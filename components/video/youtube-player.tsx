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
 * Supports all YouTube URL formats including Shorts
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // If it's already just an ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Remove protocol and www if present
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Try multiple extraction methods
  let videoId: string | null = null;

  // Method 1: Extract from query parameter (watch?v=)
  const vParam = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParam && vParam[1]) {
    videoId = vParam[1];
  }

  // Method 2: Extract from path (youtu.be/, shorts/, embed/, v/)
  if (!videoId) {
    const pathMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (pathMatch && pathMatch[1]) {
      videoId = pathMatch[1];
    }
  }

  // Method 3: Find any 11-character alphanumeric string (last resort)
  if (!videoId) {
    const anyMatch = cleanUrl.match(/([a-zA-Z0-9_-]{11})/);
    if (anyMatch && anyMatch[1]) {
      videoId = anyMatch[1];
    }
  }

  return videoId;
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
    console.log('[YouTube Player] Processing URL:', videoUrl);
    const id = extractYouTubeId(videoUrl);
    console.log('[YouTube Player] Extracted ID:', id);
    
    if (id) {
      setVideoId(id);
      setError(null);
      console.log('[YouTube Player] Success - Video ID set:', id);
    } else {
      setError("Invalid YouTube URL");
      setVideoId(null);
      console.error('[YouTube Player] Failed to extract ID from:', videoUrl);
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
