// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type TrendingArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  view_count: number;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string; slug: string } | null;
  featured_image: { id: string; storage_path: string; alt_text: string | null } | null;
};

/**
 * Track article view
 */
export async function trackArticleView(articleId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  try {
    // Check if user has already viewed this article (using cookie to prevent duplicate counts)
    const viewedKey = `viewed_${articleId}`;
    const hasViewed = cookieStore.get(viewedKey);

    if (hasViewed) {
      // Already counted this view
      return { success: true, counted: false };
    }

    // Increment view count
    const { error } = await supabase.rpc("increment_article_views", {
      article_id: articleId,
    });

    if (error) {
      console.error("Error incrementing view count:", error);
      return { success: false, counted: false };
    }

    // Set cookie to prevent duplicate counting (expires in 24 hours)
    cookieStore.set(viewedKey, "1", {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: "lax",
    });

    return { success: true, counted: true };
  } catch (err) {
    console.error("Error tracking article view:", err);
    return { success: false, counted: false };
  }
}

/**
 * Get most-read articles for today
 */
export async function getTrendingToday(limit: number = 10) {
  const supabase = await createClient();

  try {
    // Get articles published in the last 7 days, sorted by view count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, view_count, category_id, author_id, featured_image_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", sevenDaysAgo.toISOString())
      .gt("view_count", 0)
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching trending today:", error);
      return { data: [], error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], error: null };
    }

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

    const enrichedArticles = articles.map((article) => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, error: null };
  } catch (err) {
    console.error("Error fetching trending today:", err);
    return { data: [], error: "Failed to fetch trending articles" };
  }
}

/**
 * Get most-read articles for this week
 */
export async function getTrendingWeek(limit: number = 10) {
  const supabase = await createClient();

  try {
    // Get articles published in the last 30 days, sorted by view count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, view_count, category_id, author_id, featured_image_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", thirtyDaysAgo.toISOString())
      .gt("view_count", 0)
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching trending week:", error);
      return { data: [], error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], error: null };
    }

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

    const enrichedArticles = articles.map((article) => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, error: null };
  } catch (err) {
    console.error("Error fetching trending week:", err);
    return { data: [], error: "Failed to fetch trending articles" };
  }
}

/**
 * Get popular articles (all-time most viewed)
 */
export async function getPopularArticles(limit: number = 10) {
  const supabase = await createClient();

  try {
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, view_count, category_id, author_id, featured_image_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gt("view_count", 0)
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching popular articles:", error);
      return { data: [], error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], error: null };
    }

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

    const enrichedArticles = articles.map((article) => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, error: null };
  } catch (err) {
    console.error("Error fetching popular articles:", err);
    return { data: [], error: "Failed to fetch popular articles" };
  }
}
