"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getVideos, type Video } from "@/app/admin/videos/actions";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";
import {
  Search,
  Video as VideoIcon,
  Check,
  Play,
} from "lucide-react";

interface VideoPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (video: Video) => void;
  selectedIds?: string[];
  mode?: "single" | "multiple";
  onSelectMultiple?: (videos: Video[]) => void;
}

type FilterStatus = "all" | "published" | "draft";

export function VideoPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  mode = "single",
  onSelectMultiple,
}: VideoPickerDialogProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("published");
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selectedIds));

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

  useEffect(() => {
    if (open) {
      loadVideos();
      setSelectedItems(new Set(selectedIds));
    }
  }, [open, filter]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      loadVideos();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (video: Video) => {
    if (mode === "single") {
      onSelect(video);
      onOpenChange(false);
    } else {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(video.id)) {
        newSelected.delete(video.id);
      } else {
        newSelected.add(video.id);
      }
      setSelectedItems(newSelected);
    }
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple) {
      const selectedVideos = videos.filter((v) => selectedItems.has(v.id));
      onSelectMultiple(selectedVideos);
      onOpenChange(false);
    }
  };

  const getThumbnail = (video: Video): string => {
    if (video.source_type === "youtube" && video.source_url) {
      const videoId = extractYouTubeId(video.source_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "hq");
      }
    }
    return "/placeholder-video.jpg";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Video</DialogTitle>
          <DialogDescription>
            {mode === "single"
              ? "Choose a video to add to the article"
              : "Choose one or more videos to add to the article"}
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
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
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <VideoIcon className="h-12 w-12 text-text-tertiary mb-3" />
              <p className="text-text-secondary">
                {search
                  ? "No videos found matching your search"
                  : "No videos available. Create some videos first."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const isSelected = mode === "single"
                  ? selectedIds.includes(video.id)
                  : selectedItems.has(video.id);
                const youtubeId = video.source_type === "youtube" && video.source_url
                  ? extractYouTubeId(video.source_url)
                  : null;

                return (
                  <button
                    key={video.id}
                    onClick={() => handleSelect(video)}
                    className={`
                      group relative overflow-hidden rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? "border-vntv-red ring-2 ring-vntv-red/20"
                          : "border-border hover:border-vntv-red/50"
                      }
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-background-secondary">
                      <img
                        src={getThumbnail(video)}
                        alt={video.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-video.jpg";
                        }}
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-12 w-12 text-white opacity-80" />
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
                              <VideoIcon className="h-3 w-3" />
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
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-vntv-red/20">
                          <div className="rounded-full bg-vntv-red p-2">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">
                        {video.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {video.video_type}
                        </Badge>
                        <Badge
                          variant={video.status === "published" ? "primary" : "secondary"}
                          className="text-xs"
                        >
                          {video.status}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        {mode === "multiple" && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              {selectedItems.size} video{selectedItems.size !== 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmMultiple}
                disabled={selectedItems.size === 0}
              >
                Add {selectedItems.size > 0 && `(${selectedItems.size})`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
