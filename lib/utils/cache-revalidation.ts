/**
 * Centralized cache revalidation utilities for VNTV
 * 
 * This module provides strategic cache invalidation to ensure the public site
 * reflects content changes immediately while minimizing unnecessary revalidations.
 */

import { revalidatePath } from "next/cache";

/**
 * Revalidate homepage and related paths
 * Use when: Breaking news, featured content, or homepage sections change
 */
export function revalidateHomepage() {
  revalidatePath("/", "page");
  console.log("[Cache] Revalidated homepage");
}

/**
 * Revalidate article detail page and related list pages
 * Use when: Article is created, updated, published, or deleted
 */
export function revalidateArticle(slug: string, categorySlug?: string) {
  // Article detail page
  revalidatePath(`/news/${slug}`, "page");
  
  // Homepage (if featured or breaking)
  revalidatePath("/", "page");
  
  // Category page (if category exists)
  if (categorySlug) {
    revalidatePath(`/news/category/${categorySlug}`, "page");
  }
  
  console.log(`[Cache] Revalidated article: ${slug}`);
}

/**
 * Revalidate all article-related paths
 * Use when: Major article changes that affect multiple pages
 */
export function revalidateAllArticles() {
  revalidatePath("/", "page");
  revalidatePath("/news", "layout"); // Revalidates all /news/* pages
  console.log("[Cache] Revalidated all article paths");
}

/**
 * Revalidate video detail page and related list pages
 * Use when: Video is created, updated, published, or deleted
 */
export function revalidateVideo(slug: string) {
  revalidatePath(`/videos/${slug}`, "page");
  revalidatePath("/videos", "page");
  revalidatePath("/", "page"); // Homepage often includes latest videos
  console.log(`[Cache] Revalidated video: ${slug}`);
}

/**
 * Revalidate programme and its episodes
 * Use when: Programme or episodes are updated
 */
export function revalidateProgramme(slug: string) {
  revalidatePath(`/originals/${slug}`, "page");
  revalidatePath("/originals", "page");
  console.log(`[Cache] Revalidated programme: ${slug}`);
}

/**
 * Revalidate category pages
 * Use when: Category is created, updated, or articles in category change
 */
export function revalidateCategory(slug: string) {
  revalidatePath(`/news/category/${slug}`, "page");
  revalidatePath("/", "page"); // Homepage may show category-specific sections
  console.log(`[Cache] Revalidated category: ${slug}`);
}

/**
 * Revalidate tag pages
 * Use when: Tag is created, updated, or articles with tag change
 */
export function revalidateTag(slug: string) {
  revalidatePath(`/news/tag/${slug}`, "page");
  console.log(`[Cache] Revalidated tag: ${slug}`);
}

/**
 * Revalidate author pages
 * Use when: Author is created, updated, or their articles change
 */
export function revalidateAuthor(slug: string) {
  revalidatePath(`/authors/${slug}`, "page");
  console.log(`[Cache] Revalidated author: ${slug}`);
}

/**
 * Revalidate breaking news ticker
 * Use when: Breaking news is added, updated, or removed
 */
export function revalidateBreakingNews() {
  // Breaking news appears on all pages via PublicLayout
  revalidatePath("/", "layout");
  console.log("[Cache] Revalidated breaking news ticker");
}

/**
 * Revalidate RSS-related pages
 * Use when: RSS items are approved or feeds are updated
 */
export function revalidateRSS(itemId?: string) {
  if (itemId) {
    revalidatePath(`/rss/${itemId}`, "page");
  }
  revalidatePath("/", "page"); // Homepage includes RSS items
  console.log(`[Cache] Revalidated RSS ${itemId ? `item: ${itemId}` : "feeds"}`);
}

/**
 * Revalidate search results
 * Use when: Content is published or unpublished (affects search index)
 */
export function revalidateSearch() {
  revalidatePath("/search", "page");
  console.log("[Cache] Revalidated search");
}

/**
 * Revalidate all admin paths
 * Use when: Admin data changes that don't affect public pages
 */
export function revalidateAdmin(path: string) {
  revalidatePath(path, "page");
  console.log(`[Cache] Revalidated admin: ${path}`);
}

/**
 * Nuclear option: Revalidate everything
 * Use sparingly: Only for major structural changes or deployments
 */
export function revalidateAll() {
  revalidatePath("/", "layout");
  console.log("[Cache] ⚠️  FULL CACHE REVALIDATION");
}

/**
 * Batch revalidation for efficiency
 * Use when: Multiple related changes happen together
 */
export function batchRevalidate(paths: string[], type: "page" | "layout" = "page") {
  const uniquePaths = [...new Set(paths)];
  uniquePaths.forEach(path => revalidatePath(path, type));
  console.log(`[Cache] Batch revalidated ${uniquePaths.length} paths`);
}

/**
 * Smart revalidation based on content type and status
 */
export function smartRevalidate(params: {
  contentType: "article" | "video" | "programme" | "breaking_news" | "rss";
  action: "create" | "update" | "delete" | "publish" | "unpublish";
  slug?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
}) {
  const { contentType, action, slug, categorySlug, isFeatured, isBreaking } = params;

  // Always revalidate homepage for featured or breaking content
  if (isFeatured || isBreaking) {
    revalidateHomepage();
  }

  switch (contentType) {
    case "article":
      if (slug) {
        revalidateArticle(slug, categorySlug);
      }
      if (action === "publish" || action === "unpublish") {
        revalidateSearch();
      }
      break;

    case "video":
      if (slug) {
        revalidateVideo(slug);
      }
      if (action === "publish" || action === "unpublish") {
        revalidateSearch();
      }
      break;

    case "programme":
      if (slug) {
        revalidateProgramme(slug);
      }
      break;

    case "breaking_news":
      revalidateBreakingNews();
      break;

    case "rss":
      if (slug) {
        revalidateRSS(slug);
      }
      break;
  }

  console.log(`[Cache] Smart revalidation: ${contentType} - ${action}`);
}
