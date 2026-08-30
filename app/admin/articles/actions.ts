// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";

export type ArticleStatus =
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected"
  | "archived";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: any; // JSONB structured content blocks
  category_id: string | null;
  author_id: string | null;
  featured_image_id: string | null;
  source_id: string | null;
  status: ArticleStatus;
  content_type: string;
  is_breaking: boolean;
  is_featured: boolean;
  is_exclusive: boolean;
  is_sponsored: boolean;
  sponsor_label: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  social_image_id: string | null;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt?: string;
  body: any;
  category_id?: string;
  author_id?: string;
  featured_image_id?: string | null;
  status: ArticleStatus;
  is_breaking?: boolean;
  is_featured?: boolean;
  is_exclusive?: boolean;
  is_sponsored?: boolean;
  sponsor_label?: string;
  scheduled_at?: string;
  seo_title?: string;
  seo_description?: string;
  tag_ids?: string[];
}

/**
 * Get all articles with optional filters
 */
export async function getArticles(options?: {
  status?: ArticleStatus;
  category_id?: string;
  author_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Article[] | null; error: string | null; count?: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.category_id) {
    query = query.eq("category_id", options.category_id);
  }

  if (options?.author_id) {
    query = query.eq("author_id", options.author_id);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null, count: count || 0 };
}

/**
 * Get a single article by ID
 */
export async function getArticle(
  id: string
): Promise<{ data: Article | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching article:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get article tags
 */
export async function getArticleTags(
  articleId: string
): Promise<{ data: string[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", articleId);

  if (error) {
    console.error("Error fetching article tags:", error);
    return { data: null, error: error.message };
  }

  return { data: data.map((t) => t.tag_id), error: null };
}

/**
 * Create a new article
 */
export async function createArticle(
  formData: ArticleFormData
): Promise<{ data: Article | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Check if slug already exists
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", formData.slug)
    .single();

  if (existing) {
    return { data: null, error: "An article with this slug already exists" };
  }

  // Insert article
  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      body: formData.body || [],
      category_id: formData.category_id || null,
      author_id: formData.author_id || null,
      featured_image_id: formData.featured_image_id || null,
      status: formData.status,
      is_breaking: formData.is_breaking || false,
      is_featured: formData.is_featured || false,
      is_exclusive: formData.is_exclusive || false,
      is_sponsored: formData.is_sponsored || false,
      sponsor_label: formData.sponsor_label || null,
      scheduled_at: formData.scheduled_at || null,
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
      created_by: user.id,
      published_at:
        formData.status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating article:", error);
    return { data: null, error: error.message };
  }

  // Add tags if provided
  if (formData.tag_ids && formData.tag_ids.length > 0 && data) {
    const tagInserts = formData.tag_ids.map((tag_id) => ({
      article_id: data.id,
      tag_id,
    }));

    const { error: tagError } = await supabase
      .from("article_tags")
      .insert(tagInserts);

    if (tagError) {
      console.error("Error adding article tags:", tagError);
    }
  }

  revalidatePath("/admin/articles");
  return { data, error: null };
}

/**
 * Update an existing article
 */
export async function updateArticle(
  id: string,
  formData: ArticleFormData
): Promise<{ data: Article | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Check if slug already exists (excluding current article)
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", formData.slug)
    .neq("id", id)
    .single();

  if (existing) {
    return { data: null, error: "An article with this slug already exists" };
  }

  // Get current article to check status change
  const { data: currentArticle } = await supabase
    .from("articles")
    .select("status, published_at")
    .eq("id", id)
    .single();

  // Update article
  const updateData: any = {
    title: formData.title,
    slug: formData.slug,
    excerpt: formData.excerpt || null,
    body: formData.body || [],
    category_id: formData.category_id || null,
    author_id: formData.author_id || null,
    featured_image_id: formData.featured_image_id !== undefined ? formData.featured_image_id : null,
    status: formData.status,
    is_breaking: formData.is_breaking || false,
    is_featured: formData.is_featured || false,
    is_exclusive: formData.is_exclusive || false,
    is_sponsored: formData.is_sponsored || false,
    sponsor_label: formData.sponsor_label || null,
    scheduled_at: formData.scheduled_at || null,
    seo_title: formData.seo_title || null,
    seo_description: formData.seo_description || null,
  };

  // Set published_at if status changed to published and not already set
  if (
    formData.status === "published" &&
    currentArticle?.status !== "published" &&
    !currentArticle?.published_at
  ) {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating article:", error);
    return { data: null, error: error.message };
  }

  // Update tags
  if (formData.tag_ids !== undefined) {
    // Delete existing tags
    await supabase.from("article_tags").delete().eq("article_id", id);

    // Add new tags
    if (formData.tag_ids.length > 0) {
      const tagInserts = formData.tag_ids.map((tag_id) => ({
        article_id: id,
        tag_id,
      }));

      const { error: tagError } = await supabase
        .from("article_tags")
        .insert(tagInserts);

      if (tagError) {
        console.error("Error updating article tags:", tagError);
      }
    }
  }

  revalidatePath("/admin/articles");
  return { data, error: null };
}

/**
 * Delete an article
 */
export async function deleteArticle(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Delete article (tags will cascade delete)
  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) {
    console.error("Error deleting article:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/articles");
  return { error: null };
}

/**
 * Update article status (for workflow)
 */
export async function updateArticleStatus(
  id: string,
  status: ArticleStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const updateData: any = { status };

  // Set published_at if status is published
  if (status === "published") {
    const { data: article } = await supabase
      .from("articles")
      .select("published_at")
      .eq("id", id)
      .single();

    if (!article?.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating article status:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/articles");
  return { error: null };
}
