# Article Featured Image Fix ✅

**Date:** September 2, 2026  
**Status:** Fixed

## 🐛 The Problem

Featured images were showing correctly on the **admin articles page** but NOT showing on the **public article details page** (`/news/[slug]`).

## 🔍 Root Cause

The public article page was **double-adding** the bucket name to the storage path.

### Code Comparison:

**Admin Page (WORKING):**
```typescript
// /app/admin/articles/page.tsx
src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${article.featured_image.storage_path}`}
```

**Public Page (BROKEN):**
```typescript
// /app/news/[slug]/page.tsx
src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${article.featured_image.storage_path}`}
```

### The Issue:
The `storage_path` field in the database **already includes the bucket name**:
```
Example: "media/articles/some-image.jpg"
```

So when the public page added `/media/` again, it created an invalid path:
```
BROKEN: /storage/v1/object/public/media/media/articles/some-image.jpg
                                      ↑↑↑↑↑ DUPLICATE!

CORRECT: /storage/v1/object/public/media/articles/some-image.jpg
```

## ✅ The Fix

### File: `/app/news/[slug]/page.tsx`

**Changed from:**
```typescript
const imageUrl = article.featured_image
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${article.featured_image.storage_path}`
  : null;
```

**Changed to:**
```typescript
const imageUrl = article.featured_image
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${article.featured_image.storage_path}`
  : null;
```

**Key change:** Removed the hardcoded `/media/` part since it's already in `storage_path`.

## 📝 Technical Details

### Database Structure:
```sql
Table: media_assets
- id: uuid
- storage_path: text  -- Example: "media/articles/image123.jpg"
- alt_text: text
```

### URL Construction:
```
Base URL: https://your-supabase-url.supabase.co
Path: /storage/v1/object/public/
Storage Path: media/articles/image123.jpg
Full URL: https://your-supabase-url.supabase.co/storage/v1/object/public/media/articles/image123.jpg
```

## 🎯 Impact

### Before Fix:
- ❌ Article images not showing on public site
- ✅ Article images showing in admin (using correct path)
- User experience: Broken image placeholders on news articles

### After Fix:
- ✅ Article images showing on public site
- ✅ Article images showing in admin  
- User experience: Professional article display with featured images

## 🔍 How to Test

1. Restart dev server: `npm run dev`
2. Go to admin: `/admin/articles`
3. Verify featured image shows (should already work)
4. Click on an article with an image
5. Verify the article page at `/news/[slug]` now shows the featured image
6. Hard refresh if needed: `Cmd + Shift + R`

## 📋 Files Modified

- ✅ `/app/news/[slug]/page.tsx` - Fixed image URL construction (2 instances)

### Changed Lines:
- Line ~32: Metadata generation (OpenGraph image)
- Line ~117: Featured image display

## ✅ Testing Checklist

- [x] TypeScript compiles without errors
- [x] Removed duplicate `/media/` from URL construction
- [x] Image URL now matches admin's working pattern
- [x] Both metadata and display use correct URL
- [x] No other files affected

---

**Status:** ✅ Complete and Ready to Test  
**Impact:** High - Fixes broken article images on public site  
**Risk:** Low - Simple path correction, matches working admin code
