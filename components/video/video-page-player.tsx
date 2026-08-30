"use client";

import { useCallback } from "react";
import { UnifiedVideoPlayer } from "./unified-video-player";
import { trackVideoEvent } from "@/app/actions/video-analytics";

interface VideoPagePlayerProps {
  videoId: string;
  title: string;
  sourceType: string;
  sourceUrl: string;
  posterUrl?: string;
  gatingEnabled?: boolean;
  className?: string;
}

export function VideoPagePlayer({
  videoId,
  title,
  sourceType,
  sourceUrl,
  posterUrl,
  gatingEnabled = true,
  className = "",
}: VideoPagePlayerProps) {
  // Analytics handler
  const handleAnalytics = useCallback((event: string, data?: any) => {
    trackVideoEvent(videoId, event, data).catch((err) => {
      console.error(`Failed to track ${event} event:`, err);
    });
  }, [videoId]);

  return (
    <UnifiedVideoPlayer
      videoId={videoId}
      title={title}
      sourceType={sourceType}
      sourceUrl={sourceUrl}
      posterUrl={posterUrl}
      gatingEnabled={gatingEnabled}
      autoPlay={false}
      onAnalytics={handleAnalytics}
      className={className}
    />
  );
}
