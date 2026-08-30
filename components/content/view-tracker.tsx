"use client";

import { useEffect } from "react";
import { trackArticleView } from "@/app/actions/trending";

interface ViewTrackerProps {
  articleId: string;
}

/**
 * Client component to track article views
 * Runs once when the article page loads
 */
export function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    // Track the view
    trackArticleView(articleId).catch((err) => {
      console.error("Failed to track article view:", err);
    });
  }, [articleId]);

  return null; // This component doesn't render anything
}
