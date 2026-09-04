"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadArticleMedia(file: FormData): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { url: null, error: "Not authenticated" };
    }
    
    const fileData = file.get("file") as File;
    if (!fileData) {
      return { url: null, error: "No file provided" };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = fileData.name.split(".").pop();
    const fileName = `article-${timestamp}-${randomString}.${fileExt}`;
    
    // Get current date for folder structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Follow storage policy: {user_id}/{year}/{month}/{filename}
    // For videos, use 'videos' bucket; for images, use 'media' bucket
    const isVideo = fileData.type.startsWith("video/");
    const bucketName = isVideo ? "videos" : "media";
    const filePath = `${user.id}/${year}/${month}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { url: null, error: error.message || "Upload failed" };
  }
}
