# Fix Video Source Type - YouTube Error

**Problem:** Video shows "YouTube Error - Invalid YouTube URL"  
**Cause:** Video has `source_type = "youtube"` but `source_url` contains storage path (not YouTube URL)

---

## 🔍 Diagnosis

Your uploaded video is incorrectly marked as a YouTube video in the database.

**What should be:**
```
source_type: "upload"
source_url: "videos/user-id/2026/09/filename.mp4"
```

**What it probably is:**
```
source_type: "youtube"  ← WRONG!
source_url: "videos/user-id/2026/09/filename.mp4"
```

---

## 🔧 Fix

### Step 1: Find the Problem Video

Run this SQL query in Supabase SQL Editor:

```sql
-- Find videos with wrong source_type
SELECT 
  id,
  title,
  slug,
  source_type,
  source_url,
  video_type,
  status
FROM videos
WHERE 
  source_type = 'youtube'
  AND source_url LIKE 'videos/%'
ORDER BY created_at DESC;
```

**Expected Result:** Should show your shorts video with:
- `source_type = "youtube"` (WRONG)
- `source_url = "videos/..."` (Correct storage path)

---

### Step 2: Fix the Source Type

Copy the video ID from the query above, then run:

```sql
-- Fix the source_type for uploaded video
UPDATE videos
SET source_type = 'upload'
WHERE source_type = 'youtube'
  AND source_url LIKE 'videos/%';
```

**This will:**
- Change `source_type` from "youtube" to "upload"
- Keep the `source_url` as is (already correct)

---

### Step 3: Verify the Fix

```sql
-- Check the video is now correct
SELECT 
  id,
  title,
  source_type,
  source_url,
  video_type
FROM videos
WHERE video_type = 'short'
  AND status = 'published'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
```
source_type: "upload"
source_url: "videos/user-id/2026/09/filename.mp4"
```

---

## 🧪 Test

1. **Clear browser cache** (important!)
2. **Hard refresh** the homepage (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check shorts section** - video should now play
4. **Check hero section** (if featured) - should work

---

## 🎯 Why This Happened

The video creation form likely:
1. Defaulted to `source_type = "youtube"`
2. User selected uploaded video
3. Form updated `source_url` but NOT `source_type`

---

## 🛠️ Prevention - Fix the Form

To prevent this in the future, update the video creation/edit form:

**When user selects uploaded video:**
```typescript
// Automatically set source_type
formData.source_type = "upload";
formData.source_url = uploadResult.storagePath;
```

**When user enters YouTube URL:**
```typescript
formData.source_type = "youtube";
formData.source_url = youtubeUrl;
```

---

## 📊 Validation Query

Run this periodically to catch mismatches:

```sql
-- Find all videos with mismatched source_type and source_url
SELECT 
  id,
  title,
  source_type,
  source_url,
  CASE 
    -- YouTube type but not YouTube URL
    WHEN source_type = 'youtube' AND source_url NOT LIKE '%youtube.com%' AND source_url NOT LIKE '%youtu.be%' 
      THEN '❌ Wrong: Should be upload'
    
    -- Upload type but YouTube URL
    WHEN source_type = 'upload' AND (source_url LIKE '%youtube.com%' OR source_url LIKE '%youtu.be%')
      THEN '❌ Wrong: Should be youtube'
    
    -- Upload type but doesn't start with videos/
    WHEN source_type = 'upload' AND source_url NOT LIKE 'videos/%' AND source_url NOT LIKE 'http%'
      THEN '⚠️ Check: Missing bucket prefix'
    
    ELSE '✅ Correct'
  END as status
FROM videos
WHERE status != 'archived'
ORDER BY created_at DESC;
```

---

## ✅ Quick Fix Summary

**1. Run this SQL:**
```sql
UPDATE videos
SET source_type = 'upload'
WHERE source_type = 'youtube'
  AND source_url LIKE 'videos/%';
```

**2. Clear browser cache**

**3. Refresh homepage**

**4. Video should now play!**

---

## 🔍 Alternative: Fix via Admin Panel

If you prefer UI over SQL:

1. Go to `/admin/videos`
2. Find the shorts video
3. Click **Edit**
4. Change **Source Type** dropdown to **Upload**
5. Keep **Source URL** as is (should show `videos/...`)
6. Click **Save**
7. Refresh homepage

---

## 📝 Related Issues

### Other videos that might have same issue:

```sql
-- Check all your uploaded videos
SELECT 
  COUNT(*) as total,
  source_type,
  CASE 
    WHEN source_type = 'youtube' AND source_url LIKE 'videos/%' THEN 'WRONG'
    WHEN source_type = 'upload' AND source_url LIKE 'videos/%' THEN 'CORRECT'
    ELSE 'CHECK'
  END as status
FROM videos
WHERE status != 'archived'
GROUP BY source_type, status
ORDER BY status;
```

---

**Status:** Ready to fix - Run the UPDATE query  
**Time to fix:** < 1 minute  
**Risk:** Zero (only fixes incorrect source_type)
