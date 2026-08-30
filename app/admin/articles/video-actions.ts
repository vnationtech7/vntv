// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get videos associated with an article
 */
export async function getArticleVideos(articleId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("video_articles")
      .select(`
        video_id,
        position,
        videos (
          id,
          title,
          slug,
          source_type,
          source_url,
          video_type,
          orientation,
          duration_seconds,
          status
        )
      `)
      .eq("article_id", articleId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching article videos:", error);
      return { data: null, error: error.message };
    }

    // Flatten the structure
    const videos = data?.map((item: any) => ({
      ...item.videos,
      position: item.position,
    })) || [];

    return { data: videos, error: null };
  } catch (err) {
    console.error("Unexpected error fetching article videos:", err);
    return { data: null, error: "Failed to fetch article videos" };
  }
}

/**
 * Add video to article
 */
export async function addVideoToArticle(
  articleId: string,
  videoId: string,
  position?: number
) {
  const supabase = await createClient();

  try {
    // Get current max position if not provided
    if (position === undefined) {
      const { data: existing } = await supabase
        .from("video_articles")
        .select("position")
        .eq("article_id", articleId)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      position = existing ? existing.position + 1 : 0;
    }

    const { data, error } = await supabase
      .from("video_articles")
      .insert({
        article_id: articleId,
        video_id: videoId,
        position,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding video to article:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/admin/articles/${articleId}`);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error adding video to article:", err);
    return { data: null, error: "Failed to add video to article" };
  }
}

/**
 * Remove video from article
 */
export async function removeVideoFromArticle(
  articleId: string,
  videoId: string
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("video_articles")
      .delete()
      .eq("article_id", articleId)
      .eq("video_id", videoId);

    if (error) {
      console.error("Error removing video from article:", error);
      return { error: error.message };
    }

    revalidatePath(`/admin/articles/${articleId}`);
    return { error: null };
  } catch (err) {
    console.error("Unexpected error removing video from article:", err);
    return { error: "Failed to remove video from article" };
  }
}

/**
 * Update video position in article
 */
export async function updateVideoPosition(
  articleId: string,
  videoId: string,
  newPosition: number
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("video_articles")
      .update({ position: newPosition } as any)
      .eq("article_id", articleId)
      .eq("video_id", videoId);

    if (error) {
      console.error("Error updating video position:", error);
      return { error: error.message };
    }

    revalidatePath(`/admin/articles/${articleId}`);
    return { error: null };
  } catch (err) {
    console.error("Unexpected error updating video position:", err);
    return { error: "Failed to update video position" };
  }
}

/**
 * Reorder videos in article
 */
export async function reorderArticleVideos(
  articleId: string,
  videoIds: string[]
) {
  const supabase = await createClient();

  try {
    // Update positions for all videos
    const updates = videoIds.map((videoId, index) =>
      supabase
        .from("video_articles")
        .update({ position: index } as any)
        .eq("article_id", articleId)
        .eq("video_id", videoId)
    );

    await Promise.all(updates);

    revalidatePath(`/admin/articles/${articleId}`);
    return { error: null };
  } catch (err) {
    console.error("Unexpected error reordering videos:", err);
    return { error: "Failed to reorder videos" };
  }
}
