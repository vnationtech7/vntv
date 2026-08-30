// @ts-nocheck
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VideoPlayer } from "./video-player";
import { VideoGateModal } from "./video-gate-modal";
import { useUser } from "@/hooks/use-user";

interface GatedVideoPlayerProps extends Omit<VideoPlayerProps, "onProgress" | "onPlay"> {
  /** Video ID for analytics */
  videoId: string;
  /** Video title for gate modal */
  videoTitle: string;
  /** Video source type (e.g., "vntv", "youtube") */
  sourceType: string;
  /** Whether gating is enabled globally */
  gatingEnabled?: boolean;
  /** Percentage at which to show gate (default: 25) */
  gateThreshold?: number;
  /** Callback when gate is shown */
  onGateShown?: () => void;
  /** Callback when user authenticates via gate */
  onGateAuthenticated?: () => void;
  /** Callback for video analytics */
  onAnalytics?: (event: string, data?: any) => void;
}

export function GatedVideoPlayer({
  videoId,
  videoTitle,
  sourceType,
  gatingEnabled = true,
  gateThreshold = 25,
  onGateShown,
  onGateAuthenticated,
  onAnalytics,
  ...playerProps
}: GatedVideoPlayerProps) {
  const { user } = useUser();
  const [showGate, setShowGate] = useState(false);
  const [hasShownGate, setHasShownGate] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldGateRef = useRef(false);

  // Determine if this video should be gated
  useEffect(() => {
    // Don't gate if:
    // 1. User is authenticated
    // 2. Gating is disabled globally
    // 3. Video is from YouTube (YouTube videos are never gated)
    const shouldGate =
      !user &&
      gatingEnabled &&
      sourceType?.toLowerCase() !== "youtube" &&
      !hasShownGate;

    shouldGateRef.current = shouldGate;
  }, [user, gatingEnabled, sourceType, hasShownGate]);

  // Handle play event
  const handlePlay = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      onAnalytics?.("video_start", { videoId, timestamp: Date.now() });
    }
  }, [hasStarted, videoId, onAnalytics]);

  // Handle progress updates
  const handleProgress = useCallback(
    (percentage: number) => {
      // Track progress milestones
      onAnalytics?.(`video_progress_${percentage}`, {
        videoId,
        percentage,
        timestamp: Date.now(),
      });

      // Check if we should show the gate
      if (
        shouldGateRef.current &&
        percentage >= gateThreshold &&
        !hasShownGate &&
        !showGate
      ) {
        // Pause the video
        if (videoRef.current) {
          videoRef.current.pause();
        }
        
        setShowGate(true);
        setHasShownGate(true);
        onGateShown?.();
        onAnalytics?.("gate_shown", {
          videoId,
          percentage,
          timestamp: Date.now(),
        });
      }
    },
    [gateThreshold, hasShownGate, showGate, videoId, onGateShown, onAnalytics]
  );

  // Handle gate modal close
  const handleGateClose = useCallback(() => {
    setShowGate(false);
    // Note: Video remains paused - user chose not to authenticate
  }, []);

  // Handle successful authentication
  const handleAuthenticated = useCallback(() => {
    setShowGate(false);
    
    // Resume video playback
    if (videoRef.current) {
      videoRef.current.play();
    }
    
    onGateAuthenticated?.();
    onAnalytics?.("gate_authenticated", {
      videoId,
      timestamp: Date.now(),
    });
  }, [videoId, onGateAuthenticated, onAnalytics]);

  // Monitor user changes (after authentication)
  useEffect(() => {
    if (user && showGate) {
      // User just authenticated, close the gate
      handleAuthenticated();
    }
  }, [user, showGate, handleAuthenticated]);

  return (
    <>
      <VideoPlayer
        {...playerProps}
        title={videoTitle}
        videoRef={videoRef}
        onPlay={handlePlay}
        onProgress={handleProgress}
      />

      {/* Gate Modal */}
      <VideoGateModal
        open={showGate}
        onClose={handleGateClose}
        onAuthenticated={handleAuthenticated}
        videoTitle={videoTitle}
      />
    </>
  );
}
