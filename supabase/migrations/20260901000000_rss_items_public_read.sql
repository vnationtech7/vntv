-- =====================================================
-- RSS ITEMS PUBLIC READ POLICY
-- =====================================================
-- Allow public users to read approved RSS items
-- This is needed for the public RSS feeds page

CREATE POLICY "rss_items_public_read"
ON rss_items FOR SELECT
TO public
USING (status = 'approved' AND published_at IS NOT NULL);
