-- =====================================================
-- RSS TABLES RLS POLICIES
-- =====================================================

-- Enable RLS on RSS tables
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_import_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RSS FEEDS POLICIES
-- =====================================================

-- Public: Read enabled feeds
CREATE POLICY "rss_feeds_public_read"
ON rss_feeds FOR SELECT
TO public
USING (is_enabled = true);

-- Authenticated: Read all feeds
CREATE POLICY "rss_feeds_authenticated_read"
ON rss_feeds FOR SELECT
TO authenticated
USING (true);

-- Editors and Admins: Manage feeds
CREATE POLICY "rss_feeds_editors_insert"
ON rss_feeds FOR INSERT
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
);

CREATE POLICY "rss_feeds_editors_update"
ON rss_feeds FOR UPDATE
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
);

CREATE POLICY "rss_feeds_admins_delete"
ON rss_feeds FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- =====================================================
-- RSS ITEMS POLICIES
-- =====================================================

-- Authenticated: Read all items
CREATE POLICY "rss_items_authenticated_read"
ON rss_items FOR SELECT
TO authenticated
USING (true);

-- System/Service: Insert items (for ingestion engine)
CREATE POLICY "rss_items_service_insert"
ON rss_items FOR INSERT
TO authenticated
WITH CHECK (true); -- Will be used by service role during ingestion

-- Editors: Update items (for review workflow)
CREATE POLICY "rss_items_editors_update"
ON rss_items FOR UPDATE
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
);

-- Editors: Delete items
CREATE POLICY "rss_items_editors_delete"
ON rss_items FOR DELETE
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
);

-- =====================================================
-- RSS IMPORT LOGS POLICIES
-- =====================================================

-- Authenticated: Read logs
CREATE POLICY "rss_import_logs_authenticated_read"
ON rss_import_logs FOR SELECT
TO authenticated
USING (true);

-- System/Service: Create logs (for ingestion engine)
CREATE POLICY "rss_import_logs_service_insert"
ON rss_import_logs FOR INSERT
TO authenticated
WITH CHECK (true); -- Will be used by service role during ingestion

-- Service: Update logs (for completing imports)
CREATE POLICY "rss_import_logs_service_update"
ON rss_import_logs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admins: Delete old logs
CREATE POLICY "rss_import_logs_admins_delete"
ON rss_import_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- RSS Feeds indexes
CREATE INDEX IF NOT EXISTS idx_rss_feeds_enabled ON rss_feeds(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_rss_feeds_category ON rss_feeds(category_id);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_last_fetched ON rss_feeds(last_fetched_at);

-- RSS Items indexes
CREATE INDEX IF NOT EXISTS idx_rss_items_feed ON rss_items(feed_id);
CREATE INDEX IF NOT EXISTS idx_rss_items_status ON rss_items(status);
CREATE INDEX IF NOT EXISTS idx_rss_items_guid ON rss_items(feed_id, guid);
CREATE INDEX IF NOT EXISTS idx_rss_items_hash ON rss_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_rss_items_fetched ON rss_items(fetched_at DESC);

-- RSS Import Logs indexes
CREATE INDEX IF NOT EXISTS idx_rss_import_logs_feed ON rss_import_logs(feed_id);
CREATE INDEX IF NOT EXISTS idx_rss_import_logs_started ON rss_import_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_rss_import_logs_status ON rss_import_logs(status);
