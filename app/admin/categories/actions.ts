// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
}

/**
 * Get all categories with optional filters
 */
export async function getCategories(options?: {
  includeInactive?: boolean;
  parentId?: string | null;
}): Promise<{ data: Category[] | null; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  if (options?.parentId !== undefined) {
    if (options.parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", options.parentId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching categories:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get a single category by ID
 */
export async function getCategory(
  id: string
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Create a new category
 */
export async function createCategory(
  formData: CategoryFormData
): Promise<{ data: Category | null; error: string | null }> {
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
    .from("categories")
    .select("id")
    .eq("slug", formData.slug)
    .single();

  if (existing) {
    return { data: null, error: "A category with this slug already exists" };
  }

  // Insert category
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { data, error: null };
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  formData: CategoryFormData
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Check if slug already exists (excluding current category)
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", formData.slug)
    .neq("id", id)
    .single();

  if (existing) {
    return { data: null, error: "A category with this slug already exists" };
  }

  // Update category
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { data, error: null };
}

/**
 * Delete a category
 */
export async function deleteCategory(
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

  // Check if category has children
  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", id)
    .limit(1);

  if (children && children.length > 0) {
    return { error: "Cannot delete a category with subcategories" };
  }

  // Check if category is used by any articles
  const { data: articles } = await supabase
    .from("articles")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (articles && articles.length > 0) {
    return { error: "Cannot delete a category that has articles" };
  }

  // Delete category
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { error: null };
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  updates: Array<{ id: string; display_order: number }>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Check if user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Update display_order for each category
  const promises = updates.map(({ id, display_order }) =>
    supabase.from("categories").update({ display_order } as any).eq("id", id)
  );

  const results = await Promise.all(promises);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error("Error reordering categories:", errors);
    return { error: "Failed to reorder some categories" };
  }

  revalidatePath("/admin/categories");
  return { error: null };
}
