-- =====================================================
-- Migration: Breaking News System Enhancement
-- Description: Add link_url column to existing breaking_news table
-- Date: 2026-08-29
-- Note: Table already exists with columns: headline_override, starts_at, expires_at
-- =====================================================

-- Add link_url column if it doesn't exist (for custom external links)
ALTER TABLE public.breaking_news 
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Update indexes to match current column names (starts_at, expires_at)
DROP INDEX IF EXISTS breaking_news_active_idx;
DROP INDEX IF EXISTS breaking_news_start_time_idx;
DROP INDEX IF EXISTS breaking_news_starts_at_idx;

CREATE INDEX IF NOT EXISTS breaking_news_active_idx 
  ON public.breaking_news(is_active, starts_at, expires_at) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS breaking_news_priority_idx 
  ON public.breaking_news(priority DESC);

CREATE INDEX IF NOT EXISTS breaking_news_article_idx 
  ON public.breaking_news(article_id);

CREATE INDEX IF NOT EXISTS breaking_news_starts_at_idx 
  ON public.breaking_news(starts_at DESC);

-- =====================================================
-- HELPER FUNCTION: Get Active Breaking News
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_breaking_news()
RETURNS TABLE (
  id UUID,
  headline_override TEXT,
  article_id UUID,
  link_url TEXT,
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
    priority,
    starts_at
  FROM breaking_news
  WHERE is_active = true
    AND starts_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY priority DESC, starts_at DESC
  LIMIT 10;
$$;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION get_active_breaking_news() TO public;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN public.breaking_news.link_url IS 'Custom URL (used if article_id is null)';
