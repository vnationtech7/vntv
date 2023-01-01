-- Google AdSense and Advanced Advertising Settings
-- Adds AdSense configuration to existing site_settings table

-- Insert Google AdSense settings with default values
INSERT INTO site_settings (key, value, description) VALUES
  ('google_adsense', jsonb_build_object(
    'enabled', false,
    'publisher_id', '',
    'ad_client', '',
    'auto_ads_enabled', false,
    'slots', jsonb_build_object(
      'homepage_top', '',
      'homepage_sidebar', '',
      'article_top', '',
      'article_sidebar', '',
      'article_inline', ''
    )
  ), 'Google AdSense configuration including publisher ID and ad slot IDs'),
  ('ads_global_settings', jsonb_build_object(
    'custom_ads_enabled', true,
    'adsense_fallback_enabled', true,
    'show_ad_label', true
  ), 'Global advertising settings for custom ads and AdSense fallback behavior')
ON CONFLICT (key) DO NOTHING;

-- Comments
COMMENT ON TABLE site_settings IS 'Global site configuration including Google AdSense and advertising settings';

