-- Create homepage_items table for managing featured content in homepage sections
CREATE TABLE IF NOT EXISTS homepage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'rss', 'programme')),
  content_id UUID NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  custom_headline TEXT,
  custom_excerpt TEXT,
  custom_image_url TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT homepage_items_unique_content UNIQUE (section_id, content_type, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_homepage_items_section ON homepage_items(section_id);
CREATE INDEX idx_homepage_items_content ON homepage_items(content_type, content_id);
CREATE INDEX idx_homepage_items_active_pinned ON homepage_items(is_active, is_pinned, display_order);
CREATE INDEX idx_homepage_items_section_active_order ON homepage_items(section_id, is_active, is_pinned DESC, display_order);
CREATE INDEX idx_homepage_items_time_range ON homepage_items(start_time, end_time) WHERE start_time IS NOT NULL OR end_time IS NOT NULL;

-- Create updated_at trigger
CREATE TRIGGER update_homepage_items_updated_at
  BEFORE UPDATE ON homepage_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE homepage_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public: Can view active items within time range
CREATE POLICY "Public can view active homepage items"
  ON homepage_items
  FOR SELECT
  USING (
    is_active = true
    AND (start_time IS NULL OR start_time <= NOW())
    AND (end_time IS NULL OR end_time > NOW())
  );

-- Authenticated: Can view all items
CREATE POLICY "Authenticated users can view all homepage items"
  ON homepage_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Editors and admins can create items
CREATE POLICY "Editors can create homepage items"
  ON homepage_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- Editors and admins can update items
CREATE POLICY "Editors can update homepage items"
  ON homepage_items
  FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  )
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- Editors and admins can delete items
CREATE POLICY "Editors can delete homepage items"
  ON homepage_items
  FOR DELETE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['super_admin', 'editor']::user_role[])
  );

-- Helper function to get items for a section
CREATE OR REPLACE FUNCTION get_homepage_section_items(p_section_id UUID, p_limit INTEGER DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  section_id UUID,
  content_type TEXT,
  content_id UUID,
  display_order INTEGER,
  is_pinned BOOLEAN,
  custom_headline TEXT,
  custom_excerpt TEXT,
  custom_image_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    id,
    section_id,
    content_type,
    content_id,
    display_order,
    is_pinned,
    custom_headline,
    custom_excerpt,
    custom_image_url,
    created_at
  FROM homepage_items
  WHERE 
    section_id = p_section_id
    AND is_active = true
    AND (start_time IS NULL OR start_time <= NOW())
    AND (end_time IS NULL OR end_time > NOW())
  ORDER BY 
    is_pinned DESC,
    display_order ASC,
    created_at DESC
  LIMIT p_limit;
$$;

-- Helper function to check if content is already featured in a section
CREATE OR REPLACE FUNCTION is_content_in_section(
  p_section_id UUID,
  p_content_type TEXT,
  p_content_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM homepage_items
    WHERE 
      section_id = p_section_id
      AND content_type = p_content_type
      AND content_id = p_content_id
      AND is_active = true
  );
$$;

-- Function to automatically reorder items after insert/update/delete
CREATE OR REPLACE FUNCTION reorder_homepage_items()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_section_id UUID;
BEGIN
  -- Determine which section to reorder
  IF TG_OP = 'DELETE' THEN
    v_section_id := OLD.section_id;
  ELSE
    v_section_id := NEW.section_id;
  END IF;

  -- Reorder all items in the section
  WITH ordered_items AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        ORDER BY 
          is_pinned DESC,
          display_order ASC,
          created_at DESC
      ) * 10 AS new_order
    FROM homepage_items
    WHERE section_id = v_section_id
  )
  UPDATE homepage_items
  SET display_order = ordered_items.new_order
  FROM ordered_items
  WHERE homepage_items.id = ordered_items.id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for auto-reordering (optional, can be disabled if manual ordering is preferred)
-- CREATE TRIGGER homepage_items_auto_reorder
--   AFTER INSERT OR UPDATE OR DELETE ON homepage_items
--   FOR EACH ROW
--   EXECUTE FUNCTION reorder_homepage_items();

-- Comment on table
COMMENT ON TABLE homepage_items IS 'Maps content (articles, videos, etc.) to homepage sections with custom display options and scheduling';

COMMENT ON COLUMN homepage_items.is_pinned IS 'Pinned items always appear first in their section regardless of display_order';
COMMENT ON COLUMN homepage_items.custom_headline IS 'Override the original content headline for this section';
COMMENT ON COLUMN homepage_items.custom_excerpt IS 'Override the original content excerpt for this section';
COMMENT ON COLUMN homepage_items.custom_image_url IS 'Override the original content image for this section';
COMMENT ON COLUMN homepage_items.start_time IS 'When this item should start appearing (NULL = immediately)';
COMMENT ON COLUMN homepage_items.end_time IS 'When this item should stop appearing (NULL = never expires)';
