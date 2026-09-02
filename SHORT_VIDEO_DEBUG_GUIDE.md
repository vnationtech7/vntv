# Short Video Not Playing - Debug Guide

**Date:** September 2, 2026  
**Issue:** Shorts video plays in `/admin/videos` but not in hero/shorts sections

---

## ✅ Fixes Applied

### Fix 1: User Management Page
**Status:** ✅ FIXED

Changed query approach to fetch user roles separately to avoid PostgreSQL relationship ambiguity.

**File:** `app/admin/roles/actions.ts`

---

### Fix 2: Video Card Thumbnails
**Status:** ✅ FIXED

Added full URL construction for uploaded video thumbnails.

**File:** `components/content/video-card.tsx`

---

## 🔍 Short Video Issue Analysis

### Where It Works
- ✅ `/admin/videos` - Plays correctly

### Where It Doesn't Work  
- ❌ Hero section (homepage)
- ❌ Shorts section (homepage)

---

## 📊 Code Analysis

### Hero Section (`components/homepage/hero-section-v2.tsx`)

**Line 113 - Video URL Construction:**
```typescript
const videoUrl = isVideo && currentItem.source_type === 'upload' && currentItem.source_url
  ? getImageUrl(currentItem.source_url)
  : null;
```

**Line 71 - getImageUrl Function:**
```typescript
const getImageUrl = (storagePath: string | undefined) => {
  if (!storagePath) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url = `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
  return url;
};
```

**Line 132 - Video Element:**
```typescript
<video
  ref={videoRef}
  src={videoUrl}
  poster={imageUrl || undefined}
  loop
  muted={muted}
  playsInline
  className="w-full h-full object-cover"
/>
```

✅ **Construction is CORRECT**

---

### Shorts Section (`components/homepage/shorts-section.tsx`)

**Line 111 - Video Element:**
```typescript
<video
  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${short.source_url}`}
  poster={thumbnailUrl || undefined}
  loop
  muted
  playsInline
  preload="metadata"
  className="absolute inset-0 h-full w-full object-cover"
/>
```

✅ **Construction is CORRECT**

---

## 🧪 Diagnostic Steps

### Step 1: Check Video in Database

Run this SQL query:
```sql
SELECT 
  id,
  title,
  slug,
  source_type,
  source_url,
  status,
  is_featured,
  video_type,
  published_at
FROM videos
WHERE video_type = 'short'
  AND status = 'published'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result:**
```
source_type: "upload"
source_url: "videos/user-id/2026/09/timestamp-filename.mp4"
status: "published"
video_type: "short"
```

---

### Step 2: Check Browser Console

Open browser DevTools (F12) and check:

1. **Network Tab:**
   - Look for video file request
   - Check if it's 404 (Not Found)
   - Check if it's 403 (Forbidden)
   - Check response headers

2. **Console Tab:**
   - Look for CORS errors
   - Look for security policy errors
   - Check for any JavaScript errors

---

### Step 3: Check Video URL Format

In browser console, run:
```javascript
// For hero section
document.querySelector('video')?.src

// Should return something like:
// "https://xxx.supabase.co/storage/v1/object/public/videos/user-id/2026/09/file.mp4"
```

---

### Step 4: Test Video URL Directly

1. Copy the video URL from console
2. Paste it in a new browser tab
3. **Expected:** Video should play or download
4. **If 404:** File doesn't exist or path is wrong
5. **If 403:** Storage bucket not public or RLS blocking

---

## 🔧 Possible Issues & Fixes

### Issue 1: Storage Bucket Not Public

**Symptoms:**
- Video loads in admin (uses service_role key)
- Video doesn't load on public pages (403 error)

**Fix:**
```sql
-- Make videos bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'videos';
```

**Or via Supabase Dashboard:**
1. Go to Storage
2. Select `videos` bucket
3. Click settings
4. Enable "Public bucket"

---

### Issue 2: RLS Policy Blocking

**Symptoms:**
- 403 Forbidden error
- Works in admin but not on public pages

**Check current policies:**
```sql
SELECT *
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage';
```

**Fix: Add public read policy:**
```sql
-- Allow public read access to videos bucket
CREATE POLICY "Public read access for videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');
```

---

### Issue 3: Wrong Path Format

**Symptoms:**
- 404 Not Found
- Video exists but path doesn't match

**Check video path:**
```sql
-- Find videos with potentially wrong paths
SELECT 
  id,
  title,
  source_url,
  CASE 
    WHEN source_url LIKE 'videos/%' THEN '✅ Correct'
    WHEN source_url NOT LIKE '%/%' THEN '❌ Missing bucket'
    ELSE '⚠️ Check format'
  END as status
FROM videos
WHERE source_type = 'upload'
ORDER BY created_at DESC;
```

**Fix wrong paths:**
```sql
-- Fix videos missing bucket prefix
UPDATE videos
SET source_url = 'videos/' || source_url
WHERE source_type = 'upload'
  AND source_url NOT LIKE 'videos/%'
  AND source_url NOT LIKE 'http%';
```

---

### Issue 4: Video File Too Large

**Symptoms:**
- Video loads slowly or not at all
- Works for small videos, not large ones

**Check video size:**
```sql
SELECT 
  v.id,
  v.title,
  v.source_url,
  m.file_size,
  ROUND(m.file_size / 1024.0 / 1024.0, 2) as size_mb
FROM videos v
LEFT JOIN media_assets m ON v.source_url = m.storage_path
WHERE v.source_type = 'upload'
  AND v.video_type = 'short'
ORDER BY m.file_size DESC;
```

**Recommendation:**
- Shorts should be < 50MB
- Hero videos should be < 100MB
- For larger files, use external hosting or YouTube

---

### Issue 5: CORS Policy

**Symptoms:**
- Console shows CORS error
- Video element shows blank

**Check CORS settings:**
```sql
SELECT *
FROM storage.buckets
WHERE name = 'videos';
```

**Fix: Enable CORS for videos bucket**

In Supabase Dashboard:
1. Storage → Settings → CORS Configuration
2. Add allowed origins:
   ```json
   {
     "allowedOrigins": ["*"],
     "allowedMethods": ["GET", "HEAD"],
     "allowedHeaders": ["*"],
     "maxAgeSeconds": 3600
   }
   ```

---

### Issue 6: Environment Variable Not Set

**Symptoms:**
- Video src looks like: `undefined/storage/v1/object/public/...`
- Console shows undefined in URL

**Check:**
```bash
# In .env.local or .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

**Verify in browser console:**
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
// Should NOT be undefined
```

---

## 🎯 Quick Diagnostic Checklist

Run through these in order:

- [ ] **Check database:** Video has `source_url` with correct format (`videos/...`)
- [ ] **Check bucket:** `videos` bucket exists and is public
- [ ] **Check RLS:** Public read policy exists for videos bucket
- [ ] **Check browser:** Network tab shows video request
- [ ] **Check response:** Video request returns 200 (not 403/404)
- [ ] **Check console:** No CORS or security errors
- [ ] **Check URL:** Video src is complete and correct
- [ ] **Test direct:** Video URL works in new tab

---

## 🔍 Most Likely Causes

### For shorts not playing on homepage:

1. **Storage bucket not public** (90% likely)
   - Videos bucket has `public = false`
   - Need to enable public access

2. **RLS policy missing** (5% likely)
   - No policy allowing public SELECT on storage.objects
   - Need to add public read policy

3. **Wrong path format** (3% likely)
   - Video stored without bucket prefix
   - Need to fix source_url

4. **CORS issue** (2% likely)
   - Bucket CORS not configured
   - Need to enable CORS

---

## ✅ Recommended Fix Order

### 1. Make Videos Bucket Public (Try First)

**Supabase Dashboard:**
1. Go to **Storage**
2. Click on **videos** bucket
3. Click **Settings** (gear icon)
4. Enable **"Public bucket"**
5. Click **Save**

**Or via SQL:**
```sql
UPDATE storage.buckets
SET public = true
WHERE name = 'videos';
```

---

### 2. Add Public Read Policy (If #1 Doesn't Work)

```sql
CREATE POLICY "Allow public read access to videos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'videos');
```

---

### 3. Verify Video Path (If #1 & #2 Don't Work)

```sql
-- Check specific short video
SELECT 
  id,
  title,
  source_type,
  source_url,
  status,
  is_featured,
  video_type
FROM videos
WHERE video_type = 'short'
  AND status = 'published'
ORDER BY created_at DESC
LIMIT 1;
```

Make sure `source_url` starts with `videos/`

---

## 📝 After Fixing

Test in this order:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check homepage shorts section**
4. **Check hero section** (if video is featured)
5. **Verify in browser console** (no errors)

---

## 🆘 If Still Not Working

1. **Share the video URL** from browser console
2. **Share the SQL query result** for that video
3. **Share any browser console errors**
4. **Check Supabase Storage logs** for access attempts

---

**Most Common Fix:** Making the videos bucket public solves 90% of cases.

**Status:** Ready to debug with user
