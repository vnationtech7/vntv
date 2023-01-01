// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateHomepage, revalidateAdmin } from "@/lib/utils/cache-revalidation";

export type FeaturedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_id: string | null;
  category_id: string | null;
  author_id: string | null;
  published_at: string | null;
  is_featured: boolean;
  is_breaking: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string;
    slug: string;
  } | null;
  featured_image: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
};

export type FeaturedContent = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  content_type: 'article' | 'video';
  featured_image_id?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string;
    slug: string;
  } | null;
  featured_image: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
  // Video-specific fields
  source_type?: string;
  source_url?: string;
  duration_seconds?: number;
  video_type?: string;
};

/**
 * Get featured content (articles AND videos) for homepage hero
 */
export async function getFeaturedContent(limit: number = 5) {
  const supabase = await createClient();

  try {
    // Get featured articles
    const { data: articles, error: articlesError }: { data: any[] | null; error: any } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
      .eq("status", "published")
      .eq("is_featured", true)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    // Get featured videos
    const { data: videos, error: videosError }: { data: any[] | null; error: any } = await supabase
      .from("videos")
      .select("id, title, slug, description, source_type, source_url, duration_seconds, thumbnail_id, video_type, published_at")
      .eq("status", "published")
      .eq("is_featured", true)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (articlesError) console.error("Error fetching featured articles:", articlesError);
    if (videosError) console.error("Error fetching featured videos:", videosError);

    // Combine and get related data
    const allContent: FeaturedContent[] = [];
    const categoryIds: string[] = [];
    const authorIds: string[] = [];
    const imageIds: string[] = [];

    // Process articles
    if (articles) {
      articles.forEach(article => {
        if (article.category_id) categoryIds.push(article.category_id);
        if (article.author_id) authorIds.push(article.author_id);
        if (article.featured_image_id) imageIds.push(article.featured_image_id);
        
        allContent.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          published_at: article.published_at,
          content_type: 'article',
          featured_image_id: article.featured_image_id,
          category_id: article.category_id,
          author_id: article.author_id,
          category: null,
          author: null,
          featured_image: null,
        });
      });
    }

    // Process videos
    if (videos) {
      videos.forEach(video => {
        if (video.thumbnail_id) imageIds.push(video.thumbnail_id);
        
        allContent.push({
          id: video.id,
          title: video.title,
          slug: video.slug,
          excerpt: video.description,
          published_at: video.published_at,
          content_type: 'video',
          featured_image_id: video.thumbnail_id,
          category: video.video_type ? { id: video.video_type, name: video.video_type, slug: video.video_type } : null,
          author: null,
          featured_image: null,
          source_type: video.source_type,
          source_url: video.source_url,
          duration_seconds: video.duration_seconds,
          video_type: video.video_type,
        });
      });
    }

    // Sort by published date
    allContent.sort((a, b) => {
      const dateA = new Date(a.published_at || 0).getTime();
      const dateB = new Date(b.published_at || 0).getTime();
      return dateB - dateA;
    });

    // Take only the limit
    const limitedContent = allContent.slice(0, limit);

    // Fetch related data
    const [categoriesResult, authorsResult, imagesResult] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
        : { data: [], error: null },
      authorIds.length > 0
        ? supabase.from("authors").select("id, name, slug").in("id", authorIds)
        : { data: [], error: null },
      imageIds.length > 0
        ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
        : { data: [], error: null },
    ]);

    // Create maps
    const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || []);
    const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || []);
    const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || []);

    // Enrich content
    const enrichedContent = limitedContent.map(item => ({
      ...item,
      category: item.content_type === 'article' && item.category_id
        ? categoriesMap.get(item.category_id) || item.category
        : item.category,
      author: item.content_type === 'article' && item.author_id
        ? authorsMap.get(item.author_id) || null
        : null,
      featured_image: item.featured_image_id
        ? imagesMap.get(item.featured_image_id) || null
        : null,
    }));

    return { data: enrichedContent, error: null };
  } catch (err) {
    console.error("Unexpected error fetching featured content:", err);
    return { data: null, error: "Failed to fetch featured content" };
  }
}

/**
 * Get featured articles for homepage hero
 */
export async function getFeaturedArticles(limit: number = 5) {
  const supabase = await createClient();

  try {
    // First get articles
    const { data: articles, error: articlesError }: { data: any[] | null; error: any } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at, is_featured, is_breaking")
      .eq("status", "published")
      .eq("is_featured", true)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (articlesError) {
      console.error("Error fetching featured articles:", articlesError);
      return { data: null, error: articlesError.message || "Failed to fetch featured articles" };
    }

    if (!articles || articles.length === 0) {
      return { data: [], error: null };
    }

    // Get related data
    const categoryIds = articles.map(a => a.category_id).filter(Boolean);
    const authorIds = articles.map(a => a.author_id).filter(Boolean);
    const imageIds = articles.map(a => a.featured_image_id).filter(Boolean);

    const [categoriesResult, authorsResult, imagesResult] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
        : { data: [], error: null },
      authorIds.length > 0
        ? supabase.from("authors").select("id, name, slug").in("id", authorIds)
        : { data: [], error: null },
      imageIds.length > 0
        ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
        : { data: [], error: null },
    ]);

    // Map related data
    const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || []);
    const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || []);
    const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || []);

    // Combine data
    const enrichedArticles = articles.map(article => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles as FeaturedArticle[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching featured articles:", err);
    return { data: null, error: "Failed to fetch featured articles" };
  }
}

/**
 * Get latest articles AND RSS items for homepage
 */
export async function getLatestArticles(limit: number = 6) {
  const supabase = await createClient();

  try {
    // Get articles
    const { data: articles, error: articlesError }: { data: any[] | null; error: any } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    // Get approved RSS items - ordered by published_at (not fetched_at) to show latest posts
    const { data: rssItems, error: rssError }: { data: any[] | null; error: any } = await supabase
      .from("rss_items")
      .select(`
        id,
        title,
        description,
        url,
        image_url,
        author,
        published_at,
        fetched_at,
        feed:rss_feeds(id, name, source_name, category_id)
      `)
      .eq("status", "approved")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (articlesError) {
      console.error("Error fetching latest articles:", articlesError);
    }
    if (rssError) {
      console.error("Error fetching RSS items:", rssError);
    }

    // Combine both into a unified content array
    const allContent: any[] = [];
    const categoryIds: string[] = [];
    const authorIds: string[] = [];
    const imageIds: string[] = [];

    // Process articles
    if (articles) {
      articles.forEach(article => {
        if (article.category_id) categoryIds.push(article.category_id);
        if (article.author_id) authorIds.push(article.author_id);
        if (article.featured_image_id) imageIds.push(article.featured_image_id);
        
        allContent.push({
          ...article,
          content_type: 'article',
          date: article.published_at,
        });
      });
    }

    // Process RSS items
    if (rssItems) {
      rssItems.forEach(item => {
        // Add RSS feed's category to the list
        if (item.feed?.category_id) categoryIds.push(item.feed.category_id);
        
        allContent.push({
          id: item.id,
          title: item.title,
          slug: item.id, // Use ID as slug for RSS items
          excerpt: item.description,
          image_url: item.image_url, // RSS items have direct image URLs
          category_id: item.feed?.category_id,
          author_name: item.author || item.feed?.source_name,
          source_name: item.feed?.source_name,
          published_at: item.published_at || item.fetched_at,
          date: item.published_at || item.fetched_at,
          content_type: 'rss',
          original_url: item.url,
        });
      });
    }

    // Sort by date (newest first)
    allContent.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    // Take only the limit
    const limitedContent = allContent.slice(0, limit);

    // Fetch related data for articles
    const [categoriesResult, authorsResult, imagesResult] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
        : { data: [], error: null },
      authorIds.length > 0
        ? supabase.from("authors").select("id, name, slug").in("id", authorIds)
        : { data: [], error: null },
      imageIds.length > 0
        ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
        : { data: [], error: null },
    ]);

    // Map related data
    const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || []);
    const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || []);
    const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || []);

    // Enrich content
    const enrichedContent = limitedContent.map(item => {
      if (item.content_type === 'article') {
        return {
          ...item,
          category: item.category_id ? categoriesMap.get(item.category_id) || null : null,
          author: item.author_id ? authorsMap.get(item.author_id) || null : null,
          featured_image: item.featured_image_id ? imagesMap.get(item.featured_image_id) || null : null,
        };
      } else {
        // RSS item
        return {
          ...item,
          category: item.category_id ? categoriesMap.get(item.category_id) || null : null,
          author: item.author_name ? { name: item.author_name } : null,
        };
      }
    });

    return { data: enrichedContent, error: null };
  } catch (err) {
    console.error("Unexpected error fetching latest content:", err);
    return { data: null, error: "Failed to fetch latest content" };
  }
}

/**
 * Get trending articles AND RSS items (by view count/recency from last 7 days)
 */
export async function getTrendingArticles(limit: number = 5) {
  const supabase = await createClient();

  try {
    // Get articles published in the last 7 days, sorted by view count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("id, title, slug, published_at, view_count")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", sevenDaysAgo.toISOString())
      .gt("view_count", 0)
      .order("view_count", { ascending: false })
      .limit(limit);

    // Get recent approved RSS items (last 7 days)
    const { data: rssItems, error: rssError } = await supabase
      .from("rss_items")
      .select("id, title, published_at, fetched_at")
      .eq("status", "approved")
      .gte("fetched_at", sevenDaysAgo.toISOString())
      .order("fetched_at", { ascending: false })
      .limit(limit);

    if (articlesError) {
      console.error("Error fetching trending articles:", articlesError);
    }
    if (rssError) {
      console.error("Error fetching RSS items:", rssError);
    }

    // Combine both
    const allContent: any[] = [];

    if (articles) {
      articles.forEach(article => {
        allContent.push({
          ...article,
          content_type: 'article',
          score: article.view_count || 0,
        });
      });
    }

    if (rssItems) {
      rssItems.forEach(item => {
        allContent.push({
          id: item.id,
          title: item.title,
          slug: item.id,
          published_at: item.published_at || item.fetched_at,
          content_type: 'rss',
          score: 1, // RSS items don't have view counts, give them base score
        });
      });
    }

    // Sort by score (articles with high views first, then recent RSS items)
    allContent.sort((a, b) => b.score - a.score);

    // Take only the limit
    const limitedContent = allContent.slice(0, limit);

    return { data: limitedContent, error: null };
  } catch (err) {
    console.error("Unexpected error fetching trending content:", err);
    return { data: null, error: "Failed to fetch trending content" };
  }
}

/**
 * Get latest videos for homepage
 */
export async function getLatestVideos(limit: number = 4) {
  const supabase = await createClient();

  try {
    // First get videos (excluding shorts)
    const { data: videos, error: videosError }: { data: any[] | null; error: any } = await supabase
      .from("videos")
      .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, thumbnail_id, video_type")
      .eq("status", "published")
      .not("published_at", "is", null)
      .neq("video_type", "short") // Exclude shorts
      .order("published_at", { ascending: false })
      .limit(limit);

    if (videosError) {
      console.error("Error fetching latest videos:", videosError);
      return { data: null, error: videosError.message || "Failed to fetch latest videos" };
    }

    if (!videos || videos.length === 0) {
      return { data: [], error: null };
    }

    // Get thumbnails
    const thumbnailIds = videos.map(v => v.thumbnail_id).filter(Boolean);

    const thumbnailsResult = thumbnailIds.length > 0
      ? await supabase.from("media_assets").select("id, storage_path, alt_text").in("id", thumbnailIds)
      : { data: [], error: null };

    // Map thumbnails
    const thumbnailsMap = new Map(thumbnailsResult.data?.map((t: any) => [t.id, t]) || []);

    // Combine data - videos don't have categories, they have video_type
    const enrichedVideos = videos.map(video => ({
      ...video,
      category: video.video_type ? { id: video.video_type, name: video.video_type, slug: video.video_type } : null,
      thumbnail: video.thumbnail_id ? thumbnailsMap.get(video.thumbnail_id) || null : null,
    }));

    return { data: enrichedVideos, error: null };
  } catch (err) {
    console.error("Unexpected error fetching latest videos:", err);
    return { data: null, error: "Failed to fetch latest videos" };
  }
}

// Homepage Sections Management

export type HomepageSection = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  section_type: 'featured' | 'latest' | 'trending' | 'category' | 'custom';
  category_id: string | null;
  display_order: number;
  is_enabled: boolean;
  configuration: {
    max_items?: number;
    layout_style?: 'grid' | 'list' | 'carousel' | 'hero';
    show_images?: boolean;
    show_excerpt?: boolean;
    show_author?: boolean;
    show_date?: boolean;
  };
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type HomepageItem = {
  id: string;
  section_id: string;
  content_type: 'article' | 'video' | 'rss' | 'programme';
  content_id: string;
  display_order: number;
  is_pinned: boolean;
  custom_headline: string | null;
  custom_excerpt: string | null;
  custom_image_url: string | null;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get all homepage sections (admin)
 */
export async function getAllHomepageSections() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching homepage sections:", error);
      return { data: null, error: error.message };
    }

    return { data: data as HomepageSection[], error: null };
  } catch (err) {
    console.error("Error fetching homepage sections:", err);
    return { data: null, error: "Failed to fetch homepage sections" };
  }
}

/**
 * Get enabled homepage sections (public)
 */
export async function getEnabledHomepageSections() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("is_enabled", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching enabled homepage sections:", error);
      return { data: null, error: error.message };
    }

    return { data: data as HomepageSection[], error: null };
  } catch (err) {
    console.error("Error fetching enabled homepage sections:", err);
    return { data: null, error: "Failed to fetch enabled homepage sections" };
  }
}

/**
 * Get single homepage section by ID
 */
export async function getHomepageSectionById(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return { data: null, error: "Homepage section not found" };
    }

    return { data: data as HomepageSection, error: null };
  } catch (err) {
    console.error("Error fetching homepage section:", err);
    return { data: null, error: "Failed to fetch homepage section" };
  }
}

/**
 * Create homepage section
 */
export async function createHomepageSection(sectionData: {
  name: string;
  slug?: string | null;
  description?: string | null;
  section_type: 'featured' | 'latest' | 'trending' | 'category' | 'custom';
  category_id?: string | null;
  display_order?: number;
  is_enabled?: boolean;
  configuration?: {
    max_items?: number;
    layout_style?: 'grid' | 'list' | 'carousel' | 'hero';
    show_images?: boolean;
    show_excerpt?: boolean;
    show_author?: boolean;
    show_date?: boolean;
  };
}) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .insert({
        name: sectionData.name,
        slug: sectionData.slug || null,
        description: sectionData.description || null,
        section_type: sectionData.section_type,
        category_id: sectionData.category_id || null,
        display_order: sectionData.display_order ?? 0,
        is_enabled: sectionData.is_enabled ?? true,
        configuration: sectionData.configuration || {
          max_items: 6,
          layout_style: 'grid',
          show_images: true,
          show_excerpt: true,
          show_author: false,
          show_date: true,
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating homepage section:", error);
      return { data: null, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { data, error: null };
  } catch (err) {
    console.error("Error creating homepage section:", err);
    return { data: null, error: "Failed to create homepage section" };
  }
}

/**
 * Update homepage section
 */
export async function updateHomepageSection(
  id: string,
  sectionData: Partial<HomepageSection>
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .update({
        ...sectionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating homepage section:", error);
      return { data: null, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { data, error: null };
  } catch (err) {
    console.error("Error updating homepage section:", err);
    return { data: null, error: "Failed to update homepage section" };
  }
}

/**
 * Delete homepage section
 */
export async function deleteHomepageSection(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("homepage_sections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting homepage section:", error);
      return { success: false, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting homepage section:", err);
    return { success: false, error: "Failed to delete homepage section" };
  }
}

/**
 * Toggle homepage section status
 */
export async function toggleHomepageSectionStatus(id: string, isEnabled: boolean) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .update({
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling homepage section status:", error);
      return { data: null, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { data, error: null };
  } catch (err) {
    console.error("Error toggling homepage section status:", err);
    return { data: null, error: "Failed to toggle homepage section status" };
  }
}

// Homepage Items Management

/**
 * Get items for a section
 */
export async function getHomepageSectionItems(sectionId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_items")
      .select("*")
      .eq("section_id", sectionId)
      .order("is_pinned", { ascending: false })
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching homepage items:", error);
      return { data: null, error: error.message };
    }

    return { data: data as HomepageItem[], error: null };
  } catch (err) {
    console.error("Error fetching homepage items:", err);
    return { data: null, error: "Failed to fetch homepage items" };
  }
}

/**
 * Add item to section
 */
export async function addHomepageItem(itemData: {
  section_id: string;
  content_type: 'article' | 'video' | 'rss' | 'programme';
  content_id: string;
  display_order?: number;
  is_pinned?: boolean;
  custom_headline?: string | null;
  custom_excerpt?: string | null;
  custom_image_url?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_active?: boolean;
}) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("homepage_items")
      .insert({
        section_id: itemData.section_id,
        content_type: itemData.content_type,
        content_id: itemData.content_id,
        display_order: itemData.display_order ?? 0,
        is_pinned: itemData.is_pinned ?? false,
        custom_headline: itemData.custom_headline || null,
        custom_excerpt: itemData.custom_excerpt || null,
        custom_image_url: itemData.custom_image_url || null,
        start_time: itemData.start_time || null,
        end_time: itemData.end_time || null,
        is_active: itemData.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding homepage item:", error);
      return { data: null, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { data, error: null };
  } catch (err) {
    console.error("Error adding homepage item:", err);
    return { data: null, error: "Failed to add homepage item" };
  }
}

/**
 * Update homepage item
 */
export async function updateHomepageItem(
  id: string,
  itemData: Partial<HomepageItem>
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("homepage_items")
      .update({
        ...itemData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating homepage item:", error);
      return { data: null, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { data, error: null };
  } catch (err) {
    console.error("Error updating homepage item:", err);
    return { data: null, error: "Failed to update homepage item" };
  }
}

/**
 * Remove item from section
 */
export async function removeHomepageItem(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("homepage_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing homepage item:", error);
      return { success: false, error: error.message };
    }

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { success: true, error: null };
  } catch (err) {
    console.error("Error removing homepage item:", err);
    return { success: false, error: "Failed to remove homepage item" };
  }
}

/**
 * Reorder homepage items in a section
 */
export async function reorderHomepageItems(items: { id: string; display_order: number }[]) {
  const supabase = await createClient();

  try {
    const updates = items.map(item =>
      supabase
        .from("homepage_items")
        .update({ display_order: item.display_order })
        .eq("id", item.id)
    );

    await Promise.all(updates);

    revalidateHomepage();
    revalidateAdmin("/admin/homepage");

    return { success: true, error: null };
  } catch (err) {
    console.error("Error reordering homepage items:", err);
    return { success: false, error: "Failed to reorder items" };
  }
}

/**
 * Get latest shorts videos for homepage
 */
export async function getLatestShorts(limit: number = 6) {
  const supabase = await createClient();

  try {
    // Get shorts (video_type = 'short')
    const { data: shorts, error: shortsError }: { data: any[] | null; error: any } = await supabase
      .from("videos")
      .select("id, title, slug, source_type, source_url, thumbnail_id, video_type")
      .eq("status", "published")
      .eq("video_type", "short")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (shortsError) {
      console.error("Error fetching shorts:", shortsError);
      return { data: null, error: shortsError.message || "Failed to fetch shorts" };
    }

    if (!shorts || shorts.length === 0) {
      return { data: [], error: null };
    }

    // Get thumbnails
    const thumbnailIds = shorts.map(s => s.thumbnail_id).filter(Boolean);

    const thumbnailsResult = thumbnailIds.length > 0
      ? await supabase.from("media_assets").select("id, storage_path, alt_text").in("id", thumbnailIds)
      : { data: [], error: null };

    // Map thumbnails
    const thumbnailsMap = new Map(thumbnailsResult.data?.map((t: any) => [t.id, t]) || []);

    // Combine data
    const enrichedShorts = shorts.map(short => ({
      ...short,
      thumbnail: short.thumbnail_id ? thumbnailsMap.get(short.thumbnail_id) || null : null,
    }));

    return { data: enrichedShorts, error: null };
  } catch (err) {
    console.error("Unexpected error fetching shorts:", err);
    return { data: null, error: "Failed to fetch shorts" };
  }
}

/**
 * Get latest articles for homepage (published articles only)
 */
export async function getLatestPublishedArticles(limit: number = 4) {
  const supabase = await createClient();

  try {
    // Get published articles
    const { data: articles, error: articlesError }: { data: any[] | null; error: any } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
      return { data: null, error: articlesError.message || "Failed to fetch articles" };
    }

    if (!articles || articles.length === 0) {
      return { data: [], error: null };
    }

    // Get related data
    const categoryIds = articles.map(a => a.category_id).filter(Boolean);
    const authorIds = articles.map(a => a.author_id).filter(Boolean);
    const imageIds = articles.map(a => a.featured_image_id).filter(Boolean);

    const [categoriesResult, authorsResult, imagesResult] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
        : { data: [], error: null },
      authorIds.length > 0
        ? supabase.from("authors").select("id, name, slug").in("id", authorIds)
        : { data: [], error: null },
      imageIds.length > 0
        ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
        : { data: [], error: null },
    ]);

    // Map related data
    const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || []);
    const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || []);
    const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || []);

    // Combine data
    const enrichedArticles = articles.map(article => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, error: null };
  } catch (err) {
    console.error("Unexpected error fetching articles:", err);
    return { data: null, error: "Failed to fetch articles" };
  }
}
