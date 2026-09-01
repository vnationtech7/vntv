-- =====================================================
-- MILESTONE 17: Audit Log Performance Indexes
-- =====================================================
-- Created: September 1, 2026
-- Purpose: Add indexes for audit log queries and performance

-- Audit logs indexes for filtering and searching
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS audit_logs_entity_id_idx ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Composite index for common query patterns (user + date range)
CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx ON audit_logs(user_id, created_at DESC);

-- Composite index for entity lookup (type + id + date)
CREATE INDEX IF NOT EXISTS audit_logs_entity_created_idx ON audit_logs(entity_type, entity_id, created_at DESC);

-- Additional performance indexes for frequently queried tables

-- Articles: status + published_at for filtering published articles
CREATE INDEX IF NOT EXISTS articles_status_published_idx ON articles(status, published_at DESC) WHERE status = 'published';

-- Articles: is_featured + published_at for featured content queries  
CREATE INDEX IF NOT EXISTS articles_featured_published_idx ON articles(is_featured, published_at DESC) WHERE is_featured = true;

-- Articles: category_id + status + published_at for category pages
CREATE INDEX IF NOT EXISTS articles_category_status_published_idx ON articles(category_id, status, published_at DESC);

-- Videos: status + published_at for filtering published videos
CREATE INDEX IF NOT EXISTS videos_status_published_idx ON videos(status, published_at DESC) WHERE status = 'published';

-- RSS items: feed_id + published_at for feed-specific queries
CREATE INDEX IF NOT EXISTS rss_items_feed_published_idx ON rss_items(feed_id, published_at DESC);

-- Article views: article_id + viewed_at for trending calculations
CREATE INDEX IF NOT EXISTS article_views_article_viewed_idx ON article_views(article_id, viewed_at DESC);

-- Video events: video_id + event_type + created_at for analytics
CREATE INDEX IF NOT EXISTS video_events_video_event_created_idx ON video_events(video_id, event_type, created_at DESC);

-- Social shares: content_type + content_id + shared_at for trending calculations
CREATE INDEX IF NOT EXISTS social_shares_content_shared_idx ON social_shares(content_type, content_id, shared_at DESC);

-- Breaking news: is_active + priority for active breaking news queries
CREATE INDEX IF NOT EXISTS breaking_news_active_priority_idx ON breaking_news(is_active, priority DESC, created_at DESC) WHERE is_active = true;

-- Homepage sections: is_enabled + display_order for homepage rendering
CREATE INDEX IF NOT EXISTS homepage_sections_enabled_order_idx ON homepage_sections(is_enabled, display_order) WHERE is_enabled = true;

COMMENT ON INDEX audit_logs_user_id_idx IS 'Filter audit logs by user';
COMMENT ON INDEX audit_logs_action_idx IS 'Filter audit logs by action type';
COMMENT ON INDEX audit_logs_entity_type_idx IS 'Filter audit logs by resource type';
COMMENT ON INDEX audit_logs_created_at_idx IS 'Sort audit logs by date (most recent first)';
COMMENT ON INDEX audit_logs_user_created_idx IS 'Query user activity over time';
COMMENT ON INDEX audit_logs_entity_created_idx IS 'Track changes to specific entities';
