// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  type: "article" | "video" | "author";
  title: string;
  slug: string;
  excerpt?: string | null;
  description?: string | null;
  published_at?: string | null;
  avatar_url?: string | null;
  featured_image?: { storage_path: string; alt_text: string | null } | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string; slug: string } | null;
};

/**
 * Global search across articles, videos, and authors
 */
export async function globalSearch(
  query: string,
  options: {
    type?: "all" | "article" | "video" | "author";
    page?: number;
    limit?: number;
  } = {}
) {
  const supabase = await createClient();
  const { type = "all", page = 1, limit = 20 } = options;

  if (!query || query.trim().length === 0) {
    return { data: [], total: 0, error: null };
  }

  const searchQuery = query.trim();
  const results: SearchResult[] = [];

  try {
    // Search articles
    if (type === "all" || type === "article") {
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, published_at, category_id, author_id, featured_image_id")
        .eq("status", "published")
        .not("published_at", "is", null)
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order("published_at", { ascending: false })
        .limit(type === "article" ? limit : 10);

      if (!articlesError && articles && articles.length > 0) {
        // Get related data
        const categoryIds = articles.map((a) => a.category_id).filter(Boolean);
        const authorIds = articles.map((a) => a.author_id).filter(Boolean);
        const imageIds = articles.map((a) => a.featured_image_id).filter(Boolean);

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

        const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || [] as any);
        const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || [] as any);
        const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || [] as any);

        articles.forEach((article) => {
          results.push({
            id: article.id,
            type: "article",
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            published_at: article.published_at,
            category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
            author: article.author_id ? authorsMap.get(article.author_id) || null : null,
            featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
          });
        });
      }
    }

    // Search videos
    if (type === "all" || type === "video") {
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select("id, title, slug, description, published_at, category_id, featured_image_id")
        .eq("status", "published")
        .not("published_at", "is", null)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order("published_at", { ascending: false })
        .limit(type === "video" ? limit : 10);

      if (!videosError && videos && videos.length > 0) {
        // Get related data
        const categoryIds = videos.map((v) => v.category_id).filter(Boolean);
        const imageIds = videos.map((v) => v.featured_image_id).filter(Boolean);

        const [categoriesResult, imagesResult] = await Promise.all([
          categoryIds.length > 0
            ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
            : { data: [], error: null },
          imageIds.length > 0
            ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
            : { data: [], error: null },
        ]);

        const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || [] as any);
        const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || [] as any);

        videos.forEach((video) => {
          results.push({
            id: video.id,
            type: "video",
            title: video.title,
            slug: video.slug,
            description: video.description,
            published_at: video.published_at,
            category: video.category_id ? categoriesMap.get(video.category_id) || null : null,
            featured_image: video.featured_image_id ? imagesMap.get(video.featured_image_id) || null : null,
          });
        });
      }
    }

    // Search authors
    if (type === "all" || type === "author") {
      const { data: authors, error: authorsError } = await supabase
        .from("authors")
        .select("id, name, slug, bio, avatar_url")
        .or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
        .limit(type === "author" ? limit : 5);

      if (!authorsError && authors && authors.length > 0) {
        authors.forEach((author) => {
          results.push({
            id: author.id,
            type: "author",
            title: author.name,
            slug: author.slug,
            description: author.bio,
            avatar_url: author.avatar_url,
          });
        });
      }
    }

    // Apply pagination if filtering by specific type
    if (type !== "all") {
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedResults = results.slice(from, to);
      return { data: paginatedResults, total: results.length, error: null };
    }

    return { data: results, total: results.length, error: null };
  } catch (err) {
    console.error("Error performing search:", err);
    return { data: [], total: 0, error: "Search failed" };
  }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(query: string) {
  const supabase = await createClient();

  if (!query || query.trim().length < 2) {
    return { data: [], error: null };
  }

  const searchQuery = query.trim();

  try {
    // Get article and video titles
    const [articlesResult, videosResult] = await Promise.all([
      supabase
        .from("articles")
        .select("title, slug")
        .eq("status", "published")
        .not("published_at", "is", null)
        .ilike("title", `%${searchQuery}%`)
        .limit(5),
      supabase
        .from("videos")
        .select("title, slug")
        .eq("status", "published")
        .not("published_at", "is", null)
        .ilike("title", `%${searchQuery}%`)
        .limit(3),
    ]);

    const suggestions = [
      ...(articlesResult.data || []).map((item: any) => ({ title: item.title, slug: item.slug, type: "article" })),
      ...(videosResult.data || []).map((item: any) => ({ title: item.title, slug: item.slug, type: "video" })),
    ].slice(0, 8);

    return { data: suggestions, error: null };
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    return { data: [], error: "Failed to fetch suggestions" };
  }
}
