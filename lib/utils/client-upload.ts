/**
 * Client-side upload utility for uploading files directly to Supabase Storage
 * This bypasses Next.js Server Actions for better performance with large files
 */

import { createClient } from "@/lib/supabase/client";

export async function uploadToSupabase(
  file: File,
  options: {
    bucket?: "media" | "videos";
    folder?: string;
  } = {}
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { url: null, error: "Not authenticated" };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${options.folder || "upload"}-${timestamp}-${randomString}.${fileExt}`;

    // Get current date for folder structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Determine bucket based on file type or options
    const isVideo = file.type.startsWith("video/");
    const bucketName = options.bucket || (isVideo ? "videos" : "media");

    // Follow storage policy: {user_id}/{year}/{month}/{filename}
    const filePath = `${user.id}/${year}/${month}/${fileName}`;

    // Upload directly to Supabase Storage (client-side)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { url: null, error: error.message || "Upload failed" };
  }
}

/**
 * Upload file for article inline media (images/videos)
 */
export async function uploadArticleMedia(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  return uploadToSupabase(file, { folder: "article" });
}
