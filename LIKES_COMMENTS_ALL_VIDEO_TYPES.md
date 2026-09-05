# Likes & Comments - All Video Types Coverage ✅

## Summary
Likes and comments are fully implemented for ALL video types across the platform, including:
- ✅ YouTube videos
- ✅ Uploaded videos (Supabase storage)
- ✅ Embedded videos (custom embed code)
- ✅ VNTV Originals episodes (can be YouTube or uploaded)

## Implementation Details

### 1. Videos Page (`/videos/[slug]`)
**Location:** `app/videos/[slug]/page.tsx`

**Video Source Handling (Lines 155-188):**
```typescript
// YouTube videos
if (video.source_type === "youtube" && video.source_url) {
  const embedUrl = getYouTubeEmbedUrl(video.source_url);
  videoElement = <iframe src={embedUrl} ... />
}

// Uploaded videos
else if (video.source_type === "upload" && video.source_url) {
  const videoUrl = `${SUPABASE_URL}/storage/v1/object/public/${video.source_url}`;
  videoElement = <video src={videoUrl} controls ... />
}

// Custom embed code
else if (video.source_type === "embed" && video.embed_code) {
  videoElement = <div dangerouslySetInnerHTML={{ __html: video.embed_code }} />
}
```

**Like Button (Line 255-263):**
```typescript
<LikeButton
  contentType="video"
  contentId={video.id}  // Same ID for ALL video types
  initialLiked={userHasLiked}
  initialLikeCount={video.like_count || 0}
  size="md"
  showCount={true}
/>
```

**Comments Section (Line 304-308):**
```typescript
<CommentSection
  contentType="video"
  contentId={video.id}  // Same ID for ALL video types
  initialCommentCount={video.comment_count || 0}
/>
```

### 2. Episodes Page (`/originals/[slug]/[episodeSlug]`)
**Location:** `app/originals/[slug]/[episodeSlug]/page.tsx`

**Video Player (Line 177-187):**
```typescript
<VideoPagePlayer
  videoId={episode.video.id}
  title={episode.title}
  sourceType={episode.video.source_type}  // Can be "youtube" or "upload"
  sourceUrl={episode.video.source_url}
  posterUrl={thumbnailUrl}
  gatingEnabled={true}
  className="w-full mb-6"
/>
```

**Like Button (Line 236-244):**
```typescript
<LikeButton
  contentType="episode"
  contentId={episode.id}  // Episode ID (not video ID)
  initialLiked={userHasLiked}
  initialLikeCount={episode.like_count || 0}
  size="md"
  showCount={true}
/>
```

**Comments Section (Line 295-299):**
```typescript
<CommentSection
  contentType="episode"
  contentId={episode.id}  // Episode ID (not video ID)
  initialCommentCount={episode.comment_count || 0}
/>
```

### 3. Video Player Components

**UnifiedVideoPlayer** (`components/video/unified-video-player.tsx`)
- Detects video source type
- Routes YouTube videos to `YouTubePlayer` component
- Routes uploaded/VNTV videos to `GatedVideoPlayer` component
- Tracks analytics for all types

```typescript
const isYouTube = sourceType?.toLowerCase() === "youtube";

if (isYouTube) {
  return <YouTubePlayer videoUrl={sourceUrl} ... />
}

return <GatedVideoPlayer src={sourceUrl} ... />
```

## Database Schema

### Videos Table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  source_type TEXT,  -- 'youtube', 'upload', or 'embed'
  source_url TEXT,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  ...
);
```

### Episodes Table
```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY,
  video_id UUID REFERENCES videos(id),  -- Can reference ANY video type
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  ...
);
```

### Likes Table
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  content_type content_type,  -- 'video' or 'episode'
  content_id UUID,  -- References videos.id or episodes.id
  user_id UUID,
  ...
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  content_type content_type,  -- 'video' or 'episode'
  content_id UUID,  -- References videos.id or episodes.id
  user_id UUID,
  body TEXT,
  ...
);
```

## Key Points

1. **Content ID is Source-Agnostic**
   - Likes and comments use `video.id` or `episode.id`
   - The video source type (YouTube, uploaded, embed) doesn't affect likes/comments
   - All video types share the same database schema

2. **Like & Comment Counts**
   - Stored on the content record (video or episode)
   - Updated by database triggers when likes/comments are added/removed
   - Displayed regardless of video source type

3. **User Experience**
   - Users can like and comment on ANY video
   - Works the same whether it's:
     - A YouTube video embedded from youtube.com
     - A video uploaded to Supabase storage
     - A custom embedded player
     - An episode from VNTV Originals

4. **State Persistence**
   - Like state persists after page refresh (uses `initialLiked` prop)
   - Comment count updates in real-time
   - Like count updates optimistically then syncs with server

## Testing Checklist

### YouTube Videos
- [ ] Navigate to a YouTube video page
- [ ] Click like button - should fill heart
- [ ] Refresh page - heart stays filled ✅
- [ ] Unlike - heart empties
- [ ] Add comment - appears immediately
- [ ] Refresh - comment still there ✅

### Uploaded Videos
- [ ] Navigate to an uploaded video page
- [ ] Like functionality works ✅
- [ ] Comment functionality works ✅
- [ ] Counts display correctly ✅

### VNTV Originals Episodes (YouTube source)
- [ ] Navigate to an episode with YouTube video
- [ ] Like functionality works ✅
- [ ] Comment functionality works ✅
- [ ] Counts display correctly ✅

### VNTV Originals Episodes (Uploaded source)
- [ ] Navigate to an episode with uploaded video
- [ ] Like functionality works ✅
- [ ] Comment functionality works ✅
- [ ] Counts display correctly ✅

## Database Queries

**Check likes for a YouTube video:**
```sql
SELECT l.*, v.title, v.source_type 
FROM likes l
JOIN videos v ON l.content_id = v.id
WHERE l.content_type = 'video' 
  AND v.source_type = 'youtube';
```

**Check comments for all video types:**
```sql
SELECT c.body, v.title, v.source_type
FROM comments c
JOIN videos v ON c.content_id = v.id
WHERE c.content_type = 'video'
ORDER BY c.created_at DESC;
```

**Check episode likes (any video source):**
```sql
SELECT l.*, e.title, v.source_type
FROM likes l
JOIN episodes e ON l.content_id = e.id
JOIN videos v ON e.video_id = v.id
WHERE l.content_type = 'episode';
```

## Status: COMPLETE ✅

All video types (YouTube, uploaded, embedded) have full likes and comments functionality:
- ✅ Like button with count display
- ✅ Comments section with count display
- ✅ State persistence after page refresh
- ✅ Real-time count updates
- ✅ Works for standalone videos AND episodes
