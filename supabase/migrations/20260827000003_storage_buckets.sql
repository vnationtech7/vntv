-- =====================================================
-- VNTV Storage Buckets and Policies
-- Migration: 20260827000003
-- Description: Create storage buckets for media, videos, and configure RLS
-- =====================================================

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Media bucket (images, documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Videos bucket (video files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  524288000, -- 500MB
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Thumbnails bucket (video thumbnails, optimized images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  2097152, -- 2MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (user profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - MEDIA BUCKET
-- =====================================================

-- Public read access for media
CREATE POLICY "Public media read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE POLICIES - VIDEOS BUCKET
-- =====================================================

-- Public read access for videos
CREATE POLICY "Public videos read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Authenticated users can upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own videos
CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE POLICIES - THUMBNAILS BUCKET
-- =====================================================

-- Public read access for thumbnails
CREATE POLICY "Public thumbnails read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Authenticated users can upload thumbnails
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own thumbnails
CREATE POLICY "Users can update own thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own thumbnails
CREATE POLICY "Users can delete own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE POLICIES - AVATARS BUCKET
-- =====================================================

-- Public read access for avatars
CREATE POLICY "Public avatars read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get public URL for storage object
CREATE OR REPLACE FUNCTION get_storage_public_url(bucket_name text, object_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url text;
BEGIN
  -- Get the Supabase project URL from settings
  SELECT current_setting('app.settings.supabase_url', true) INTO project_url;
  
  IF project_url IS NULL THEN
    project_url := 'https://natnvyrukhheaaksfaug.supabase.co';
  END IF;
  
  RETURN project_url || '/storage/v1/object/public/' || bucket_name || '/' || object_path;
END;
$$;

-- Function to generate signed URL for private storage object
CREATE OR REPLACE FUNCTION get_storage_signed_url(bucket_name text, object_path text, expires_in_seconds integer DEFAULT 3600)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder. In production, use Supabase client SDK to generate signed URLs
  -- The actual signed URL generation requires service role key which should not be in database
  RETURN get_storage_public_url(bucket_name, object_path);
END;
$$;

-- =====================================================
-- STORAGE PATH STRUCTURE
-- =====================================================

-- Storage paths follow this structure:
-- media: {user_id}/{year}/{month}/{filename}
-- videos: {user_id}/{year}/{month}/{filename}
-- thumbnails: {user_id}/video-thumbnails/{video_id}/{filename}
-- avatars: {user_id}/avatar.{ext}

-- Examples:
-- media/f47ac10b-58cc-4372-a567-0e02b2c3d479/2026/08/article-image.jpg
-- videos/f47ac10b-58cc-4372-a567-0e02b2c3d479/2026/08/news-report.mp4
-- thumbnails/f47ac10b-58cc-4372-a567-0e02b2c3d479/video-thumbnails/abc123/thumb.jpg
-- avatars/f47ac10b-58cc-4372-a567-0e02b2c3d479/avatar.webp

-- =====================================================
-- NOTES
-- =====================================================

-- 1. File Size Limits:
--    - Media (images/docs): 10MB
--    - Videos: 500MB
--    - Thumbnails: 2MB
--    - Avatars: 2MB

-- 2. Security:
--    - All buckets have public read access
--    - Users can only upload/modify/delete their own files
--    - Files are organized by user_id to enforce ownership

-- 3. MIME Types:
--    - Media: JPEG, PNG, GIF, WebP, SVG, PDF
--    - Videos: MP4, WebM, QuickTime, AVI
--    - Thumbnails: JPEG, PNG, WebP (optimized)
--    - Avatars: JPEG, PNG, WebP (optimized)

-- 4. CDN:
--    - Supabase Storage includes CDN by default
--    - Public URLs are automatically CDN-accelerated
--    - No additional CDN configuration needed for MVP

-- 5. Migration:
--    - Run this migration after initial schema
--    - Buckets are idempotent (ON CONFLICT DO NOTHING)
--    - Safe to re-run if needed
