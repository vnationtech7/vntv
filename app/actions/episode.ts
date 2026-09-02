// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type EpisodeData = {
  id: string;
  programme_id: string;
  title: string;
  slug: string;
  episode_number: number;
  description: string | null;
  video_id: string | null;
  url: string | null;
  thumbnail_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  video?: {
    id: string;
    title: string;
    slug: string;
    source_type: string;
    source_url: string;
    duration_seconds: number | null;
  } | null;
  thumbnail?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
  programme?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

/**
 * Get all episodes for a programme
 */
export async function getProgrammeEpisodes(programmeId: string) {
  const supabase = await createClient();

  try {
    const { data: episodes, error } = await supabase
      .from("episodes")
      .select("id, programme_id, title, slug, episode_number, description, video_id, url, thumbnail_id, published_at, created_at, updated_at")
      .eq("programme_id", programmeId)
      .order("episode_number", { ascending: true });

    if (error) {
      console.error("Error fetching episodes:", error);
      return { data: null, error: error.message };
    }

    if (!episodes || episodes.length === 0) {
      return { data: [], error: null };
    }

    // Get related data
    const videoIds = episodes.map((e) => e.video_id).filter(Boolean);
    const thumbnailIds = episodes.map((e) => e.thumbnail_id).filter(Boolean);

    const [videosResult, thumbnailsResult] = await Promise.all([
      videoIds.length > 0
        ? supabase.from("videos").select("id, title, slug, source_type, source_url, duration_seconds").in("id", videoIds)
        : { data: [], error: null },
      thumbnailIds.length > 0
        ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", thumbnailIds)
        : { data: [], error: null },
    ]);

    const videosMap = new Map(videosResult.data?.map((v: any) => [v.id, v]) || []);
    const thumbnailsMap = new Map(thumbnailsResult.data?.map((t: any) => [t.id, t]) || []);

    const enrichedEpisodes = episodes.map((episode) => ({
      ...episode,
      video: episode.video_id ? videosMap.get(episode.video_id) || null : null,
      thumbnail: episode.thumbnail_id ? thumbnailsMap.get(episode.thumbnail_id) || null : null,
    }));

    return { data: enrichedEpisodes, error: null };
  } catch (err) {
    console.error("Error fetching episodes:", err);
    return { data: null, error: "Failed to fetch episodes" };
  }
}

/**
 * Get single episode by ID
 */
export async function getEpisode(id: string) {
  const supabase = await createClient();

  try {
    const { data: episode, error } = await supabase
      .from("episodes")
      .select("id, programme_id, title, slug, episode_number, description, video_id, url, thumbnail_id, published_at, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !episode) {
      return { data: null, error: "Episode not found" };
    }

    // Get related data
    const [videoResult, thumbnailResult, programmeResult] = await Promise.all([
      episode.video_id
        ? supabase.from("videos").select("id, title, slug, source_type, source_url, duration_seconds").eq("id", episode.video_id).single()
        : { data: null, error: null },
      episode.thumbnail_id
        ? supabase.from("media_assets").select("id, storage_path, alt_text").eq("id", episode.thumbnail_id).single()
        : { data: null, error: null },
      supabase.from("programmes").select("id, name, slug").eq("id", episode.programme_id).single(),
    ]);

    episode.video = videoResult.data;
    episode.thumbnail = thumbnailResult.data;
    episode.programme = programmeResult.data;

    return { data: episode, error: null };
  } catch (err) {
    console.error("Error fetching episode:", err);
    return { data: null, error: "Failed to fetch episode" };
  }
}

/**
 * Get episode by slug (for public pages)
 */
export async function getEpisodeBySlug(programmeSlug: string, episodeSlug: string) {
  const supabase = await createClient();

  try {
    // Get programme first
    const { data: programme, error: progError } = await supabase
      .from("programmes")
      .select("id, name, slug")
      .eq("slug", programmeSlug)
      .eq("is_active", true)
      .single();

    if (progError || !programme) {
      return { data: null, error: "Programme not found" };
    }

    // Get episode
    const { data: episode, error } = await supabase
      .from("episodes")
      .select("id, programme_id, title, slug, episode_number, description, video_id, url, thumbnail_id, published_at")
      .eq("programme_id", programme.id)
      .eq("slug", episodeSlug)
      .not("published_at", "is", null)
      .single();

    if (error || !episode) {
      return { data: null, error: "Episode not found" };
    }

    // Get video and thumbnail
    const [videoResult, thumbnailResult] = await Promise.all([
      episode.video_id
        ? supabase.from("videos").select("id, title, slug, source_type, source_url, duration_seconds, view_count, thumbnail_id").eq("id", episode.video_id).single()
        : { data: null, error: null },
      episode.thumbnail_id
        ? supabase.from("media_assets").select("id, storage_path, alt_text").eq("id", episode.thumbnail_id).single()
        : { data: null, error: null },
    ]);

    episode.video = videoResult.data;
    episode.thumbnail = thumbnailResult.data;
    episode.programme = programme;

    return { data: episode, error: null };
  } catch (err) {
    console.error("Error fetching episode:", err);
    return { data: null, error: "Failed to fetch episode" };
  }
}

/**
 * Create new episode
 */
export async function createEpisode(data: {
  programme_id: string;
  title: string;
  slug: string;
  episode_number: number;
  description?: string;
  video_id?: string;
  url?: string;
  thumbnail_id?: string;
  published_at?: string;
}) {
  const supabase = await createClient();

  try {
    const { data: episode, error } = await supabase
      .from("episodes")
      .insert({
        programme_id: data.programme_id,
        title: data.title,
        slug: data.slug,
        episode_number: data.episode_number,
        description: data.description || null,
        video_id: data.video_id || null,
        url: data.url || null,
        thumbnail_id: data.thumbnail_id || null,
        published_at: data.published_at || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating episode:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/admin/programmes/${data.programme_id}/episodes`);
    return { data: episode, error: null };
  } catch (err) {
    console.error("Error creating episode:", err);
    return { data: null, error: "Failed to create episode" };
  }
}

/**
 * Update episode
 */
export async function updateEpisode(
  id: string,
  data: {
    title?: string;
    slug?: string;
    episode_number?: number;
    description?: string;
    video_id?: string | null;
    url?: string | null;
    thumbnail_id?: string | null;
    published_at?: string | null;
  }
) {
  const supabase = await createClient();

  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are explicitly provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.episode_number !== undefined) updateData.episode_number = data.episode_number;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.video_id !== undefined) updateData.video_id = data.video_id || null;
    if (data.url !== undefined) updateData.url = data.url || null;
    if (data.thumbnail_id !== undefined) updateData.thumbnail_id = data.thumbnail_id || null;
    if (data.published_at !== undefined) updateData.published_at = data.published_at || null;

    const { data: episode, error } = await supabase
      .from("episodes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating episode:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/admin/programmes/${episode.programme_id}/episodes`);
    return { data: episode, error: null };
  } catch (err) {
    console.error("Error updating episode:", err);
    return { data: null, error: "Failed to update episode" };
  }
}

/**
 * Delete episode
 */
export async function deleteEpisode(id: string, programmeId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("episodes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting episode:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/programmes/${programmeId}/episodes`);
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting episode:", err);
    return { success: false, error: "Failed to delete episode" };
  }
}

/**
 * Toggle episode published status
 */
export async function toggleEpisodeStatus(id: string, programmeId: string, currentStatus: string) {
  const supabase = await createClient();

  try {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("episodes")
      .update({
        status: newStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error toggling episode status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/programmes/${programmeId}/episodes`);
    return { success: true, error: null };
  } catch (err) {
    console.error("Error toggling episode status:", err);
    return { success: false, error: "Failed to toggle episode status" };
  }
}


