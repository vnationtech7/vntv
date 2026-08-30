// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";

export interface Author {
  id: string;
  profile_id: string | null;
  name: string;
  slug: string;
  bio: string | null;
  avatar_id: string | null;
  social_links: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthorFormData {
  name: string;
  slug: string;
  bio?: string;
  profile_id?: string;
  social_links: Record<string, string>;
  is_active: boolean;
}

/**
 * Get all authors with optional filters
 */
export async function getAuthors(options?: {
  includeInactive?: boolean;
}): Promise<{ data: Author[] | null; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("authors")
    .select("*")
    .order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching authors:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get a single author by ID
 */
export async function getAuthor(
  id: string
): Promise<{ data: Author | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching author:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get author article count
 */
export async function getAuthorArticleCount(
  authorId: string
): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("author_id", authorId);

  if (error) {
    console.error("Error fetching author article count:", error);
    return { count: 0, error: error.message };
  }

  return { count: count || 0, error: null };
}

/**
 * Get all user profiles (for linking authors to users)
 */
export async function getUserProfiles(): Promise<{
  data: Array<{ id: string; email: string; full_name: string | null }> | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .order("email", { ascending: true });

  if (error) {
    console.error("Error fetching user profiles:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Create a new author
 */
export async function createAuthor(
  formData: AuthorFormData
): Promise<{ data: Author | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Check if slug already exists
  const { data: existing } = await supabase
    .from("authors")
    .select("id")
    .eq("slug", formData.slug)
    .single();

  if (existing) {
    return { data: null, error: "An author with this slug already exists" };
  }

  // If profile_id is provided, check if it's already linked to another author
  if (formData.profile_id) {
    const { data: existingProfile } = await supabase
      .from("authors")
      .select("id")
      .eq("profile_id", formData.profile_id)
      .single();

    if (existingProfile) {
      return {
        data: null,
        error: "This user profile is already linked to another author",
      };
    }
  }

  // Insert author
  const { data, error } = await supabase
    .from("authors")
    .insert({
      name: formData.name,
      slug: formData.slug,
      bio: formData.bio || null,
      profile_id: formData.profile_id || null,
      social_links: formData.social_links || {},
      is_active: formData.is_active,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating author:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/authors");
  return { data, error: null };
}

/**
 * Update an existing author
 */
export async function updateAuthor(
  id: string,
  formData: AuthorFormData
): Promise<{ data: Author | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Check if slug already exists (excluding current author)
  const { data: existing } = await supabase
    .from("authors")
    .select("id")
    .eq("slug", formData.slug)
    .neq("id", id)
    .single();

  if (existing) {
    return { data: null, error: "An author with this slug already exists" };
  }

  // If profile_id is provided, check if it's already linked to another author
  if (formData.profile_id) {
    const { data: existingProfile } = await supabase
      .from("authors")
      .select("id")
      .eq("profile_id", formData.profile_id)
      .neq("id", id)
      .single();

    if (existingProfile) {
      return {
        data: null,
        error: "This user profile is already linked to another author",
      };
    }
  }

  // Update author
  const { data, error } = await supabase
    .from("authors")
    .update({
      name: formData.name,
      slug: formData.slug,
      bio: formData.bio || null,
      profile_id: formData.profile_id || null,
      social_links: formData.social_links || {},
      is_active: formData.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating author:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/authors");
  return { data, error: null };
}

/**
 * Delete an author
 */
export async function deleteAuthor(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if author has any articles
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("author_id", id);

  if (count && count > 0) {
    return {
      error: `Cannot delete an author with ${count} article${
        count > 1 ? "s" : ""
      }`,
    };
  }

  // Delete author
  const { error } = await supabase.from("authors").delete().eq("id", id);

  if (error) {
    console.error("Error deleting author:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/authors");
  return { error: null };
}
