// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface TagFormData {
  name: string;
  slug: string;
}

/**
 * Get all tags
 */
export async function getTags(): Promise<{
  data: Tag[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tags:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get a single tag by ID
 */
export async function getTag(
  id: string
): Promise<{ data: Tag | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching tag:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get tag usage count (how many articles use this tag)
 */
export async function getTagUsageCount(
  tagId: string
): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("article_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", tagId);

  if (error) {
    console.error("Error fetching tag usage:", error);
    return { count: 0, error: error.message };
  }

  return { count: count || 0, error: null };
}

/**
 * Create a new tag
 */
export async function createTag(
  formData: TagFormData
): Promise<{ data: Tag | null; error: string | null }> {
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
    .from("tags")
    .select("id")
    .eq("slug", formData.slug)
    .single();

  if (existing) {
    return { data: null, error: "A tag with this slug already exists" };
  }

  // Check if name already exists (case-insensitive)
  const { data: existingName } = await supabase
    .from("tags")
    .select("id")
    .ilike("name", formData.name)
    .single();

  if (existingName) {
    return { data: null, error: "A tag with this name already exists" };
  }

  // Insert tag
  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: formData.name,
      slug: formData.slug,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/tags");
  return { data, error: null };
}

/**
 * Update an existing tag
 */
export async function updateTag(
  id: string,
  formData: TagFormData
): Promise<{ data: Tag | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Check if slug already exists (excluding current tag)
  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", formData.slug)
    .neq("id", id)
    .single();

  if (existing) {
    return { data: null, error: "A tag with this slug already exists" };
  }

  // Check if name already exists (case-insensitive, excluding current tag)
  const { data: existingName } = await supabase
    .from("tags")
    .select("id")
    .ilike("name", formData.name)
    .neq("id", id)
    .single();

  if (existingName) {
    return { data: null, error: "A tag with this name already exists" };
  }

  // Update tag
  const { data, error } = await supabase
    .from("tags")
    .update({
      name: formData.name,
      slug: formData.slug,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating tag:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/tags");
  return { data, error: null };
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if tag is used by any articles
  const { count } = await supabase
    .from("article_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", id);

  if (count && count > 0) {
    return {
      error: `Cannot delete a tag that is used by ${count} article${
        count > 1 ? "s" : ""
      }`,
    };
  }

  // Delete tag
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    console.error("Error deleting tag:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/tags");
  return { error: null };
}

/**
 * Bulk create tags from a comma-separated string
 */
export async function bulkCreateTags(
  tagsString: string
): Promise<{ data: Tag[] | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Parse and clean tag names
  const tagNames = tagsString
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (tagNames.length === 0) {
    return { data: null, error: "No valid tags provided" };
  }

  // Create tags array with slugs
  const tagsToCreate = tagNames.map((name) => ({
    name,
    slug: generateSlug(name),
  }));

  // Check for existing tags
  const slugs = tagsToCreate.map((t) => t.slug);
  const { data: existingTags } = await supabase
    .from("tags")
    .select("slug")
    .in("slug", slugs);

  const existingSlugs = new Set(existingTags?.map((t) => t.slug) || []);

  // Filter out existing tags
  const newTags = tagsToCreate.filter((t) => !existingSlugs.has(t.slug));

  if (newTags.length === 0) {
    return { data: null, error: "All tags already exist" };
  }

  // Insert new tags
  const { data, error } = await supabase
    .from("tags")
    .insert(newTags)
    .select();

  if (error) {
    console.error("Error bulk creating tags:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/tags");
  return { data, error: null };
}
