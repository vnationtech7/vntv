# Video Analytics Troubleshooting Guide

**Date:** September 2, 2026  
**Issue:** Some videos not counting views

---

## ✅ Verification Results

### 1. Analytics Tracker Integration

**✅ CONFIRMED:** VideoAnalyticsTracker is properly integrated in:
- `/video/[slug]/page.tsx` - Standalone videos
- `/originals/[slug]/[episodeSlug]/page.tsx` - Programme episodes

Both pages call `<VideoAnalyticsTracker videoId={video.id} />` on page load.

### 2. RPC Function

**Function:** `increment_video_view(video_id UUID)`
**Status:** ✅ Exists in database (migration 20240829000000_video_analytics.sql)
**Permissions:** ✅ Granted to authenticated AND anon users

```sql
GRANT EXECUTE ON FUNCTION increment_video_view(UUID) TO authenticated, anon;
```

---

## 🔍 Potential Issues & Fixes

### Issue 1: Cookie-Based Deduplication

**Current Behavior:**
- Views are deduplicated using cookies (24-hour window)
- Cookie key: `video_viewed_{videoId}`
- If cookie exists, view is NOT counted

**Problem:**
- Users with cookies disabled won't be counted
- Clearing cookies allows re-counting same video
- Private browsing resets on browser close

**Solution:** This is working as intended for preventing view spam.

---

### Issue 2: RLS Policies on Videos Table

**Potential Problem:** If RLS is enabled on `videos` table, the RPC function may not be able to UPDATE view_count.

**Fix Applied:** RPC function uses `SECURITY DEFINER` which bypasses RLS.

```sql
CREATE OR REPLACE FUNCTION increment_video_view(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status:** ✅ Already correct

---

### Issue 3: Function Not Being Called

**Check:** Verify the trackVideoView action is being called.

**Server Action:** `app/actions/video-analytics.ts`

```typescript
export async function trackVideoView(videoId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  try {
    // Check if user has already viewed this video
    const viewedKey = `video_viewed_${videoId}`;
    const hasViewed = cookieStore.get(viewedKey);

    if (hasViewed) {
      // Already counted this view
      return { success: true, counted: false };
    }

    // Increment view count using RPC function
    const { error } = await supabase.rpc('increment_video_view', {
      video_id: videoId,
    });

    if (error) {
      console.error('Error incrementing video view:', error);
      return { success: false, counted: false };
    }

    // Set cookie to prevent duplicate counting (expires in 24 hours)
    cookieStore.set(viewedKey, '1', {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });

    // Also track as analytics event
    await trackVideoEvent(videoId, 'view', {
      timestamp: Date.now(),
    });

    return { success: true, counted: true };
  } catch (err) {
    console.error('Error tracking video view:', err);
    return { success: false, counted: false };
  }
}
```

**Status:** ✅ Logic looks correct

---

## 🧪 Testing Instructions

### Test 1: Verify RPC Function Works

**Run in Supabase SQL Editor:**

```sql
-- 1. Check current view count for a video
SELECT id, title, view_count FROM videos WHERE slug = 'your-video-slug';

-- 2. Manually increment using RPC
SELECT increment_video_view('video-id-here');

-- 3. Check view count again (should be +1)
SELECT id, title, view_count FROM videos WHERE slug = 'your-video-slug';
```

---

### Test 2: Test from Frontend

1. **Open video in incognito/private window** (no cookies)
2. **Open browser console**
3. **Load video page:** `/video/[slug]`
4. **Check for errors** in console
5. **Check Supabase logs** for RPC calls
6. **Verify view count increased** in admin panel

---

### Test 3: Check Cookie Behavior

1. **Load video page**
2. **Open DevTools → Application → Cookies**
3. **Look for:** `video_viewed_{videoId}` cookie
4. **Verify:** Expires in 24 hours
5. **Reload page** → View should NOT increment again
6. **Delete cookie** → View should increment again

---

## 🐛 Common Issues

### Issue: "Function not found"

**Symptom:** Error: `function increment_video_view(uuid) does not exist`

**Fix:** Run the migration:
```bash
npx supabase db push
```

---

### Issue: "Permission denied"

**Symptom:** Error: `permission denied for function increment_video_view`

**Fix:** Grant permissions:
```sql
GRANT EXECUTE ON FUNCTION increment_video_view(UUID) TO authenticated, anon;
```

---

### Issue: Views not incrementing

**Possible Causes:**
1. **Cookie already exists** (viewed within 24 hours)
2. **RLS blocking UPDATE** (shouldn't happen with SECURITY DEFINER)
3. **Function not called** (check console for errors)
4. **Wrong video ID passed** (check VideoAnalyticsTracker props)

**Debug Steps:**
```typescript
// Add logging to trackVideoView action
console.log('Tracking view for video:', videoId);
console.log('Has viewed cookie?', hasViewed);
console.log('RPC result:', { error });
```

---

## 📊 Analytics Data Flow

### Flow Diagram:

```
User loads video page
         ↓
VideoAnalyticsTracker component mounts
         ↓
Calls trackVideoView(videoId) server action
         ↓
Check cookie: video_viewed_{videoId}
         ↓
   ┌────────┴────────┐
   ↓                 ↓
Cookie exists    No cookie
         ↓                 ↓
Skip (counted: false)  Call RPC increment_video_view
                            ↓
                       Set cookie (24h expiry)
                            ↓
                       Track analytics event
                            ↓
                       Return (counted: true)
```

---

## 🔧 Recommended Improvements

### 1. Add Logging for Debugging

**Add to:** `app/actions/video-analytics.ts`

```typescript
export async function trackVideoView(videoId: string) {
  // ... existing code ...
  
  console.log('[VIDEO ANALYTICS]', {
    videoId,
    hasViewed: !!hasViewed,
    timestamp: new Date().toISOString()
  });
  
  // ... rest of function ...
}
```

### 2. Add Admin Panel to View Analytics

**Create:** `/admin/analytics/videos` page to show:
- Total views per video
- Views over time (graph)
- Most viewed videos
- View completion rates

### 3. Fallback Tracking

**If RPC fails, fallback to direct UPDATE:**

```typescript
if (error) {
  console.error('RPC failed, trying direct UPDATE:', error);
  
  // Fallback: Direct UPDATE
  const { error: updateError } = await supabase
    .from('videos')
    .update({ 
      view_count: supabase.raw('COALESCE(view_count, 0) + 1') 
    })
    .eq('id', videoId);
    
  if (updateError) {
    return { success: false, counted: false };
  }
}
```

---

## ✅ Current Status

**✅ Analytics Tracker:** Properly integrated  
**✅ RPC Function:** Exists and has correct permissions  
**✅ Cookie Deduplication:** Working as designed  
**✅ Database Function:** Uses SECURITY DEFINER (bypasses RLS)  

**⚠️ Potential Issue:** Some videos may not count if:
- User has cookies disabled
- RPC function errors silently
- Wrong video ID passed to tracker

---

## 🎯 Next Steps

1. **Test RPC function manually** in Supabase SQL editor
2. **Check browser console** for errors when loading videos
3. **Verify cookie is being set** in DevTools
4. **Check Supabase logs** for RPC call errors
5. **Add more logging** to trackVideoView action if issues persist

---

## 📞 Quick Test Checklist

- [ ] Load video in incognito window
- [ ] Check console for errors
- [ ] Verify cookie `video_viewed_{id}` is set
- [ ] Reload page → view should NOT increment
- [ ] Delete cookie → reload → view should increment
- [ ] Check view_count in database

---

**Status:** Analytics system is correctly implemented. If views aren't counting, it's likely due to cookies or silent RPC errors. Enable logging to debug.
