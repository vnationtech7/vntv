"use client";

import { useState } from "react";
import { VideoSearchPicker } from "./video-search-picker";
import { Upload, Search, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui";

interface VideoUploadOrSearchProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function VideoUploadOrSearch({
  value,
  onChange,
  label = "Video",
}: VideoUploadOrSearchProps) {
  const [mode, setMode] = useState<"add" | "search">("add");
  const [addType, setAddType] = useState<"url" | "upload">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data for adding video
  const [videoData, setVideoData] = useState({
    title: "",
    slug: "",
    sourceType: "youtube" as "youtube" | "external" | "upload",
    sourceUrl: "",
  });

  const handleAddVideo = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create video via server action
      const { createVideo } = await import("@/app/admin/videos/actions");
      
      // Generate unique slug with timestamp if no custom slug provided
      const baseSlug = videoData.slug || videoData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const uniqueSlug = videoData.slug ? baseSlug : `${baseSlug}-${Date.now()}`;
      
      const result = await createVideo({
        title: videoData.title,
        slug: uniqueSlug,
        description: "",
        source_type: videoData.sourceType,
        source_url: videoData.sourceUrl,
        orientation: "horizontal",
        video_type: "standalone",
        is_exclusive: false,
        is_featured: false,
        status: "draft",
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Set the newly created video ID
      if (result.data) {
        onChange(result.data.id);
        
        // Reset form
        setVideoData({
          title: "",
          slug: "",
          sourceType: "youtube",
          sourceUrl: "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-fill title from filename if empty
    if (!videoData.title) {
      const titleFromFile = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setVideoData(prev => ({ ...prev, title: titleFromFile }));
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First upload the video file to media storage
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

      const uploadResult = await response.json();

      // Generate unique slug with timestamp
      const baseSlug = (videoData.slug || file.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      // Then create a video record pointing to this media asset
      const { createVideo } = await import("@/app/admin/videos/actions");
      
      const result = await createVideo({
        title: videoData.title || file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        slug: uniqueSlug,
        description: "",
        source_type: "upload",
        source_url: uploadResult.storagePath, // Store the storage path
        thumbnail_id: uploadResult.id, // Link to media asset
        orientation: "horizontal",
        video_type: "standalone",
        is_exclusive: false,
        is_featured: false,
        status: "draft",
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        onChange(result.data.id);
        
        // Reset form
        setVideoData({
          title: "",
          slug: "",
          sourceType: "youtube",
          sourceUrl: "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary">
        {label}
      </label>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("add")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "add"
              ? "bg-accent-yellow text-black"
              : "bg-surface-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Upload className="w-4 h-4" />
          Add New Video
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

      {/* Add Video Mode */}
      {mode === "add" && (
        <div className="space-y-4 p-4 bg-surface-secondary rounded-lg border border-border">
          {/* Add Type Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddType("url")}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                addType === "url"
                  ? "bg-accent-yellow text-black"
                  : "bg-surface-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Video URL
            </button>
            <button
              type="button"
              onClick={() => setAddType("upload")}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                addType === "upload"
                  ? "bg-accent-yellow text-black"
                  : "bg-surface-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {/* Video Title */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Video Title *
            </label>
            <input
              type="text"
              value={videoData.title}
              onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
              placeholder="Enter video title"
              className="w-full px-3 py-2 text-sm rounded-lg bg-surface-tertiary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            />
          </div>

          {addType === "url" ? (
            <>
              {/* Source Type */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Video Platform *
                </label>
                <select
                  value={videoData.sourceType}
                  onChange={(e) => setVideoData({ ...videoData, sourceType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-tertiary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                >
                  <option value="youtube">YouTube</option>
                  <option value="external">External (Vimeo, etc.)</option>
                </select>
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={videoData.sourceUrl}
                  onChange={(e) => setVideoData({ ...videoData, sourceUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-tertiary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                />
              </div>

              <Button
                type="button"
                onClick={handleAddVideo}
                disabled={isSubmitting || !videoData.title || !videoData.sourceUrl}
                variant="primary"
                size="sm"
              >
                {isSubmitting ? "Adding..." : "Add Video"}
              </Button>
            </>
          ) : (
            <>
              {/* File Upload */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-tertiary border border-border text-text-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-accent-yellow file:text-black hover:file:bg-accent-yellow/90 focus:outline-none focus:ring-2 focus:ring-accent-yellow disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-text-tertiary">
                  MP4, WEBM (max 500MB) • Title will be auto-filled from filename
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      )}

      {/* Search Mode */}
      {mode === "search" && (
        <VideoSearchPicker
          value={value}
          onChange={onChange}
          label=""
          placeholder="Search for video..."
        />
      )}
    </div>
  );
}
