-- =====================================================
-- Migration: Add Type Column to Breaking News
-- Description: Support both breaking news and announcements
-- Date: 2026-09-01
-- =====================================================

-- Add type column
ALTER TABLE public.breaking_news 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'breaking' 
CHECK (type IN ('breaking', 'announcement'));

-- Update existing records to be 'breaking' type
UPDATE public.breaking_news 
SET type = 'breaking' 
WHERE type IS NULL;

-- Create index for type filtering
CREATE INDEX IF NOT EXISTS breaking_news_type_active_idx 
ON public.breaking_news(type, is_active, priority DESC, starts_at DESC)
WHERE is_active = true;

-- =====================================================
-- UPDATE HELPER FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS get_active_breaking_news();

CREATE OR REPLACE FUNCTION get_active_breaking_news()
RETURNS TABLE (
  id UUID,
  headline_override TEXT,
  article_id UUID,
  link_url TEXT,
  type TEXT,
  priority INTEGER,
  starts_at TIMESTAMPTZ
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id,
    headline_override,
    article_id,
    link_url,
    type,
    priority,
    starts_at
  FROM breaking_news
  WHERE is_active = true
    AND starts_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY priority DESC, starts_at DESC
  LIMIT 20;
$$;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION get_active_breaking_news() TO public;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN public.breaking_news.type IS 'Type of alert: breaking (news) or announcement';
