-- Create separate storage bucket for advertisement images
-- Ads should NOT use the media library

-- Create the advertisements bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advertisements',
  'advertisements',
  true,
  2097152, -- 2MB limit for ad images
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for advertisements bucket

-- Allow authenticated users with advertising roles to upload
CREATE POLICY "Advertising managers can upload ad images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'advertisements' AND
  has_any_role(auth.uid(), ARRAY['super_admin', 'advertising_manager']::user_role[])
);

-- Allow authenticated users with advertising roles to update
CREATE POLICY "Advertising managers can update ad images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'advertisements' AND
  has_any_role(auth.uid(), ARRAY['super_admin', 'advertising_manager']::user_role[])
);

-- Allow authenticated users with advertising roles to delete
CREATE POLICY "Advertising managers can delete ad images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'advertisements' AND
  has_any_role(auth.uid(), ARRAY['super_admin', 'advertising_manager']::user_role[])
);

-- Allow public read access (needed for displaying ads)
CREATE POLICY "Anyone can view ad images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'advertisements');

-- Add image_path column to advertisements table
-- This stores the direct path to the uploaded image in the advertisements bucket
ALTER TABLE advertisements 
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add image dimensions columns for validation
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS image_width INTEGER,
ADD COLUMN IF NOT EXISTS image_height INTEGER;

-- Make image_id nullable (backward compatibility)
ALTER TABLE advertisements 
ALTER COLUMN image_id DROP NOT NULL;

-- Note: Removed strict check constraint temporarily to allow flexibility
-- Validation should be done in the application layer instead

-- Comments
COMMENT ON COLUMN advertisements.image_path IS 'Direct path to image in advertisements bucket (e.g., homepage_top/123456_banner.jpg)';
COMMENT ON COLUMN advertisements.image_width IS 'Width of uploaded image in pixels';
COMMENT ON COLUMN advertisements.image_height IS 'Height of uploaded image in pixels';
COMMENT ON COLUMN advertisements.image_id IS 'Legacy reference to media_assets table (backward compatibility)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS advertisements_image_path_idx ON advertisements(image_path) WHERE image_path IS NOT NULL;
