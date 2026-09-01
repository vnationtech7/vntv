// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Video = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  source_type: "upload" | "youtube" | "external";
  source_url: string | null;
  storage_path: string | null;
  thumbnail_id: string | null;
  thumbnail?: {
    id: string;
    file_name: string;
    storage_path: string;
    media_type: string;
  } | null;
  duration_seconds: number | null;
  orientation: "horizontal" | "vertical";
  video_type: "news" | "breaking" | "interview" | "documentary" | "short" | "original" | "standalone";
  programme_id: string | null;
  is_exclusive: boolean;
  is_featured: boolean;
  status: "draft" | "review" | "approved" | "scheduled" | "published" | "rejected" | "archived";
  published_at: string | null;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoFormData = {
  title: string;
  slug: string;
  description: string;
  source_type: "upload" | "youtube" | "external";
  source_url: string;
  thumbnail_id?: string | null;
  duration_seconds?: number;
  orientation: "horizontal" | "vertical";
  video_type: "news" | "breaking" | "interview" | "documentary" | "short" | "original" | "standalone";
  is_exclusive: boolean;
  is_featured: boolean;
  status: "draft" | "published";
};

/**
 * Get all videos with optional filters
 */
export async function getVideos(filters?: {
  status?: string;
  video_type?: string;
  source_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("videos")
      .select(`
        *,
        thumbnail:media_assets!thumbnail_id(id, file_name, storage_path, media_type)
      `)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.video_type) {
      query = query.eq("video_type", filters.video_type);
    }

    if (filters?.source_type) {
      query = query.eq("source_type", filters.source_type);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching videos:", error);
      return { data: null, error: error.message };
    }

    return { data: data as Video[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching videos:", err);
    return { data: null, error: "Failed to fetch videos" };
  }
}

/**
 * Get a single video by ID
 */
export async function getVideo(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching video:", error);
      return { data: null, error: error.message };
    }

    return { data: data as Video, error: null };
  } catch (err) {
    console.error("Unexpected error fetching video:", err);
    return { data: null, error: "Failed to fetch video" };
  }
}

/**
 * Create a new video
 */
export async function createVideo(formData: VideoFormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("videos")
      .insert({
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        source_type: formData.source_type,
        source_url: formData.source_url || null,
        thumbnail_id: formData.thumbnail_id || null,
        duration_seconds: formData.duration_seconds || null,
        orientation: formData.orientation,
        video_type: formData.video_type,
        is_exclusive: formData.is_exclusive,
        is_featured: formData.is_featured,
        status: formData.status,
        published_at: formData.status === "published" ? new Date().toISOString() : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating video:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/videos");
    return { data: data as Video, error: null };
  } catch (err) {
    console.error("Unexpected error creating video:", err);
    return { data: null, error: "Failed to create video" };
  }
}

/**
 * Update a video
 */
export async function updateVideo(id: string, formData: VideoFormData) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("videos")
      .update({
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        source_type: formData.source_type,
        source_url: formData.source_url || null,
        thumbnail_id: formData.thumbnail_id || null,
        duration_seconds: formData.duration_seconds || null,
        orientation: formData.orientation,
        video_type: formData.video_type,
        is_exclusive: formData.is_exclusive,
        is_featured: formData.is_featured,
        status: formData.status,
        published_at:
          formData.status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating video:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/videos");
    return { data: data as Video, error: null };
  } catch (err) {
    console.error("Unexpected error updating video:", err);
    return { data: null, error: "Failed to update video" };
  }
}

/**
 * Delete a video
 */
export async function deleteVideo(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting video:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/videos");
    return { error: null };
  } catch (err) {
    console.error("Unexpected error deleting video:", err);
    return { error: "Failed to delete video" };
  }
}

/**
 * Get video statistics
 */
export async function getVideoStats() {
  const supabase = await createClient();

  try {
    const [totalResult, publishedResult, youtubeResult, uploadedResult] =
      await Promise.all([
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .eq("source_type", "youtube"),
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .eq("source_type", "upload"),
      ]);

    return {
      total: totalResult.count || 0,
      published: publishedResult.count || 0,
      youtube: youtubeResult.count || 0,
      uploaded: uploadedResult.count || 0,
    };
  } catch (err) {
    console.error("Error fetching video stats:", err);
    return {
      total: 0,
      published: 0,
      youtube: 0,
      uploaded: 0,
    };
  }
}
