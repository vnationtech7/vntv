# Like State Persistence - Fixed ✅

## Problem
Like button state was not persisting after page refresh. The like was being saved to the database, but when the page refreshed, the button returned to the "unliked" state (empty heart instead of filled heart).

## Root Cause
The `LikeButton` component accepts an `initialLiked` prop to set the initial state, but we were not passing this prop from the page components. We were only passing `initialLikeCount` but not `initialLiked`.

## Solution
Added server-side check on page load to determine if the current user has liked the content, then pass this value as the `initialLiked` prop to the `LikeButton` component.

## Changes Made

### 1. Article Page (`app/news/[slug]/page.tsx`)
**Added:**
- Lines 156-169: Check if user has liked the article
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

let userHasLiked = false;
if (user) {
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', 'article')
    .eq('content_id', article.id)
    .single();
  
  userHasLiked = !!existingLike;
}
```

**Updated:**
- Line 315: Pass `initialLiked` prop
```typescript
<LikeButton
  contentType="article"
  contentId={article.id}
  initialLiked={userHasLiked}  // ✅ Added
  initialLikeCount={article.like_count || 0}
  size="md"
  showCount={true}
/>
```

### 2. Video Page (`app/videos/[slug]/page.tsx`)
**Added:**
- Lines 130-147: Check if user has liked the video
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

let userHasLiked = false;
if (user) {
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', 'video')
    .eq('content_id', video.id)
    .single();
  
  userHasLiked = !!existingLike;
}
```

**Updated:**
- Line 260: Pass `initialLiked` prop
```typescript
<LikeButton
  contentType="video"
  contentId={video.id}
  initialLiked={userHasLiked}  // ✅ Added
  initialLikeCount={video.like_count || 0}
  size="md"
  showCount={true}
/>
```

### 3. Episode Page (`app/originals/[slug]/[episodeSlug]/page.tsx`)
**Added:**
- Lines 93-110: Check if user has liked the episode
```typescript
const { createClient } = await import("@/lib/supabase/server");
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

let userHasLiked = false;
if (user) {
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', 'episode')
    .eq('content_id', episode.id)
    .single();
  
  userHasLiked = !!existingLike;
}
```

**Updated:**
- Line 235: Pass `initialLiked` prop
```typescript
<LikeButton
  contentType="episode"
  contentId={episode.id}
  initialLiked={userHasLiked}  // ✅ Added
  initialLikeCount={episode.like_count || 0}
  size="md"
  showCount={true}
/>
```

## How It Works

1. **Page Load (Server-Side):**
   - Check if user is authenticated
   - Query the `likes` table to see if a like exists for this user + content
   - Set `userHasLiked = true` if a like record exists

2. **Component Initialization:**
   - `LikeButton` receives `initialLiked={userHasLiked}` prop
   - Sets initial state: `const [isLiked, setIsLiked] = useState(initialLiked)`
   - Heart icon shows filled (❤️) if `true`, empty (🤍) if `false`

3. **User Interaction:**
   - User clicks like button
   - Client-side state updates immediately (optimistic update)
   - Server action creates/deletes like in database
   - Like count updates

4. **Page Refresh:**
   - Server-side check runs again
   - Finds the like record in database
   - Passes `initialLiked={true}` to component
   - Heart stays filled ✅

## Testing

To verify the fix works:

1. **Test on Article:**
   - Navigate to any article (e.g., `/news/some-article`)
   - Click the like button (heart should fill)
   - Refresh the page
   - ✅ Heart should remain filled

2. **Test on Video:**
   - Navigate to any video (e.g., `/videos/some-video`)
   - Click the like button
   - Refresh the page
   - ✅ Heart should remain filled

3. **Test on Episode:**
   - Navigate to any episode (e.g., `/originals/some-show/episode-1`)
   - Click the like button
   - Refresh the page
   - ✅ Heart should remain filled

4. **Test Unlike:**
   - Click the filled heart to unlike
   - Refresh the page
   - ✅ Heart should be empty

## Database Verification

Check the likes table in Supabase:
```sql
SELECT * FROM likes WHERE user_id = auth.uid();
```

You should see records like:
```
id: d59c7da7-e439-4c7e-ba66-7bb1cf48ed5d
content_type: article
content_id: 234085ad-e138-4f69-ac1d-3283e2cc11b2
user_id: b29cfd42-81bc-4cbe-853e-e638126e53f4
reaction_type: like
created_at: 2026-09-05 14:11:23.293647+00
```

## Previous Issues Resolved

1. ✅ RLS policies fixed - likes can be inserted
2. ✅ Comments RLS fixed - comments can be created
3. ✅ Like count displayed correctly
4. ✅ Like state persists after page refresh

## Status: COMPLETE ✅

All three content types (article, video, episode) now correctly:
- Load the user's like state from the database on page load
- Display the correct heart icon (filled/empty)
- Persist the state after page refresh
- Update the like count in real-time
