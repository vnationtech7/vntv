-- =====================================================
-- Test Likes Insert
-- Run this in Supabase SQL Editor to diagnose the issue
-- =====================================================

-- Step 1: Check if you're authenticated
SELECT 
  auth.uid() as your_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ Authenticated'
    ELSE '❌ Not authenticated - Sign in to Supabase dashboard'
  END as auth_status;

-- Step 2: Check if likes table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'likes'
) as likes_table_exists;

-- Step 3: Check current RLS policies on likes table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'likes'
ORDER BY cmd;

-- Step 4: Try to insert a test like (replace article ID with real one)
INSERT INTO likes (
  user_id,
  content_type,
  content_id,
  reaction_type
) VALUES (
  auth.uid(),
  'article',
  '234085ad-e138-4f69-ac1d-3283e2cc11b2',  -- Replace with real article ID
  'like'
)
ON CONFLICT (user_id, content_type, content_id) DO NOTHING
RETURNING *;

-- Step 5: Check if the like was inserted
SELECT COUNT(*) as your_likes_count
FROM likes
WHERE user_id = auth.uid();

-- Step 6: View your likes
SELECT 
  content_type,
  content_id,
  reaction_type,
  created_at
FROM likes
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- If Step 4 fails with RLS error, run this fix:
/*
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
*/
