"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { VideoUploadDialog, type UploadedVideoData } from "@/components/cms/video-upload-dialog";
import { ThumbnailUploadDialog } from "@/components/cms/thumbnail-upload-dialog";
import {
  createVideo,
  type VideoFormData,
} from "../actions";
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "@/lib/utils/youtube";
import { generateSlug } from "@/lib/utils/slug";
import { Play, Upload, X, Image as ImageIcon } from "lucide-react";

export default function NewVideoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    slug: "",
    description: "",
    source_type: "youtube",
    source_url: "",
    thumbnail_id: null,
    orientation: "horizontal",
    video_type: "news",
    is_exclusive: false,
    is_featured: false,
    status: "draft",
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoData | null>(null);
  const [thumbnailPickerOpen, setThumbnailPickerOpen] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<{ id: string; url: string } | null>(null);

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: autoSlug ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, source_url: url }));
    
    // Try to extract and preview
    const videoId = extractYouTubeId(url);
    if (videoId) {
      setYoutubePreview(getYouTubeThumbnail(videoId, "hq"));
    } else {
      setYoutubePreview(null);
    }
  };

  const handleVideoUploadSuccess = (video: UploadedVideoData) => {
    setUploadedVideo(video);
    setFormData((prev) => ({
      ...prev,
      source_type: "upload",
      source_url: video.public_url,
    }));
  };

  const handleRemoveUploadedVideo = () => {
    setUploadedVideo(null);
    setFormData((prev) => ({
      ...prev,
      source_url: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate
    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError("Slug is required");
      setLoading(false);
      return;
    }

    if (formData.source_type === "youtube" && !formData.source_url.trim()) {
      setError("YouTube URL is required");
      setLoading(false);
      return;
    }

    if (formData.source_type === "upload" && !uploadedVideo) {
      setError("Please upload a video file");
      setLoading(false);
      return;
    }

    if (formData.source_type === "youtube") {
      const videoId = extractYouTubeId(formData.source_url);
      if (!videoId) {
        setError("Invalid YouTube URL");
        setLoading(false);
        return;
      }
    }

    const { data, error: saveError } = await createVideo(formData);

    if (data) {
      router.push("/admin/videos");
    } else if (saveError) {
      setError(saveError);
    }

    setLoading(false);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Add Video"
        description="Import from YouTube or upload video file"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Source Type Selection */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Video Source
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, source_type: "youtube" }));
                setUploadedVideo(null);
              }}
              className={`
                flex items-center gap-3 rounded-lg border-2 p-4 transition-all
                ${
                  formData.source_type === "youtube"
                    ? "border-vntv-red bg-vntv-red/5"
                    : "border-border hover:border-vntv-red/50"
                }
              `}
            >
              <Play className={`h-8 w-8 ${formData.source_type === "youtube" ? "text-vntv-red" : "text-text-tertiary"}`} />
              <div className="text-left">
                <div className="font-semibold text-text-primary">YouTube</div>
                <div className="text-sm text-text-secondary">
                  Import from YouTube URL
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, source_type: "upload" }));
                setYoutubePreview(null);
              }}
              className={`
                flex items-center gap-3 rounded-lg border-2 p-4 transition-all
                ${
                  formData.source_type === "upload"
                    ? "border-vntv-red bg-vntv-red/5"
                    : "border-border hover:border-vntv-red/50"
                }
              `}
            >
              <Upload className={`h-8 w-8 ${formData.source_type === "upload" ? "text-vntv-red" : "text-text-tertiary"}`} />
              <div className="text-left">
                <div className="font-semibold text-text-primary">Upload</div>
                <div className="text-sm text-text-secondary">
                  Upload video file (MP4, WebM)
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* YouTube URL */}
        {formData.source_type === "youtube" && (
          <div className="rounded-lg border border-border bg-background-panel p-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              YouTube URL
            </h3>
            <div>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.source_url}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Paste the full YouTube video URL
              </p>
            </div>

            {/* YouTube Preview - Inline Player */}
            {youtubePreview && formData.source_url && (() => {
              const videoId = extractYouTubeId(formData.source_url);
              return videoId ? (
                <div className="mt-4">
                  <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border">
                    <iframe
                      src={getYouTubeEmbedUrl(videoId)}
                      title="YouTube video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Video Upload */}
        {formData.source_type === "upload" && (
          <div className="rounded-lg border border-border bg-background-panel p-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Upload Video File
            </h3>

            {uploadedVideo ? (
              <div className="space-y-3">
                <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-black">
                  <video
                    src={uploadedVideo.public_url}
                    controls
                    className="h-full w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {uploadedVideo.file_name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {(uploadedVideo.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveUploadedVideo}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Video File
                </Button>
                <p className="mt-2 text-xs text-text-tertiary">
                  Supported formats: MP4, WebM, QuickTime, AVI (Max 500MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Basic Information */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Basic Information
          </h3>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-text-primary">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium text-text-primary">
                Slug *
              </label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="video-slug"
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                URL-friendly version. Auto-generated from title.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-text-primary">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter video description"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Video Settings
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Video Type */}
            <div>
              <label htmlFor="video_type" className="mb-1 block text-sm font-medium text-text-primary">
                Video Type
              </label>
              <select
                id="video_type"
                value={formData.video_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, video_type: e.target.value as any }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="news">News</option>
                <option value="breaking">Breaking News</option>
                <option value="interview">Interview</option>
                <option value="documentary">Documentary</option>
                <option value="short">Short</option>
                <option value="original">Original</option>
                <option value="standalone">Standalone</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label htmlFor="orientation" className="mb-1 block text-sm font-medium text-text-primary">
                Orientation
              </label>
              <select
                id="orientation"
                value={formData.orientation}
                onChange={(e) => setFormData((prev) => ({ ...prev, orientation: e.target.value as any }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="horizontal">Horizontal (16:9)</option>
                <option value="vertical">Vertical (9:16)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Thumbnail */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Custom Thumbnail (Optional)
          </h3>
          <p className="mb-4 text-sm text-text-secondary">
            Upload a custom thumbnail image for your video. If not set, YouTube videos will use their default thumbnail.
          </p>
          
          {selectedThumbnail ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border">
                <img
                  src={selectedThumbnail.url}
                  alt="Video thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedThumbnail(null);
                  setFormData((prev) => ({ ...prev, thumbnail_id: null }));
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Thumbnail
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setThumbnailPickerOpen(true)}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose Thumbnail
            </Button>
          )}
        </div>

        {/* Flags */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Flags
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_exclusive"
                checked={formData.is_exclusive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_exclusive: checked === true }))
                }
              />
              <label htmlFor="is_exclusive" className="text-sm font-medium text-text-primary">
                Exclusive Content
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_featured: checked === true }))
                }
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-text-primary">
                Featured Video
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              setFormData((prev) => ({ ...prev, status: "draft" }));
              handleSubmit(e as any);
            }}
          >
            Save as Draft
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>

      {/* Video Upload Dialog */}
      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleVideoUploadSuccess}
      />

      {/* Thumbnail Picker Dialog */}
      <ThumbnailUploadDialog
        open={thumbnailPickerOpen}
        onOpenChange={setThumbnailPickerOpen}
        onSelect={(thumbnail) => {
          setSelectedThumbnail(thumbnail);
          setFormData((prev) => ({ ...prev, thumbnail_id: thumbnail.id }));
          setThumbnailPickerOpen(false);
        }}
      />
    </AdminLayout>
  );
}
