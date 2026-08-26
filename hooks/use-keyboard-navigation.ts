"use client";

import { useEffect } from "react";

/**
 * Hook for keyboard navigation (arrow keys)
 * 
 * Usage:
 * useKeyboardNavigation({
 *   onArrowUp: () => console.log("up"),
 *   onArrowDown: () => console.log("down"),
 * });
 */
export interface UseKeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          onArrowUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          onArrowDown?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onArrowLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          onArrowRight?.();
          break;
        case "Enter":
          onEnter?.();
          break;
        case "Escape":
          onEscape?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, enabled]);
}
