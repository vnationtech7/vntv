# Like Button Repositioned & View Count Added ✅

## Changes Made

Repositioned the like button to the top meta info area (near views, date, etc.) across all content pages, and added view count to articles.

## Updated Pages

### 1. Article Page (`app/news/[slug]/page.tsx`)

**Added:**
- ✅ View count in meta info section
- ✅ Like button in meta info (inline with author, date, views)

**Meta Info Now Shows:**
```
Author • Date • Views • ❤️ Like Count • Breaking/Exclusive badges
```

**Before:**
```typescript
Author • Date • Breaking/Exclusive
[... article content ...]
─────────────────
❤️ Like Button
Share Buttons
```

**After:**
```typescript
Author • Date • Views • ❤️ Like • Breaking/Exclusive
[... article content ...]
Share Buttons
```

### 2. Video Page - Singular (`app/video/[slug]/page.tsx`)

**Meta Info Now Shows:**
```
👁 Views • 📅 Date • ⏱ Duration • ❤️ Like Count
```

**Before:**
```typescript
👁 Views • 📅 Date • ⏱ Duration
[... description ...]
❤️ Like Button
Share Buttons
```

**After:**
```typescript
👁 Views • 📅 Date • ⏱ Duration • ❤️ Like
[... description ...]
Share Buttons
```

### 3. Video Page - Plural (`app/videos/[slug]/page.tsx`)

**Meta Info Now Shows:**
```
📅 Date • ⏱ Duration • 👁 Views • ❤️ Like Count
```

**Before:**
```typescript
📅 Date • ⏱ Duration • 👁 Views
[... description ...]
❤️ Like Button
Share Buttons
```

**After:**
```typescript
📅 Date • ⏱ Duration • 👁 Views • ❤️ Like
[... description ...]
Share Buttons
```

### 4. Episode Page (`app/originals/[slug]/[episodeSlug]/page.tsx`)

**Meta Info Now Shows:**
```
📅 Date • ❤️ Like Count
```

**Before:**
```typescript
📅 Date

[... description ...]
❤️ Like • Share Buttons
```

**After:**
```typescript
📅 Date • ❤️ Like

[... description ...]
Share Buttons
```

## Technical Details

### Like Button Size Change
Changed from `size="md"` to `size="sm"` for inline display in meta info:

**Before (standalone):**
```typescript
<LikeButton
  contentType="article"
  contentId={article.id}
  initialLiked={userHasLiked}
  initialLikeCount={article.like_count || 0}
  size="md"  // Medium size for standalone
  showCount={true}
/>
```

**After (inline in meta):**
```typescript
<LikeButton
  contentType="article"
  contentId={article.id}
  initialLiked={userHasLiked}
  initialLikeCount={article.like_count || 0}
  size="sm"  // Small size for inline
  showCount={true}
/>
```

### View Count Display

**Articles** - Added view count:
```typescript
{article.view_count > 0 && (
  <>
    <span>•</span>
    <span>{article.view_count.toLocaleString()} views</span>
  </>
)}
```

**Videos** - Already had view count, kept in place

**Episodes** - Don't have view_count field (view count is on the video record)

## Visual Layout

### Article Page
```
┌─────────────────────────────────────────┐
│ CATEGORY BADGE                          │
│                                         │
│ Article Title                           │
│                                         │
│ Author • Date • 1.2K views • ❤️ 45     │
│ • BREAKING • EXCLUSIVE                  │
│                                         │
│ [Featured Image]                        │
│                                         │
│ Article content...                      │
│                                         │
│ 🔗 Share Buttons                        │
│                                         │
│ 💬 Comments Section                     │
└─────────────────────────────────────────┘
```

### Video Pages
```
┌─────────────────────────────────────────┐
│ VIDEO TYPE BADGE                        │
│                                         │
│ Video Title                             │
│                                         │
│ 👁 1.5K views • 📅 2 days ago          │
│ • ⏱ 5:30 • ❤️ 89                      │
│                                         │
│ [Video Player]                          │
│                                         │
│ Description...                          │
│                                         │
│ 🔗 Share Buttons                        │
│                                         │
│ 💬 Comments Section                     │
└─────────────────────────────────────────┘
```

### Episode Pages
```
┌─────────────────────────────────────────┐
│ PROGRAMME BADGE                         │
│                                         │
│ Episode 5                               │
│ Episode Title                           │
│                                         │
│ 📅 1 week ago • ❤️ 234                 │
│                                         │
│ [Video Player]                          │
│                                         │
│ Description...                          │
│                                         │
│ 🔗 Share Buttons                        │
│                                         │
│ 💬 Comments Section                     │
└─────────────────────────────────────────┘
```

## Benefits

1. **Better UX** - Like button is now visible without scrolling
2. **Consistent** - All pages follow the same pattern
3. **Compact** - Saves vertical space
4. **Discoverable** - Users see engagement metrics immediately
5. **View Count** - Articles now show view count like videos do

## Testing Checklist

### Articles
- [ ] Navigate to any article
- [ ] Check meta info shows: Author • Date • Views • ❤️ Like
- [ ] Like button is small size and inline
- [ ] Click like - count increments
- [ ] Refresh - like persists ✅
- [ ] View count displays if > 0

### Videos (both /video and /videos)
- [ ] Navigate to any video
- [ ] Check meta info shows: Views • Date • Duration • ❤️ Like
- [ ] Like button is small size and inline
- [ ] Click like - count increments
- [ ] Refresh - like persists ✅

### Episodes
- [ ] Navigate to any episode
- [ ] Check meta info shows: Date • ❤️ Like
- [ ] Like button is small size and inline
- [ ] Click like - count increments
- [ ] Refresh - like persists ✅

## Status: COMPLETE ✅

All pages updated:
- ✅ Article page - View count added, like button moved to meta
- ✅ Video page (singular) - Like button moved to meta
- ✅ Video page (plural) - Like button moved to meta
- ✅ Episode page - Like button moved to meta

Like button now appears at the top of all content pages! 🎉
