"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getVideos, getVideoStats, deleteVideo, type Video } from "./actions";
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "@/lib/utils/youtube";
import {
  Plus,
  Search,
  Video as VideoIcon,
  Upload,
  Trash2,
  Edit,
  Play,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";

import { RequireVideoEditor } from "@/components/auth/require-role-client";
type FilterStatus = "all" | "draft" | "published";

export default function VideosPage() {
  return (
    <RequireVideoEditor>
      <VideosPageContent />
    </RequireVideoEditor>
  );
}

function VideosPageContent() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    youtube: 0,
    uploaded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const loadVideos = async () => {
    setLoading(true);
    const filters: any = {};

    if (filter !== "all") {
      filters.status = filter;
    }

    if (search.trim()) {
      filters.search = search.trim();
    }

    const { data, error } = await getVideos(filters);
    if (data) {
      setVideos(data);
    } else if (error) {
      console.error("Failed to load videos:", error);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const stats = await getVideoStats();
    setStats(stats);
  };

  useEffect(() => {
    loadVideos();
    loadStats();
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVideos();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteVideo(id);

    if (error) {
      alert(`Failed to delete: ${error}`);
    } else {
      await loadVideos();
      await loadStats();
    }

    setDeletingId(null);
  };

  const getThumbnail = (video: Video): string | null => {
    // Priority 1: Custom thumbnail
    if (video.thumbnail?.storage_path) {
      // Generate public URL from storage path
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const bucket = "media"; // Thumbnails are stored in media bucket
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${video.thumbnail.storage_path}`;
    }
    
    // Priority 2: YouTube thumbnail
    if (video.source_type === "youtube" && video.source_url) {
      const videoId = extractYouTubeId(video.source_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "hq");
      }
    }
    
    // Priority 3: No thumbnail - use CSS placeholder
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "primary" as const;
      case "draft":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Videos"
        description="Manage video content and YouTube imports"
        action={
          <Link href="/admin/videos/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Videos</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total}
              </p>
            </div>
            <VideoIcon className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Published</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.published}
              </p>
            </div>
            <Eye className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">YouTube</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.youtube}
              </p>
            </div>
            <Play className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Uploaded</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.uploaded}
              </p>
            </div>
            <Upload className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "published" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("published")}
          >
            Published
          </Button>
          <Button
            variant={filter === "draft" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("draft")}
          >
            Drafts
          </Button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Videos Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center text-text-secondary">
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <VideoIcon className="mx-auto h-12 w-12 text-text-tertiary" />
            <p className="mt-2 text-text-secondary">
              {search ? "No videos found matching your search" : "No videos yet"}
            </p>
            <Link href="/admin/videos/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Video
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const youtubeId = video.source_type === "youtube" && video.source_url 
                ? extractYouTubeId(video.source_url) 
                : null;

              return (
                <div
                  key={video.id}
                  className="group overflow-hidden rounded-lg border border-border bg-background-panel transition-all hover:border-vntv-red hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div 
                    className="relative aspect-video bg-background-secondary cursor-pointer overflow-hidden"
                    onClick={() => setPlayingVideo(video)}
                  >
                    {getThumbnail(video) ? (
                      <img
                        src={getThumbnail(video)!}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : video.source_type === "upload" && video.source_url ? (
                      // For uploaded videos without thumbnail, show video element with preload
                      <video
                        src={video.source_url}
                        preload="metadata"
                        className="h-full w-full object-cover pointer-events-none"
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background-secondary to-background">
                        <VideoIcon className="h-16 w-16 text-text-tertiary opacity-50" />
                      </div>
                    )}
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    {/* Source Badge */}
                    <div className="absolute left-2 top-2">
                      <Badge variant="secondary" className="gap-1">
                        {video.source_type === "youtube" ? (
                          <>
                            <Play className="h-3 w-3" />
                            YouTube
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Uploaded
                          </>
                        )}
                      </Badge>
                    </div>
                    {/* Duration */}
                    {video.duration_seconds && (
                      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                        {Math.floor(video.duration_seconds / 60)}:
                        {String(video.duration_seconds % 60).padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-semibold text-text-primary">
                        {video.title}
                      </h3>
                      <Badge variant={getStatusColor(video.status)}>
                        {video.status}
                      </Badge>
                    </div>

                    {video.description && (
                      <p className="line-clamp-2 text-sm text-text-secondary">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <Eye className="h-3 w-3" />
                        {video.view_count || 0} views
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/videos/${video.id}`}
                          className="text-text-secondary hover:text-vntv-red"
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          disabled={deletingId === video.id}
                          className="text-text-secondary hover:text-red-500 disabled:opacity-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-5xl p-0">
          <div className="relative bg-black">
            {/* Close button */}
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Player */}
            {playingVideo && (
              <div className="aspect-video w-full">
                {playingVideo.source_type === "youtube" && playingVideo.source_url ? (
                  <iframe
                    src={getYouTubeEmbedUrl(extractYouTubeId(playingVideo.source_url) || "")}
                    title={playingVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : playingVideo.source_url ? (
                  <video
                    src={playingVideo.source_url}
                    controls
                    autoPlay
                    className="h-full w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}

            {/* Video Info */}
            {playingVideo && (
              <div className="bg-background-panel p-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {playingVideo.title}
                </h3>
                {playingVideo.description && (
                  <p className="mt-2 text-sm text-text-secondary">
                    {playingVideo.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {playingVideo.view_count || 0} views
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    {playingVideo.source_type === "youtube" ? (
                      <>
                        <Play className="h-3 w-3" />
                        YouTube
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3" />
                        Uploaded
                      </>
                    )}
                  </Badge>
                  <Badge variant={getStatusColor(playingVideo.status)}>
                    {playingVideo.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
