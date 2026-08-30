// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

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

    // Get approved RSS items
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
      .order("fetched_at", { ascending: false })
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
    // First get videos
    const { data: videos, error: videosError }: { data: any[] | null; error: any } = await supabase
      .from("videos")
      .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, thumbnail_id, video_type")
      .eq("status", "published")
      .not("published_at", "is", null)
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
