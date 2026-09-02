# Debug: Video Not Found Error 🔍

**Error:** `Failed to load because no supported source was found`  
**URL:** `https://natnvyrukhheaaksfaug.supabase.co/storage/v1/object/public/videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4`

---

## 🎯 Quick Fix Steps

### Step 1: Check Console Logs

Refresh the page and look for these new debug logs:

```
[Shorts] Video source for <title>: { 
  raw: "...", 
  constructed: "..." 
}
```

This will show us exactly what URL is being constructed.

---

### Step 2: Test Video URL Directly

Copy the URL from the console error and paste it directly in your browser:

```
https://natnvyrukhheaaksfaug.supabase.co/storage/v1/object/public/videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
```

**If you get 404:**
→ The video file doesn't exist at that path in Supabase Storage

**If you get 403:**
→ The videos bucket isn't public or RLS policy blocks it

**If video plays:**
→ The issue is with the video format or browser compatibility

---

### Step 3: Check Database vs Storage

Run this SQL in Supabase SQL Editor:

```sql
-- Check what source_url is stored in database
SELECT 
  id,
  title,
  source_type,
  source_url,
  video_type
FROM videos
WHERE source_type = 'upload'
  AND video_type = 'short'
ORDER BY created_at DESC
LIMIT 5;
```

**Check the `source_url` values:**

**Option A:** Full URL
```
https://natnvyrukhheaaksfaug.supabase.co/storage/v1/object/public/videos/...
```

**Option B:** Relative path with bucket
```
videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
```

**Option C:** Relative path without bucket
```
b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
```

---

### Step 4: Check Storage Objects

```sql
-- Find the actual storage path
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'videos'
  AND name LIKE '%1787867684532%';
```

**If no results:**
→ The video file was never uploaded successfully or was deleted

**If results found, check the `name` column:**
This is the ACTUAL path in storage. Compare with what's in `videos.source_url`.

---

## 🔧 Common Issues & Fixes

### Issue 1: Video File Doesn't Exist

**Symptom:** 404 when testing URL directly

**Causes:**
1. Upload failed but database record was created
2. File was deleted from storage but not from database
3. Wrong bucket specified

**Solutions:**

**Option A: Re-upload the video**
1. Go to `/admin/videos`
2. Find the video
3. Edit it
4. Upload the video file again
5. Save

**Option B: Delete the broken record**
```sql
DELETE FROM videos WHERE id = '<video-id>';
```

**Option C: Check storage.objects table**
```sql
-- Find where the file actually is
SELECT bucket_id, name 
FROM storage.objects 
WHERE name LIKE '%1787867684532%';
```

Then update the video record:
```sql
UPDATE videos 
SET source_url = 'videos/<actual-path-from-storage>'
WHERE id = '<video-id>';
```

---

### Issue 2: Wrong Path Format

**Symptom:** URL is double-prefixed or malformed

**Example bad URLs:**
```
https://.../public/videos/videos/user/file.mp4  ← "videos/" duplicated
https://.../public/user/file.mp4  ← Missing "videos/" bucket
```

**Fix:** Update source_url in database

**If source_url has full URL:**
```sql
-- Remove full URL, keep only path
UPDATE videos
SET source_url = REGEXP_REPLACE(
  source_url, 
  'https://.*?/storage/v1/object/public/', 
  ''
)
WHERE source_type = 'upload'
  AND source_url LIKE 'https://%';
```

**If source_url missing "videos/" prefix:**
```sql
UPDATE videos
SET source_url = 'videos/' || source_url
WHERE source_type = 'upload'
  AND source_url NOT LIKE 'videos/%'
  AND source_url NOT LIKE 'http%';
```

---

### Issue 3: Bucket Not Public

**Symptom:** 403 Forbidden when testing URL

**Fix:**

1. Go to Supabase Dashboard
2. Storage → videos bucket
3. Click gear icon (Settings)
4. Toggle "Public bucket" ON
5. Click "Save"

Or via SQL:
```sql
-- Make videos bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'videos';
```

---

### Issue 4: RLS Policy Blocking Access

**Symptom:** 403 for specific files, others work

**Fix:**

```sql
-- Allow public read access to videos bucket
CREATE POLICY "Public Access to Videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');
```

---

### Issue 5: Video Format Not Supported

**Symptom:** Video URL loads but error says "no supported source"

**Supported formats:**
- ✅ MP4 (H.264 video + AAC audio)
- ✅ WebM (VP8/VP9 video + Vorbis/Opus audio)
- ❌ MOV (depends on codec)
- ❌ AVI (usually not)
- ❌ MKV (usually not)

**Check video format:**

1. Download the video from Supabase Storage
2. Check properties or use:
   ```bash
   ffprobe video.mp4
   ```

**Convert to compatible format:**
```bash
ffmpeg -i input.mov -c:v libx264 -c:a aac -movflags +faststart output.mp4
```

Then re-upload to Supabase.

---

## 📊 Diagnostic Workflow

```
1. Check console logs
   ├─ [Shorts] Video source for...
   └─ [Shorts Video] Failed to load video...

2. Test URL in browser
   ├─ 404 → File doesn't exist → Check storage.objects
   ├─ 403 → Permission issue → Check bucket public + RLS
   ├─ Video plays → Format issue → Re-encode video
   └─ Connection error → Network/CORS issue

3. Check database source_url
   ├─ Full URL → Strip to relative path
   ├─ Missing "videos/" → Add prefix
   └─ Correct format → Check storage

4. Check storage.objects
   ├─ File missing → Re-upload or delete record
   ├─ Different path → Update source_url in videos table
   └─ File exists → Check format/codec

5. Verify Fix
   └─ Video plays on hover ✅
```

---

## 🧪 Test After Fix

### Test 1: URL in Console
```
[Shorts] Video source for "Title": { 
  raw: "videos/user-id/2026/08/file.mp4",
  constructed: "https://.../storage/v1/object/public/videos/user-id/2026/08/file.mp4"
}
```

### Test 2: URL in Browser
Paste constructed URL → Video plays ✅

### Test 3: Hover in Shorts Section
Hover over uploaded short → Video plays ✅

---

## ✅ Expected Result

**Console logs:**
```
[Shorts] Video source for "Title": { raw: "...", constructed: "..." }
[Shorts Video] Registered video element: <id> https://...
[Shorts Hover] Attempting to play uploaded video: <id>
[Shorts Hover] Video playing successfully
```

**Visual:**
- ✅ No error messages
- ✅ Thumbnail shows when not hovering
- ✅ Video plays on hover
- ✅ Video loops smoothly

---

## 🚀 Next Steps

1. **Check console logs** after page refresh
2. **Copy the constructed URL** from logs
3. **Test URL directly** in browser
4. **Run diagnostic SQL** to check database vs storage
5. **Apply appropriate fix** from above
6. **Re-test hover** functionality

---

**Need Help?**

Share these details:
1. Console log showing `[Shorts] Video source for...`
2. Result of SQL query checking `source_url`
3. Result of SQL query checking `storage.objects`
4. What happens when you paste the URL in browser

This will help pinpoint the exact issue!
