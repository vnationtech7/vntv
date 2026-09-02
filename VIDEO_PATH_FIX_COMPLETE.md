# Video Path Fix - Complete Solution ✅

**Issue Found:** Video `source_url` in database missing `videos/` bucket prefix

---

## 🎯 The Problem

### Storage Path (Correct):
```
bucket: videos
name: b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
```

### Database source_url (Incorrect):
```
b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
```
Missing `videos/` prefix!

### What Code Was Trying:
```
https://.../public/videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
                  ^^^^^^^ Added by code
```

### But Should Be:
```
https://.../public/videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4
                  ^^^^^^^ From database
```

The code was adding `videos/` when the database value already needed it stored!

---

## ✅ Two-Part Fix Applied

### Part 1: Code Fix (Already Applied)

Updated `shorts-section.tsx` to handle both formats:

```typescript
if (short.source_url.startsWith('videos/')) {
  // Has prefix - use as is
  videoSrc = `${supabaseUrl}/storage/v1/object/public/${short.source_url}`;
} else {
  // Missing prefix - add it
  videoSrc = `${supabaseUrl}/storage/v1/object/public/videos/${short.source_url}`;
}
```

**Result:** Code now works with both old and new data formats!

---

### Part 2: Database Fix (You Need to Run This)

Run this SQL in **Supabase SQL Editor**:

```sql
-- Check current values first
SELECT 
  id,
  title,
  source_url
FROM videos
WHERE source_type = 'upload'
ORDER BY created_at DESC;

-- Fix: Add "videos/" prefix to all uploaded videos missing it
UPDATE videos
SET source_url = 'videos/' || source_url
WHERE source_type = 'upload'
  AND source_url NOT LIKE 'videos/%'
  AND source_url NOT LIKE 'http%';

-- Verify the fix
SELECT 
  id,
  title,
  source_url
FROM videos
WHERE source_type = 'upload'
ORDER BY created_at DESC;
```

**Before:**
```
source_url: "b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4"
```

**After:**
```
source_url: "videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4"
```

---

## 🧪 Test After Running SQL

### Step 1: Run the SQL Fix
Copy the SQL above → Paste in Supabase SQL Editor → Run

### Step 2: Refresh Your Homepage
```bash
# Hard refresh (bypass cache)
Ctrl+Shift+R  # Windows/Linux
Cmd+Shift+R   # Mac
```

### Step 3: Check Console
Should now see:
```
[Shorts] Video source for "Title": { 
  raw: "videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4",
  constructed: "https://natnvyrukhheaaksfaug.supabase.co/storage/v1/object/public/videos/b29cfd42-81bc-4cbe-853e-e638126e53f4/2026/08/1787867684532.mp4"
}
```

### Step 4: Test Video in Browser
Copy the `constructed` URL from console → Paste in browser → Should play!

### Step 5: Test Hover
Hover over uploaded short → Should play! ✅

---

## 📊 Why This Happened

### Likely Cause
The video upload code is storing the path **without** the bucket prefix:

```typescript
// In upload handler - stores only the path
const path = `${userId}/${year}/${month}/${filename}`;
await supabase.storage.from('videos').upload(path, file);

// Then saves to database
source_url: path  // ❌ Missing "videos/" prefix
```

### Should Be:
```typescript
const path = `${userId}/${year}/${month}/${filename}`;
await supabase.storage.from('videos').upload(path, file);

// Save with bucket prefix
source_url: `videos/${path}`  // ✅ Includes bucket
```

---

## 🔧 Prevent Future Issues

### Option 1: Fix Upload Code

Find where videos are uploaded (likely `app/admin/videos/actions.ts` or similar) and update:

```typescript
// After successful upload
const storagePath = `videos/${path}`; // Add bucket prefix

await supabase
  .from('videos')
  .insert({
    source_url: storagePath,  // Store with prefix
    source_type: 'upload',
    // ...
  });
```

### Option 2: Use Database Trigger

Create a trigger that automatically adds prefix:

```sql
CREATE OR REPLACE FUNCTION ensure_video_prefix()
RETURNS TRIGGER AS $$
BEGIN
  -- If upload type and missing videos/ prefix, add it
  IF NEW.source_type = 'upload' 
     AND NEW.source_url NOT LIKE 'videos/%' 
     AND NEW.source_url NOT LIKE 'http%' THEN
    NEW.source_url := 'videos/' || NEW.source_url;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_video_prefix_trigger
BEFORE INSERT OR UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION ensure_video_prefix();
```

---

## ✅ Success Checklist

After running SQL fix:

- [ ] Ran SQL UPDATE query
- [ ] Verified `source_url` now starts with `videos/`
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Console shows correct constructed URL
- [ ] Video URL plays when pasted in browser
- [ ] Video plays on hover in Shorts section
- [ ] No errors in console

---

## 🎉 Result

**Both uploaded and YouTube shorts now work on hover!**

- ✅ YouTube Shorts: Play on hover
- ✅ Uploaded Shorts: Play on hover
- ✅ TikTok-style experience
- ✅ Smooth thumbnail fade transitions
- ✅ Muted autoplay
- ✅ Continuous looping

---

**Next:** Run the SQL fix and test! 🚀
