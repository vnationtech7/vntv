"use client";

import { useState } from "react";
import { MediaSearchPicker } from "./media-search-picker";
import { Upload, Search } from "lucide-react";

interface MediaUploadOrSearchProps {
  value: string;
  onChange: (value: string) => void;
  mediaType?: "image" | "video" | "all";
  label?: string;
  uploadLabel?: string;
  searchPlaceholder?: string;
  accept?: string;
  onUploadComplete?: (mediaId: string) => void;
}

export function MediaUploadOrSearch({
  value,
  onChange,
  mediaType = "image",
  label = "Media Asset",
  uploadLabel = "Upload New",
  searchPlaceholder = "Search media...",
  accept = "image/*",
  onUploadComplete,
}: MediaUploadOrSearchProps) {
  const [mode, setMode] = useState<"upload" | "search">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const result = await response.json();
      
      // Set the newly uploaded media ID
      onChange(result.id);
      
      if (onUploadComplete) {
        onUploadComplete(result.id);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-accent-yellow text-black"
              : "bg-surface-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload New
        </button>
        <button
          type="button"
          onClick={() => setMode("search")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "search"
              ? "bg-accent-yellow text-black"
              : "bg-surface-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Search className="w-4 h-4" />
          Search Existing
        </button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {uploadLabel}
          </label>
          <div className="relative">
            <input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-accent-yellow file:text-black hover:file:bg-accent-yellow/90 focus:outline-none focus:ring-2 focus:ring-accent-yellow disabled:opacity-50"
            />
          </div>
          
          {isUploading && (
            <p className="mt-2 text-sm text-accent-yellow">
              Uploading...
            </p>
          )}
          
          {uploadError && (
            <p className="mt-2 text-sm text-red-500">
              {uploadError}
            </p>
          )}
          
          <p className="mt-2 text-xs text-text-tertiary">
            {mediaType === "image" 
              ? "Accepts: JPG, PNG, WEBP (max 10MB)" 
              : mediaType === "video"
              ? "Accepts: MP4, WEBM (max 500MB)"
              : "Accepts image or video files"}
          </p>
        </div>
      )}

      {/* Search Mode */}
      {mode === "search" && (
        <MediaSearchPicker
          value={value}
          onChange={onChange}
          mediaType={mediaType}
          label={label}
          placeholder={searchPlaceholder}
        />
      )}
    </div>
  );
}
