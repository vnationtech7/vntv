"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createMediaAsset } from "@/app/admin/media/actions";
import { X, Upload, Image as ImageIcon, Check, AlertCircle } from "lucide-react";

interface MediaUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
  preview?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export function MediaUploadDialog({
  isOpen,
  onClose,
  onSuccess,
}: MediaUploadDialogProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("MediaUploadDialog mounted/updated - isOpen:", isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log("MediaUploadDialog component mounted");
    return () => console.log("MediaUploadDialog component unmounted");
  }, []);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "File type not supported. Please upload JPEG, PNG, GIF, WebP, or PDF files.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }

    return null;
  };

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newUploadFiles: UploadFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      const preview = await generatePreview(file);

      newUploadFiles.push({
        file,
        id: `${Date.now()}-${i}`,
        status: error ? "error" : "pending",
        progress: 0,
        error,
        preview,
      });
    }

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed, files:", e.target.files);
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleSelectFiles = () => {
    console.log("Select Files button clicked");
    console.log("File input ref:", fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleSelectFilesButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectFiles();
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const supabase = createClient();

    try {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
        )
      );

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate storage path
      const timestamp = Date.now();
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const fileExt = uploadFile.file.name.split(".").pop();
      const fileName = `${timestamp}-${uploadFile.file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}.${fileExt}`;
      const storagePath = `${user.id}/${year}/${month}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, uploadFile.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Update progress to 80% (upload complete, now processing)
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, progress: 80, status: "processing" as const }
            : f
        )
      );

      // Get image dimensions if it's an image
      let width: number | undefined;
      let height: number | undefined;

      if (uploadFile.file.type.startsWith("image/")) {
        const dimensions = await getImageDimensions(uploadFile.file);
        width = dimensions.width;
        height = dimensions.height;
      }

      // Create media asset record in database
      const mediaType = uploadFile.file.type.startsWith("image/")
        ? "image"
        : uploadFile.file.type === "application/pdf"
        ? "document"
        : "video";

      const { data: asset, error: assetError } = await createMediaAsset({
        file_name: uploadFile.file.name,
        storage_path: `media/${storagePath}`,
        media_type: mediaType,
        mime_type: uploadFile.file.type,
        file_size: uploadFile.file.size,
        width,
        height,
      });

      if (assetError) throw new Error(assetError);

      // Update to success
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, progress: 100, status: "success" as const }
            : f
        )
      );
    } catch (error) {
      console.error("Upload error:", error);
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error" as const,
                error:
                  error instanceof Error
                    ? error.message
                    : "Upload failed. Please try again.",
              }
            : f
        )
      );
    }
  };

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  };

  const handleUploadAll = async () => {
    console.log("handleUploadAll called");
    console.log("Upload files:", uploadFiles);
    console.log("Pending files:", uploadFiles.filter((f) => f.status === "pending"));
    
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    // Check if all uploads succeeded
    const allSuccess = uploadFiles.every((f) => f.status === "success");
    if (allSuccess) {
      onSuccess();
      setTimeout(() => {
        onClose();
        setUploadFiles([]);
      }, 1500);
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "uploading":
      case "processing":
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-vntv-red border-t-transparent" />
        );
      default:
        return null;
    }
  };

  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case "success":
        return "Upload complete";
      case "error":
        return file.error || "Upload failed";
      case "uploading":
        return `Uploading... ${file.progress}%`;
      case "processing":
        return "Processing...";
      default:
        return "Ready to upload";
    }
  };

  const hasPendingFiles = uploadFiles.some((f) => f.status === "pending");
  const hasUploadingFiles = uploadFiles.some(
    (f) => f.status === "uploading" || f.status === "processing"
  );
  const allSuccess = uploadFiles.length > 0 && uploadFiles.every((f) => f.status === "success");

  console.log("MediaUploadDialog render state:", {
    isOpen,
    uploadFilesCount: uploadFiles.length,
    hasPendingFiles,
    hasUploadingFiles,
    allSuccess,
    windowDefined: typeof window !== 'undefined'
  });

  if (!isOpen) return null;

  console.log("MediaUploadDialog is OPEN, rendering content...");

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !hasUploadingFiles) {
          onClose();
        }
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-background-panel shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background-panel p-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Upload Media
            </h2>
            <p className="text-sm text-text-secondary">
              Images, PDFs up to 10MB each
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={hasUploadingFiles}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSelectFiles}
            className={`
              relative rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer
              ${
                isDragging
                  ? "border-vntv-red bg-vntv-red/5"
                  : "border-border hover:border-vntv-red/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-text-tertiary" />
            <p className="mt-4 text-lg font-medium text-text-primary">
              Drag and drop files here
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              or click to browse
            </p>
            <Button
              type="button"
              onClick={handleSelectFilesButton}
              className="mt-4"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Select Files
            </Button>
            <p className="mt-4 text-xs text-text-tertiary">
              Supported: JPEG, PNG, GIF, WebP, PDF • Max 10MB per file
              <br />
              Recommended: 1920x1080px (16:9) for featured images
            </p>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-primary">
                Files ({uploadFiles.length})
              </h3>
              <div className="space-y-2">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    {/* Preview */}
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-border bg-background-secondary">
                      {uploadFile.preview ? (
                        <img
                          src={uploadFile.preview}
                          alt={uploadFile.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-text-tertiary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-text-secondary">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <span className="text-text-tertiary">•</span>
                        <p className="text-xs text-text-secondary">
                          {getStatusText(uploadFile)}
                        </p>
                      </div>
                      {/* Progress Bar */}
                      {(uploadFile.status === "uploading" ||
                        uploadFile.status === "processing") && (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background-secondary">
                          <div
                            className="h-full bg-vntv-red transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(uploadFile.status)}
                    </div>

                    {/* Remove Button */}
                    {uploadFile.status !== "uploading" &&
                      uploadFile.status !== "processing" && (
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="flex-shrink-0 text-text-secondary hover:text-red-500"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {allSuccess && (
            <div className="rounded-lg bg-green-500/10 p-4 text-center">
              <Check className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 font-medium text-green-500">
                All files uploaded successfully!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-background-panel p-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={hasUploadingFiles}
          >
            {allSuccess ? "Done" : "Cancel"}
          </Button>
          {!allSuccess && (
            <Button
              type="button"
              onClick={handleUploadAll}
              disabled={!hasPendingFiles || hasUploadingFiles}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {uploadFiles.filter((f) => f.status === "pending").length}{" "}
              {uploadFiles.filter((f) => f.status === "pending").length === 1
                ? "File"
                : "Files"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root level
  if (typeof window !== 'undefined') {
    console.log("Creating portal to document.body");
    return createPortal(dialogContent, document.body);
  }

  console.log("Window is undefined, returning null");
  return null;
}
