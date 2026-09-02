// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAuditEvent } from "@/app/actions/audit";

/**
 * Get featured articles for admin management
 */
export async function getFeaturedArticlesAdmin() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        id,
        title,
        slug,
        is_featured,
        published_at,
        category:categories!category_id(id, name),
        author:authors!author_id(id, name)
      `)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching featured articles:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { data: null, error: "Failed to fetch articles" };
  }
}

/**
 * Toggle featured status for an article
 */
export async function toggleArticleFeatured(articleId: string, isFeatured: boolean) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("articles")
      .update({ is_featured: isFeatured } as any)
      .eq("id", articleId);

    if (error) {
      console.error("Error updating featured status:", error);
      return { success: false, error: error.message };
    }

    // Revalidate homepage
    revalidatePath("/");
    
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to update article" };
  }
}

/**
 * Get breaking news items for admin management
 */
export async function getBreakingNewsAdmin() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("breaking_news")
      .select(`
        id,
        title,
        article_id,
        is_active,
        priority,
        starts_at,
        expires_at,
        article:articles!article_id(id, title, slug)
      `)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching breaking news:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { data: null, error: "Failed to fetch breaking news" };
  }
}

/**
 * Toggle active status for breaking news
 */
export async function toggleBreakingNewsActive(breakingId: string, isActive: boolean) {
  const supabase = await createClient();

  try {
    // Get old status for audit log
    const { data: oldNews } = await supabase
      .from("breaking_news")
      .select("title, is_active")
      .eq("id", breakingId)
      .single();

    const { error } = await supabase
      .from("breaking_news")
      .update({ is_active: isActive } as any)
      .eq("id", breakingId);

    if (error) {
      console.error("Error updating breaking news status:", error);
      return { success: false, error: error.message };
    }

    // Log audit event
    await logAuditEvent({
      action: isActive ? "activate" : "deactivate",
      entityType: "breaking_news",
      entityId: breakingId,
      oldValues: oldNews ? {
        title: oldNews.title,
        is_active: oldNews.is_active,
      } : undefined,
      newValues: {
        title: oldNews?.title,
        is_active: isActive,
      },
    });

    // Revalidate homepage
    revalidatePath("/");
    
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to update breaking news" };
  }
}

/**
 * Create a new breaking news item
 */
export async function createBreakingNews(data: {
  articleId: string;
  title: string;
  priority: number;
  startsAt: string;
  expiresAt: string | null;
}) {
  const supabase = await createClient();

  try {
    const { data: newBreakingNews, error } = await supabase
      .from("breaking_news")
      .insert({
        article_id: data.articleId,
        title: data.title,
        is_active: true,
        priority: data.priority,
        starts_at: data.startsAt,
        expires_at: data.expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating breaking news:", error);
      return { success: false, error: error.message };
    }

    // Log audit event
    await logAuditEvent({
      action: "create",
      entityType: "breaking_news",
      entityId: newBreakingNews.id,
      newValues: {
        title: data.title,
        article_id: data.articleId,
        priority: data.priority,
        is_active: true,
      },
    });

    // Revalidate homepage
    revalidatePath("/");
    
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to create breaking news" };
  }
}

/**
 * Delete a breaking news item
 */
export async function deleteBreakingNews(breakingId: string) {
  const supabase = await createClient();

  try {
    // Get breaking news data before deletion for audit log
    const { data: breakingNews } = await supabase
      .from("breaking_news")
      .select("title, article_id, priority, is_active")
      .eq("id", breakingId)
      .single();

    const { error } = await supabase
      .from("breaking_news")
      .delete()
      .eq("id", breakingId);

    if (error) {
      console.error("Error deleting breaking news:", error);
      return { success: false, error: error.message };
    }

    // Log audit event
    await logAuditEvent({
      action: "delete",
      entityType: "breaking_news",
      entityId: breakingId,
      oldValues: breakingNews ? {
        title: breakingNews.title,
        article_id: breakingNews.article_id,
        priority: breakingNews.priority,
        is_active: breakingNews.is_active,
      } : undefined,
    });

    // Revalidate homepage
    revalidatePath("/");
    
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to delete breaking news" };
  }
}
