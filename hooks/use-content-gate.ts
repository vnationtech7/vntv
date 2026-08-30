"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GateType } from "@/components/content";

interface UseContentGateOptions {
  /**
   * Type of content being gated
   */
  type: GateType;
  
  /**
   * Whether gating is enabled (from site settings)
   */
  enabled: boolean;
  
  /**
   * Content title (optional, for better messaging)
   */
  contentTitle?: string;
}

interface UseContentGateReturn {
  /**
   * Whether the gate should be shown
   */
  showGate: boolean;
  
  /**
   * Trigger the gate (for manual triggering)
   */
  triggerGate: () => void;
  
  /**
   * Close the gate
   */
  closeGate: () => void;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
}

/**
 * Hook for managing content access gates
 * 
 * Handles checking if user is authenticated and showing the gate when needed.
 * 
 * @example
 * ```tsx
 * const { showGate, triggerGate, closeGate, isAuthenticated } = useContentGate({
 *   type: "article",
 *   enabled: true,
 *   contentTitle: "Article Title"
 * });
 * 
 * // In article component, trigger gate during reading
 * useEffect(() => {
 *   if (!isAuthenticated && enabled) {
 *     triggerGate();
 *   }
 * }, []);
 * ```
 */
export function useContentGate({
  type,
  enabled,
  contentTitle,
}: UseContentGateOptions): UseContentGateReturn {
  const [showGate, setShowGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    // Subscribe to auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      
      // Close gate when user authenticates
      if (session?.user) {
        setShowGate(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const triggerGate = () => {
    // Only show gate if enabled and user is not authenticated
    if (enabled && !isAuthenticated) {
      setShowGate(true);
    }
  };

  const closeGate = () => {
    setShowGate(false);
  };

  return {
    showGate,
    triggerGate,
    closeGate,
    isAuthenticated,
  };
}
