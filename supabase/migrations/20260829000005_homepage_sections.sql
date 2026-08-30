-- =====================================================
-- Migration: Homepage Sections Enhancement
-- Description: Add missing columns to existing homepage_sections table
-- Date: 2026-08-29
-- Note: Table already exists with: name, section_type, display_order, is_enabled, configuration
-- =====================================================

-- Add new columns if they don't exist
ALTER TABLE public.homepage_sections 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_homepage_sections_slug ON homepage_sections(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_homepage_sections_category ON homepage_sections(category_id) WHERE category_id IS NOT NULL;

-- Ensure existing indexes exist
CREATE INDEX IF NOT EXISTS idx_homepage_sections_enabled_order ON homepage_sections(is_enabled, display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);

-- Enable RLS if not already enabled
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Public can view enabled homepage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Authenticated users can view all homepage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Editors can create homepage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Editors can update homepage sections" ON homepage_sections;
DROP POLICY IF EXISTS "Admins can delete homepage sections" ON homepage_sections;

-- RLS Policies
CREATE POLICY "Public can view enabled homepage sections"
  ON homepage_sections
  FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Authenticated users can view all homepage sections"
  ON homepage_sections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can create homepage sections"
  ON homepage_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

CREATE POLICY "Editors can update homepage sections"
  ON homepage_sections
  FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  )
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

CREATE POLICY "Admins can delete homepage sections"
  ON homepage_sections
  FOR DELETE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin']::user_role[])
  );

-- Helper function to get enabled sections
CREATE OR REPLACE FUNCTION get_enabled_homepage_sections()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  section_type TEXT,
  category_id UUID,
  display_order INTEGER,
  is_enabled BOOLEAN,
  configuration JSONB
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    id,
    name,
    slug,
    description,
    section_type,
    category_id,
    display_order,
    is_enabled,
    configuration
  FROM homepage_sections
  WHERE is_enabled = true
  ORDER BY display_order ASC, created_at ASC;
$$;

-- Comment on table
COMMENT ON TABLE homepage_sections IS 'Manages dynamic sections displayed on the homepage';
COMMENT ON COLUMN homepage_sections.configuration IS 'JSONB field for section-specific settings (max_items, layout_style, show_images, etc.)';
