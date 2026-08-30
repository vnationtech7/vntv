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
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, FileVideo, AlertCircle } from "lucide-react";

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (uploadedVideo: UploadedVideoData) => void;
}

export interface UploadedVideoData {
  storage_path: string;
  public_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

export function VideoUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: VideoUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError(
        `Invalid file type. Accepted formats: MP4, WebM, QuickTime, AVI`
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
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
      const fileName = `${timestamp}.${fileExt}`;
      const storagePath = `${user.id}/${year}/${month}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(100);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(storagePath);

      // Return video data
      const videoData: UploadedVideoData = {
        storage_path: storagePath,
        public_url: publicUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
      };

      onSuccess(videoData);
      handleClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload video");
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    setDragActive(false);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video file (MP4, WebM, QuickTime, AVI). Max 500MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              <FileVideo className="h-12 w-12 text-text-tertiary mb-3" />
              <p className="text-sm font-medium text-text-primary mb-1">
                Drag and drop your video here
              </p>
              <p className="text-xs text-text-tertiary mb-4">or click to browse</p>
              <Button type="button" variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <input
                id="video-upload"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected file preview */}
              <div className="flex items-start gap-3 rounded-lg border border-border bg-background-panel p-4">
                <FileVideo className="h-10 w-10 text-vntv-red flex-shrink-0" />
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
                    onClick={() => setSelectedFile(null)}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Upload progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Uploading...</span>
                    <span className="text-text-primary font-medium">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

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
                  {uploading ? "Uploading..." : "Upload Video"}
                </Button>
              </div>
            </div>
          )}

          {/* File format info */}
          {!selectedFile && (
            <div className="rounded-lg bg-background-panel p-3 text-xs text-text-tertiary">
              <p className="font-medium mb-1">Supported formats:</p>
              <p>MP4, WebM, QuickTime (.mov), AVI</p>
              <p className="mt-2">Maximum file size: 500MB</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
