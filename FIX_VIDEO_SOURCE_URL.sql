-- Step 1: Check current source_url values for uploaded videos
SELECT 
  id,
  title,
  source_type,
  source_url,
  video_type
FROM videos
WHERE source_type = 'upload'
ORDER BY created_at DESC;

-- Step 2: Fix source_url - Add "videos/" prefix if missing
UPDATE videos
SET source_url = 'videos/' || source_url
WHERE source_type = 'upload'
  AND source_url NOT LIKE 'videos/%'
  AND source_url NOT LIKE 'http%';

-- Step 3: Verify the fix
SELECT 
  id,
  title,
  source_url
FROM videos
WHERE source_type = 'upload'
ORDER BY created_at DESC;
