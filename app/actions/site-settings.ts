// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface GlobalSettings {
  site_title: string;
  site_tagline: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
  social_tiktok: string;
  social_linkedin: string;
  logo_light: string;
  logo_dark: string;
  favicon: string;
  og_image_default: string;
}

export interface ContentGateSettings {
  anonymous_article_gate_enabled: boolean;
  anonymous_video_gate_enabled: boolean;
  article_gate_threshold: number;
  video_gate_threshold: number;
  gate_redirect_enabled: boolean;
}

export interface FeatureFlagSettings {
  feature_newsletter: boolean;
  feature_breaking_news: boolean;
  feature_comments: boolean;
  feature_search: boolean;
  feature_social_sharing: boolean;
  feature_trending: boolean;
  feature_related_articles: boolean;
}

export interface SEOSettings {
  seo_default_meta_description: string;
  seo_keywords: string;
  seo_google_analytics_id: string;
  seo_google_search_console: string;
  seo_google_site_verification: string;
  seo_robots_index: boolean;
  seo_sitemap_enabled: boolean;
  seo_sitemap_max_articles: number;
}

export interface EmailSettings {
  email_from_address: string;
  email_from_name: string;
  email_reply_to: string;
  email_provider: string;
  resend_api_key: string;
  resend_audience_id: string;
  newsletter_enabled: boolean;
  newsletter_double_optin: boolean;
  newsletter_welcome_enabled: boolean;
  newsletter_frequency: string;
}

export interface ContentSettings {
  content_articles_per_page: number;
  content_videos_per_page: number;
  content_related_count: number;
  content_trending_count: number;
  content_latest_count: number;
}

export interface MaintenanceSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_allowed_ips: string[];
}

export interface AllSettings {
  global: GlobalSettings;
  contentGate: ContentGateSettings;
  features: FeatureFlagSettings;
  seo: SEOSettings;
  email: EmailSettings;
  content: ContentSettings;
  maintenance: MaintenanceSettings;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Parse JSONB value to appropriate JavaScript type
 */
function parseSettingValue(value: any): any {
  if (value === null || value === undefined) return null;
  
  // If it's already a primitive, return it
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  // If it's an object, try to extract the value
  if (typeof value === 'object') {
    // Handle array
    if (Array.isArray(value)) return value;
    
    // Try to extract scalar value from JSONB wrapper
    if (value.hasOwnProperty('value')) return value.value;
    
    return value;
  }
  
  return value;
}

/**
 * Convert JavaScript value to JSONB format for database
 */
function toJsonbValue(value: any): any {
  if (value === null || value === undefined) return JSON.stringify("");
  if (typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return JSON.stringify(String(value));
}

// =====================================================
// GET SETTINGS FUNCTIONS
// =====================================================

/**
 * Get all site settings organized by category
 */
export async function getAllSettings(): Promise<{
  success: boolean;
  data?: AllSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .order("key");

    if (error) {
      console.error("Error fetching settings:", error);
      return { success: false, error: "Failed to fetch settings" };
    }

    // Convert array of key-value pairs to organized object
    const settingsMap = new Map(
      data.map((item: any) => [item.key, parseSettingValue(item.value)])
    );

    const settings: AllSettings = {
      global: {
        site_title: settingsMap.get("site_title") || "",
        site_tagline: settingsMap.get("site_tagline") || "",
        site_description: settingsMap.get("site_description") || "",
        contact_email: settingsMap.get("contact_email") || "",
        contact_phone: settingsMap.get("contact_phone") || "",
        contact_address: settingsMap.get("contact_address") || "",
        social_facebook: settingsMap.get("social_facebook") || "",
        social_twitter: settingsMap.get("social_twitter") || "",
        social_instagram: settingsMap.get("social_instagram") || "",
        social_youtube: settingsMap.get("social_youtube") || "",
        social_tiktok: settingsMap.get("social_tiktok") || "",
        social_linkedin: settingsMap.get("social_linkedin") || "",
        logo_light: settingsMap.get("logo_light") || "",
        logo_dark: settingsMap.get("logo_dark") || "",
        favicon: settingsMap.get("favicon") || "",
        og_image_default: settingsMap.get("og_image_default") || "",
      },
      contentGate: {
        anonymous_article_gate_enabled: settingsMap.get("anonymous_article_gate_enabled") === true || settingsMap.get("anonymous_article_gate_enabled") === "true",
        anonymous_video_gate_enabled: settingsMap.get("anonymous_video_gate_enabled") === true || settingsMap.get("anonymous_video_gate_enabled") === "true",
        article_gate_threshold: Number(settingsMap.get("article_gate_threshold")) || 0,
        video_gate_threshold: Number(settingsMap.get("video_gate_threshold")) || 25,
        gate_redirect_enabled: settingsMap.get("gate_redirect_enabled") === true || settingsMap.get("gate_redirect_enabled") === "true",
      },
      features: {
        feature_newsletter: settingsMap.get("feature_newsletter") === true || settingsMap.get("feature_newsletter") === "true",
        feature_breaking_news: settingsMap.get("feature_breaking_news") === true || settingsMap.get("feature_breaking_news") === "true",
        feature_comments: settingsMap.get("feature_comments") === true || settingsMap.get("feature_comments") === "true",
        feature_search: settingsMap.get("feature_search") === true || settingsMap.get("feature_search") === "true",
        feature_social_sharing: settingsMap.get("feature_social_sharing") === true || settingsMap.get("feature_social_sharing") === "true",
        feature_trending: settingsMap.get("feature_trending") === true || settingsMap.get("feature_trending") === "true",
        feature_related_articles: settingsMap.get("feature_related_articles") === true || settingsMap.get("feature_related_articles") === "true",
      },
      seo: {
        seo_default_meta_description: settingsMap.get("seo_default_meta_description") || "",
        seo_keywords: settingsMap.get("seo_keywords") || "",
        seo_google_analytics_id: settingsMap.get("seo_google_analytics_id") || "",
        seo_google_search_console: settingsMap.get("seo_google_search_console") || "",
        seo_google_site_verification: settingsMap.get("seo_google_site_verification") || "",
        seo_robots_index: settingsMap.get("seo_robots_index") === true || settingsMap.get("seo_robots_index") === "true",
        seo_sitemap_enabled: settingsMap.get("seo_sitemap_enabled") === true || settingsMap.get("seo_sitemap_enabled") === "true",
        seo_sitemap_max_articles: Number(settingsMap.get("seo_sitemap_max_articles")) || 1000,
      },
      email: {
        email_from_address: settingsMap.get("email_from_address") || "",
        email_from_name: settingsMap.get("email_from_name") || "",
        email_reply_to: settingsMap.get("email_reply_to") || "",
        email_provider: settingsMap.get("email_provider") || "resend",
        resend_api_key: settingsMap.get("resend_api_key") || "",
        resend_audience_id: settingsMap.get("resend_audience_id") || "",
        newsletter_enabled: settingsMap.get("newsletter_enabled") === true || settingsMap.get("newsletter_enabled") === "true",
        newsletter_double_optin: settingsMap.get("newsletter_double_optin") === true || settingsMap.get("newsletter_double_optin") === "true",
        newsletter_welcome_enabled: settingsMap.get("newsletter_welcome_enabled") === true || settingsMap.get("newsletter_welcome_enabled") === "true",
        newsletter_frequency: settingsMap.get("newsletter_frequency") || "weekly",
      },
      content: {
        content_articles_per_page: Number(settingsMap.get("content_articles_per_page")) || 20,
        content_videos_per_page: Number(settingsMap.get("content_videos_per_page")) || 12,
        content_related_count: Number(settingsMap.get("content_related_count")) || 6,
        content_trending_count: Number(settingsMap.get("content_trending_count")) || 5,
        content_latest_count: Number(settingsMap.get("content_latest_count")) || 8,
      },
      maintenance: {
        maintenance_mode: settingsMap.get("maintenance_mode") === true || settingsMap.get("maintenance_mode") === "true",
        maintenance_message: settingsMap.get("maintenance_message") || "",
        maintenance_allowed_ips: settingsMap.get("maintenance_allowed_ips") || [],
      },
    };

    return { success: true, data: settings };
  } catch (err) {
    console.error("Unexpected error fetching settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get a single setting value
 */
export async function getSetting(key: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return { success: false, error: `Failed to fetch setting: ${key}` };
    }

    return { success: true, data: parseSettingValue(data.value) };
  } catch (err) {
    console.error(`Unexpected error fetching setting ${key}:`, err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================================================
// UPDATE SETTINGS FUNCTIONS
// =====================================================

/**
 * Update global settings
 */
export async function updateGlobalSettings(settings: Partial<GlobalSettings>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: toJsonbValue(value),
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: update.updated_by,
          updated_at: update.updated_at,
        })
        .eq("key", update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        return { success: false, error: `Failed to update ${update.key}` };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating global settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update content gate settings
 */
export async function updateContentGateSettings(settings: Partial<ContentGateSettings>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: toJsonbValue(value),
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: update.updated_by,
          updated_at: update.updated_at,
        })
        .eq("key", update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        return { success: false, error: `Failed to update ${update.key}` };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating content gate settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update feature flag settings
 */
export async function updateFeatureFlagSettings(settings: Partial<FeatureFlagSettings>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: toJsonbValue(value),
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: update.updated_by,
          updated_at: update.updated_at,
        })
        .eq("key", update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        return { success: false, error: `Failed to update ${update.key}` };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating feature flag settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update SEO settings
 */
export async function updateSEOSettings(settings: Partial<SEOSettings>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: toJsonbValue(value),
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: update.updated_by,
          updated_at: update.updated_at,
        })
        .eq("key", update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        return { success: false, error: `Failed to update ${update.key}` };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating SEO settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update email settings
 */
export async function updateEmailSettings(settings: Partial<EmailSettings>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: toJsonbValue(value),
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: update.updated_by,
          updated_at: update.updated_at,
        })
        .eq("key", update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        return { success: false, error: `Failed to update ${update.key}` };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating email settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS FOR COMMON SETTINGS
// =====================================================

/**
 * Check if article gate is enabled
 */
export async function isArticleGateEnabled(): Promise<boolean> {
  const result = await getSetting("anonymous_article_gate_enabled");
  return result.success && (result.data === true || result.data === "true");
}

/**
 * Check if video gate is enabled
 */
export async function isVideoGateEnabled(): Promise<boolean> {
  const result = await getSetting("anonymous_video_gate_enabled");
  return result.success && (result.data === true || result.data === "true");
}

/**
 * Get Google Analytics ID
 */
export async function getGoogleAnalyticsId(): Promise<string> {
  const result = await getSetting("seo_google_analytics_id");
  return result.success ? (result.data || "") : "";
}

/**
 * Check if feature is enabled
 */
export async function isFeatureEnabled(feature: keyof FeatureFlagSettings): Promise<boolean> {
  const result = await getSetting(feature);
  return result.success && (result.data === true || result.data === "true");
}

/**
 * Check if maintenance mode is active
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const result = await getSetting("maintenance_mode");
  return result.success && (result.data === true || result.data === "true");
}

/**
 * Get social media links
 */
export async function getSocialLinks(): Promise<{
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}> {
  const result = await getAllSettings();
  if (!result.success || !result.data) return {};
  
  return {
    facebook: result.data.global.social_facebook,
    twitter: result.data.global.social_twitter,
    instagram: result.data.global.social_instagram,
    youtube: result.data.global.social_youtube,
    tiktok: result.data.global.social_tiktok,
    linkedin: result.data.global.social_linkedin,
  };
}


// =====================================================
// GOOGLE ADSENSE & ADS CONFIGURATION
// =====================================================

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
 * Get Google AdSense configuration
 */
export async function getGoogleAdSenseConfig(): Promise<{
  success: boolean;
  data?: GoogleAdSenseConfig;
  error?: string;
}> {
  try {
    const result = await getSetting("google_adsense");
    
    if (result.success && result.data) {
      return { success: true, data: result.data as GoogleAdSenseConfig };
    }
    
    // Return default config if not found
    return {
      success: true,
      data: {
        enabled: false,
        publisher_id: "",
        ad_client: "",
        auto_ads_enabled: false,
        slots: {
          homepage_top: "",
          homepage_sidebar: "",
          article_top: "",
          article_sidebar: "",
          article_inline: "",
        },
      },
    };
  } catch (err) {
    console.error("Error fetching Google AdSense config:", err);
    return { success: false, error: "Failed to fetch AdSense configuration" };
  }
}

/**
 * Update Google AdSense configuration
 */
export async function updateGoogleAdSenseConfig(config: GoogleAdSenseConfig): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("site_settings")
      .update({
        value: JSON.stringify(config),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "google_adsense");

    if (error) {
      console.error("Error updating Google AdSense config:", error);
      return { success: false, error: "Failed to update AdSense configuration" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating AdSense config:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get ads global settings
 */
export async function getAdsGlobalSettings(): Promise<{
  success: boolean;
  data?: AdsGlobalSettings;
  error?: string;
}> {
  try {
    const result = await getSetting("ads_global_settings");
    
    if (result.success && result.data) {
      return { success: true, data: result.data as AdsGlobalSettings };
    }
    
    // Return default settings if not found
    return {
      success: true,
      data: {
        custom_ads_enabled: true,
        adsense_fallback_enabled: true,
        show_ad_label: true,
      },
    };
  } catch (err) {
    console.error("Error fetching ads global settings:", err);
    return { success: false, error: "Failed to fetch ads settings" };
  }
}

/**
 * Update ads global settings
 */
export async function updateAdsGlobalSettings(settings: AdsGlobalSettings): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const canManage = await hasPermission("manage_settings");
    if (!canManage) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("site_settings")
      .update({
        value: JSON.stringify(settings),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "ads_global_settings");

    if (error) {
      console.error("Error updating ads global settings:", error);
      return { success: false, error: "Failed to update ads settings" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating ads settings:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
