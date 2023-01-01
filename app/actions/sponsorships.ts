// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Sponsorship {
  id: string;
  name: string;
  description: string | null;
  logo_id: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipFormData {
  name: string;
  description?: string | null;
  logo_id?: string | null;
  website_url?: string | null;
  is_active: boolean;
}

/**
 * Get all sponsorships (including inactive)
 */
export async function getSponsorships(includeInactive = false) {
  const supabase = await createClient();

  let query = supabase
    .from("sponsorships")
    .select("*")
    .order("name");

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sponsorships:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Sponsorship[], error: null };
}

/**
 * Get a single sponsorship by ID
 */
export async function getSponsorship(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsorships")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching sponsorship:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Sponsorship, error: null };
}

/**
 * Create a new sponsorship
 */
export async function createSponsorship(formData: SponsorshipFormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsorships")
    .insert([
      {
        name: formData.name,
        description: formData.description || null,
        logo_id: formData.logo_id || null,
        website_url: formData.website_url || null,
        is_active: formData.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating sponsorship:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/sponsors");
  return { data: data as Sponsorship, error: null };
}

/**
 * Update an existing sponsorship
 */
export async function updateSponsorship(
  id: string,
  formData: SponsorshipFormData
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsorships")
    .update({
      name: formData.name,
      description: formData.description || null,
      logo_id: formData.logo_id || null,
      website_url: formData.website_url || null,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating sponsorship:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/sponsors");
  return { data: data as Sponsorship, error: null };
}

/**
 * Delete a sponsorship
 */
export async function deleteSponsorship(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sponsorships")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting sponsorship:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/sponsors");
  return { error: null };
}

/**
 * Toggle sponsorship active status
 */
export async function toggleSponsorshipStatus(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sponsorships")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling sponsorship status:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/sponsors");
  return { data: data as Sponsorship, error: null };
}
