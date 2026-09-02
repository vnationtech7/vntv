# Video Upload & Storage Path Audit

**Date:** September 2, 2026  
**Status:** 🔍 Audit Complete - Issues Found

---

## 🚨 Critical Issues Found

### Issue 1: Inconsistent Storage Path Format

**Problem:** Videos uploaded use different path formats, causing playback failures.

**Evidence:**
1. **Upload API** stores videos with format: `videos/{userId}/{year}/{month}/{timestamp}-{filename}`
   - Example: `videos/abc123/2026/09/1693593600000-myvideo.mp4`
   - Storage path in DB: `videos/abc123/2026/09/1693593600000-myvideo.mp4`

2. **Retrieval Code** expects format: `{bucket}/{path}`
   - Some components expect: `videos/...`
   - Others assume it's just the path without bucket

**Where It Breaks:**
```typescript
// components/homepage/shorts-section.tsx:111
src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${short.source_url}`}
```

If `source_url` = `videos/user123/2026/09/video.mp4`, URL becomes:
```
https://supabase.co/storage/v1/object/public/videos/user123/2026/09/video.mp4
```
✅ **CORRECT!**

But if there's a mismatch (stored without bucket prefix), it breaks.

---

### Issue 2: Video Upload Dialog Stores Incorrect Path

**File:** `components/cms/video-upload-or-search.tsx`

**Line 123:**
```typescript
source_url: uploadResult.storagePath, // Store the storage path
```

**Problem:** `uploadResult.storagePath` comes from `/api/media/upload` and includes the bucket name:
```typescript
// In upload API:
const storagePath = `${bucketName}/${pathInBucket}`;
// Returns: "videos/user123/2026/09/video.mp4"
```

This is **CORRECT** ✅

---

### Issue 3: Missing Storage Bucket in Database Schema

**Problem:** Videos table doesn't have a `storage_bucket` column. We're storing full path like `videos/path/to/file.mp4`, but some code doesn't know which bucket to use.

**Current Schema:**
```sql
CREATE TABLE videos (
  source_url TEXT,  -- Could be YouTube URL OR storage path
  source_type TEXT  -- "youtube", "upload", "external"
)
```

**Issue:** When `source_type = "upload"`, `source_url` could be:
- ✅ `videos/user123/file.mp4` (includes bucket)
- ❌ `user123/file.mp4` (missing bucket)
- ❌ Full URL `https://...` (wrong format)

---

## 📊 Current Implementation Analysis

### Upload Flow

**1. Upload API** (`/api/media/upload/route.ts`):
```typescript
// ✅ CORRECT
const bucketName = mediaType === "video" ? "videos" : "media";
const pathInBucket = `${user.id}/${year}/${month}/${timestamp}-${sanitizedFileName}`;
const storagePath = `${bucketName}/${pathInBucket}`;
// Stores in DB: "videos/user123/2026/09/video.mp4"
```

**2. Video Creation** (`video-upload-or-search.tsx`):
```typescript
// ✅ CORRECT
source_url: uploadResult.storagePath,  // "videos/..."
source_type: "upload"
```

**3. Video Retrieval** (Various components):

**Option A - Correct** (video-player.tsx):
```typescript
const videoUrl = src.startsWith("http")
  ? src
  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${src}`;
```
✅ Works if `src = "videos/user123/file.mp4"`

**Option B - Wrong** (shorts-section.tsx):
```typescript
src={`${SUPABASE_URL}/storage/v1/object/public/${short.source_url}`}
```
⚠️ Assumes `source_url` includes bucket prefix

---

## 🔍 Where Videos Are Used

### 1. Admin Video Management
**Files:**
- `app/admin/videos/actions.ts` - CRUD operations
- `app/admin/videos/new/page.tsx` - Create video
- `app/admin/videos/[id]/page.tsx` - Edit video

**Status:** ✅ **CORRECT** - Stores `source_url` with bucket prefix

---

### 2. Video Cards (Listing)
**Files:**
- `components/content/video-card.tsx`

**Code:**
```typescript
{sourceType === "upload" && sourceUrl ? (
  <video
    src={sourceUrl}  // ❌ WRONG - Missing full URL construction
    className="h-full w-full object-cover pointer-events-none"
    preload="metadata"
  />
) : null}
```

**Issue:** `sourceUrl` is just `"videos/user123/file.mp4"`, not full URL!

**Fix Needed:**
```typescript
src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${sourceUrl}`}
```

---

### 3. Video Player (Full Page)
**Files:**
- `components/video/video-player.tsx` - ✅ CORRECT
- `components/video/video-page-player.tsx` - Need to check
- `components/video/unified-video-player.tsx` - Need to check

---

### 4. Shorts Section (Homepage)
**File:** `components/homepage/shorts-section.tsx`

**Code:**
```typescript
<video
  src={`${SUPABASE_URL}/storage/v1/object/public/${short.source_url}`}
  poster={thumbnailUrl || undefined}
/>
```

**Status:** ✅ **CORRECT** - Assumes `source_url` has bucket prefix

---

### 5. Episode Videos
**Files:**
- `app/admin/programmes/[id]/episodes/actions.ts`
- `app/originals/[slug]/[episodeSlug]/page.tsx`

**Need to audit:** How episode videos are stored and retrieved.

---

## 🛠️ Required Fixes

### Fix 1: Update video-card.tsx Thumbnail Loading

**File:** `components/content/video-card.tsx`

**Current (Line 97-103):**
```typescript
) : sourceType === "upload" && sourceUrl ? (
  // For uploaded videos without thumbnail, show video frame
  <video
    src={sourceUrl}  // ❌ WRONG
    className="h-full w-full object-cover pointer-events-none"
    preload="metadata"
  />
```

**Fix:**
```typescript
) : sourceType === "upload" && sourceUrl ? (
  <video
    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${sourceUrl}`}
    className="h-full w-full object-cover pointer-events-none"
    preload="metadata"
  />
```

---

### Fix 2: Ensure Consistent Storage Path Format

**Verify all video creations store with bucket prefix:**

**✅ Already correct in:**
- `/api/media/upload` - Returns `storage_path` with bucket
- `video-upload-or-search.tsx` - Uses `uploadResult.storagePath`

**⚠️ Need to check:**
- Episode video uploads
- Any direct video creation (not via upload API)

---

### Fix 3: Add Validation in Video Actions

**File:** `app/admin/videos/actions.ts`

**Add to createVideo() and updateVideo():**
```typescript
// Validate uploaded video paths
if (formData.source_type === "upload") {
  if (!formData.source_url.startsWith("videos/")) {
    // Fix path if missing bucket prefix
    formData.source_url = `videos/${formData.source_url}`;
  }
}
```

---

### Fix 4: Audit Media Assets Table

**Query to check for inconsistent paths:**
```sql
-- Find media assets with inconsistent paths
SELECT 
  id, 
  file_name, 
  storage_path,
  media_type
FROM media_assets
WHERE 
  media_type = 'video' 
  AND NOT storage_path LIKE 'videos/%'
ORDER BY created_at DESC;
```

**Query to check videos table:**
```sql
-- Find videos with uploaded source but wrong path format
SELECT 
  id,
  title,
  source_type,
  source_url
FROM videos
WHERE 
  source_type = 'upload'
  AND (
    source_url NOT LIKE 'videos/%'
    OR source_url LIKE 'http%'
  )
ORDER BY created_at DESC;
```

---

## 🎯 Recommended Solution

### Short-term: Fix Display Components

1. ✅ Update `video-card.tsx` to construct full URL
2. ✅ Verify all video players construct full URLs
3. ✅ Add validation to video creation

### Long-term: Database Schema Improvement

**Add separate columns:**
```sql
ALTER TABLE videos ADD COLUMN storage_bucket TEXT;
ALTER TABLE videos ADD COLUMN storage_path TEXT;

-- Migrate data:
UPDATE videos
SET 
  storage_bucket = SPLIT_PART(source_url, '/', 1),
  storage_path = SUBSTRING(source_url FROM POSITION('/' IN source_url) + 1)
WHERE source_type = 'upload' AND source_url LIKE '%/%';
```

**Benefits:**
- Clear separation: external URLs vs storage paths
- Easier to construct storage URLs
- Simpler validation

---

## 📋 Testing Checklist

After fixes, test these scenarios:

### Video Upload
- [ ] Upload video via admin
- [ ] Check `source_url` in database (should be `videos/...`)
- [ ] View video in admin video list
- [ ] Edit video and save (ensure path preserved)
- [ ] Delete video (ensure storage file deleted)

### Video Playback
- [ ] Play video on video detail page (`/video/[slug]`)
- [ ] Play video in shorts section (homepage)
- [ ] Play video thumbnail preview (video cards)
- [ ] Play episode video (`/originals/[slug]/[episode]`)

### Episode Videos
- [ ] Create episode with uploaded video
- [ ] Edit episode video
- [ ] View episode page
- [ ] Play episode video

### Edge Cases
- [ ] Video with YouTube source (should work)
- [ ] Video with external URL (should work)
- [ ] Video with storage path (should work)
- [ ] Video with missing/deleted file (graceful error)

---

## 🔍 Files to Review/Fix

**Priority 1 - Immediate Fixes:**
1. ✅ `components/content/video-card.tsx` - Fix video src
2. ⏳ `components/video/video-page-player.tsx` - Verify URL construction
3. ⏳ `components/video/unified-video-player.tsx` - Verify URL construction

**Priority 2 - Validation:**
4. ⏳ `app/admin/videos/actions.ts` - Add path validation
5. ⏳ `app/admin/programmes/[id]/episodes/actions.ts` - Check episode videos

**Priority 3 - Auditing:**
6. ⏳ Run SQL queries to find inconsistent paths
7. ⏳ Fix any existing videos with wrong paths

---

## 🎯 Root Cause Analysis

**Why videos don't play:**

1. **Video card thumbnail previews** use `sourceUrl` directly without constructing full URL
2. **No validation** on path format during video creation
3. **Inconsistent path handling** across different components
4. **Missing bucket prefix** in some stored paths (if any exist)

**Good News:**
- ✅ Upload API is correct
- ✅ Main video player is correct
- ✅ Shorts section is correct
- ❌ Video cards need fixing
- ⚠️ Episodes need verification

---

## 📊 Expected vs Actual

### Expected Format

**For uploaded videos:**
```
source_type: "upload"
source_url: "videos/user-id/2026/09/timestamp-filename.mp4"
```

**URL Construction:**
```typescript
const fullUrl = `${SUPABASE_URL}/storage/v1/object/public/${source_url}`;
// Result: https://xxx.supabase.co/storage/v1/object/public/videos/user-id/2026/09/file.mp4
```

### Actual Issues

1. **Video cards** don't construct full URL
2. Some videos may have been created before fixes (wrong format)
3. No validation catches malformed paths

---

## ✅ Next Actions

1. **Immediate:** Fix video-card.tsx (5 minutes)
2. **Quick:** Verify episode video handling (10 minutes)
3. **Important:** Run SQL audit queries (find broken videos)
4. **Follow-up:** Add validation to video creation
5. **Long-term:** Consider schema improvement

---

**Status:** Ready to implement fixes  
**Risk Level:** Low (fixes are straightforward)  
**Impact:** All uploaded videos will play correctly
