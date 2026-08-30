"use client";

import { useState } from "react";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui";
import { Plus, Edit, Eye, EyeOff, Play, X } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { VideoPlayer } from "@/components/video/video-player";

interface EpisodeWithVideo {
  id: string;
  title: string;
  episode_number: number;
  description: string | null;
  published_at: string | null;
  created_at: string;
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
  const [previewEpisode, setPreviewEpisode] = useState<EpisodeWithVideo | null>(null);

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
                          onClick={() => episode.video && setPreviewEpisode(episode)}
                          disabled={!episode.video}
                          className="relative w-40 aspect-video rounded overflow-hidden group disabled:cursor-default"
                        >
                          <img
                            src={thumbnailUrl}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                          {episode.video && (
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
                            {episode.published_at ? (
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
                            {episode.video && (
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
                        <div className="flex-shrink-0">
                          <Link href={`/admin/programmes/${programmeId}/episodes/${episode.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
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
      {previewEpisode && previewEpisode.video && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl bg-surface-primary rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Episode {previewEpisode.episode_number}: {previewEpisode.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {previewEpisode.video.title}
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
                src={previewEpisode.video.source_url}
                type={previewEpisode.video.source_type}
                poster={
                  previewEpisode.thumbnail
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${previewEpisode.thumbnail.storage_path}`
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
