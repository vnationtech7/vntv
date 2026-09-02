"use client";

import { useState } from "react";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui";
import { Plus, Edit, Eye, EyeOff, Play, X, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { VideoPlayer } from "@/components/video/video-player";
import { deleteEpisode, toggleEpisodeStatus } from "@/app/actions/episode";
import { useRouter } from "next/navigation";
// Helper function to extract YouTube thumbnail
function getYouTubeThumbnail(url: string): string | null {
  try {
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    // Short URL: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
    else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0];
    }

    if (videoId) {
      // Use maxresdefault for best quality, fallback to hqdefault
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch (error) {
    console.error('Error extracting YouTube thumbnail:', error);
  }
  
  return null;
}

interface EpisodeWithVideo {
  id: string;
  title: string;
  episode_number: number;
  description: string | null;
  published_at: string | null;
  status: string;
  created_at: string;
  url?: string | null;
  video?: {
    id: string;
    title: string;
    source_type: "upload" | "youtube" | "external";
    source_url: string;
    duration_seconds: number | null;
  } | null;
  thumbnail?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
}

export default function EpisodesPageClient({
  programmeId,
  programmeName,
  episodes,
  error,
}: {
  programmeId: string;
  programmeName: string;
  episodes: EpisodeWithVideo[];
  error: string | null;
}) {
  const router = useRouter();
  const [previewEpisode, setPreviewEpisode] = useState<EpisodeWithVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete episode "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const { success, error } = await deleteEpisode(id, programmeId);

    if (error) {
      alert(`Failed to delete: ${error}`);
    } else {
      router.refresh();
    }

    setDeletingId(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: string, title: string) => {
    const action = currentStatus === "published" ? "unpublish" : "publish";
    if (!confirm(`${action === "publish" ? "Publish" : "Unpublish"} episode "${title}"?`)) {
      return;
    }

    setTogglingId(id);
    const { success, error } = await toggleEpisodeStatus(id, programmeId, currentStatus);

    if (error) {
      alert(`Failed to ${action}: ${error}`);
    } else {
      router.refresh();
    }

    setTogglingId(null);
  };

  return (
    <>
      <PageHeader
        title={`Episodes: ${programmeName}`}
        description={`Manage episodes for ${programmeName}`}
      >
        <Link href={`/admin/programmes/${programmeId}/episodes/new`}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Episode
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            Error loading episodes: {error}
          </div>
        )}

        {episodes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">No episodes yet</p>
            <Link href={`/admin/programmes/${programmeId}/episodes/new`}>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Episode
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {episodes.map((episode) => {
              const thumbnailUrl = episode.thumbnail
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${episode.thumbnail.storage_path}`
                : episode.url && episode.url.includes('youtube')
                ? getYouTubeThumbnail(episode.url)
                : null;

              return (
                <div
                  key={episode.id}
                  className="bg-surface-secondary rounded-lg border border-border hover:border-accent-yellow transition-colors p-4"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {thumbnailUrl ? (
                        <button
                          onClick={() => (episode.video || episode.url) && setPreviewEpisode(episode)}
                          disabled={!episode.video && !episode.url}
                          className="relative w-40 aspect-video rounded overflow-hidden group disabled:cursor-default"
                        >
                          <img
                            src={thumbnailUrl}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                          {(episode.video || episode.url) && (
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </button>
                      ) : (
                        <div className="w-40 aspect-video rounded bg-surface-tertiary flex items-center justify-center">
                          <span className="text-text-tertiary font-bold">
                            EP {episode.episode_number}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-text-tertiary">
                              Episode {episode.episode_number}
                            </span>
                            {episode.status === "published" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                                <Eye className="w-3 h-3" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 text-xs font-medium">
                                <EyeOff className="w-3 h-3" />
                                Draft
                              </span>
                            )}
                            {(episode.video || episode.url) && (
                              <button
                                onClick={() => setPreviewEpisode(episode)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent-yellow/10 text-accent-yellow hover:bg-accent-yellow/20 text-xs font-medium transition-colors"
                              >
                                <Play className="w-3 h-3" />
                                Preview Video
                              </button>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-text-primary mb-1">
                            {episode.title}
                          </h3>

                          {episode.description && (
                            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                              {episode.description}
                            </p>
                          )}

                          {episode.video && (
                            <p className="text-xs text-text-tertiary">
                              Video: {episode.video.title}
                              {episode.video.duration_seconds && (
                                <> • {Math.floor(episode.video.duration_seconds / 60)}:{(episode.video.duration_seconds % 60).toString().padStart(2, '0')}</>
                              )}
                            </p>
                          )}

                          <p className="text-xs text-text-tertiary mt-2">
                            {episode.published_at
                              ? `Published ${formatDistanceToNow(new Date(episode.published_at), { addSuffix: true })}`
                              : `Created ${formatDistanceToNow(new Date(episode.created_at), { addSuffix: true })}`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(episode.id, episode.status, episode.title)}
                            disabled={togglingId === episode.id}
                            className={`p-2 rounded transition-colors disabled:opacity-50 ${
                              episode.status === "published"
                                ? "text-green-500 hover:bg-green-500/10"
                                : "text-gray-500 hover:bg-gray-500/10"
                            }`}
                            title={episode.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {episode.status === "published" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                          <Link href={`/admin/programmes/${programmeId}/episodes/${episode.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleDelete(episode.id, episode.title)}
                            disabled={deletingId === episode.id}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewEpisode && (previewEpisode.video || previewEpisode.url) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl bg-surface-primary rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Episode {previewEpisode.episode_number}: {previewEpisode.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {previewEpisode.video?.title || 'Video Preview'}
                </p>
              </div>
              <button
                onClick={() => setPreviewEpisode(null)}
                className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Video Player */}
            <div className="p-4">
              <VideoPlayer
                src={previewEpisode.url || previewEpisode.video?.source_url || ''}
                type={previewEpisode.url?.includes('youtube') ? 'youtube' : (previewEpisode.video?.source_type || 'external')}
                poster={
                  previewEpisode.thumbnail
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${previewEpisode.thumbnail.storage_path}`
                    : previewEpisode.url
                    ? getYouTubeThumbnail(previewEpisode.url) || undefined
                    : undefined
                }
                title={previewEpisode.title}
                controls={true}
              />
            </div>

            {/* Description */}
            {previewEpisode.description && (
              <div className="p-4 border-t border-border">
                <p className="text-sm text-text-secondary">
                  {previewEpisode.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
