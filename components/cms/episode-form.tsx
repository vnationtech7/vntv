"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createEpisode, updateEpisode, type EpisodeData } from "@/app/actions/episode";
import { generateEpisodeSlug } from "@/lib/utils/slug";
import { MediaUploadOrSearch } from "@/components/cms/media-upload-or-search";
import { VideoUploadOrSearch } from "@/components/cms/video-upload-or-search";
import { Loader2 } from "lucide-react";

interface EpisodeFormProps {
  programmeId: string;
  episode?: EpisodeData;
  mode: "create" | "edit";
  suggestedEpisodeNumber?: number;
}

export function EpisodeForm({ programmeId, episode, mode, suggestedEpisodeNumber }: EpisodeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: episode?.title || "",
    slug: episode?.slug || "",
    episode_number: episode?.episode_number || suggestedEpisodeNumber || 1,
    description: episode?.description || "",
    video_id: episode?.video_id || "",
    thumbnail_id: episode?.thumbnail_id || "",
    published_at: episode?.published_at || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (mode === "create") {
        result = await createEpisode({
          programme_id: programmeId,
          ...formData,
        });
      } else {
        result = await updateEpisode(episode!.id, {
          ...formData,
        });
      }

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push(`/admin/programmes/${programmeId}/episodes`);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      // Auto-generate slug from title and episode number if creating
      slug: mode === "create" ? generateEpisodeSlug(title, prev.episode_number) : prev.slug,
    }));
  };

  const handleEpisodeNumberChange = (value: string) => {
    const episodeNumber = value === "" ? 0 : parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      episode_number: isNaN(episodeNumber) ? 0 : episodeNumber,
      // Regenerate slug with new episode number if creating and valid number
      slug: mode === "create" && episodeNumber > 0 
        ? generateEpisodeSlug(prev.title, episodeNumber) 
        : prev.slug,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Episode Number */}
      <div>
        <label htmlFor="episode_number" className="block text-sm font-medium text-text-primary mb-2">
          Episode Number *
        </label>
        <input
          type="number"
          id="episode_number"
          value={formData.episode_number || ""}
          onChange={(e) => handleEpisodeNumberChange(e.target.value)}
          required
          min={1}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
        {suggestedEpisodeNumber && mode === "create" && (
          <p className="text-xs text-text-tertiary mt-1">
            Suggested: Episode {suggestedEpisodeNumber} (next available)
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
          Episode Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          placeholder="e.g., The Rise of African Tech"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-text-primary mb-2">
          URL Slug *
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
        <p className="text-xs text-text-tertiary mt-1">
          URL: /originals/[programme]/{formData.slug || "episode-slug"}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow resize-none"
          placeholder="Brief description of the episode..."
        />
      </div>

      {/* Video */}
      <VideoUploadOrSearch
        value={formData.video_id}
        onChange={(value) => setFormData({ ...formData, video_id: value })}
        label="Episode Video"
      />

      {/* Thumbnail */}
      <MediaUploadOrSearch
        value={formData.thumbnail_id}
        onChange={(value) => setFormData({ ...formData, thumbnail_id: value })}
        mediaType="image"
        label="Custom Thumbnail (Optional)"
        uploadLabel="Upload Thumbnail"
        searchPlaceholder="Search for thumbnail image..."
        accept="image/*"
      />

      {/* Published Date */}
      <div>
        <label htmlFor="published_at" className="block text-sm font-medium text-text-primary mb-2">
          Publish Date (Optional)
        </label>
        <input
          type="datetime-local"
          id="published_at"
          value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ""}
          onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
        <p className="text-xs text-text-tertiary mt-1">
          Leave empty to save as draft. Episodes are only visible when published.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : (
            mode === "create" ? "Create Episode" : "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
