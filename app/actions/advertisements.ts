// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Advertisement Management Server Actions
 * Handles CRUD operations for advertisements with scheduling and priority
 */

export interface Advertisement {
  id: string;
  slot_id: string;
  name: string;
  creative_type: "image" | "html";
  image_id: string | null;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  html_content: string | null;
  target_url: string | null;
  sponsor_id: string | null;
  starts_at: string;
  expires_at: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  ad_slot?: {
    id: string;
    name: string;
    key: string;
    placement: string;
  };
  image?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  };
  // Note: sponsor data will be fetched separately if needed
}

export interface AdvertisementFormData {
  slot_id: string;
  name: string;
  creative_type: "image" | "html";
  image_id?: string | null;
  image_path?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  html_content?: string | null;
  target_url?: string | null;
  sponsor_id?: string | null;
  starts_at: string;
  expires_at?: string | null;
  priority: number;
  is_active: boolean;
}

/**
 * Get all advertisements with optional filters
 */
export async function getAdvertisements(options?: {
  slotId?: string;
  includeInactive?: boolean;
  includeExpired?: boolean;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("advertisements")
    .select(
      `
      *,
      ad_slot:ad_slots(id, name, key, placement),
      image:media_assets(id, storage_path, alt_text)
    `
    )
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  // Filter by slot
  if (options?.slotId) {
    query = query.eq("slot_id", options.slotId);
  }

  // Filter by active status
  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  // Filter expired ads
  if (!options?.includeExpired) {
    const now = new Date().toISOString();
    query = query.or(`expires_at.is.null,expires_at.gte.${now}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching advertisements:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Advertisement[], error: null };
}

/**
 * Get active advertisements for a specific slot
 * Used by frontend to fetch ads for display
 */
export async function getActiveAdvertisementsForSlot(slotKey: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  console.log(`🔍 [AD-QUERY] Searching for ads with placement: "${slotKey}"`);

  const { data, error } = await supabase
    .from("advertisements")
    .select(
      `
      *,
      ad_slot:ad_slots!inner(id, name, key, placement),
      image:media_assets(id, storage_path, alt_text)
    `
    )
    .eq("ad_slot.placement", slotKey)
    .eq("ad_slot.is_active", true)
    .eq("is_active", true)
    .lte("starts_at", now)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("priority", { ascending: false })
    .limit(5); // Max 5 ads per slot

  console.log(`🔍 [AD-QUERY] Database returned:`, { 
    placement: slotKey, 
    foundAds: data?.length || 0, 
    data, 
    error 
  });

  if (error) {
    console.error("❌ [AD-QUERY] Error fetching ads:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Advertisement[], error: null };
}

/**
 * Get a single advertisement by ID
 */
export async function getAdvertisement(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("advertisements")
    .select(
      `
      *,
      ad_slot:ad_slots(id, name, key, placement),
      image:media_assets(id, storage_path, alt_text)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching advertisement:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Advertisement, error: null };
}

/**
 * Create a new advertisement
 */
export async function createAdvertisement(formData: AdvertisementFormData) {
  const supabase = await createClient();

  // Validate creative content
  if (formData.creative_type === "image" && !formData.image_path && !formData.image_id) {
    return { data: null, error: "Image is required for image ads" };
  }

  if (formData.creative_type === "html" && !formData.html_content) {
    return { data: null, error: "HTML content is required for HTML ads" };
  }

  const { data, error } = await supabase
    .from("advertisements")
    .insert([
      {
        slot_id: formData.slot_id,
        name: formData.name,
        creative_type: formData.creative_type,
        image_id: formData.image_id || null,
        image_path: formData.image_path || null,
        image_width: formData.image_width || null,
        image_height: formData.image_height || null,
        html_content: formData.html_content || null,
        target_url: formData.target_url || null,
        sponsor_id: formData.sponsor_id || null,
        starts_at: formData.starts_at,
        expires_at: formData.expires_at || null,
        priority: formData.priority,
        is_active: formData.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating advertisement:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { data: data as Advertisement, error: null };
}

/**
 * Update an existing advertisement
 */
export async function updateAdvertisement(
  id: string,
  formData: AdvertisementFormData
) {
  const supabase = await createClient();

  // Validate creative content
  if (formData.creative_type === "image" && !formData.image_path && !formData.image_id) {
    return { data: null, error: "Image is required for image ads" };
  }

  if (formData.creative_type === "html" && !formData.html_content) {
    return { data: null, error: "HTML content is required for HTML ads" };
  }

  const { data, error } = await supabase
    .from("advertisements")
    .update({
      slot_id: formData.slot_id,
      name: formData.name,
      creative_type: formData.creative_type,
      image_id: formData.image_id || null,
      image_path: formData.image_path || null,
      image_width: formData.image_width || null,
      image_height: formData.image_height || null,
      html_content: formData.html_content || null,
      target_url: formData.target_url || null,
      sponsor_id: formData.sponsor_id || null,
      starts_at: formData.starts_at,
      expires_at: formData.expires_at || null,
      priority: formData.priority,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating advertisement:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { data: data as Advertisement, error: null };
}

/**
 * Toggle advertisement active status
 */
export async function toggleAdvertisementStatus(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("advertisements")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling advertisement status:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { data: data as Advertisement, error: null };
}

/**
 * Delete an advertisement
 */
export async function deleteAdvertisement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("advertisements").delete().eq("id", id);

  if (error) {
    console.error("Error deleting advertisement:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { error: null };
}

/**
 * Get advertisements statistics
 */
export async function getAdvertisementsStats() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: ads } = await supabase
    .from("advertisements")
    .select("is_active, starts_at, expires_at");

  const total = ads?.length || 0;
  const active = ads?.filter((a) => a.is_active).length || 0;
  const live =
    ads?.filter(
      (a) =>
        a.is_active &&
        a.starts_at <= now &&
        (!a.expires_at || a.expires_at >= now)
    ).length || 0;
  const scheduled =
    ads?.filter((a) => a.is_active && a.starts_at > now).length || 0;
  const expired =
    ads?.filter((a) => a.expires_at && a.expires_at < now).length || 0;

  return {
    total,
    active,
    live,
    scheduled,
    expired,
  };
}

/**
 * Get advertisement status (for display)
 * Note: This is a utility function, not a server action
 */
export async function getAdvertisementStatus(ad: Advertisement): Promise<{
  label: string;
  color: string;
}> {
  if (!ad.is_active) {
    return { label: "Inactive", color: "gray" };
  }

  const now = new Date();
  const startsAt = new Date(ad.starts_at);
  const expiresAt = ad.expires_at ? new Date(ad.expires_at) : null;

  if (startsAt > now) {
    return { label: "Scheduled", color: "blue" };
  }

  if (expiresAt && expiresAt < now) {
    return { label: "Expired", color: "orange" };
  }

  return { label: "Live", color: "green" };
}
