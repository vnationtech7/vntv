"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  type: "upload" | "youtube" | "external";
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export function VideoPlayer({
  src,
  type,
  poster,
  title,
  autoPlay = false,
  controls = true,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // YouTube embed
  if (type === "youtube") {
    const videoId = extractYouTubeId(src);
    if (!videoId) {
      return (
        <div className="aspect-video bg-surface-tertiary flex items-center justify-center text-red-500">
          Invalid YouTube URL
        </div>
      );
    }

    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // External embed (Vimeo, etc.)
  if (type === "external") {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={src}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Direct video file (uploaded videos)
  const videoUrl = src.startsWith("http")
    ? src
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${src}`;

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        autoPlay={autoPlay}
        controls={controls}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Controls Overlay (optional - shown when controls=false) */}
      {!controls && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-accent-yellow/90 hover:bg-accent-yellow flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black" />
            ) : (
              <Play className="w-8 h-8 text-black ml-1" />
            )}
          </button>
        </div>
      )}

      {/* Bottom Controls Bar (optional) */}
      {!controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-accent-yellow transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleMute}
              className="text-white hover:text-accent-yellow transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1" />

            <button
              onClick={handleFullscreen}
              className="text-white hover:text-accent-yellow transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
