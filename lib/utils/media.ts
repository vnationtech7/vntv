/**
 * Media utility functions
 * Pure functions with no server dependencies for client-side use
 */

import { getOptimizedImageUrl, getThumbnailUrl } from "./image-optimizer";

export type MediaAsset = {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
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

/**
 * Get optimized image URL for a media asset
 */
export function getOptimizedMediaUrl(
  asset: MediaAsset,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  } = {}
): string {
  if (asset.media_type !== "image") {
    return asset.public_url;
  }

  return getOptimizedImageUrl(asset.public_url, {
    width: options.width,
    height: options.height,
    quality: options.quality || 85,
    format: options.format || "webp",
    fit: "cover",
  });
}

/**
 * Get thumbnail URL for a media asset
 */
export function getMediaThumbnailUrl(
  asset: MediaAsset,
  size: number = 150
): string {
  if (asset.media_type !== "image") {
    return asset.public_url;
  }

  return getThumbnailUrl(asset.public_url, size);
}
