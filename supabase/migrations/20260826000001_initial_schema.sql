-- VNTV Initial Database Schema Migration
-- This migration creates the complete database structure for the VNTV platform
-- Following the architecture defined in Blueprint.md and Product_spec.md

-- =====================================================
-- ENUMS
-- =====================================================

-- Article status enum
CREATE TYPE article_status AS ENUM (
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'rejected',
  'archived'
);

-- Video type enum
CREATE TYPE video_type AS ENUM (
  'news',
  'breaking',
  'interview',
  'documentary',
  'short',
  'original',
  'standalone'
);

-- Video source type enum
CREATE TYPE video_source_type AS ENUM (
  'upload',
  'youtube',
  'external'
);

-- Video orientation enum
CREATE TYPE video_orientation AS ENUM (
  'horizontal',
  'vertical'
);

-- Content type enum
CREATE TYPE content_type AS ENUM (
  'article',
  'video',
  'programme',
  'episode'
);

-- Media type enum
CREATE TYPE media_type AS ENUM (
  'image',
  'video',
  'document'
);

-- User role enum
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'editor',
  'reporter',
  'video_editor',
  'advertising_manager'
);

-- =====================================================
-- AUTH DOMAIN
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  newsletter_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (many-to-many)
CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- EDITORIAL DOMAIN
-- =====================================================

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_id UUID, -- Will reference media_assets
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authors (separate from user accounts for legacy/imported content)
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_id UUID, -- Will reference media_assets
  social_links JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources (for attribution)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body JSONB NOT NULL DEFAULT '[]'::jsonb, -- Structured content blocks
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  featured_image_id UUID, -- Will reference media_assets
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  status article_status DEFAULT 'draft',
  content_type TEXT DEFAULT 'article',
  
  -- Flags
  is_breaking BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  sponsor_label TEXT,
  
  -- Publishing
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  social_image_id UUID, -- Will reference media_assets
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article tags (many-to-many)
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Article revisions
CREATE TABLE article_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body JSONB NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEDIA DOMAIN
-- =====================================================

-- Media assets
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  media_type media_type NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For videos, in seconds
  alt_text TEXT,
  caption TEXT,
  credit TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  source_type video_source_type NOT NULL DEFAULT 'upload',
  source_url TEXT, -- YouTube URL or external URL
  storage_path TEXT, -- For uploaded videos
  thumbnail_id UUID REFERENCES media_assets(id),
  duration_seconds INTEGER,
  orientation video_orientation DEFAULT 'horizontal',
  video_type video_type DEFAULT 'news',
  programme_id UUID, -- Will reference programmes
  
  -- Flags
  is_exclusive BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Status
  status article_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video-Article relationships (many-to-many)
CREATE TABLE video_articles (
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  relationship_type TEXT DEFAULT 'embedded',
  PRIMARY KEY (video_id, article_id)
);

-- =====================================================
-- ORIGINALS DOMAIN
-- =====================================================

-- Programmes
CREATE TABLE programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  poster_id UUID REFERENCES media_assets(id),
  presenter TEXT,
  programme_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  episode_number INTEGER,
  video_id UUID REFERENCES videos(id),
  thumbnail_id UUID REFERENCES media_assets(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(programme_id, slug)
);

-- Add programme_id foreign key to videos (circular dependency resolved)
ALTER TABLE videos 
  ADD CONSTRAINT videos_programme_id_fkey 
  FOREIGN KEY (programme_id) 
  REFERENCES programmes(id) 
  ON DELETE SET NULL;

-- =====================================================
-- RSS DOMAIN
-- =====================================================

-- RSS feeds
CREATE TABLE rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source_name TEXT NOT NULL,
  country TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_enabled BOOLEAN DEFAULT true,
  auto_publish BOOLEAN DEFAULT false,
  requires_review BOOLEAN DEFAULT true,
  fetch_interval INTEGER DEFAULT 3600, -- In seconds
  last_fetched_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSS items
CREATE TABLE rss_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
  external_id TEXT,
  guid TEXT,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL,
  author TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, published
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  content_hash TEXT, -- For deduplication
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feed_id, guid)
);

-- RSS import logs
CREATE TABLE rss_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running', -- running, success, failed
  items_found INTEGER DEFAULT 0,
  items_imported INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb
);

-- =====================================================
-- HOMEPAGE DOMAIN
-- =====================================================

-- Homepage sections
CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  section_type TEXT NOT NULL, -- hero, grid, list, video, originals, etc.
  display_order INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage items
CREATE TABLE homepage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT homepage_items_content_check CHECK (
    (article_id IS NOT NULL AND video_id IS NULL) OR
    (article_id IS NULL AND video_id IS NOT NULL)
  )
);

-- =====================================================
-- BREAKING NEWS DOMAIN
-- =====================================================

-- Breaking news
CREATE TABLE breaking_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  headline_override TEXT,
  priority INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADVERTISING DOMAIN
-- =====================================================

-- Ad slots
CREATE TABLE ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  placement TEXT NOT NULL, -- homepage_top, article_top, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advertisements
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  creative_type TEXT NOT NULL, -- image, html
  image_id UUID REFERENCES media_assets(id),
  html_content TEXT,
  target_url TEXT,
  sponsor_id UUID, -- Could reference a sponsors table
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsorships
CREATE TABLE sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_id UUID REFERENCES media_assets(id),
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENGAGEMENT DOMAIN
-- =====================================================

-- Article views (lightweight tracking)
CREATE TABLE article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video events
CREATE TABLE video_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- start, progress, complete, gate_shown
  progress_percentage INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social shares
CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  platform TEXT NOT NULL, -- whatsapp, facebook, x, linkedin, etc.
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  verification_token TEXT,
  verified_at TIMESTAMPTZ
);

-- =====================================================
-- SYSTEM DOMAIN
-- =====================================================

-- Site settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redirects
CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Articles indexes
CREATE INDEX articles_slug_idx ON articles(slug);
CREATE INDEX articles_status_idx ON articles(status);
CREATE INDEX articles_published_at_idx ON articles(published_at DESC);
CREATE INDEX articles_category_id_idx ON articles(category_id);
CREATE INDEX articles_author_id_idx ON articles(author_id);
CREATE INDEX articles_is_breaking_idx ON articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX articles_is_featured_idx ON articles(is_featured) WHERE is_featured = true;

-- Categories indexes
CREATE INDEX categories_slug_idx ON categories(slug);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);
CREATE INDEX categories_display_order_idx ON categories(display_order);

-- Tags indexes
CREATE INDEX tags_slug_idx ON tags(slug);

-- Videos indexes
CREATE INDEX videos_slug_idx ON videos(slug);
CREATE INDEX videos_source_type_idx ON videos(source_type);
CREATE INDEX videos_programme_id_idx ON videos(programme_id);
CREATE INDEX videos_published_at_idx ON videos(published_at DESC);

-- RSS indexes
CREATE INDEX rss_items_feed_id_idx ON rss_items(feed_id);
CREATE INDEX rss_items_status_idx ON rss_items(status);
CREATE INDEX rss_items_content_hash_idx ON rss_items(content_hash);

-- Homepage indexes
CREATE INDEX homepage_sections_display_order_idx ON homepage_sections(display_order);
CREATE INDEX homepage_items_section_id_idx ON homepage_items(section_id);
CREATE INDEX homepage_items_display_order_idx ON homepage_items(display_order);

-- Breaking news indexes
CREATE INDEX breaking_news_is_active_idx ON breaking_news(is_active) WHERE is_active = true;
CREATE INDEX breaking_news_expires_at_idx ON breaking_news(expires_at);

-- Engagement indexes
CREATE INDEX article_views_article_id_idx ON article_views(article_id);
CREATE INDEX article_views_viewed_at_idx ON article_views(viewed_at DESC);
CREATE INDEX video_events_video_id_idx ON video_events(video_id);
CREATE INDEX video_events_event_type_idx ON video_events(event_type);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programmes_updated_at BEFORE UPDATE ON programmes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rss_feeds_updated_at BEFORE UPDATE ON rss_feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breaking_news_updated_at BEFORE UPDATE ON breaking_news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorships_updated_at BEFORE UPDATE ON sponsorships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('editor', 'Editorial review and publishing'),
  ('reporter', 'Create and manage articles'),
  ('video_editor', 'Manage video content'),
  ('advertising_manager', 'Manage advertising and sponsorships');

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('anonymous_article_gate_enabled', 'false'::jsonb, 'Enable authentication gate for anonymous article readers'),
  ('anonymous_video_gate_enabled', 'false'::jsonb, 'Enable authentication gate for anonymous video viewers at 25%'),
  ('newsletter_enabled', 'true'::jsonb, 'Enable newsletter signup'),
  ('breaking_news_enabled', 'true'::jsonb, 'Enable breaking news ticker'),
  ('site_name', '"VNTV"'::jsonb, 'Site name'),
  ('site_tagline', '"AFRICA. OUR STORIES. OUR WAY."'::jsonb, 'Site tagline');

-- Insert default categories
INSERT INTO categories (name, slug, display_order, is_active) VALUES
  ('Home', 'home', 0, true),
  ('Ghana', 'ghana', 1, true),
  ('Nigeria', 'nigeria', 2, true),
  ('Africa', 'africa', 3, true),
  ('World', 'world', 4, true),
  ('Politics', 'politics', 5, true),
  ('Business', 'business', 6, true),
  ('Entertainment', 'entertainment', 7, true),
  ('Sports', 'sports', 8, true),
  ('Viral', 'viral', 9, true),
  ('Opinion', 'opinion', 10, true);
