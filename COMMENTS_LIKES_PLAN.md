# VNTV Comments & Likes Feature Plan

**Version:** 2.0  
**Date:** September 5, 2026  
**Status:** Planning Phase - Aligned with Existing Schema  
**Priority:** High (User Engagement Feature)

---

## 1. Executive Summary

This document outlines the implementation plan for adding **comments** and **likes/reactions** functionality to the VNTV platform. These features will enable user engagement on articles, videos, and originals episodes.

### Integration with Existing System

This plan **integrates with** the existing VNTV architecture:
- ✅ Uses existing `profiles` table for user identity
- ✅ Follows existing RLS pattern with helper functions
- ✅ Extends existing `content_type` enum
- ✅ Complements existing engagement tables (`article_views`, `video_events`, `social_shares`)
- ✅ Follows Blueprint.md principles (secure by default, database-first, server-rendered)
- ✅ Uses established role-based permissions (`user_role` enum)

### Key Goals
- Enable authenticated users to comment on content
- Allow users to like/react to articles, videos, and episodes
- Support threaded/nested comments (replies up to 3 levels)
- Provide moderation tools for editors and admins
- Maintain platform performance with proper indexing
- Follow existing VNTV architectural patterns

### Success Metrics
- User engagement rate (% of viewers who interact)
- Comments per article/video/episode
- Moderation response time
- Page load performance impact (< 200ms)

---

## 2. Feature Scope

### 2.1 Comments System

#### Content Types Supporting Comments
- ✅ Articles
- ✅ Videos (standalone video pages)
- ✅ Originals Episodes
- ❌ Breaking News (too transient)
- ❌ Homepage (not applicable)

#### Comment Features
1. **Basic Commenting**
   - Text-based comments (max 2000 characters)
   - Markdown support (bold, italic, links)
   - Auto-linkify URLs
   - Mention users (@username)
   - Edit own comments (within 15 minutes)
   - Delete own comments

2. **Threaded Replies**
   - Reply to comments (nested replies)
   - Maximum nesting depth: 3 levels
   - Collapse/expand reply threads
   - "View more replies" pagination

3. **Comment Moderation**
   - Admin can approve/reject comments
   - Admin can pin/unpin comments
   - Admin can delete any comment
   - Flagging system for users
   - Auto-moderation rules (profanity filter, spam detection)
   - Moderation queue in admin dashboard

4. **Comment Display**
   - Sort by: Newest, Oldest, Most Liked, Pinned First
   - Pagination (20 comments per page)
   - Real-time comment count
   - "X new comments" indicator
   - Author badges (Staff, Verified, etc.)

### 2.2 Likes/Reactions System

#### Content Types Supporting Likes
- ✅ Articles
- ✅ Videos
- ✅ Originals Episodes
- ✅ Comments

#### Reaction Types
**Phase 1:** Simple Like button (❤️)
- One like per user per content item
- Toggle on/off (unlike)
- Real-time like count

**Phase 2 (Future):** Multiple Reactions
- Like ❤️
- Love 🔥
- Insightful 💡
- Funny 😂
- Sad 😢

### 2.3 User Requirements

#### Authentication
- **Must be logged in** to comment or like
- Guest users can view comments and like counts
- Social login support (Google, Facebook)
- Email verification required for commenting

#### User Profile Requirements
- Profile must have display name
- Optional: Profile picture
- Optional: Bio (shown in comment card)

---

## 3. Database Schema

### 3.1 Comments Table

**Note:** Integrates with existing `profiles` table and follows existing patterns.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content reference (uses existing content_type enum)
  content_type content_type NOT NULL CHECK (content_type IN ('article', 'video', 'episode')),
  content_id UUID NOT NULL,
  
  -- User & content (references existing profiles table)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 2000),
  body_html TEXT, -- Sanitized HTML for display (supports basic markdown)
  
  -- Threading
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reply_count INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 3),
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  
  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES profiles(id),
  moderation_reason TEXT,
  moderation_note TEXT, -- Internal note for moderators
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_content ON comments(content_type, content_id, status, created_at DESC) WHERE status = 'approved';
CREATE INDEX idx_comments_content_all ON comments(content_type, content_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_user ON comments(user_id, created_at DESC);
CREATE INDEX idx_comments_moderation ON comments(status, created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_comments_pinned ON comments(content_type, content_id, is_pinned, created_at DESC) WHERE is_pinned = TRUE;

-- Add updated_at trigger
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.2 Likes Table

**Note:** Uses polymorphic pattern similar to existing `social_shares` table.

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content reference (polymorphic like social_shares)
  content_type content_type NOT NULL CHECK (content_type IN ('article', 'video', 'episode')),
  content_id UUID NOT NULL,
  
  -- User (references existing profiles)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reaction type (for future multiple reactions)
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'insightful', 'funny', 'sad')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one like per user per content
  CONSTRAINT unique_user_content_like UNIQUE (user_id, content_type, content_id)
);

-- Indexes
CREATE INDEX idx_likes_content ON likes(content_type, content_id);
CREATE INDEX idx_likes_user ON likes(user_id, created_at DESC);
CREATE INDEX idx_likes_reaction ON likes(reaction_type, created_at DESC);
```

### 3.3 Comment Likes Table

**Note:** Separate table for liking comments (different from content likes).

```sql
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One like per user per comment
  CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id, created_at DESC);
```

### 3.4 Comment Flags Table

```sql
CREATE TABLE comment_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'offensive', 'harassment', 'misinformation', 'other')),
  details TEXT CHECK (char_length(details) <= 500),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One flag per user per comment
  CONSTRAINT unique_user_comment_flag UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_flags_comment ON comment_flags(comment_id);
CREATE INDEX idx_flags_status ON comment_flags(status, created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_flags_user ON comment_flags(user_id);
```

### 3.5 Add Columns to Existing Tables

**Note:** Extends existing tables following established patterns.

```sql
-- Add like_count and comment_count to articles
ALTER TABLE articles 
  ADD COLUMN like_count INTEGER DEFAULT 0,
  ADD COLUMN comment_count INTEGER DEFAULT 0;

CREATE INDEX idx_articles_like_count ON articles(like_count DESC) WHERE like_count > 0;
CREATE INDEX idx_articles_comment_count ON articles(comment_count DESC) WHERE comment_count > 0;
CREATE INDEX idx_articles_engagement ON articles(like_count DESC, comment_count DESC, view_count DESC);

-- Add like_count and comment_count to videos
ALTER TABLE videos 
  ADD COLUMN like_count INTEGER DEFAULT 0,
  ADD COLUMN comment_count INTEGER DEFAULT 0;

CREATE INDEX idx_videos_like_count ON videos(like_count DESC) WHERE like_count > 0;
CREATE INDEX idx_videos_comment_count ON videos(comment_count DESC) WHERE comment_count > 0;
CREATE INDEX idx_videos_engagement ON videos(like_count DESC, comment_count DESC, view_count DESC);

-- Add like_count and comment_count to episodes
ALTER TABLE episodes 
  ADD COLUMN like_count INTEGER DEFAULT 0,
  ADD COLUMN comment_count INTEGER DEFAULT 0;

CREATE INDEX idx_episodes_like_count ON episodes(like_count DESC) WHERE like_count > 0;
CREATE INDEX idx_episodes_comment_count ON episodes(comment_count DESC) WHERE comment_count > 0;
```

---

## 4. Database Functions & Triggers

### 4.1 Increment/Decrement Counters

```sql
-- Function to update like count
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment like count
    IF NEW.content_type = 'article' THEN
      UPDATE articles SET like_count = like_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'video' THEN
      UPDATE videos SET like_count = like_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'episode' THEN
      UPDATE episodes SET like_count = like_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'comment' THEN
      UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement like count
    IF OLD.content_type = 'article' THEN
      UPDATE articles SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'video' THEN
      UPDATE videos SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'episode' THEN
      UPDATE episodes SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'comment' THEN
      UPDATE comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_like_count();
```

```sql
-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' AND NEW.parent_comment_id IS NULL THEN
    -- Increment comment count for top-level comments only
    IF NEW.content_type = 'article' THEN
      UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'video' THEN
      UPDATE videos SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'episode' THEN
      UPDATE episodes SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' AND NEW.parent_comment_id IS NULL THEN
    -- Approve previously pending comment
    IF NEW.content_type = 'article' THEN
      UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'video' THEN
      UPDATE videos SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'episode' THEN
      UPDATE episodes SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' AND OLD.parent_comment_id IS NULL THEN
    -- Decrement comment count
    IF OLD.content_type = 'article' THEN
      UPDATE articles SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'video' THEN
      UPDATE videos SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'episode' THEN
      UPDATE episodes SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();
```

```sql
-- Function to update reply count
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
    UPDATE comments SET reply_count = GREATEST(0, reply_count - 1) WHERE id = OLD.parent_comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_reply_count();
```

### 4.2 Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. Row Level Security (RLS) Policies

### 5.1 Comments RLS

```sql
-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public: Read approved comments
CREATE POLICY "Public can view approved comments"
ON comments FOR SELECT
TO public
USING (status = 'approved');

-- Authenticated: Read own comments (any status)
CREATE POLICY "Users can view own comments"
ON comments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated: Create comments
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND status = 'pending'
  AND depth <= 3
);

-- Authenticated: Update own comments (within 15 minutes, only if pending or approved)
CREATE POLICY "Users can edit own comments"
ON comments FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND status IN ('pending', 'approved')
  AND created_at > (NOW() - INTERVAL '15 minutes')
)
WITH CHECK (
  auth.uid() = user_id
  AND status IN ('pending', 'approved')
);

-- Authenticated: Delete own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin: Full access
CREATE POLICY "Admins have full access to comments"
ON comments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin')
  )
);
```

### 5.2 Likes RLS

```sql
-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Public: Read like counts (aggregated, not individual likes)
CREATE POLICY "Public can view like counts"
ON likes FOR SELECT
TO public
USING (TRUE);

-- Authenticated: Create likes
CREATE POLICY "Authenticated users can create likes"
ON likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated: Delete own likes (unlike)
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 5.3 Comment Flags RLS

```sql
-- Enable RLS
ALTER TABLE comment_flags ENABLE ROW LEVEL SECURITY;

-- Authenticated: Create flags
CREATE POLICY "Authenticated users can flag comments"
ON comment_flags FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated: View own flags
CREATE POLICY "Users can view own flags"
ON comment_flags FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin: Full access to flags
CREATE POLICY "Admins have full access to flags"
ON comment_flags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin', 'moderator')
  )
);
```

---

## 6. Server Actions (Next.js API)

### 6.1 Comment Actions

```typescript
// /app/actions/comments.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getComments(
  contentType: 'article' | 'video' | 'episode',
  contentId: string,
  options?: {
    sortBy?: 'newest' | 'oldest' | 'most_liked';
    limit?: number;
    offset?: number;
  }
) {
  const supabase = await createClient();
  
  let query = supabase
    .from('comments')
    .select(`
      *,
      user:profiles!user_id(id, display_name, avatar_url),
      replies:comments!parent_comment_id(count)
    `)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('status', 'approved')
    .is('parent_comment_id', null); // Only top-level comments
  
  // Apply sorting
  if (options?.sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (options?.sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (options?.sortBy === 'most_liked') {
    query = query.order('like_count', { ascending: false });
  }
  
  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return { data: null, error: error.message };
  }
  
  return { data, error: null };
}

export async function getReplies(parentCommentId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!user_id(id, display_name, avatar_url)
    `)
    .eq('parent_comment_id', parentCommentId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });
  
  if (error) {
    return { data: null, error: error.message };
  }
  
  return { data, error: null };
}

export async function createComment(
  contentType: 'article' | 'video' | 'episode',
  contentId: string,
  body: string,
  parentCommentId?: string
) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' };
  }
  
  // Validate comment length
  if (body.length < 1 || body.length > 2000) {
    return { data: null, error: 'Comment must be between 1 and 2000 characters' };
  }
  
  // If replying, check parent exists and get depth
  let depth = 0;
  if (parentCommentId) {
    const { data: parentComment } = await supabase
      .from('comments')
      .select('depth')
      .eq('id', parentCommentId)
      .single();
    
    if (!parentComment) {
      return { data: null, error: 'Parent comment not found' };
    }
    
    depth = parentComment.depth + 1;
    
    if (depth > 3) {
      return { data: null, error: 'Maximum reply depth exceeded' };
    }
  }
  
  // Create comment
  const { data, error } = await supabase
    .from('comments')
    .insert({
      content_type: contentType,
      content_id: contentId,
      user_id: user.id,
      body: body.trim(),
      parent_comment_id: parentCommentId || null,
      depth,
      status: 'pending', // Auto-approve or moderate based on settings
    })
    .select()
    .single();
  
  if (error) {
    return { data: null, error: error.message };
  }
  
  // Revalidate page
  revalidatePath(`/news/${contentId}`);
  revalidatePath(`/videos/${contentId}`);
  revalidatePath(`/originals/*/${contentId}`);
  
  return { data, error: null };
}

export async function updateComment(commentId: string, body: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' };
  }
  
  // Validate length
  if (body.length < 1 || body.length > 2000) {
    return { data: null, error: 'Comment must be between 1 and 2000 characters' };
  }
  
  const { data, error } = await supabase
    .from('comments')
    .update({
      body: body.trim(),
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', user.id) // RLS ensures this
    .select()
    .single();
  
  if (error) {
    return { data: null, error: error.message };
  }
  
  return { data, error: null };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id); // RLS ensures this
  
  if (error) {
    return { error: error.message };
  }
  
  return { error: null };
}
```

### 6.2 Like Actions

```typescript
// /app/actions/likes.ts

'use server';

import { createClient } from '@/lib/supabase/server';

export async function toggleLike(
  contentType: 'article' | 'video' | 'episode' | 'comment',
  contentId: string
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' };
  }
  
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();
  
  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) {
      return { data: { liked: false }, error: error.message };
    }
    
    return { data: { liked: false }, error: null };
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reaction_type: 'like',
      });
    
    if (error) {
      return { data: { liked: true }, error: error.message };
    }
    
    return { data: { liked: true }, error: null };
  }
}

export async function checkIfLiked(
  contentType: 'article' | 'video' | 'episode' | 'comment',
  contentId: string
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { liked: false };
  }
  
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();
  
  return { liked: !!data };
}
```

---

## 7. Frontend Components

### 7.1 Comment Section Component

**File:** `/components/comments/comment-section.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CommentList } from './comment-list';
import { CommentForm } from './comment-form';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  contentType: 'article' | 'video' | 'episode';
  contentId: string;
  initialComments?: any[];
  totalCount: number;
}

export function CommentSection({
  contentType,
  contentId,
  initialComments = [],
  totalCount,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  return (
    <div className="mt-12 border-t border-border pt-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">
          Comments ({totalCount})
        </h2>
        
        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_liked">Most Liked</option>
        </select>
      </div>

      {/* Comment form */}
      {user ? (
        <CommentForm
          contentType={contentType}
          contentId={contentId}
          onCommentAdded={(comment) => {
            setComments([comment, ...comments]);
          }}
        />
      ) : (
        <div className="mb-6 rounded-lg border border-border bg-background-panel p-6 text-center">
          <p className="mb-4 text-text-secondary">
            Sign in to join the conversation
          </p>
          <Button onClick={() => setShowLoginPrompt(true)}>
            Sign In to Comment
          </Button>
        </div>
      )}

      {/* Comments list */}
      <CommentList
        comments={comments}
        contentType={contentType}
        contentId={contentId}
        sortBy={sortBy}
      />
    </div>
  );
}
```

### 7.2 Like Button Component

**File:** `/components/engagement/like-button.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/app/actions/likes';
import { useAuth } from '@/hooks/use-auth';

interface LikeButtonProps {
  contentType: 'article' | 'video' | 'episode' | 'comment';
  contentId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
  contentType,
  contentId,
  initialLiked,
  initialCount,
  size = 'md',
}: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      // Show login prompt
      return;
    }

    setIsLoading(true);
    
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(prev => newLiked ? prev + 1 : prev - 1);

    const { error } = await toggleLike(contentType, contentId);
    
    if (error) {
      // Revert on error
      setLiked(!newLiked);
      setCount(prev => newLiked ? prev - 1 : prev + 1);
      console.error('Failed to toggle like:', error);
    }
    
    setIsLoading(false);
  };

  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-full transition-colors ${
        liked
          ? 'text-vntv-red'
          : 'text-text-secondary hover:text-vntv-red'
      } ${sizeClasses[size]} ${isLoading ? 'opacity-50' : ''}`}
    >
      <Heart
        className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="font-medium">{count.toLocaleString()}</span>
    </button>
  );
}
```

---

## 8. Admin Moderation Interface

### 8.1 Moderation Queue Page

**File:** `/app/admin/moderation/page.tsx`

Features:
- List pending comments
- Quick approve/reject actions
- View flagged comments
- Bulk actions
- Filter by content type
- Search by user or keyword

### 8.2 Comment Management

- View all comments for a specific article/video
- Pin/unpin comments
- Delete comments
- Ban users from commenting
- View user comment history

---

## 9. Implementation Phases

### Phase 1: Database & Backend (Week 1)
- ✅ Create database migrations
- ✅ Implement RLS policies
- ✅ Create server actions
- ✅ Test API endpoints
- ✅ Add indexes for performance

### Phase 2: Comments UI (Week 2)
- ✅ Build comment form component
- ✅ Build comment list component
- ✅ Build comment card component
- ✅ Implement threading/replies
- ✅ Add edit/delete functionality
- ✅ Integrate with article pages

### Phase 3: Likes UI (Week 2)
- ✅ Build like button component
- ✅ Add optimistic updates
- ✅ Integrate with articles/videos
- ✅ Show like counts

### Phase 4: Moderation (Week 3)
- ✅ Build admin moderation queue
- ✅ Implement flagging system
- ✅ Add auto-moderation rules
- ✅ Create moderation dashboard

### Phase 5: Polish & Testing (Week 3-4)
- ✅ Add loading states
- ✅ Error handling
- ✅ Mobile responsive design
- ✅ Performance optimization
- ✅ Security audit
- ✅ User acceptance testing

---

## 10. Security Considerations

### 10.1 XSS Protection
- Sanitize all user input
- Use React's built-in XSS protection
- Escape HTML in markdown rendering
- Use DOMPurify for user-generated content

### 10.2 Rate Limiting
- Max 10 comments per user per hour
- Max 100 likes per user per hour
- IP-based rate limiting for guests

### 10.3 Spam Prevention
- Captcha for first comment
- Akismet integration for spam detection
- Shadowban repeat offenders
- Require email verification

### 10.4 Content Moderation
- Profanity filter
- URL blocklist
- Auto-flag suspicious patterns
- Manual review queue

---

## 11. Performance Optimization

### 11.1 Database
- Proper indexing on all foreign keys
- Materialized views for popular content
- Denormalized counts (cached)
- Pagination with cursor-based navigation

### 11.2 Frontend
- Virtual scrolling for long comment threads
- Lazy loading of replies
- Optimistic UI updates
- Client-side caching with SWR/React Query

### 11.3 Caching
- Cache approved comments (5 min TTL)
- Cache like counts (1 min TTL)
- Invalidate on new activity

---

## 12. Analytics & Metrics

### Track:
- Comments per article/video
- Average comment length
- Reply rate (% of comments with replies)
- Moderation queue wait time
- Flagging accuracy
- User engagement rate
- Like-to-view ratio
- Most liked content

### Reports:
- Daily/weekly/monthly engagement dashboard
- Top commenters
- Most discussed articles
- Moderation team performance

---

## 13. Future Enhancements

### Phase 6 (Future)
- ✨ Multiple reaction types (❤️🔥💡😂😢)
- ✨ Comment mentions notifications
- ✨ Email notifications for replies
- ✨ Rich text formatting in comments
- ✨ GIF support in comments
- ✨ User reputation/karma system
- ✨ Verified commenter badges
- ✨ Comment sorting by AI sentiment
- ✨ Real-time comment updates (WebSocket)
- ✨ Comment bookmarking
- ✨ Share individual comments

---

## 14. Success Criteria

### Launch Checklist
- [ ] All database tables created
- [ ] RLS policies tested
- [ ] Server actions working
- [ ] Comments display on articles/videos
- [ ] Like buttons functional
- [ ] Mobile responsive
- [ ] Admin moderation working
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete

### Metrics for Success
- 10%+ of viewers leave a comment
- 30%+ of viewers like content
- < 5 min moderation queue response time
- < 200ms page load impact
- < 1% spam rate

---

## 15. Migration Path

### For Existing Content
1. Add columns to existing tables
2. Set default values (0 for counts)
3. No data migration needed (clean start)

### Rollback Plan
If issues arise:
1. Disable comment forms (feature flag)
2. Keep displaying existing comments (read-only)
3. Investigate and fix
4. Re-enable when ready

---

## Appendix A: Configuration

### Environment Variables
```env
# Comment moderation
NEXT_PUBLIC_COMMENTS_ENABLED=true
NEXT_PUBLIC_AUTO_APPROVE_COMMENTS=false
NEXT_PUBLIC_MAX_COMMENT_LENGTH=2000
NEXT_PUBLIC_ENABLE_COMMENT_LIKES=true

# Spam protection
AKISMET_API_KEY=your_key_here
CAPTCHA_SITE_KEY=your_key_here
```

### Site Settings Table
Add to `site_settings`:
```sql
INSERT INTO site_settings (key, value, type) VALUES
('comments_enabled', 'true', 'boolean'),
('auto_approve_comments', 'false', 'boolean'),
('require_captcha_first_comment', 'true', 'boolean'),
('max_comment_length', '2000', 'number'),
('max_reply_depth', '3', 'number');
```

---

**END OF PLAN**

This comprehensive plan provides a complete roadmap for implementing comments and likes on the VNTV platform. Ready to proceed with implementation when approved.
