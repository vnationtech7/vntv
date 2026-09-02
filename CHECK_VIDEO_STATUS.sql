-- Check the video details and status
SELECT 
  id,
  title,
  slug,
  source_type,
  source_url,
  status,
  published_at,
  video_type,
  thumbnail_id
FROM videos
WHERE slug = 'the-convor-never-saw-me-coming';

-- If status is not 'published', update it:
-- UPDATE videos 
-- SET status = 'published'
-- WHERE slug = 'the-convor-never-saw-me-coming';
