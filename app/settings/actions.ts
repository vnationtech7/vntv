"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get site settings by key
 */
export async function getSiteSetting(key: string): Promise<any> {
  const supabase = await createClient();

  // @ts-ignore - Database schema types
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error(`Error fetching site setting ${key}:`, error);
    return null;
  }

  // @ts-ignore
  return data?.value;
}

/**
 * Check if article gating is enabled
 */
export async function isArticleGateEnabled(): Promise<boolean> {
  const value = await getSiteSetting("anonymous_article_gate_enabled");
  return value === true || value === "true";
}

/**
 * Check if video gating is enabled
 */
export async function isVideoGateEnabled(): Promise<boolean> {
  const value = await getSiteSetting("anonymous_video_gate_enabled");
  return value === true || value === "true";
}
