// @ts-nocheck
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { createMediaAsset } from "@/app/admin/media/actions";
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { MediaPickerDialog } from "./media-picker-dialog";

interface ThumbnailUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (thumbnail: { id: string; url: string }) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function ThumbnailUploadDialog({
  open,
  onOpenChange,
  onSelect,
}: ThumbnailUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid file type. Accepted formats: JPEG, PNG, WebP");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate storage path
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `thumbnail-${timestamp}.${fileExt}`;
      const storagePath = `${user.id}/${year}/${month}/${fileName}`;

      // Upload to Supabase Storage (media bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get dimensions
      const dimensions = await getImageDimensions(selectedFile);

      // Create media asset record
      const { data: mediaAsset, error: mediaError } = await createMediaAsset({
        file_name: selectedFile.name,
        storage_path: storagePath,
        media_type: "image",
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        width: dimensions.width,
        height: dimensions.height,
        alt_text: "",
        caption: "",
        credit: "",
      });

      if (mediaError || !mediaAsset) {
        throw new Error(mediaError || "Failed to create media asset");
      }

      // Generate public URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`;

      onSelect({ id: mediaAsset.id, url: publicUrl });
      handleClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload thumbnail");
      setUploading(false);
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploading(false);
    setError(null);
    setDragActive(false);
    setActiveTab("upload");
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <Dialog open={open && !mediaPickerOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Video Thumbnail</DialogTitle>
            <DialogDescription>
              Upload a new image or choose from your media library
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} defaultValue="upload" onValueChange={(v) => setActiveTab(v as "upload" | "library")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload New</TabsTrigger>
              <TabsTrigger value="library">Media Library</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8
                    transition-colors cursor-pointer
                    ${
                      dragActive
                        ? "border-vntv-red bg-vntv-red/5"
                        : "border-border hover:border-vntv-red/50 hover:bg-background-panel-2"
                    }
                  `}
                  onClick={() => document.getElementById("thumbnail-upload")?.click()}
                >
                  <ImageIcon className="h-12 w-12 text-text-tertiary mb-3" />
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Drag and drop your thumbnail here
                  </p>
                  <p className="text-xs text-text-tertiary mb-4">or click to browse</p>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-background-secondary">
                    {preview && (
                      <img
                        src={preview}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-background-panel p-4">
                    <ImageIcon className="h-10 w-10 text-vntv-red flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                        className="text-text-tertiary hover:text-text-primary"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Thumbnail"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* File format info */}
              {!selectedFile && (
                <div className="rounded-lg bg-background-panel p-3 text-xs text-text-tertiary">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <p>JPEG, PNG, WebP</p>
                  <p className="mt-2">Maximum file size: 5MB</p>
                  <p className="mt-2">Recommended size: 1280x720px (16:9 aspect ratio)</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="library">
              <div className="py-4">
                <Button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Browse Media Library
                </Button>
                <p className="mt-3 text-xs text-text-tertiary text-center">
                  Choose an existing image from your media library
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media) => {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${media.storage_path}`;
          onSelect({ id: media.id, url: publicUrl });
          setMediaPickerOpen(false);
          handleClose();
        }}
      />
    </>
  );
}
