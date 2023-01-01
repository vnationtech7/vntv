// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SiteSetting {
  id: string;
  key: string;
  value: any; // JSONB value
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface GoogleAdSenseConfig {
  enabled: boolean;
  publisher_id: string;
  ad_client: string;
  auto_ads_enabled: boolean;
  slots: {
    homepage_top: string;
    homepage_sidebar: string;
    article_top: string;
    article_sidebar: string;
    article_inline: string;
  };
}

export interface AdsGlobalSettings {
  custom_ads_enabled: boolean;
  adsense_fallback_enabled: boolean;
  show_ad_label: boolean;
}

/**
 * Get a site setting by key
 */
export async function getSiteSetting(key: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) {
    console.error("Error fetching site setting:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SiteSetting, error: null };
}

/**
 * Get Google AdSense configuration
 */
export async function getGoogleAdSenseConfig() {
  const { data, error } = await getSiteSetting("google_adsense");

  if (error || !data) {
    return {
      data: null,
      error: error || "AdSense config not found",
    };
  }

  return {
    data: data.value as GoogleAdSenseConfig,
    error: null,
  };
}

/**
 * Get global ads settings
 */
export async function getAdsGlobalSettings() {
  const { data, error } = await getSiteSetting("ads_global_settings");

  if (error || !data) {
    // Return defaults if not found
    return {
      data: {
        custom_ads_enabled: true,
        adsense_fallback_enabled: true,
        show_ad_label: true,
      } as AdsGlobalSettings,
      error: null,
    };
  }

  return {
    data: data.value as AdsGlobalSettings,
    error: null,
  };
}

/**
 * Update Google AdSense configuration
 */
export async function updateGoogleAdSenseConfig(config: GoogleAdSenseConfig) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      value: config,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "google_adsense")
    .select()
    .single();

  if (error) {
    console.error("Error updating AdSense config:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { data: data as SiteSetting, error: null };
}

/**
 * Update global ads settings
 */
export async function updateAdsGlobalSettings(settings: AdsGlobalSettings) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      value: settings,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "ads_global_settings")
    .select()
    .single();

  if (error) {
    console.error("Error updating ads global settings:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { data: data as SiteSetting, error: null };
}

/**
 * Get all site settings
 */
export async function getAllSiteSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching site settings:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SiteSetting[], error: null };
}
