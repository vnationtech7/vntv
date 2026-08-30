"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ThumbnailUploadDialog } from "@/components/cms/thumbnail-upload-dialog";
import {
  getVideo,
  updateVideo,
  type VideoFormData,
  type Video,
} from "../actions";
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "@/lib/utils/youtube";
import { Play, X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailPickerOpen, setThumbnailPickerOpen] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    setLoading(true);
    const { data, error } = await getVideo(videoId);

    if (data) {
      setVideo(data);
      setFormData({
        title: data.title,
        slug: data.slug,
        description: data.description || "",
        source_type: data.source_type,
        source_url: data.source_url || "",
        thumbnail_id: data.thumbnail_id,
        orientation: data.orientation,
        video_type: data.video_type,
        is_exclusive: data.is_exclusive,
        is_featured: data.is_featured,
        status: data.status === "published" ? "published" : "draft",
      });

      // Set thumbnail if exists
      if (data.thumbnail?.storage_path) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const thumbnailUrl = `${supabaseUrl}/storage/v1/object/public/media/${data.thumbnail.storage_path}`;
        setSelectedThumbnail({ id: data.thumbnail.id, url: thumbnailUrl });
      }
    } else if (error) {
      setError(error);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error: saveError } = await updateVideo(videoId, formData);

    if (data) {
      router.push("/admin/videos");
    } else if (saveError) {
      setError(saveError);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-vntv-red" />
        </div>
      </AdminLayout>
    );
  }

  if (!video) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
          <p className="text-text-secondary">Video not found</p>
          <Button className="mt-4" onClick={() => router.push("/admin/videos")}>
            Back to Videos
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Edit Video"
        description={`Editing: ${video.title}`}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Video Preview */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Video Preview
          </h3>
          <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-black">
            {video.source_type === "youtube" && video.source_url ? (
              <iframe
                src={getYouTubeEmbedUrl(extractYouTubeId(video.source_url) || "")}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : video.source_url ? (
              <video
                src={video.source_url}
                controls
                className="h-full w-full"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex h-full items-center justify-center text-text-tertiary">
                No video source
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-text-primary">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium text-text-primary">
                Slug *
              </label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="video-slug"
                required
              />
            </div>

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
            Upload a custom thumbnail image for your video.
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
            onClick={() => router.push("/admin/videos")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            disabled={saving}
            onClick={(e) => {
              e.preventDefault();
              setFormData((prev) => ({ ...prev, status: "draft" }));
              handleSubmit(e as any);
            }}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            onClick={(e) => {
              setFormData((prev) => ({ ...prev, status: "published" }));
            }}
          >
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </form>

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
