// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type TagData = {
  id: string;
  name: string;
  slug: string;
};

export type TagArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string; slug: string } | null;
  featured_image: { id: string; storage_path: string; alt_text: string | null } | null;
};

/**
 * Get tag by slug
 */
export async function getTag(slug: string) {
  const supabase = await createClient();

  try {
    const { data: tag, error } = await supabase
      .from("tags")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();

    if (error || !tag) {
      return { data: null, error: "Tag not found" };
    }

    return { data: tag, error: null };
  } catch (err) {
    console.error("Error fetching tag:", err);
    return { data: null, error: "Failed to fetch tag" };
  }
}

/**
 * Get articles for a tag with pagination
 */
export async function getTagArticles(
  tagSlug: string,
  options: {
    page?: number;
    limit?: number;
  } = {}
) {
  const supabase = await createClient();
  const { page = 1, limit = 12 } = options;

  try {
    // Get tag ID
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();

    if (!tag) {
      return { data: null, total: 0, error: "Tag not found" };
    }

    // Get article IDs from article_tags junction table
    const { data: articleTags, error: junctionError } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tag.id);

    if (junctionError) {
      console.error("Error fetching article tags:", junctionError);
      return { data: null, total: 0, error: junctionError.message };
    }

    if (!articleTags || articleTags.length === 0) {
      return { data: [], total: 0, error: null };
    }

    const articleIds = articleTags.map((at) => at.article_id);

    // Build query for articles
    let query = supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, category_id, author_id, featured_image_id", { count: "exact" })
      .eq("status", "published")
      .in("id", articleIds)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error("Error fetching tag articles:", error);
      return { data: null, total: 0, error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], total: 0, error: null };
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

    return { data: enrichedArticles, total: count || 0, error: null };
  } catch (err) {
    console.error("Error fetching tag articles:", err);
    return { data: null, total: 0, error: "Failed to fetch articles" };
  }
}

/**
 * Get article count for a tag
 */
export async function getTagArticleCount(tagId: string) {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("article_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagId);

    if (error) {
      console.error("Error fetching tag article count:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Error fetching tag article count:", err);
    return 0;
  }
}

/**
 * Get all tags
 */
export async function getAllTags() {
  const supabase = await createClient();

  try {
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching tags:", error);
      return { data: null, error: error.message };
    }

    return { data: tags || [], error: null };
  } catch (err) {
    console.error("Error fetching tags:", err);
    return { data: null, error: "Failed to fetch tags" };
  }
}
