# VNTV Cache Revalidation Strategy

## Overview

VNTV uses Next.js App Router's built-in caching with strategic revalidation to ensure content changes appear immediately while maintaining excellent performance.

## Cache Revalidation Utility

Location: `/lib/utils/cache-revalidation.ts`

This centralized utility provides functions for revalidating specific types of content and paths.

## Revalidation Functions

### Content-Specific Functions

#### `revalidateHomepage()`
- **When**: Breaking news, featured content, or homepage sections change
- **Paths**: `/` (page only)
- **Use in**: Breaking news, homepage section management, featured article toggles

#### `revalidateArticle(slug, categorySlug?)`
- **When**: Article created, updated, published, or deleted
- **Paths**: 
  - `/news/${slug}` (article detail)
  - `/` (homepage)
  - `/news/category/${categorySlug}` (if category provided)
- **Use in**: Article CRUD operations

#### `revalidateVideo(slug)`
- **When**: Video created, updated, published, or deleted
- **Paths**:
  - `/videos/${slug}` (video detail)
  - `/videos` (video listing)
  - `/` (homepage)
- **Use in**: Video CRUD operations

#### `revalidateProgramme(slug)`
- **When**: Programme or episodes updated
- **Paths**:
  - `/originals/${slug}` (programme detail)
  - `/originals` (originals listing)
- **Use in**: Programme and episode CRUD operations

#### `revalidateCategory(slug)`
- **When**: Category created, updated, or articles in category change
- **Paths**:
  - `/news/category/${slug}` (category page)
  - `/` (homepage - may have category sections)
- **Use in**: Category management, article category changes

#### `revalidateBreakingNews()`
- **When**: Breaking news added, updated, or removed
- **Paths**: `/` (layout - affects all pages via ticker)
- **Use in**: Breaking news CRUD operations

#### `revalidateRSS(itemId?)`
- **When**: RSS items approved or feeds updated
- **Paths**:
  - `/rss/${itemId}` (if itemId provided)
  - `/` (homepage - includes RSS items)
- **Use in**: RSS approval, feed ingestion

### Smart Revalidation

#### `smartRevalidate(params)`
Intelligent revalidation based on content type and action.

**Parameters:**
```typescript
{
  contentType: "article" | "video" | "programme" | "breaking_news" | "rss";
  action: "create" | "update" | "delete" | "publish" | "unpublish";
  slug?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
}
```

**Features:**
- Automatically revalidates homepage for featured/breaking content
- Revalidates search on publish/unpublish
- Handles content-type-specific paths

**Example:**
```typescript
smartRevalidate({
  contentType: "article",
  action: "publish",
  slug: article.slug,
  categorySlug: article.category?.slug,
  isFeatured: article.is_featured,
  isBreaking: article.is_breaking
});
```

## Implementation Guidelines

### 1. In Server Actions

Always call revalidation functions **after** successful database operations:

```typescript
export async function updateBreakingNews(id: string, data: any) {
  const supabase = await createClient();
  
  const { data: updated, error } = await supabase
    .from("breaking_news")
    .update(data)
    .eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  // Revalidate after successful update
  revalidateBreakingNews();
  revalidateAdmin("/admin/breaking-news");

  return { data: updated, error: null };
}
```

### 2. Batch Operations

For bulk operations, revalidate once at the end:

```typescript
export async function bulkApproveArticles(ids: string[]) {
  // ... perform bulk updates ...
  
  // Single revalidation for all changes
  revalidateHomepage();
  revalidateAdmin("/admin/articles");
}
```

### 3. Avoid Over-Revalidation

❌ **Don't:**
```typescript
// Revalidating on every admin view
export async function getArticle(id: string) {
  // ... fetch article ...
  revalidateArticle(slug); // ❌ No changes made!
}
```

✅ **Do:**
```typescript
// Only revalidate on mutations
export async function publishArticle(id: string) {
  // ... update article status ...
  revalidateArticle(slug); // ✅ Content changed
}
```

## Revalidation Scope

### Page vs Layout

- **`"page"`** (default): Revalidates only that specific page
- **`"layout"`**: Revalidates the layout and all nested pages

Breaking news uses `"layout"` because the ticker appears on all pages via `PublicLayout`.

### Admin vs Public

- **Admin paths** (`/admin/*`): Only revalidate the specific admin page
- **Public paths** (`/`, `/news/*`, etc.): Revalidate affected public pages

## Current Implementation Status

### ✅ Implemented
- Breaking news (layout-wide revalidation)
- Homepage sections and items
- RSS items (homepage revalidation on approval)
- Admin-only paths (categories, tags, authors)

### 🔄 To Be Enhanced
- Article actions (add public path revalidation)
- Video actions (add public path revalidation)
- Programme actions (add public path revalidation)
- Search revalidation on content publish/unpublish

## Performance Considerations

### Cache Layers

1. **Next.js Data Cache**: Server action results
2. **Full Route Cache**: Rendered pages
3. **Client Router Cache**: Client-side navigation cache

Revalidation affects layers 1 and 2. Layer 3 refreshes on navigation.

### Revalidation Strategy

- **Surgical**: Revalidate only affected paths
- **Immediate**: Changes appear on next page load
- **Logged**: All revalidations logged for monitoring

## Monitoring

All revalidation calls are logged to console:

```
[Cache] Revalidated homepage
[Cache] Revalidated article: breaking-news-story
[Cache] Smart revalidation: article - publish
```

Monitor these logs in production to:
- Verify revalidation is working
- Identify over-revalidation patterns
- Debug cache issues

## Future Enhancements

### Time-Based Revalidation

For less critical content, consider time-based revalidation:

```typescript
// In route segment config
export const revalidate = 3600; // Revalidate every hour
```

### On-Demand Incremental Static Regeneration (ISR)

Current implementation uses on-demand revalidation. Could extend with:
- Webhook-based revalidation from Supabase
- Scheduled revalidation for time-sensitive content

### Cache Tags (Next.js 14+)

When upgrading to Next.js 14+, consider using cache tags for more granular control:

```typescript
// Tag cache entries
export const tags = ['articles', 'category:politics'];

// Revalidate by tag
revalidateTag('category:politics');
```

## Troubleshooting

### Changes Not Appearing

1. **Check revalidation is called**: Look for console logs
2. **Verify path matches**: `/news/article` ≠ `/news/article/`
3. **Check cache type**: May need `"layout"` instead of `"page"`
4. **Hard refresh**: Cmd+Shift+R to bypass browser cache

### Over-Revalidation

1. **Review logs**: Check frequency of revalidation
2. **Audit action calls**: Ensure revalidation only on mutations
3. **Consider batching**: Group related revalidations

## Best Practices

1. ✅ Always revalidate after successful mutations
2. ✅ Use content-specific functions for clarity
3. ✅ Log custom revalidations for debugging
4. ✅ Revalidate admin and public paths separately
5. ❌ Don't revalidate on read operations
6. ❌ Don't over-use `revalidateAll()`
7. ❌ Don't forget to handle errors before revalidating

## Related Documentation

- [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js Revalidation Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
