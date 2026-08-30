"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Video as VideoIcon } from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration: number | null;
  video_type: string;
}

interface VideoSearchPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function VideoSearchPicker({
  value,
  onChange,
  label = "Video",
  placeholder = "Search videos by title...",
}: VideoSearchPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch videos when search query changes
  useEffect(() => {
    const fetchVideos = async () => {
      if (searchQuery.length < 2) {
        setVideos([]);
        return;
      }

      setLoading(true);
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data, error } = await supabase
          .from("videos")
          .select("id, title, duration, video_type")
          .eq("status", "published")
          .ilike("title", `%${searchQuery}%`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setVideos(data);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchVideos, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fetch selected video details when value changes
  useEffect(() => {
    const fetchSelectedVideo = async () => {
      if (!value) {
        setSelectedVideo(null);
        return;
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data, error } = await supabase
          .from("videos")
          .select("id, title, duration, video_type")
          .eq("id", value)
          .single();

        if (!error && data) {
          setSelectedVideo(data);
        }
      } catch (err) {
        console.error("Error fetching selected video:", err);
      }
    };

    fetchSelectedVideo();
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (video: Video) => {
    onChange(video.id);
    setSelectedVideo(video);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onChange("");
    setSelectedVideo(null);
    setSearchQuery("");
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>

      {/* Selected Video Preview */}
      {selectedVideo && (
        <div className="mb-2 p-3 bg-surface-secondary border border-border rounded-lg flex items-center gap-3">
          <div className="w-16 h-16 rounded bg-surface-tertiary flex items-center justify-center flex-shrink-0">
            <VideoIcon className="w-8 h-8 text-text-tertiary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {selectedVideo.title}
            </p>
            <p className="text-xs text-text-tertiary">
              {formatDuration(selectedVideo.duration)} • {selectedVideo.video_type}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-surface-tertiary rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-surface-secondary border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-text-secondary">
              Searching...
            </div>
          ) : videos.length === 0 ? (
            <div className="p-4 text-center text-text-secondary">
              No videos found for "{searchQuery}"
            </div>
          ) : (
            <div className="p-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => handleSelect(video)}
                  className="w-full p-2 flex items-center gap-3 hover:bg-surface-tertiary rounded-lg transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                    <VideoIcon className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {video.title}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatDuration(video.duration)} • {video.video_type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-text-tertiary">
        Type at least 2 characters to search • Selected ID: {value || "None"}
      </p>
    </div>
  );
}
