# VNTV Database Architecture Documentation

Complete database schema documentation for the VNTV platform.

## Overview

The VNTV database consists of **30+ tables** organized into **9 logical domains**:

1. **Auth Domain** - User authentication and authorization
2. **Editorial Domain** - Articles, categories, tags, authors
3. **Media Domain** - Media assets, videos, video-article relationships
4. **Originals Domain** - Programmes and episodes
5. **RSS Domain** - Feed management and ingestion
6. **Homepage Domain** - Dynamic homepage management
7. **Breaking Domain** - Breaking news ticker
8. **Advertising Domain** - Ad management and sponsorships
9. **Engagement Domain** - Analytics and user interactions
10. **System Domain** - Settings, audit logs, redirects

## Database Schema

### 1. Auth Domain

#### `profiles`
Extends Supabase `auth.users` with application-specific profile data.

```sql
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
```

**Purpose**: Store user profile information
**Key Relationships**: Links to `auth.users`, referenced by `user_roles`, `audit_logs`
**RLS**: Users can read all, insert/update own profile

#### `roles`
Available system roles.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles**:
- `super_admin` - Full system access
- `editor` - Editorial review and publishing
- `reporter` - Create and manage articles
- `video_editor` - Manage video content
- `advertising_manager` - Manage advertising

**RLS**: Everyone can read roles

#### `user_roles`
Many-to-many relationship between users and roles.

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**RLS**: Everyone can read, only service role can modify

### 2. Editorial Domain

#### `categories`
Content categories (Ghana, Nigeria, Africa, World, Politics, etc.).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_id UUID, -- References media_assets
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Organize content into categories
**Supports**: Hierarchical categories via `parent_id`
**RLS**: Everyone can read active categories

#### `tags`
Content tags for cross-categorization.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS**: Everyone can read tags

#### `authors`
Content authors (separate from user accounts).

```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_id UUID, -- References media_assets
  social_links JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Support both CMS users and legacy/imported authors
**RLS**: Everyone can read active authors

#### `sources`
Content source attribution.

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS**: Everyone can read active sources

#### `articles`
Main article content table.

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body JSONB NOT NULL DEFAULT '[]'::jsonb, -- Structured content blocks
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  featured_image_id UUID, -- References media_assets
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
  social_image_id UUID, -- References media_assets
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Article Status Enum**:
- `draft` - Initial creation
- `review` - Submitted for editorial review
- `approved` - Approved by editor
- `scheduled` - Scheduled for future publishing
- `published` - Live on site
- `rejected` - Rejected by editor
- `archived` - Archived content

**Body Structure**: JSONB array of content blocks:
- Paragraph
- Heading
- Image
- Gallery
- Video
- YouTube
- Quote
- Embed
- Related article

**RLS**: Everyone can read published, authenticated can create, users can update own

#### `article_tags`
Many-to-many relationship between articles and tags.

```sql
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

#### `article_revisions`
Version history for articles.

```sql
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
```

**Purpose**: Track article changes, support rollback

### 3. Media Domain

#### `media_assets`
Metadata for all media files.

```sql
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
```

**Media Types**: `image`, `video`, `document`
**Storage**: Actual files in Supabase Storage buckets

#### `videos`
Video content records.

```sql
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
  programme_id UUID, -- References programmes
  
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
```

**Source Types**: `upload`, `youtube`, `external`
**Orientations**: `horizontal` (16:9), `vertical` (9:16)
**Video Types**: `news`, `breaking`, `interview`, `documentary`, `short`, `original`, `standalone`

**RLS**: Everyone can read published, authenticated can create, users can update own

#### `video_articles`
Many-to-many relationship between videos and articles.

```sql
CREATE TABLE video_articles (
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  relationship_type TEXT DEFAULT 'embedded',
  PRIMARY KEY (video_id, article_id)
);
```

**Purpose**: Support articles with multiple videos and videos in multiple articles

### 4. Originals Domain

#### `programmes`
Original VNTV programmes (e.g., D'Opinion, Beyond Headlines).

```sql
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
```

**RLS**: Everyone can read active programmes

#### `episodes`
Individual episodes within programmes.

```sql
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
```

**RLS**: Everyone can read published episodes

### 5. RSS Domain

#### `rss_feeds`
External RSS feed configurations.

```sql
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
```

**Purpose**: Manage external news feed imports
**Controls**: Enable/disable per feed, auto-publish option

#### `rss_items`
Imported RSS feed items.

```sql
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
```

**Purpose**: Store imported items for editorial review

#### `rss_import_logs`
RSS import operation logs.

```sql
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
```

### 6. Homepage Domain

#### `homepage_sections`
Dynamic homepage sections configuration.

```sql
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
```

**Purpose**: CMS-managed homepage layout

#### `homepage_items`
Content items within homepage sections.

```sql
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
```

**Constraint**: Each item references either article OR video, not both

### 7. Breaking Domain

#### `breaking_news`
Breaking news ticker management.

```sql
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
```

**Purpose**: Control breaking news ticker display

### 8. Advertising Domain

#### `ad_slots`
Advertising placement definitions.

```sql
CREATE TABLE ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  placement TEXT NOT NULL, -- homepage_top, article_top, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Placements**: `homepage_top`, `article_top`, `article_inline`, `video_sponsor`, etc.

#### `advertisements`
Individual ad campaigns.

```sql
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  creative_type TEXT NOT NULL, -- image, html
  image_id UUID REFERENCES media_assets(id),
  html_content TEXT,
  target_url TEXT,
  sponsor_id UUID, -- Could reference sponsors table
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `sponsorships`
Sponsorship records.

```sql
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
```

### 9. Engagement Domain

#### `article_views`
Article view tracking.

```sql
CREATE TABLE article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Track article reads for analytics

#### `video_events`
Video playback events.

```sql
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
```

**Event Types**: `start`, `progress`, `complete`, `gate_shown`

#### `social_shares`
Social sharing tracking.

```sql
CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  platform TEXT NOT NULL, -- whatsapp, facebook, x, linkedin, etc.
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `newsletter_subscribers`
Newsletter subscription list.

```sql
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
```

### 10. System Domain

#### `site_settings`
Global site configuration.

```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Settings**:
- `anonymous_article_gate_enabled` - Enable article gating
- `anonymous_video_gate_enabled` - Enable video gating
- `newsletter_enabled` - Enable newsletter
- `breaking_news_enabled` - Enable breaking ticker
- `site_name` - Site name
- `site_tagline` - Site tagline

#### `audit_logs`
System audit trail.

```sql
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
```

**Purpose**: Track administrative actions

#### `redirects`
URL redirect management.

```sql
CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Handle URL changes, maintain SEO

## Database Indexes

Performance indexes created on frequently queried columns:

**Articles**:
- `slug` (unique)
- `status`
- `published_at DESC`
- `category_id`
- `author_id`
- `is_breaking` (partial, where true)
- `is_featured` (partial, where true)

**Categories**:
- `slug` (unique)
- `parent_id`
- `display_order`

**Tags**:
- `slug` (unique)

**Videos**:
- `slug` (unique)
- `source_type`
- `programme_id`
- `published_at DESC`

**RSS**:
- `feed_id` on `rss_items`
- `status` on `rss_items`
- `content_hash` on `rss_items`

**Homepage**:
- `display_order` on `homepage_sections`
- `section_id` on `homepage_items`
- `display_order` on `homepage_items`

**Breaking News**:
- `is_active` (partial, where true)
- `expires_at`

**Engagement**:
- `article_id` on `article_views`
- `viewed_at DESC` on `article_views`
- `video_id` on `video_events`
- `event_type` on `video_events`

## Enums

### `article_status`
```sql
CREATE TYPE article_status AS ENUM (
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'rejected',
  'archived'
);
```

### `video_type`
```sql
CREATE TYPE video_type AS ENUM (
  'news',
  'breaking',
  'interview',
  'documentary',
  'short',
  'original',
  'standalone'
);
```

### `video_source_type`
```sql
CREATE TYPE video_source_type AS ENUM (
  'upload',
  'youtube',
  'external'
);
```

### `video_orientation`
```sql
CREATE TYPE video_orientation AS ENUM (
  'horizontal',
  'vertical'
);
```

### `content_type`
```sql
CREATE TYPE content_type AS ENUM (
  'article',
  'video',
  'programme',
  'episode'
);
```

### `media_type`
```sql
CREATE TYPE media_type AS ENUM (
  'image',
  'video',
  'document'
);
```

### `user_role`
```sql
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'editor',
  'reporter',
  'video_editor',
  'advertising_manager'
);
```

## Triggers

### `updated_at` Auto-Update
All tables with `updated_at` column have a trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_[table]_updated_at 
  BEFORE UPDATE ON [table]
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

Applied to: `profiles`, `categories`, `authors`, `articles`, `media_assets`, `videos`, `programmes`, `episodes`, `rss_feeds`, `homepage_sections`, `breaking_news`, `advertisements`, `sponsorships`

## Initial Data

Default data inserted during migration:

**Roles**:
- super_admin
- editor
- reporter
- video_editor
- advertising_manager

**Site Settings**:
- `anonymous_article_gate_enabled` = false
- `anonymous_video_gate_enabled` = false
- `newsletter_enabled` = true
- `breaking_news_enabled` = true
- `site_name` = "VNTV"
- `site_tagline` = "AFRICA. OUR STORIES. OUR WAY."

**Categories**:
- Home, Ghana, Nigeria, Africa, World
- Politics, Business, Entertainment, Sports
- Viral, Opinion

## Migration Files

Located in `/supabase/migrations/`:

1. **20260826000001_initial_schema.sql** - Complete database schema
2. **20260827000002_rls_policies.sql** - Row Level Security policies

## RLS Summary

All tables have RLS enabled. Key policies:

**Public Content** (published only):
- Articles (published)
- Videos (published)
- Categories (active)
- Programmes (active)
- Episodes (published)

**Authenticated Access**:
- Create articles, videos
- Update own content
- Profile management

**Admin Access**:
- Role assignment (service role only)
- Full content management (by role)
- System settings
- Feed management

## Best Practices

### Schema Changes
1. Always use migrations
2. Test in development first
3. Backup before applying to production
4. Version control all migration files

### Data Access
1. Use RLS - never bypass security
2. Query only needed columns
3. Use indexes for frequently queried fields
4. Implement pagination for large result sets

### Type Safety
1. Generate TypeScript types from schema
2. Use type-safe query builders
3. Validate data before insert/update

## Maintenance

### Regular Tasks
- Monitor slow queries
- Review and optimize indexes
- Archive old data (article_views, audit_logs)
- Vacuum and analyze tables
- Monitor storage growth

### Monitoring
- Query performance
- Index usage
- Table sizes
- RLS policy effectiveness
- Connection pool usage

## Support

For schema questions:
- Review Blueprint.md sections 7-18
- Check migration files
- Review RLS policies
- Test queries in Supabase SQL Editor

For modifications:
- Create new migration file
- Test thoroughly
- Document changes
- Update TypeScript types
