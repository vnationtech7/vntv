// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Ad Slot Management Server Actions
 * Handles CRUD operations for ad slots
 */

export interface AdSlot {
  id: string;
  name: string;
  key: string;
  description: string | null;
  placement: string;
  is_active: boolean;
  created_at: string;
}

export interface AdSlotFormData {
  name: string;
  key: string;
  description?: string;
  placement: string;
  is_active: boolean;
}

/**
 * Get all ad slots
 */
export async function getAdSlots(includeInactive = false) {
  const supabase = await createClient();

  let query = supabase
    .from("ad_slots")
    .select("*")
    .order("placement", { ascending: true })
    .order("name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching ad slots:", error);
    return { data: null, error: error.message };
  }

  return { data: data as AdSlot[], error: null };
}

/**
 * Get a single ad slot by ID
 */
export async function getAdSlot(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ad_slots")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching ad slot:", error);
    return { data: null, error: error.message };
  }

  return { data: data as AdSlot, error: null };
}

/**
 * Get ad slot by key (for frontend rendering)
 */
export async function getAdSlotByKey(key: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ad_slots")
    .select("*")
    .eq("key", key)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found - return null instead of error
      return { data: null, error: null };
    }
    console.error("Error fetching ad slot by key:", error);
    return { data: null, error: error.message };
  }

  return { data: data as AdSlot, error: null };
}

/**
 * Create a new ad slot
 */
export async function createAdSlot(formData: AdSlotFormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ad_slots")
    .insert([
      {
        name: formData.name,
        key: formData.key,
        description: formData.description || null,
        placement: formData.placement,
        is_active: formData.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating ad slot:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads/slots");
  return { data: data as AdSlot, error: null };
}

/**
 * Update an existing ad slot
 */
export async function updateAdSlot(id: string, formData: AdSlotFormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ad_slots")
    .update({
      name: formData.name,
      key: formData.key,
      description: formData.description || null,
      placement: formData.placement,
      is_active: formData.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating ad slot:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads/slots");
  revalidatePath("/admin/ads");
  return { data: data as AdSlot, error: null };
}

/**
 * Toggle ad slot active status
 */
export async function toggleAdSlotStatus(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ad_slots")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling ad slot status:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/ads/slots");
  revalidatePath("/admin/ads");
  return { data: data as AdSlot, error: null };
}

/**
 * Delete an ad slot
 */
export async function deleteAdSlot(id: string) {
  const supabase = await createClient();

  // Check if slot has active advertisements
  const { data: ads } = await supabase
    .from("advertisements")
    .select("id")
    .eq("slot_id", id)
    .eq("is_active", true)
    .limit(1);

  if (ads && ads.length > 0) {
    return {
      error:
        "Cannot delete ad slot with active advertisements. Please deactivate or delete advertisements first.",
    };
  }

  const { error } = await supabase.from("ad_slots").delete().eq("id", id);

  if (error) {
    console.error("Error deleting ad slot:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/ads/slots");
  revalidatePath("/admin/ads");
  return { error: null };
}

/**
 * Get ad slots statistics
 */
export async function getAdSlotsStats() {
  const supabase = await createClient();

  const { data: slots } = await supabase.from("ad_slots").select("is_active");

  const total = slots?.length || 0;
  const active = slots?.filter((s) => s.is_active).length || 0;
  const inactive = total - active;

  return {
    total,
    active,
    inactive,
  };
}
