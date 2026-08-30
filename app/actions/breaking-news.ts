// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateBreakingNews, revalidateAdmin } from "@/lib/utils/cache-revalidation";

export type BreakingNews = {
  id: string;
  headline_override: string;
  article_id: string | null;
  link_url: string | null;
  priority: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

/**
 * Get all breaking news (for admin)
 */
export async function getAllBreakingNews() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("breaking_news")
      .select(`
        *,
        article:articles(id, title, slug)
      `)
      .order("priority", { ascending: false })
      .order("starts_at", { ascending: false });

    if (error) {
      console.error("Error fetching breaking news:", error);
      return { data: null, error: error.message };
    }

    return { data: data as BreakingNews[], error: null };
  } catch (err) {
    console.error("Error fetching breaking news:", err);
    return { data: null, error: "Failed to fetch breaking news" };
  }
}

/**
 * Get active breaking news (for public display)
 */
export async function getActiveBreakingNews() {
  const supabase = await createClient();

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("breaking_news")
      .select(`
        *,
        article:articles(id, title, slug)
      `)
      .eq("is_active", true)
      .lte("starts_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("priority", { ascending: false })
      .order("starts_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching active breaking news:", error);
      return { data: null, error: error.message };
    }

    return { data: data as BreakingNews[], error: null };
  } catch (err) {
    console.error("Error fetching active breaking news:", err);
    return { data: null, error: "Failed to fetch active breaking news" };
  }
}

/**
 * Get single breaking news by ID
 */
export async function getBreakingNewsById(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("breaking_news")
      .select(`
        *,
        article:articles(id, title, slug)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return { data: null, error: "Breaking news not found" };
    }

    return { data: data as BreakingNews, error: null };
  } catch (err) {
    console.error("Error fetching breaking news:", err);
    return { data: null, error: "Failed to fetch breaking news" };
  }
}

/**
 * Create new breaking news
 */
export async function createBreakingNews(newsData: {
  headline_override: string;
  article_id?: string | null;
  link_url?: string | null;
  priority?: number;
  starts_at?: string;
  expires_at?: string | null;
  is_active?: boolean;
}) {
  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("breaking_news")
      .insert({
        headline_override: newsData.headline_override,
        article_id: newsData.article_id || null,
        link_url: newsData.link_url || null,
        priority: newsData.priority ?? 0,
        starts_at: newsData.starts_at || new Date().toISOString(),
        expires_at: newsData.expires_at || null,
        is_active: newsData.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating breaking news:", error);
      return { data: null, error: error.message };
    }

    revalidateBreakingNews();
    revalidateAdmin("/admin/breaking-news");

    return { data, error: null };
  } catch (err) {
    console.error("Error creating breaking news:", err);
    return { data: null, error: "Failed to create breaking news" };
  }
}

/**
 * Update breaking news
 */
export async function updateBreakingNews(
  id: string,
  newsData: {
    headline_override?: string;
    article_id?: string | null;
    link_url?: string | null;
    priority?: number;
    starts_at?: string;
    expires_at?: string | null;
    is_active?: boolean;
  }
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("breaking_news")
      .update({
        ...newsData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating breaking news:", error);
      return { data: null, error: error.message };
    }

    revalidateBreakingNews();
    revalidateAdmin("/admin/breaking-news");

    return { data, error: null };
  } catch (err) {
    console.error("Error updating breaking news:", err);
    return { data: null, error: "Failed to update breaking news" };
  }
}

/**
 * Delete breaking news
 */
export async function deleteBreakingNews(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("breaking_news")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting breaking news:", error);
      return { success: false, error: error.message };
    }

    revalidateBreakingNews();
    revalidateAdmin("/admin/breaking-news");

    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting breaking news:", err);
    return { success: false, error: "Failed to delete breaking news" };
  }
}

/**
 * Toggle breaking news active status
 */
export async function toggleBreakingNewsStatus(id: string, isActive: boolean) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("breaking_news")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling breaking news status:", error);
      return { data: null, error: error.message };
    }

    revalidateBreakingNews();
    revalidateAdmin("/admin/breaking-news");

    return { data, error: null };
  } catch (err) {
    console.error("Error toggling breaking news status:", err);
    return { data: null, error: "Failed to toggle breaking news status" };
  }
}
