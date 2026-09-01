-- =====================================================
-- Milestone 16: Comprehensive Site Settings
-- =====================================================
-- Adds all settings needed for full site configuration
-- without code deployment

-- Insert/Update Global Settings
INSERT INTO site_settings (key, value, description) VALUES
  -- Site Identity
  ('site_title', '"VNTV - Africa. Our Stories. Our Way."'::jsonb, 'Main site title displayed in browser and SEO'),
  ('site_tagline', '"Africa. Our Stories. Our Way."'::jsonb, 'Site tagline/slogan'),
  ('site_description', '"Your trusted source for African news, stories, and perspectives from Ghana, Nigeria, and across the continent."'::jsonb, 'Main site description for SEO and about pages'),
  
  -- Contact Information
  ('contact_email', '"info@vntv.africa"'::jsonb, 'Primary contact email address'),
  ('contact_phone', '""'::jsonb, 'Contact phone number (optional)'),
  ('contact_address', '""'::jsonb, 'Physical address (optional)'),
  
  -- Social Media Links
  ('social_facebook', '"https://facebook.com/vntv"'::jsonb, 'Facebook page URL'),
  ('social_twitter', '"https://twitter.com/vntv"'::jsonb, 'Twitter/X profile URL'),
  ('social_instagram', '"https://instagram.com/vntv"'::jsonb, 'Instagram profile URL'),
  ('social_youtube', '"https://youtube.com/@vntv"'::jsonb, 'YouTube channel URL'),
  ('social_tiktok', '"https://tiktok.com/@vntv"'::jsonb, 'TikTok profile URL'),
  ('social_linkedin', '""'::jsonb, 'LinkedIn page URL (optional)'),
  
  -- Branding Assets (stored as media asset IDs or URLs)
  ('logo_light', '""'::jsonb, 'Logo for light theme (media asset ID or URL)'),
  ('logo_dark', '""'::jsonb, 'Logo for dark theme (media asset ID or URL)'),
  ('favicon', '""'::jsonb, 'Favicon (media asset ID or URL)'),
  ('og_image_default', '""'::jsonb, 'Default Open Graph image for social sharing (media asset ID or URL)'),
  
  -- Content Gate Configuration (expand existing)
  ('article_gate_threshold', '0'::jsonb, 'Percentage of article to show before gate (0-100, 0 means immediate gate)'),
  ('video_gate_threshold', '25'::jsonb, 'Percentage of video to play before gate (0-100)'),
  ('gate_redirect_enabled', 'true'::jsonb, 'Return users to content after authentication'),
  
  -- Feature Flags
  ('feature_newsletter', 'true'::jsonb, 'Enable newsletter functionality'),
  ('feature_breaking_news', 'true'::jsonb, 'Enable breaking news ticker'),
  ('feature_comments', 'false'::jsonb, 'Enable comments on articles (future feature)'),
  ('feature_search', 'true'::jsonb, 'Enable search functionality'),
  ('feature_social_sharing', 'true'::jsonb, 'Enable social sharing buttons'),
  ('feature_trending', 'true'::jsonb, 'Enable trending articles section'),
  ('feature_related_articles', 'true'::jsonb, 'Enable related articles suggestions'),
  
  -- SEO Settings
  ('seo_default_meta_description', '"Your trusted source for African news and stories from Ghana, Nigeria, and across the continent."'::jsonb, 'Default meta description when page-specific is not available'),
  ('seo_keywords', '"African news, Ghana news, Nigeria news, African stories, VNTV"'::jsonb, 'Default keywords for SEO'),
  ('seo_google_analytics_id', '""'::jsonb, 'Google Analytics measurement ID (e.g., G-XXXXXXXXXX)'),
  ('seo_google_search_console', '""'::jsonb, 'Google Search Console verification meta tag content'),
  ('seo_google_site_verification', '""'::jsonb, 'Google site verification code'),
  ('seo_robots_index', 'true'::jsonb, 'Allow search engines to index the site'),
  ('seo_sitemap_enabled', 'true'::jsonb, 'Enable automatic sitemap generation'),
  ('seo_sitemap_max_articles', '1000'::jsonb, 'Maximum articles to include in sitemap'),
  
  -- Email/SMTP Configuration
  ('email_from_address', '"noreply@vntv.africa"'::jsonb, 'From email address for outgoing emails'),
  ('email_from_name', '"VNTV"'::jsonb, 'From name for outgoing emails'),
  ('email_reply_to', '"info@vntv.africa"'::jsonb, 'Reply-to email address'),
  ('email_provider', '"resend"'::jsonb, 'Email service provider (resend, sendgrid, ses, smtp)'),
  
  -- Resend Configuration
  ('resend_api_key', '""'::jsonb, 'Resend API key (stored encrypted, use env var in production)'),
  ('resend_audience_id', '""'::jsonb, 'Resend audience ID for newsletter'),
  
  -- Newsletter Configuration
  ('newsletter_enabled', 'true'::jsonb, 'Enable newsletter signup'),
  ('newsletter_double_optin', 'true'::jsonb, 'Require email verification before activating subscription'),
  ('newsletter_welcome_enabled', 'true'::jsonb, 'Send welcome email to new subscribers'),
  ('newsletter_frequency', '"weekly"'::jsonb, 'Newsletter frequency (daily, weekly, monthly)'),
  
  -- Content Settings
  ('content_articles_per_page', '20'::jsonb, 'Number of articles per page in listings'),
  ('content_videos_per_page', '12'::jsonb, 'Number of videos per page in listings'),
  ('content_related_count', '6'::jsonb, 'Number of related articles to show'),
  ('content_trending_count', '5'::jsonb, 'Number of trending articles to show'),
  ('content_latest_count', '8'::jsonb, 'Number of latest articles to show on homepage'),
  
  -- Performance & Caching
  ('cache_homepage_ttl', '300'::jsonb, 'Homepage cache TTL in seconds (5 minutes)'),
  ('cache_article_ttl', '3600'::jsonb, 'Article page cache TTL in seconds (1 hour)'),
  ('cache_category_ttl', '600'::jsonb, 'Category page cache TTL in seconds (10 minutes)'),
  
  -- Maintenance Mode
  ('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode (shows maintenance page to public)'),
  ('maintenance_message', '"We are currently performing maintenance. Please check back soon."'::jsonb, 'Message to show during maintenance'),
  ('maintenance_allowed_ips', '[]'::jsonb, 'IP addresses allowed to access site during maintenance (JSON array)')

ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Add helpful comments
COMMENT ON TABLE site_settings IS 'Comprehensive site configuration - all settings manageable via CMS without code deployment';

-- Create helper function to get setting value with type casting
CREATE OR REPLACE FUNCTION get_setting_text(setting_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT value #>> '{}' INTO result
  FROM site_settings
  WHERE key = setting_key;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_setting_boolean(setting_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT (value #>> '{}')::boolean INTO result
  FROM site_settings
  WHERE key = setting_key;
  
  RETURN COALESCE(result, false);
END;
$$;

CREATE OR REPLACE FUNCTION get_setting_integer(setting_key TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result INTEGER;
BEGIN
  SELECT (value #>> '{}')::integer INTO result
  FROM site_settings
  WHERE key = setting_key;
  
  RETURN COALESCE(result, 0);
END;
$$;

CREATE OR REPLACE FUNCTION get_setting_jsonb(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT value INTO result
  FROM site_settings
  WHERE key = setting_key;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Create helper function to update setting
CREATE OR REPLACE FUNCTION update_setting(
  setting_key TEXT,
  setting_value JSONB,
  user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE site_settings
  SET 
    value = setting_value,
    updated_by = user_id,
    updated_at = NOW()
  WHERE key = setting_key;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_setting_text(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_setting_boolean(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_setting_integer(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_setting_jsonb(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_setting(TEXT, JSONB, UUID) TO authenticated;

-- Comments on functions
COMMENT ON FUNCTION get_setting_text IS 'Get site setting value as text';
COMMENT ON FUNCTION get_setting_boolean IS 'Get site setting value as boolean';
COMMENT ON FUNCTION get_setting_integer IS 'Get site setting value as integer';
COMMENT ON FUNCTION get_setting_jsonb IS 'Get site setting value as JSONB';
COMMENT ON FUNCTION update_setting IS 'Update site setting value (admin only via RLS)';
