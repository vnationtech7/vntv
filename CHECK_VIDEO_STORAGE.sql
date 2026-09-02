-- Check uploaded video storage paths
SELECT 
  v.id,
  v.title,
  v.slug,
  v.source_type,
  v.source_url,
  v.video_type,
  v.status
FROM videos v
WHERE v.source_type = 'upload'
ORDER BY v.created_at DESC
LIMIT 10;

-- Check if video files exist in storage.objects
SELECT 
  o.name,
  o.bucket_id,
  o.id as storage_id,
  o.created_at,
  o.metadata
FROM storage.objects o
WHERE o.bucket_id = 'videos'
  AND o.name LIKE '%1787867684532%'
LIMIT 10;

-- Check all files in videos bucket (might be slow if many files)
-- SELECT 
--   o.name,
--   o.bucket_id,
--   o.created_at
-- FROM storage.objects o
-- WHERE o.bucket_id = 'videos'
-- ORDER BY o.created_at DESC
-- LIMIT 20;
