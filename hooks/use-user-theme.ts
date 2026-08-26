"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to sync theme preference with authenticated user's profile
 * 
 * - On mount: Load user's saved theme preference from database
 * - On theme change: Save to database if user is authenticated
 * - Falls back to localStorage for anonymous users
 */
export function useUserTheme() {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  // Load user's theme preference on mount
  useEffect(() => {
    async function loadUserTheme() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch user's theme preference from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("theme_preference")
          .eq("id", user.id)
          .single();

        if (profile?.theme_preference) {
          const savedTheme = profile.theme_preference as "light" | "dark" | "system";
          if (savedTheme !== theme) {
            setTheme(savedTheme);
          }
        }
      } catch (error) {
        // Silently fail - user might not have profile yet or be offline
        console.debug("Could not load user theme preference:", error);
      }
    }

    loadUserTheme();
  }, []); // Only run on mount

  // Save theme preference when it changes (for authenticated users)
  useEffect(() => {
    async function saveUserTheme() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Update user's theme preference in profile
        await supabase
          .from("profiles")
          .update({ theme_preference: theme })
          .eq("id", user.id);
      } catch (error) {
        // Silently fail - localStorage will still work
        console.debug("Could not save user theme preference:", error);
      }
    }

    saveUserTheme();
  }, [theme, supabase]);
}
