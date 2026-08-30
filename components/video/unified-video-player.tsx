"use client";

import { GatedVideoPlayer } from "./gated-video-player";
import { YouTubePlayer } from "./youtube-player";

interface UnifiedVideoPlayerProps {
  /** Video ID for analytics */
  videoId: string;
  /** Video title */
  title: string;
  /** Video source type (e.g., "vntv", "youtube", "external") */
  sourceType: string;
  /** Video source URL */
  sourceUrl: string;
  /** Poster/thumbnail image URL */
  posterUrl?: string;
  /** Whether gating is enabled */
  gatingEnabled?: boolean;
  /** Auto-play video */
  autoPlay?: boolean;
  /** Callback for analytics events */
  onAnalytics?: (event: string, data?: any) => void;
  /** Custom class name */
  className?: string;
}

/**
 * Unified video player that handles both VNTV-hosted and YouTube videos
 */
export function UnifiedVideoPlayer({
  videoId,
  title,
  sourceType,
  sourceUrl,
  posterUrl,
  gatingEnabled = true,
  autoPlay = false,
  onAnalytics,
  className = "",
}: UnifiedVideoPlayerProps) {
  const isYouTube = sourceType?.toLowerCase() === "youtube";

  // YouTube videos use dedicated YouTube player (no gating)
  if (isYouTube) {
    return (
      <YouTubePlayer
        videoUrl={sourceUrl}
        title={title}
        className={className}
        onPlay={() => {
          onAnalytics?.("video_start", { videoId, sourceType: "youtube" });
        }}
        onPause={() => {
          onAnalytics?.("video_pause", { videoId, sourceType: "youtube" });
        }}
        onEnded={() => {
          onAnalytics?.("video_complete", { videoId, sourceType: "youtube" });
        }}
      />
    );
  }

  // VNTV-hosted videos use gated player
  return (
    <GatedVideoPlayer
      videoId={videoId}
      videoTitle={title}
      sourceType={sourceType}
      src={sourceUrl}
      poster={posterUrl}
      title={title}
      gatingEnabled={gatingEnabled}
      autoPlay={autoPlay}
      onAnalytics={onAnalytics}
      className={className}
    />
  );
}
