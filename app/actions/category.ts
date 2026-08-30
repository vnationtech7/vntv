// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
};

export type CategoryArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string; slug: string } | null;
  featured_image: { id: string; storage_path: string; alt_text: string | null } | null;
};

/**
 * Get category by slug with subcategories
 */
export async function getCategory(slug: string) {
  const supabase = await createClient();

  try {
    // Get category
    const { data: category, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, parent_id, display_order, is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !category) {
      return { data: null, error: "Category not found" };
    }

    // Get subcategories
    const { data: subcategories } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("parent_id", category.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    return {
      data: {
        ...category,
        subcategories: subcategories || [],
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching category:", err);
    return { data: null, error: "Failed to fetch category" };
  }
}

/**
 * Get articles for a category with filters and pagination
 */
export async function getCategoryArticles(
  categorySlug: string,
  options: {
    subcategorySlug?: string;
    sortBy?: "latest" | "trending" | "featured";
    page?: number;
    limit?: number;
  } = {}
) {
  const supabase = await createClient();
  const { subcategorySlug, sortBy = "latest", page = 1, limit = 12 } = options;

  try {
    // Get category ID
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .single();

    if (!category) {
      return { data: null, total: 0, error: "Category not found" };
    }

    let categoryId = category.id;

    // If subcategory specified, get its ID
    if (subcategorySlug) {
      const { data: subcategory } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", subcategorySlug)
        .eq("parent_id", category.id)
        .eq("is_active", true)
        .single();

      if (subcategory) {
        categoryId = subcategory.id;
      }
    }

    // Build query
    let query = supabase
      .from("articles")
      .select("id, title, slug, excerpt, published_at, category_id, author_id, featured_image_id", { count: "exact" })
      .eq("status", "published")
      .eq("category_id", categoryId)
      .not("published_at", "is", null);

    // Apply sorting
    if (sortBy === "latest") {
      query = query.order("published_at", { ascending: false });
    } else if (sortBy === "featured") {
      query = query.eq("is_featured", true).order("published_at", { ascending: false });
    } else if (sortBy === "trending") {
      query = query.order("view_count", { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error("Error fetching category articles:", error);
      return { data: null, total: 0, error: error.message };
    }

    if (!articles || articles.length === 0) {
      return { data: [], total: 0, error: null };
    }

    // Get related data
    const categoryIds = articles.map((a) => a.category_id).filter(Boolean);
    const authorIds = articles.map((a) => a.author_id).filter(Boolean);
    const imageIds = articles.map((a) => a.featured_image_id).filter(Boolean);

    const [categoriesResult, authorsResult, imagesResult] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
        : { data: [], error: null },
      authorIds.length > 0
        ? supabase.from("authors").select("id, name, slug").in("id", authorIds)
        : { data: [], error: null },
      imageIds.length > 0
        ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
        : { data: [], error: null },
    ]);

    const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || [] as any);
    const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || [] as any);
    const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || [] as any);

    const enrichedArticles = articles.map((article) => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, total: count || 0, error: null };
  } catch (err) {
    console.error("Error fetching category articles:", err);
    return { data: null, total: 0, error: "Failed to fetch articles" };
  }
}

/**
 * Get all active categories for navigation
 */
export async function getAllCategories() {
  const supabase = await createClient();

  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return { data: null, error: error.message };
    }

    return { data: categories || [], error: null };
  } catch (err) {
    console.error("Error fetching categories:", err);
    return { data: null, error: "Failed to fetch categories" };
  }
}
