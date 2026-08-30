// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOptimizedImageUrl, getThumbnailUrl } from "@/lib/utils/image-optimizer";

/**
 * Internal helper to get storage public URL
 * Not exported to avoid "must be async" error in server actions
 */
function getMediaPublicUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucket = storagePath.startsWith("media/") ? "media" : "videos";
  const path = storagePath.replace(/^(media|videos)\//, "");
  
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export type MediaAsset = {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string; // Generated URL for public access
  media_type: "image" | "video" | "document";
  mime_type: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaAssetFormData = {
  alt_text: string;
  caption: string;
  credit: string;
};

/**
 * Get all media assets with optional filters
 */
export async function getMediaAssets(filters?: {
  mediaType?: "image" | "video" | "document";
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.mediaType) {
      query = query.eq("media_type", filters.mediaType);
    }

    if (filters?.search) {
      query = query.or(
        `file_name.ilike.%${filters.search}%,alt_text.ilike.%${filters.search}%,caption.ilike.%${filters.search}%`
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
      console.error("Error fetching media assets:", error);
      return { data: null, error: error.message };
    }

    // Add public URLs to each asset
    const assetsWithUrls = data?.map((asset: any) => ({
      ...asset,
      public_url: getMediaPublicUrl(asset.storage_path),
    })) || [];

    return { data: assetsWithUrls as MediaAsset[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching media assets:", err);
    return { data: null, error: "Failed to fetch media assets" };
  }
}

/**
 * Get a single media asset by ID
 */
export async function getMediaAsset(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching media asset:", error);
      return { data: null, error: error.message };
    }

    // Add public URL
    const assetWithUrl = {
      ...data,
      public_url: getMediaPublicUrl(data.storage_path),
    };

    return { data: assetWithUrl as MediaAsset, error: null };
  } catch (err) {
    console.error("Unexpected error fetching media asset:", err);
    return { data: null, error: "Failed to fetch media asset" };
  }
}

/**
 * Update media asset metadata
 */
export async function updateMediaAsset(
  id: string,
  formData: MediaAssetFormData
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("media_assets")
      .update({
        alt_text: formData.alt_text || null,
        caption: formData.caption || null,
        credit: formData.credit || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating media asset:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/media");
    return { data: data as MediaAsset, error: null };
  } catch (err) {
    console.error("Unexpected error updating media asset:", err);
    return { data: null, error: "Failed to update media asset" };
  }
}

/**
 * Delete media asset (also deletes from storage)
 */
export async function deleteMediaAsset(id: string) {
  const supabase = await createClient();

  try {
    // First, get the storage path
    const { data: asset, errorfetchError }: { data: any[] | null; error: any } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !asset) {
      return { error: "Media asset not found" };
    }

    // Delete from storage
    const bucket = asset.storage_path.startsWith("media/") ? "media" : "videos";
    const path = asset.storage_path.replace(/^(media|videos)\//, "");

    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error deleting media asset:", dbError);
      return { error: dbError.message };
    }

    revalidatePath("/admin/media");
    return { error: null };
  } catch (err) {
    console.error("Unexpected error deleting media asset:", err);
    return { error: "Failed to delete media asset" };
  }
}

/**
 * Create media asset record after upload
 */
export async function createMediaAsset(data: {
  file_name: string;
  storage_path: string;
  media_type: "image" | "video" | "document";
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
}) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data: asset, error }: { data: any[] | null; error: any } = await supabase
      .from("media_assets")
      .insert({
        file_name: data.file_name,
        storage_path: data.storage_path,
        media_type: data.media_type,
        mime_type: data.mime_type,
        file_size: data.file_size,
        width: data.width || null,
        height: data.height || null,
        duration: data.duration || null,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating media asset:", error);
      return { data: null, error: error.message };
    }

    // Add public URL
    const assetWithUrl = {
      ...asset,
      public_url: getMediaPublicUrl(asset.storage_path),
    };

    revalidatePath("/admin/media");
    return { data: assetWithUrl as MediaAsset, error: null };
  } catch (err) {
    console.error("Unexpected error creating media asset:", err);
    return { data: null, error: "Failed to create media asset" };
  }
}

/**
 * Get media statistics
 */
export async function getMediaStats() {
  const supabase = await createClient();

  try {
    const [imagesResult, videosResult, docsResult, totalSizeResult] =
      await Promise.all([
        supabase
          .from("media_assets")
          .select("id", { count: "exact", head: true })
          .eq("media_type", "image"),
        supabase
          .from("media_assets")
          .select("id", { count: "exact", head: true })
          .eq("media_type", "video"),
        supabase
          .from("media_assets")
          .select("id", { count: "exact", head: true })
          .eq("media_type", "document"),
        supabase.from("media_assets").select("file_size"),
      ]);

    const totalSize = totalSizeResult.data?.reduce(
      (sum, asset) => sum + (asset.file_size || 0),
      0
    );

    return {
      images: imagesResult.count || 0,
      videos: videosResult.count || 0,
      documents: docsResult.count || 0,
      total: (imagesResult.count || 0) + (videosResult.count || 0) + (docsResult.count || 0),
      totalSize: totalSize || 0,
    };
  } catch (err) {
    console.error("Error fetching media stats:", err);
    return {
      images: 0,
      videos: 0,
      documents: 0,
      total: 0,
      totalSize: 0,
    };
  }
}
