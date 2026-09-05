-- =====================================================
-- VNTV Comments & Likes System
-- Migration: 20260905000001
-- Description: Add comments and likes functionality to articles, videos, and episodes
-- =====================================================

-- =====================================================
-- COMMENTS TABLE
-- =====================================================

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

-- =====================================================
-- LIKES TABLE
-- =====================================================

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

-- =====================================================
-- COMMENT LIKES TABLE
-- =====================================================

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

-- =====================================================
-- COMMENT FLAGS TABLE
-- =====================================================

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

-- =====================================================
-- ADD COLUMNS TO EXISTING TABLES
-- =====================================================

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

-- =====================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- =====================================================

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
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- Function to update comment count (only top-level approved comments)
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
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' AND NEW.parent_comment_id IS NULL THEN
    -- Reject or delete previously approved comment
    IF NEW.content_type = 'article' THEN
      UPDATE articles SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'video' THEN
      UPDATE videos SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'episode' THEN
      UPDATE episodes SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.content_id;
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

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_like_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Function to update comment flag count
CREATE OR REPLACE FUNCTION update_comment_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET flag_count = flag_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET flag_count = GREATEST(0, flag_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_flag_count
AFTER INSERT OR DELETE ON comment_flags
FOR EACH ROW EXECUTE FUNCTION update_comment_flag_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_flags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS RLS POLICIES
-- =====================================================

-- Public: Read approved comments
CREATE POLICY "Public can view approved comments"
  ON comments FOR SELECT
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
    AND is_authenticated()
  );

-- Authenticated: Update own comments (within 15 minutes, only if pending or approved)
CREATE POLICY "Users can edit own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND status IN ('pending', 'approved')
    AND created_at > (NOW() - INTERVAL '15 minutes')
    AND is_authenticated()
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'approved')
  );

-- Authenticated: Delete own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- Editors: Can read all comments
CREATE POLICY "Editors can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- Editors: Can moderate comments (update status, pin, etc.)
CREATE POLICY "Editors can moderate comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- Editors: Can delete any comment
CREATE POLICY "Editors can delete any comment"
  ON comments FOR DELETE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- =====================================================
-- LIKES RLS POLICIES
-- =====================================================

-- Public: Read likes (for count aggregation)
CREATE POLICY "Public can view likes"
  ON likes FOR SELECT
  USING (true);

-- Authenticated: Create likes
CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- Authenticated: Delete own likes (unlike)
CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- =====================================================
-- COMMENT LIKES RLS POLICIES
-- =====================================================

-- Public: Read comment likes
CREATE POLICY "Public can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

-- Authenticated: Create comment likes
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- Authenticated: Delete own comment likes
CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- =====================================================
-- COMMENT FLAGS RLS POLICIES
-- =====================================================

-- Authenticated: Create flags
CREATE POLICY "Authenticated users can flag comments"
  ON comment_flags FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- Authenticated: View own flags
CREATE POLICY "Users can view own flags"
  ON comment_flags FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_authenticated()
  );

-- Editors: View and manage all flags
CREATE POLICY "Editors can manage flags"
  ON comment_flags FOR ALL
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- =====================================================
-- SITE SETTINGS
-- =====================================================

-- Add comments and likes settings
INSERT INTO site_settings (key, value, description) VALUES
  ('comments_enabled', 'true'::jsonb, 'Enable comments system'),
  ('auto_approve_comments', 'true'::jsonb, 'Auto-approve comments without moderation (comments appear immediately)'),
  ('require_email_verified_to_comment', 'true'::jsonb, 'Require verified email to comment'),
  ('comment_edit_window_minutes', '15'::jsonb, 'Time window to edit comments (minutes)'),
  ('max_comment_length', '2000'::jsonb, 'Maximum comment length (characters)'),
  ('max_reply_depth', '3'::jsonb, 'Maximum nesting depth for replies'),
  ('likes_enabled', 'true'::jsonb, 'Enable likes/reactions system')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE comments IS 'User comments on articles, videos, and episodes';
COMMENT ON TABLE likes IS 'User likes on articles, videos, and episodes';
COMMENT ON TABLE comment_likes IS 'User likes on comments';
COMMENT ON TABLE comment_flags IS 'User reports of inappropriate comments';

COMMENT ON COLUMN comments.content_type IS 'Type of content being commented on (article, video, episode)';
COMMENT ON COLUMN comments.content_id IS 'ID of the content being commented on';
COMMENT ON COLUMN comments.parent_comment_id IS 'ID of parent comment for threaded replies';
COMMENT ON COLUMN comments.depth IS 'Nesting depth (0 = top-level, max 3)';
COMMENT ON COLUMN comments.status IS 'Moderation status (pending, approved, rejected, deleted)';
COMMENT ON COLUMN comments.is_pinned IS 'Whether comment is pinned to top by moderator';

