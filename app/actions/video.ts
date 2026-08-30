// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type VideoData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  source_type: string;
  source_url: string;
  duration_seconds: number | null;
  view_count: number;
  published_at: string;
  video_type: string | null;
  thumbnail: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

/**
 * Get a single video by slug
 */
export async function getVideo(slug: string) {
  const supabase = await createClient();

  try {
    const { data: video, error }: { data: any; error: any } = await supabase
      .from("videos")
      .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, published_at, video_type, thumbnail_id")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Error fetching video:", error);
      return { data: null, error: error.message };
    }

    if (!video) {
      return { data: null, error: "Video not found" };
    }

    // Get thumbnail if exists
    let thumbnail = null;
    if (video.thumbnail_id) {
      const { data: thumbnailData } = await supabase
        .from("media_assets")
        .select("id, storage_path, alt_text")
        .eq("id", video.thumbnail_id)
        .single();
      
      thumbnail = thumbnailData;
    }

    // Build category from video_type
    const category = video.video_type 
      ? { id: video.video_type, name: video.video_type, slug: video.video_type }
      : null;

    const enrichedVideo: VideoData = {
      ...video,
      thumbnail,
      category,
    };

    return { data: enrichedVideo, error: null };
  } catch (err) {
    console.error("Unexpected error fetching video:", err);
    return { data: null, error: "Failed to fetch video" };
  }
}

/**
 * Get suggested/related videos
 */
export async function getSuggestedVideos(currentVideoId: string, videoType: string | null, limit: number = 6) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("videos")
      .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, video_type, thumbnail_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .neq("id", currentVideoId) // Exclude current video
      .order("published_at", { ascending: false })
      .limit(limit);

    // Prioritize videos of the same type
    if (videoType) {
      query = query.eq("video_type", videoType);
    }

    const { data: videos, error }: { data: any[] | null; error: any } = await query;

    if (error) {
      console.error("Error fetching suggested videos:", error);
      return { data: null, error: error.message };
    }

    let allVideos: any[] = videos || [];

    if (!allVideos || allVideos.length === 0) {
      // If no videos of same type, get any videos
      const { data: fallbackVideos }: { data: any[] | null; error: any } = await supabase
        .from("videos")
        .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, video_type, thumbnail_id")
        .eq("status", "published")
        .not("published_at", "is", null)
        .neq("id", currentVideoId)
        .order("published_at", { ascending: false })
        .limit(limit);

      allVideos = fallbackVideos || [];
    }

    // Get thumbnails
    const thumbnailIds = allVideos.map((v: any) => v.thumbnail_id).filter(Boolean);
    const thumbnailsResult = thumbnailIds.length > 0
      ? await supabase.from("media_assets").select("id, storage_path, alt_text").in("id", thumbnailIds)
      : { data: [], error: null };

    const thumbnailsMap = new Map(thumbnailsResult.data?.map((t: any) => [t.id, t]) || []);

    // Enrich videos
    const enrichedVideos = allVideos.map((video: any) => ({
      ...video,
      category: video.video_type ? { id: video.video_type, name: video.video_type, slug: video.video_type } : null,
      thumbnail: video.thumbnail_id ? thumbnailsMap.get(video.thumbnail_id) || null : null,
    }));

    return { data: enrichedVideos, error: null };
  } catch (err) {
    console.error("Unexpected error fetching suggested videos:", err);
    return { data: null, error: "Failed to fetch suggested videos" };
  }
}

/**
 * Increment video view count
 */
export async function incrementVideoView(videoId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("increment_video_view", {
      video_id: videoId,
    } as any);

    if (error) {
      console.error("Error incrementing video view:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error incrementing video view:", err);
    return { error: "Failed to increment view count" };
  }
}
