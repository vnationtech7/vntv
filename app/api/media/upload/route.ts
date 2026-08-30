// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (10MB for images, 500MB for videos)
    const maxSize = file.type.startsWith("video/") ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Determine media type and bucket
    const mediaType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "document";
    
    // Videos go to 'videos' bucket, everything else goes to 'media' bucket
    const bucketName = mediaType === "video" ? "videos" : "media";

    // Generate unique file path (without bucket prefix)
    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-");
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    
    // Path within the bucket (don't include bucket name)
    const pathInBucket = `${user.id}/${year}/${month}/${timestamp}-${sanitizedFileName}`;
    
    // Full storage path for database (includes bucket name)
    const storagePath = `${bucketName}/${pathInBucket}`;

    console.log(`Uploading ${mediaType} to bucket '${bucketName}' at path:`, pathInBucket);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(pathInBucket, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload file to storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log("Upload successful, creating database record...");

    // Get image dimensions if it's an image
    let width: number | null = null;
    let height: number | null = null;

    if (mediaType === "image") {
      // For images, we'll set dimensions later via client-side or skip for now
      // This can be enhanced with server-side image processing libraries
    }

    // Create media asset record
    const { data: mediaAsset, error: dbError } = await supabase
      .from("media_assets")
      .insert({
        file_name: file.name,
        storage_path: storagePath,
        media_type: mediaType,
        mime_type: file.type,
        file_size: file.size,
        width,
        height,
        uploaded_by: user.id,
      })
      .select()
      .single() as {
        data: {
          id: string;
          file_name: string;
          storage_path: string;
          media_type: string;
          file_size: number;
        } | null;
        error: any;
      };

    if (dbError || !mediaAsset) {
      console.error("Database insert error:", dbError);
      console.error("Attempted to insert:", {
        file_name: file.name,
        storage_path: storagePath,
        media_type: mediaType,
        mime_type: file.type,
        file_size: file.size,
      });
      // Clean up uploaded file
      await supabase.storage.from(bucketName).remove([pathInBucket]);
      return NextResponse.json(
        { error: `Failed to create media record: ${dbError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log("Media asset created successfully:", mediaAsset.id);

    return NextResponse.json({
      id: mediaAsset.id,
      fileName: mediaAsset.file_name,
      storagePath: mediaAsset.storage_path,
      mediaType: mediaAsset.media_type,
      fileSize: mediaAsset.file_size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    console.error("Error details:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: `Internal server error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
