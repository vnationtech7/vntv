// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type ArticleData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: any[];
  published_at: string;
  view_count: number;
  is_breaking: boolean;
  is_featured: boolean;
  is_exclusive: boolean;
  is_sponsored: boolean;
  sponsor_label: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar_url: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

/**
 * Get a single article by slug
 */
export async function getArticle(slug: string) {
  const supabase = await createClient();

  try {
    const { data: article, error }: { data: any; error: any } = await supabase
      .from("articles")
      .select(`
        id, title, slug, excerpt, body, published_at, view_count,
        is_breaking, is_featured, is_exclusive, is_sponsored, sponsor_label,
        seo_title, seo_description,
        featured_image_id, category_id, author_id
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Error fetching article:", error);
      return { data: null, error: error.message };
    }

    if (!article) {
      return { data: null, error: "Article not found" };
    }

    // Get related data
    const [featuredImageResult, categoryResult, authorResult, tagsResult] = await Promise.all([
      article.featured_image_id
        ? supabase.from("media_assets").select("id, storage_path, alt_text").eq("id", article.featured_image_id).single()
        : { data: null, error: null },
      article.category_id
        ? supabase.from("categories").select("id, name, slug").eq("id", article.category_id).single()
        : { data: null, error: null },
      article.author_id
        ? supabase.from("authors").select("id, name, slug, bio, avatar_url").eq("id", article.author_id).single()
        : { data: null, error: null },
      supabase
        .from("article_tags")
        .select("tag:tags(id, name, slug)")
        .eq("article_id", article.id),
    ]);

    const enrichedArticle: ArticleData = {
      ...article,
      featured_image: featuredImageResult.data,
      category: categoryResult.data,
      author: authorResult.data,
      tags: tagsResult.data?.map((t: any) => t.tag).filter(Boolean) || [],
    };

    return { data: enrichedArticle, error: null };
  } catch (err) {
    console.error("Unexpected error fetching article:", err);
    return { data: null, error: "Failed to fetch article" };
  }
}

/**
 * Get suggested/related articles
 */
export async function getSuggestedArticles(
  currentArticleId: string,
  categoryId: string | null,
  tagIds: string[],
  limit: number = 6
) {
  const supabase = await createClient();

  try {
    let articles: any[] = [];

    // Strategy 1: Same category
    if (categoryId && articles.length < limit) {
      const { data: categoryArticles }: { data: any[] | null; error: any } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
        .eq("status", "published")
        .eq("category_id", categoryId)
        .neq("id", currentArticleId)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (categoryArticles) {
        articles = [...categoryArticles];
      }
    }

    // Strategy 2: Same tags (if we still need more)
    if (tagIds.length > 0 && articles.length < limit) {
      const { data: tagArticleIds }: { data: any[] | null; error: any } = await supabase
        .from("article_tags")
        .select("article_id")
        .in("tag_id", tagIds)
        .neq("article_id", currentArticleId);

      if (tagArticleIds && tagArticleIds.length > 0) {
        const articleIds = tagArticleIds.map(t => t.article_id);
        const { data: tagArticles }: { data: any[] | null; error: any } = await supabase
          .from("articles")
          .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
          .eq("status", "published")
          .in("id", articleIds)
          .not("published_at", "is", null)
          .order("published_at", { ascending: false })
          .limit(limit - articles.length);

        if (tagArticles) {
          // Add articles not already in the list
          const existingIds = new Set(articles.map(a => a.id));
          const newArticles = tagArticles.filter(a => !existingIds.has(a.id));
          articles = [...articles, ...newArticles];
        }
      }
    }

    // Strategy 3: Latest articles (if we still need more)
    if (articles.length < limit) {
      const { data: latestArticles }: { data: any[] | null; error: any } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
        .eq("status", "published")
        .neq("id", currentArticleId)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false})
        .limit(limit - articles.length);

      if (latestArticles) {
        const existingIds = new Set(articles.map(a => a.id));
        const newArticles = latestArticles.filter(a => !existingIds.has(a.id));
        articles = [...articles, ...newArticles];
      }
    }

    // Limit to requested amount
    articles = articles.slice(0, limit);

    if (articles.length === 0) {
      return { data: [], error: null };
    }

    // Get related data
    const categoryIds = articles.map(a => a.category_id).filter(Boolean);
    const authorIds = articles.map(a => a.author_id).filter(Boolean);
    const imageIds = articles.map(a => a.featured_image_id).filter(Boolean);

    const [categoriesResult, authorsResult, imagesResult]: [{ data: any[] | null; error: any }, { data: any[] | null; error: any }, { data: any[] | null; error: any }] = await Promise.all([
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

    const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || []);
    const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || []);
    const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || []);

    const enrichedArticles = articles.map(article => ({
      ...article,
      category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
      author: article.author_id ? authorsMap.get(article.author_id) || null : null,
      featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
    }));

    return { data: enrichedArticles, error: null };
  } catch (err) {
    console.error("Unexpected error fetching suggested articles:", err);
    return { data: null, error: "Failed to fetch suggested articles" };
  }
}

/**
 * Increment article view count
 */
export async function incrementArticleView(articleId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("increment_article_view", {
      article_id: articleId,
    } as any);

    if (error) {
      console.error("Error incrementing article view:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error incrementing article view:", err);
    return { error: "Failed to increment view count" };
  }
}
