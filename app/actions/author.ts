// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type AuthorData = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
  website_url: string | null;
};

export type AuthorArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  category: { id: string; name: string; slug: string } | null;
  featured_image: { id: string; storage_path: string; alt_text: string | null } | null;
};

/**
 * Get author by slug with profile details
 */
export async function getAuthor(slug: string) {
  const supabase = await createClient();

  try {
    const { data: author, error } = await supabase
      .from("authors")
      .select("id, name, slug, bio, avatar_url, email, twitter_handle, linkedin_url, website_url")
      .eq("slug", slug)
      .single();

    if (error || !author) {
      return { data: null, error: "Author not found" };
    }

    return { data: author, error: null };
  } catch (err) {
    console.error("Error fetching author:", err);
    return { data: null, error: "Failed to fetch author" };
  }
}

/**
 * Get articles by author with pagination
 */
export async function getAuthorArticles(
  authorSlug: string,
  options: {
    page?: number;
    limit?: number;
  } = {}
) {
  const supabase = await createClient();
  const { page = 1, limit = 12 } = options;

  try {
    // Get author ID
    const { data: author } = await supabase
      .from("authors")
      .select("id")
      .eq("slug", authorSlug)
      .single();

    if (!author) {
      return { data: null, total: 0, error: "Author not found" };
    }

    // Build query for articles
    let query = supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, category_id, featured_image_id", { count: "exact" })
      .eq("status", "published")
      .eq("author_id", author.id)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error("Error fetching author articles:", error);
      return { data: null, total: 0, error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], total: 0, error: null };
    }

    // Get related data
    const categoryIds = articles.map((a) => a.category_id).filter(Boolean);
    const imageIds = articles.map((a) => a.featured_image_id).filter(Boolean);

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

    const enrichedArticles = articles.map((article) => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, total: count || 0, error: null };
  } catch (err) {
    console.error("Error fetching author articles:", err);
    return { data: null, total: 0, error: "Failed to fetch articles" };
  }
}

/**
 * Get article count for an author
 */
export async function getAuthorArticleCount(authorId: string) {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .eq("author_id", authorId)
      .not("published_at", "is", null);

    if (error) {
      console.error("Error fetching article count:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Error fetching article count:", err);
    return 0;
  }
}
