// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type BreakingNews = {
  id: string;
  article_id: string;
  headline_override: string | null;
  priority: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  article: {
    id: string;
    title: string;
    slug: string;
    published_at: string | null;
  } | null;
};

/**
 * Get active breaking news items
 */
export async function getActiveBreakingNews() {
  const supabase = await createClient();

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("breaking_news")
      .select(`
        *,
        article:articles!article_id(id, title, slug, published_at)
      `)
      .eq("is_active", true)
      .lte("starts_at", now)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching breaking news:", error);
      return { data: null, error: error.message };
    }

    return { data: data as BreakingNews[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching breaking news:", err);
    return { data: null, error: "Failed to fetch breaking news" };
  }
}
