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

/**
 * Advanced trending algorithm
 * Score = views (70%) + shares (20%) + recency (10%)
 * 
 * @param limit Number of trending articles to return
 * @param daysRange Consider articles from last N days (default: 7)
 */
export async function getTrendingArticlesAdvanced(limit: number = 10, daysRange: number = 7) {
  const supabase = await createClient();

  try {
    // Get articles from last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysRange);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, view_count, category_id, author_id, featured_image_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", startDate.toISOString())
      .gt("view_count", 0);

    if (error) {
      console.error("Error fetching articles for trending:", error);
      return { data: [], error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], error: null };
    }

    // Get share counts for these articles
    const articleIds = articles.map(a => a.id);
    const { data: shares } = await supabase
      .from("social_shares")
      .select("content_id")
      .eq("content_type", "article")
      .in("content_id", articleIds);

    // Count shares per article
    const shareCount = new Map<string, number>();
    shares?.forEach(share => {
      shareCount.set(share.content_id, (shareCount.get(share.content_id) || 0) + 1);
    });

    // Calculate trending score for each article
    const now = Date.now();
    const maxAge = daysRange * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    const articlesWithScores = articles.map(article => {
      const views = article.view_count || 0;
      const sharesNum = shareCount.get(article.id) || 0;
      
      // Recency score (newer = higher score)
      const articleAge = now - new Date(article.published_at!).getTime();
      const recencyScore = Math.max(0, (maxAge - articleAge) / maxAge) * 100;

      // Weighted scoring: views (70%) + shares (20%) + recency (10%)
      const viewScore = views * 0.7;
      const shareScore = sharesNum * 10 * 0.2; // Multiply shares by 10 to balance with views
      const recencyWeighted = recencyScore * 0.1;

      const trendingScore = viewScore + shareScore + recencyWeighted;

      return {
        ...article,
        trending_score: trendingScore,
        share_count: sharesNum,
      };
    });

    // Sort by trending score
    articlesWithScores.sort((a, b) => b.trending_score - a.trending_score);

    // Take top N
    const topArticles = articlesWithScores.slice(0, limit);

    // Get related data
    const categoryIds = topArticles.map((a) => a.category_id).filter(Boolean);
    const authorIds = topArticles.map((a) => a.author_id).filter(Boolean);
    const imageIds = topArticles.map((a) => a.featured_image_id).filter(Boolean);

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

    const enrichedArticles = topArticles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      published_at: article.published_at,
      view_count: article.view_count,
      share_count: article.share_count,
      trending_score: Math.round(article.trending_score * 100) / 100,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, error: null };
  } catch (err) {
    console.error("Error fetching trending articles:", err);
    return { data: [], error: "Failed to fetch trending articles" };
  }
}

/**
 * Get trending videos using advanced algorithm
 * Score = views (70%) + shares (20%) + recency (10%)
 */
export async function getTrendingVideos(limit: number = 10, daysRange: number = 7) {
  const supabase = await createClient();

  try {
    // Get videos from last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysRange);

    const { data: videos, error } = await supabase
      .from("videos")
      .select("id, title, slug, description, published_at, view_count, video_type, category_id, featured_image_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", startDate.toISOString())
      .gt("view_count", 0);

    if (error) {
      console.error("Error fetching videos for trending:", error);
      return { data: [], error: error.message };
    }

    if (!videos || videos.length === 0) {
      return { data: [], error: null };
    }

    // Get share counts for these videos
    const videoIds = videos.map(v => v.id);
    const { data: shares } = await supabase
      .from("social_shares")
      .select("content_id")
      .eq("content_type", "video")
      .in("content_id", videoIds);

    // Count shares per video
    const shareCount = new Map<string, number>();
    shares?.forEach(share => {
      shareCount.set(share.content_id, (shareCount.get(share.content_id) || 0) + 1);
    });

    // Calculate trending score for each video
    const now = Date.now();
    const maxAge = daysRange * 24 * 60 * 60 * 1000;

    const videosWithScores = videos.map(video => {
      const views = video.view_count || 0;
      const sharesNum = shareCount.get(video.id) || 0;
      
      const videoAge = now - new Date(video.published_at!).getTime();
      const recencyScore = Math.max(0, (maxAge - videoAge) / maxAge) * 100;

      const viewScore = views * 0.7;
      const shareScore = sharesNum * 10 * 0.2;
      const recencyWeighted = recencyScore * 0.1;

      const trendingScore = viewScore + shareScore + recencyWeighted;

      return {
        ...video,
        trending_score: trendingScore,
        share_count: sharesNum,
      };
    });

    // Sort by trending score
    videosWithScores.sort((a, b) => b.trending_score - a.trending_score);

    // Take top N
    const topVideos = videosWithScores.slice(0, limit);

    // Get related data
    const categoryIds = topVideos.map((v) => v.category_id).filter(Boolean);
    const imageIds = topVideos.map((v) => v.featured_image_id).filter(Boolean);

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

    const enrichedVideos = topVideos.map((video) => ({
      id: video.id,
      title: video.title,
      slug: video.slug,
      description: video.description,
      published_at: video.published_at,
      view_count: video.view_count,
      share_count: video.share_count,
      trending_score: Math.round(video.trending_score * 100) / 100,
      video_type: video.video_type,
      category: video.category_id ? categoriesMap.get(video.category_id) || null : null,
      featured_image: video.featured_image_id ? imagesMap.get(video.featured_image_id) || null : null,
    }));

    return { data: enrichedVideos, error: null };
  } catch (err) {
    console.error("Error fetching trending videos:", err);
    return { data: [], error: "Failed to fetch trending videos" };
  }
}
