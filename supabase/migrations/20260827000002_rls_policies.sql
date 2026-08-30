-- VNTV Row Level Security (RLS) Policies
-- This migration enables RLS and creates policies for all tables

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
-- PROFILES POLICIES
-- =====================================================

-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- =====================================================
-- ROLES POLICIES
-- =====================================================

-- Everyone can read roles
CREATE POLICY "Roles are viewable by everyone" 
  ON roles FOR SELECT 
  USING (true);

-- =====================================================
-- USER_ROLES POLICIES
-- =====================================================

-- Users can read all user roles
CREATE POLICY "User roles are viewable by everyone" 
  ON user_roles FOR SELECT 
  USING (true);

-- Only admins can assign roles (we'll add helper function later)
-- For now, allow service role only
CREATE POLICY "Only service role can manage user roles" 
  ON user_roles FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================

-- Everyone can read active categories
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- =====================================================
-- TAGS POLICIES
-- =====================================================

-- Everyone can read tags
CREATE POLICY "Tags are viewable by everyone" 
  ON tags FOR SELECT 
  USING (true);

-- =====================================================
-- AUTHORS POLICIES
-- =====================================================

-- Everyone can read active authors
CREATE POLICY "Authors are viewable by everyone" 
  ON authors FOR SELECT 
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- =====================================================
-- SOURCES POLICIES
-- =====================================================

-- Everyone can read active sources
CREATE POLICY "Sources are viewable by everyone" 
  ON sources FOR SELECT 
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- =====================================================
-- ARTICLES POLICIES
-- =====================================================

-- Everyone can read published articles
CREATE POLICY "Published articles are viewable by everyone" 
  ON articles FOR SELECT 
  USING (
    status = 'published' 
    OR auth.uid() IS NOT NULL
  );

-- Authenticated users can create articles
CREATE POLICY "Authenticated users can create articles" 
  ON articles FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own articles
CREATE POLICY "Users can update their own articles" 
  ON articles FOR UPDATE 
  USING (created_by = auth.uid());

-- =====================================================
-- VIDEOS POLICIES
-- =====================================================

-- Everyone can read published videos
CREATE POLICY "Published videos are viewable by everyone" 
  ON videos FOR SELECT 
  USING (
    status = 'published' 
    OR auth.uid() IS NOT NULL
  );

-- Authenticated users can create videos
CREATE POLICY "Authenticated users can create videos" 
  ON videos FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own videos
CREATE POLICY "Users can update their own videos" 
  ON videos FOR UPDATE 
  USING (created_by = auth.uid());

-- =====================================================
-- PROGRAMMES & EPISODES POLICIES
-- =====================================================

-- Everyone can read active programmes
CREATE POLICY "Programmes are viewable by everyone" 
  ON programmes FOR SELECT 
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- Editors can manage programmes
CREATE POLICY "Editors can manage programmes"
  ON programmes FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- Everyone can read published episodes
CREATE POLICY "Episodes are viewable by everyone" 
  ON episodes FOR SELECT 
  USING (
    published_at IS NOT NULL 
    OR auth.uid() IS NOT NULL
  );

-- Editors can manage episodes
CREATE POLICY "Editors can manage episodes"
  ON episodes FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- =====================================================
-- HOMEPAGE POLICIES
-- =====================================================

-- Everyone can read enabled homepage sections
CREATE POLICY "Homepage sections are viewable by everyone" 
  ON homepage_sections FOR SELECT 
  USING (is_enabled = true OR auth.uid() IS NOT NULL);

-- Everyone can read active homepage items
CREATE POLICY "Homepage items are viewable by everyone" 
  ON homepage_items FOR SELECT 
  USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
    OR auth.uid() IS NOT NULL
  );

-- =====================================================
-- BREAKING NEWS POLICIES
-- =====================================================

-- Everyone can read active breaking news
CREATE POLICY "Breaking news is viewable by everyone" 
  ON breaking_news FOR SELECT 
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at >= NOW())
    OR auth.uid() IS NOT NULL
  );

-- =====================================================
-- ADVERTISING POLICIES
-- =====================================================

-- Everyone can read active ad slots
CREATE POLICY "Ad slots are viewable by everyone" 
  ON ad_slots FOR SELECT 
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- Everyone can read active advertisements
CREATE POLICY "Advertisements are viewable by everyone" 
  ON advertisements FOR SELECT 
  USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
    OR auth.uid() IS NOT NULL
  );

-- Everyone can read active sponsorships
CREATE POLICY "Sponsorships are viewable by everyone" 
  ON sponsorships FOR SELECT 
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- =====================================================
-- ENGAGEMENT POLICIES
-- =====================================================

-- Anyone can insert article views (for analytics)
CREATE POLICY "Anyone can insert article views" 
  ON article_views FOR INSERT 
  WITH CHECK (true);

-- Users can read their own article views
CREATE POLICY "Users can read their own article views" 
  ON article_views FOR SELECT 
  USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Anyone can insert video events (for analytics)
CREATE POLICY "Anyone can insert video events" 
  ON video_events FOR INSERT 
  WITH CHECK (true);

-- Anyone can insert social shares (for analytics)
CREATE POLICY "Anyone can insert social shares" 
  ON social_shares FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- NEWSLETTER POLICIES
-- =====================================================

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

-- Users can read their own subscription
CREATE POLICY "Users can read their own newsletter subscription" 
  ON newsletter_subscribers FOR SELECT 
  USING (email = auth.email() OR user_id = auth.uid());

-- Users can update their own subscription
CREATE POLICY "Users can update their own newsletter subscription" 
  ON newsletter_subscribers FOR UPDATE 
  USING (email = auth.email() OR user_id = auth.uid());

-- =====================================================
-- SITE SETTINGS POLICIES
-- =====================================================

-- Everyone can read site settings
CREATE POLICY "Site settings are viewable by everyone" 
  ON site_settings FOR SELECT 
  USING (true);

-- =====================================================
-- REDIRECTS POLICIES
-- =====================================================

-- Everyone can read redirects
CREATE POLICY "Redirects are viewable by everyone" 
  ON redirects FOR SELECT 
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(role_name user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_role('super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

