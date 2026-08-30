-- Add management policies for programmes and episodes
-- This allows editors and admins to create, update, and delete programmes/episodes

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Editors can manage programmes" ON programmes;
DROP POLICY IF EXISTS "Editors can manage episodes" ON episodes;

-- Editors can manage programmes
CREATE POLICY "Editors can manage programmes"
  ON programmes FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));

-- Editors can manage episodes
CREATE POLICY "Editors can manage episodes"
  ON episodes FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['super_admin', 'editor', 'video_editor']::user_role[]));
