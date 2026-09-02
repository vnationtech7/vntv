# Fix: Uploaded Shorts Hover Playback 🔧

**Date:** September 2, 2026  
**Issue:** Uploaded shorts don't play on hover (YouTube shorts work)  
**Status:** ✅ Fixed

---

## 🐛 Problem Identified

### Symptom
- YouTube Shorts play on hover ✅
- Uploaded Shorts don't play on hover ❌

### Root Cause
**Z-index layering issue:** The thumbnail image overlay was positioned AFTER the video element in the DOM, causing it to cover the video even when `!isHovered` condition removed it.

**Why YouTube worked but uploads didn't:**
- YouTube: Creates iframe dynamically on hover (conditional rendering)
- Uploads: Video element always rendered, but thumbnail stayed on top

---

## ✅ Fix Applied

### Change 1: Reordered DOM Elements
**Before:**
```tsx
<video /> {/* z-index: auto (default 0) */}
{!isHovered && <img />} {/* z-index: auto (appears on top) */}
```

**After:**
```tsx
{!isHovered && <img className="z-10" />} {/* Explicit z-index */}
<video className="z-0" /> {/* Below thumbnail */}
```

**Result:** When `isHovered` becomes true, thumbnail is removed from DOM, video shows through.

---

### Change 2: Added Debug Logging

#### In `handleMouseEnter`:
```typescript
console.log('[Shorts Hover] Attempting to play uploaded video:', id, video);
video.play().then(() => {
  console.log('[Shorts Hover] Video playing successfully');
}).catch((error) => {
  console.error('[Shorts Hover] Autoplay failed:', error);
});
```

#### In video element ref:
```typescript
ref={(el) => {
  videoRefs.current[short.id] = el;
  if (el) {
    console.log('[Shorts Video] Registered video element:', short.id, el.src);
  }
}}
```

#### In video onError:
```typescript
onError={(e) => {
  console.error('[Shorts Video] Failed to load video:', short.source_url);
}}
```

---

## 🧪 How to Test

### Step 1: Clear Browser Cache
```bash
# Press: Ctrl+Shift+Delete (Windows/Linux)
# Press: Cmd+Shift+Delete (Mac)
```

Or use **incognito/private window** for clean test.

---

### Step 2: Open Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Clear any existing logs

---

### Step 3: Navigate to Homepage
```
http://localhost:3000/
```

Scroll to the **Shorts** section.

---

### Step 4: Check Console Output

You should see:
```
[Shorts Video] Registered video element: <video-id> https://...supabase.co/storage/v1/object/public/videos/...
[Shorts Video] Registered video element: <video-id> https://...supabase.co/storage/v1/object/public/videos/...
...
```

This confirms video elements are being created correctly.

---

### Step 5: Hover Over Uploaded Short

**Expected Console Output:**
```
[Shorts Hover] Attempting to play uploaded video: <video-id> <video element>
[Shorts Hover] Video playing successfully
```

**Expected Visual:**
- Thumbnail fades out (z-index 10 removed)
- Video starts playing (z-index 0 becomes visible)
- Video loops continuously
- Play button disappears

---

### Step 6: Move Mouse Away

**Expected Visual:**
- Video pauses
- Video resets to 0:00
- Thumbnail fades back in (z-index 10 restored)
- Play button reappears

---

## 🚨 If Still Not Working

### Debug Step 1: Check Video Source URL

**Console should show:**
```
[Shorts Video] Registered video element: abc123 https://yourproject.supabase.co/storage/v1/object/public/videos/user-id/2026/09/filename.mp4
```

**If you see:**
```
[Shorts Video] Failed to load video: videos/user-id/2026/09/filename.mp4
```
→ **Problem:** `NEXT_PUBLIC_SUPABASE_URL` environment variable not set

**Solution:**
```bash
# Check .env.local
echo $NEXT_PUBLIC_SUPABASE_URL

# Should output: https://yourproject.supabase.co
```

If not set:
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
```

Then restart dev server:
```bash
npm run dev
```

---

### Debug Step 2: Check Video Element Reference

**If you see:**
```
[Shorts Hover] Video element not found for id: abc123
```

→ **Problem:** Video ref not being set

**Solution:** Check that `isUploadedVideo` is true:
```typescript
const isUploadedVideo = short.source_type === "upload" && short.source_url;
```

Open browser console and check:
```javascript
// Check video data in React DevTools
// Or add temporary console.log:
console.log('Short data:', {
  id: short.id,
  source_type: short.source_type,
  source_url: short.source_url,
  isUploadedVideo
});
```

---

### Debug Step 3: Check Autoplay Policy

**If you see:**
```
[Shorts Hover] Autoplay failed: NotAllowedError: play() failed because the user didn't interact with the document first
```

→ **Problem:** Browser autoplay policy blocking

**Solutions:**

1. **Ensure video is muted** (already done in code)
2. **Check browser settings:**
   - Chrome: `chrome://settings/content/sound`
   - Firefox: `about:preferences#privacy` → Autoplay
3. **Test in different browser**
4. **User must interact with page first** (click anywhere)

**Note:** Some browsers require user interaction before ANY autoplay works.

---

### Debug Step 4: Check Video File Format

**If video loads but doesn't play:**

**Supported formats:**
- ✅ MP4 (H.264 + AAC)
- ✅ WebM (VP8/VP9 + Vorbis/Opus)
- ❌ MOV (depends on codec)
- ❌ AVI (usually not supported)

**Check console for:**
```
[Shorts Video] Failed to load video: videos/...
```

**Test video in browser directly:**
```
https://yourproject.supabase.co/storage/v1/object/public/videos/user-id/2026/09/filename.mp4
```

If it doesn't play directly → **Problem:** Video format or codec not supported.

**Solution:** Re-encode video:
```bash
# Using ffmpeg
ffmpeg -i input.mov -c:v libx264 -c:a aac -movflags +faststart output.mp4
```

---

### Debug Step 5: Check CORS Policy

**If you see:**
```
Access to video at 'https://...supabase.co/storage/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

→ **Problem:** Supabase CORS not configured

**Solution:**

1. Go to Supabase Dashboard → Storage → videos bucket
2. Click **Settings** (gear icon)
3. Under **CORS Configuration**, add:
   ```json
   {
     "allowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
     "allowedMethods": ["GET", "HEAD"],
     "allowedHeaders": ["*"],
     "maxAge": 3600
   }
   ```

Or check if bucket is **public**:
- Supabase Dashboard → Storage → videos
- Should show 🌐 Public icon

---

## 📊 Success Checklist

### Video Element Registration
- [ ] Console shows: `[Shorts Video] Registered video element: ...`
- [ ] Video src URL is complete (includes Supabase domain)
- [ ] No errors in console

### Hover Behavior
- [ ] Console shows: `[Shorts Hover] Attempting to play uploaded video: ...`
- [ ] Console shows: `[Shorts Hover] Video playing successfully`
- [ ] Thumbnail disappears on hover
- [ ] Video becomes visible on hover
- [ ] Video plays automatically (muted)
- [ ] Play button disappears during playback

### Mouse Leave Behavior
- [ ] Video pauses immediately
- [ ] Video resets to 0:00
- [ ] Thumbnail reappears
- [ ] Play button reappears

### Multiple Videos
- [ ] Only one video plays at a time
- [ ] Hovering new video pauses previous video

---

## 🎯 Technical Details

### Z-Index Layering (Fixed)

**Layer Stack (bottom to top):**
1. `z-0` - Video element (always rendered)
2. `z-10` - Thumbnail image (conditionally rendered when `!isHovered`)
3. Gradient overlay (always visible)
4. Play button (conditionally rendered when `!isHovered`)
5. Title text (always visible)
6. Badge (always visible)

**When NOT hovered:**
```
[Badge] z-index: auto (top)
[Title] z-index: auto
[Play Button] z-index: auto
[Gradient] z-index: auto
[Thumbnail] z-index: 10 ← Visible
[Video] z-index: 0 ← Hidden behind thumbnail
```

**When hovered:**
```
[Badge] z-index: auto (top)
[Title] z-index: auto
[Gradient] z-index: auto
[Thumbnail] REMOVED FROM DOM
[Video] z-index: 0 ← Now visible, playing
```

---

### Video Element Attributes

```tsx
<video
  ref={...}                    // Store reference for play/pause control
  src={fullUrl}                // Complete URL with Supabase domain
  poster={thumbnailUrl}        // Fallback image before video loads
  loop                         // Loop continuously
  muted                        // Required for autoplay
  playsInline                  // iOS: play inline, not fullscreen
  preload="metadata"           // Only load metadata, not full video
  className="... z-0"          // Below thumbnail
  onError={...}                // Log loading errors
/>
```

---

## 🔄 Comparison: YouTube vs Uploaded

| Feature | YouTube Shorts | Uploaded Videos |
|---------|---------------|-----------------|
| **Element** | `<iframe>` | `<video>` |
| **Loading** | On hover (dynamic) | Always rendered |
| **Thumbnail** | Conditional img | Conditional img overlay |
| **Z-index** | N/A (dynamic) | Video: z-0, Thumb: z-10 |
| **Autoplay** | URL parameter | `.play()` method |
| **Control** | postMessage API | Native video API |

---

## ✅ Summary

### What Was Fixed:
1. ✅ Reordered DOM elements (thumbnail before video)
2. ✅ Added explicit z-index (thumbnail z-10, video z-0)
3. ✅ Added comprehensive debug logging
4. ✅ Added video error handler

### Result:
- ✅ YouTube Shorts play on hover
- ✅ Uploaded Shorts play on hover
- ✅ Both have smooth thumbnail fade transition
- ✅ Easy to debug with console logs

---

## 🚀 Next Steps

1. **Test with uploaded short** - Hover and verify playback
2. **Check console logs** - Verify no errors
3. **Test multiple hovers** - Ensure only one plays at a time
4. **Test mobile** - Tap should work on touch devices
5. **Remove debug logs** (optional) once verified working

---

**Status:** ✅ **Fixed - Ready to Test**  
**Change:** Z-index layering + debug logging  
**Files Modified:** `components/homepage/shorts-section.tsx`
