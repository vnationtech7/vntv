# Supabase Storage Setup Guide

## Issue
The application is trying to upload media files to a Supabase Storage bucket named "media", but this bucket doesn't exist yet.

## Solution

### Option 1: Create the bucket via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://natnvyrukhheaaksfaug.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `media`
   - **Public bucket**: ✅ **Enable** (so images can be publicly accessed)
   - **File size limit**: 10 MB (optional, matches your app limit)
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`
5. Click **"Create bucket"**

### Option 2: Create via SQL (Alternative)

Run this SQL in the Supabase SQL Editor:

```sql
-- Create the media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,  -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Set up storage policies for the media bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all media
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');
```

## Additional Buckets Needed

You may also need a `videos` bucket for video content:

```sql
-- Create the videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600,  -- 100MB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Add similar policies for videos bucket
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');
```

## Verify Bucket Exists

After creating the bucket, verify it exists by going to:
https://natnvyrukhheaaksfaug.supabase.co/storage/v1/bucket/media

You should see a JSON response with bucket details, not a 404 error.

## Test Upload

1. Go to your app: http://localhost:3001
2. Navigate to Admin → Articles → Edit any article
3. Click "Select Featured Image"
4. Click "Upload New"
5. Select an image file and upload

If successful, you'll see the image appear in your media library!

## Storage Structure

The app stores media files in this folder structure:
```
media/
  └── {user_id}/
      └── {year}/
          └── {month}/
              └── {timestamp}-{filename}
```

Example:
```
media/
  └── b29cfd42-81bc-4cbe-853e-e638126e53f4/
      └── 2026/
          └── 08/
              └── 1787888089006-my-image.png
```

## Security Notes

1. The bucket is **public** for read access, meaning anyone can view uploaded images via URL
2. Only **authenticated users** can upload files
3. Users can only **update/delete their own files** (organized by user_id folder)
4. This is standard for a CMS where images need to be publicly visible

## Troubleshooting

### Still getting "Bucket not found" error?
- Clear your browser cache and reload
- Check that you're using the correct Supabase project URL in `.env.local`
- Verify you're authenticated (logged in) when uploading
- Check browser console for detailed error messages

### Files upload but don't appear?
- Check that the `media_assets` table exists in your database
- Verify the database insertion succeeds after file upload
- Check the `createMediaAsset` server action for errors

### Can't access uploaded files?
- Verify the bucket is set to "public"
- Check that the public read policy exists
- Try accessing the file directly via the storage URL
