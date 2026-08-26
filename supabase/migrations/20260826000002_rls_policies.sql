-- VNTV Row Level Security (RLS) Policies
-- This migration enables RLS and creates security policies for all tables
-- Security is enforced at the database level, not just the application level

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR PERMISSIONS
-- =====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = has_role.user_id
      AND r.name = has_role.role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(user_id UUID, role_names user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = has_any_role.user_id
      AND r.name = ANY(has_any_role.role_names)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

-- =====================================================
-- ROLES & USER_ROLES
-- =====================================================

-- Anyone can read roles
CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  USING (true);

-- Only super admins can manage user roles
CREATE POLICY "Super admins can manage user roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- CATEGORIES, TAGS, AUTHORS, SOURCES
-- =====================================================

-- Public read access to active categories
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Editors and above can manage categories
CREATE POLICY "Editors can manage categories"
  ON categories FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Public can read tags
CREATE POLICY "Public can read tags"
  ON tags FOR SELECT
  USING (true);

-- Editors and above can manage tags
CREATE POLICY "Editors can manage tags"
  ON tags FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'reporter']::user_role[]));

-- Public can read active authors
CREATE POLICY "Public can read active authors"
  ON authors FOR SELECT
  USING (is_active = true);

-- Editors and above can manage authors
CREATE POLICY "Editors can manage authors"
  ON authors FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Public can read sources
CREATE POLICY "Public can read sources"
  ON sources FOR SELECT
  USING (true);

-- Editors and above can manage sources
CREATE POLICY "Editors can manage sources"
  ON sources FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- =====================================================
-- ARTICLES
-- =====================================================

-- Public can read published articles
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- Reporters can read their own articles
CREATE POLICY "Reporters can read own articles"
  ON articles FOR SELECT
  USING (
    is_authenticated() AND (
      created_by = auth.uid() OR
      has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
    )
  );

-- Reporters can create articles
CREATE POLICY "Reporters can create articles"
  ON articles FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'reporter']::user_role[]));

-- Reporters can update their own draft articles
CREATE POLICY "Reporters can update own draft articles"
  ON articles FOR UPDATE
  USING (
    created_by = auth.uid() AND
    status IN ('draft', 'rejected') AND
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'reporter']::user_role[])
  );

-- Editors can update all articles
CREATE POLICY "Editors can update all articles"
  ON articles FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Editors can delete articles
CREATE POLICY "Editors can delete articles"
  ON articles FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- =====================================================
-- ARTICLE TAGS
-- =====================================================

-- Public can read article tags
CREATE POLICY "Public can read article tags"
  ON article_tags FOR SELECT
  USING (true);

-- Reporters and editors can manage article tags
CREATE POLICY "Content creators can manage article tags"
  ON article_tags FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'reporter']::user_role[]));

-- =====================================================
-- ARTICLE REVISIONS
-- =====================================================

-- Content creators can read revisions of articles they can access
CREATE POLICY "Content creators can read article revisions"
  ON article_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_revisions.article_id
        AND (
          articles.status = 'published' OR
          articles.created_by = auth.uid() OR
          has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
        )
    )
  );

-- System creates revisions (handled by application)
CREATE POLICY "System can create revisions"
  ON article_revisions FOR INSERT
  WITH CHECK (is_authenticated());

-- =====================================================
-- MEDIA ASSETS
-- =====================================================

-- Public can read media assets
CREATE POLICY "Public can read media assets"
  ON media_assets FOR SELECT
  USING (true);

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media"
  ON media_assets FOR INSERT
  WITH CHECK (is_authenticated());

-- Users can update their own uploaded media
CREATE POLICY "Users can update own media"
  ON media_assets FOR UPDATE
  USING (uploaded_by = auth.uid());

-- Editors and video editors can manage all media
CREATE POLICY "Media managers can manage all media"
  ON media_assets FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- =====================================================
-- VIDEOS
-- =====================================================

-- Public can read published videos
CREATE POLICY "Public can read published videos"
  ON videos FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- Video editors can read all videos
CREATE POLICY "Video editors can read all videos"
  ON videos FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- Video editors can manage videos
CREATE POLICY "Video editors can manage videos"
  ON videos FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- =====================================================
-- VIDEO ARTICLES (RELATIONSHIPS)
-- =====================================================

-- Public can read video-article relationships
CREATE POLICY "Public can read video articles"
  ON video_articles FOR SELECT
  USING (true);

-- Content creators can manage video-article relationships
CREATE POLICY "Content creators can manage video articles"
  ON video_articles FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'reporter', 'video_editor']::user_role[]));

-- =====================================================
-- PROGRAMMES & EPISODES
-- =====================================================

-- Public can read active programmes
CREATE POLICY "Public can read active programmes"
  ON programmes FOR SELECT
  USING (is_active = true);

-- Editors can manage programmes
CREATE POLICY "Editors can manage programmes"
  ON programmes FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- Public can read published episodes
CREATE POLICY "Public can read published episodes"
  ON episodes FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- Editors can manage episodes
CREATE POLICY "Editors can manage episodes"
  ON episodes FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- =====================================================
-- RSS
-- =====================================================

-- Only editors can read RSS feeds
CREATE POLICY "Editors can read RSS feeds"
  ON rss_feeds FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Only editors can manage RSS feeds
CREATE POLICY "Editors can manage RSS feeds"
  ON rss_feeds FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Only editors can read RSS items
CREATE POLICY "Editors can read RSS items"
  ON rss_items FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Only editors can manage RSS items
CREATE POLICY "Editors can manage RSS items"
  ON rss_items FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Only editors can read RSS import logs
CREATE POLICY "Editors can read RSS import logs"
  ON rss_import_logs FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- System can create import logs
CREATE POLICY "System can create import logs"
  ON rss_import_logs FOR INSERT
  WITH CHECK (is_authenticated());

-- =====================================================
-- HOMEPAGE
-- =====================================================

-- Public can read enabled homepage sections
CREATE POLICY "Public can read enabled homepage sections"
  ON homepage_sections FOR SELECT
  USING (is_enabled = true);

-- Editors can manage homepage sections
CREATE POLICY "Editors can manage homepage sections"
  ON homepage_sections FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- Public can read active homepage items
CREATE POLICY "Public can read active homepage items"
  ON homepage_items FOR SELECT
  USING (
    is_active = true AND
    (starts_at IS NULL OR starts_at <= NOW()) AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Editors can manage homepage items
CREATE POLICY "Editors can manage homepage items"
  ON homepage_items FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- =====================================================
-- BREAKING NEWS
-- =====================================================

-- Public can read active breaking news
CREATE POLICY "Public can read active breaking news"
  ON breaking_news FOR SELECT
  USING (
    is_active = true AND
    starts_at <= NOW() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Editors can manage breaking news
CREATE POLICY "Editors can manage breaking news"
  ON breaking_news FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- =====================================================
-- ADVERTISING
-- =====================================================

-- Public can read active ad slots
CREATE POLICY "Public can read active ad slots"
  ON ad_slots FOR SELECT
  USING (is_active = true);

-- Advertising managers can manage ad slots
CREATE POLICY "Ad managers can manage ad slots"
  ON ad_slots FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'advertising_manager']::user_role[]));

-- Public can read active advertisements
CREATE POLICY "Public can read active advertisements"
  ON advertisements FOR SELECT
  USING (
    is_active = true AND
    starts_at <= NOW() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Advertising managers can manage advertisements
CREATE POLICY "Ad managers can manage advertisements"
  ON advertisements FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'advertising_manager']::user_role[]));

-- Public can read active sponsorships
CREATE POLICY "Public can read active sponsorships"
  ON sponsorships FOR SELECT
  USING (is_active = true);

-- Advertising managers can manage sponsorships
CREATE POLICY "Ad managers can manage sponsorships"
  ON sponsorships FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'advertising_manager']::user_role[]));

-- =====================================================
-- ENGAGEMENT
-- =====================================================

-- System can create article views
CREATE POLICY "System can create article views"
  ON article_views FOR INSERT
  WITH CHECK (true);

-- Users can read their own views
CREATE POLICY "Users can read own views"
  ON article_views FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- System can create video events
CREATE POLICY "System can create video events"
  ON video_events FOR INSERT
  WITH CHECK (true);

-- Users can read their own video events
CREATE POLICY "Users can read own video events"
  ON video_events FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- System can create social shares
CREATE POLICY "System can create social shares"
  ON social_shares FOR INSERT
  WITH CHECK (true);

-- Public can read newsletter subscribers (count only)
CREATE POLICY "Public can read newsletter subscriber existence"
  ON newsletter_subscribers FOR SELECT
  USING (false); -- Implement specific query patterns as needed

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (user_id = auth.uid() OR email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- SYSTEM
-- =====================================================

-- Public can read site settings
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only super admins can manage site settings
CREATE POLICY "Super admins can manage site settings"
  ON site_settings FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[]));

-- System can create audit logs
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (is_authenticated());

-- Public can read redirects
CREATE POLICY "Public can read redirects"
  ON redirects FOR SELECT
  USING (true);

-- Only super admins can manage redirects
CREATE POLICY "Super admins can manage redirects"
  ON redirects FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));
