# Comments & Likes System - Quick Reference

## ✅ Completed

### Phase 1: Database Migration
- **File**: `supabase/migrations/20260905000001_comments_likes_system.sql`
- **Tables Created**:
  - `comments` - User comments with threading (max depth 3)
  - `likes` - Content likes (articles, videos, episodes)
  - `comment_likes` - Comment likes
  - `comment_flags` - Comment reporting/moderation
- **Columns Added**:
  - `articles.{like_count, comment_count}`
  - `videos.{like_count, comment_count}`
  - `episodes.{like_count, comment_count}`
- **Triggers**: Auto-update counts via database triggers
- **RLS Policies**: Secure access control using existing `has_role()` helpers
- **Site Settings**: Configuration options added

### Phase 2: Server Actions
- **File**: `app/actions/comments.ts`
  - `getComments()` - Fetch comments with pagination & sorting
  - `getReplies()` - Fetch threaded replies
  - `createComment()` - Create new comment
  - `updateComment()` - Edit own comment (15-min window)
  - `deleteComment()` - Delete own comment
  - `moderateComment()` - Admin moderation
  - `togglePinComment()` - Pin/unpin comments
  - `flagComment()` - Report inappropriate comments
  - `getPendingComments()` - Moderation queue
  - `getFlaggedComments()` - Flagged comments review

- **File**: `app/actions/likes.ts`
  - `toggleLike()` - Like/unlike content
  - `checkIfLiked()` - Check if user liked content
  - `toggleCommentLike()` - Like/unlike comments
  - `getUserLikes()` - Get user's liked content
  - `getLikeCount()` - Get like count for content

## 📋 Next Steps

### Phase 3: Frontend Components
Create comment UI components:

1. **`components/comments/comment-section.tsx`**
   - Main container component
   - Handles comment loading, sorting, pagination
   - Integrates CommentList and CommentForm

2. **`components/comments/comment-list.tsx`**
   - Displays list of comments
   - Handles "Load More" pagination
   - Sort controls (newest/oldest/most liked)

3. **`components/comments/comment-card.tsx`**
   - Individual comment display
   - Shows user avatar, name, timestamp
   - Reply button, like button, edit/delete actions
   - Threaded replies (collapsed/expanded)
   - "edited" indicator
   - Pinned badge

4. **`components/comments/comment-form.tsx`**
   - Create/edit comment form
   - Character counter (max 2000)
   - Cancel/submit buttons
   - Loading states

### Phase 4: Like Button Component

5. **`components/engagement/like-button.tsx`**
   - Heart icon with count
   - Optimistic UI updates
   - Animated heart fill
   - Handles both content and comment likes

### Phase 5: Integration

6. **Integrate into content pages**:
   - `app/news/[slug]/page.tsx` - Add CommentSection for articles
   - `app/videos/[slug]/page.tsx` - Add CommentSection for videos
   - `app/originals/[slug]/[episodeSlug]/page.tsx` - Add for episodes

7. **Add like buttons to cards**:
   - Article cards (homepage, news listing)
   - Video cards (video gallery)
   - Episode cards (original series)

### Phase 6: Admin Moderation Interface

8. **`app/admin/moderation/page.tsx`**
   - Pending comments queue
   - Flagged comments review
   - Approve/reject actions
   - Bulk moderation tools
   - Comment details modal

### Phase 7: Testing & Polish

9. **Test all flows**:
   - Comment CRUD operations
   - Like/unlike functionality
   - Threaded replies
   - Moderation queue
   - RLS policies
   - Trigger updates

10. **Polish**:
    - Loading skeletons
    - Empty states
    - Error messages
    - Success toasts
    - Accessibility (ARIA labels)
    - Mobile responsiveness

## 🔧 Configuration

Edit site settings in Supabase to configure:

```sql
-- Enable/disable features
UPDATE site_settings SET value = 'true'::jsonb WHERE key = 'comments_enabled';
UPDATE site_settings SET value = 'true'::jsonb WHERE key = 'likes_enabled';

-- Auto-approve comments (set to false for moderation)
UPDATE site_settings SET value = 'false'::jsonb WHERE key = 'auto_approve_comments';

-- Require verified email to comment
UPDATE site_settings SET value = 'true'::jsonb WHERE key = 'require_email_verified_to_comment';

-- Edit window (minutes)
UPDATE site_settings SET value = '15'::jsonb WHERE key = 'comment_edit_window_minutes';
```

## 📊 Database Schema Quick Reference

### Comments Table
```
id, content_type, content_id, user_id, body, body_html
parent_comment_id, reply_count, depth (max 3)
like_count, flag_count
status (pending/approved/rejected/deleted)
is_pinned, is_edited, edited_at
created_at, updated_at
```

### Likes Table
```
id, content_type, content_id, user_id
reaction_type (like/love/insightful/funny/sad)
created_at
```

### RLS Highlights
- Public can read approved comments
- Authenticated users can create comments
- Users can edit own comments (15-min window)
- Users can delete own comments
- Editors can moderate all comments
- Users can like/unlike freely

## 🎯 Key Features

✅ Threaded comments (3 levels)
✅ Edit window (15 minutes)
✅ Moderation queue (optional auto-approve)
✅ Pin comments
✅ Flag inappropriate comments
✅ Like articles, videos, episodes
✅ Like comments
✅ Real-time counts via triggers
✅ Optimistic UI updates
✅ Email verification requirement (optional)
✅ RLS security using existing patterns

## 🚀 Quick Start

1. **Run migration**:
   ```bash
   supabase db reset
   # or
   supabase migration up
   ```

2. **Test server actions** (optional):
   ```typescript
   import { createComment } from '@/app/actions/comments';
   import { toggleLike } from '@/app/actions/likes';
   
   // Create comment
   await createComment({
     contentType: 'article',
     contentId: 'article-uuid',
     body: 'Great article!',
   });
   
   // Like article
   await toggleLike('article', 'article-uuid');
   ```

3. **Build frontend components** (see Phase 3-4 above)

4. **Integrate into pages** (see Phase 5 above)

5. **Create admin moderation UI** (see Phase 6 above)

## 📚 Architecture Notes

- Follows VNTV Blueprint principles (database-first, secure by default)
- Uses existing `content_type` enum
- Uses existing `user_role` enum and helper functions
- Polymorphic pattern matches `social_shares` table
- Database triggers ensure count accuracy
- RLS policies use existing `has_role()`, `has_any_role()`, `is_authenticated()` helpers
- Server actions follow existing patterns
- Revalidates paths after mutations

## 🔒 Security

- All tables have RLS enabled
- Comments go through moderation (configurable)
- XSS protection via HTML sanitization
- Rate limiting via Supabase
- Email verification requirement (optional)
- 15-minute edit window prevents abuse
- Flagging system for community moderation
- Admin roles required for moderation actions

