"use client";

import { useEffect, useRef, useCallback } from "react";
import { trackVideoEvent, trackVideoView } from "@/app/actions/video-analytics";

interface VideoAnalyticsTrackerProps {
  videoId: string;
}

/**
 * Client component to track video view on page load
 * This increments the view count once per 24 hours per user
 */
export function VideoAnalyticsTracker({ videoId }: VideoAnalyticsTrackerProps) {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!hasTrackedView.current && videoId) {
      hasTrackedView.current = true;
      
      // Track the view
      trackVideoView(videoId).catch((err) => {
        console.error("Failed to track video view:", err);
      });
    }
  }, [videoId]);

  return null; // This component doesn't render anything
}

/**
 * Analytics callback handler
 * This should be passed to the UnifiedVideoPlayer component
 */
export function createVideoAnalyticsHandler(videoId: string) {
  return useCallback((event: string, data?: any) => {
    // Track the event
    trackVideoEvent(videoId, event, data).catch((err) => {
      console.error(`Failed to track ${event} event:`, err);
    });
  }, [videoId]);
}
