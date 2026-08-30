"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  /** YouTube video URL or ID */
  videoUrl: string;
  /** Video title for accessibility */
  title: string;
  /** Callback when video starts playing */
  onPlay?: () => void;
  /** Callback when video is paused */
  onPause?: () => void;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  // Handle various YouTube URL formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - Just VIDEO_ID
  
  if (!url) return null;

  // If it's already just an ID (11 characters, alphanumeric and dashes/underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Try to extract from various URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubePlayer({
  videoUrl,
  title,
  onPlay,
  onPause,
  onEnded,
  className = "",
}: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const id = extractYouTubeId(videoUrl);
    if (id) {
      setVideoId(id);
      setError(null);
    } else {
      setError("Invalid YouTube URL");
      setVideoId(null);
    }
  }, [videoUrl]);

  // YouTube IFrame API for event tracking
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Setup player when API is ready
    const setupPlayer = () => {
      if (!iframeRef.current || !(window as any).YT) return;

      const player = new (window as any).YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              onPlay?.();
            }
            // YT.PlayerState.PAUSED = 2
            else if (event.data === 2) {
              onPause?.();
            }
            // YT.PlayerState.ENDED = 0
            else if (event.data === 0) {
              onEnded?.();
            }
          },
        },
      });
    };

    // Wait for API to be ready
    if ((window as any).YT && (window as any).YT.Player) {
      setupPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = setupPlayer;
    }
  }, [videoId, onPlay, onPause, onEnded]);

  if (error) {
    return (
      <div className={`relative bg-black flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-500 mb-2">YouTube Error</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className={`relative bg-black flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <p className="text-gray-400">Loading YouTube video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: "16 / 9" }}>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
        loading="lazy"
      />
    </div>
  );
}
