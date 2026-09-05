-- =====================================================
-- QUICK FIX: All RLS Policies for Comments & Likes
-- Run this directly in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- FIX COMMENTS RLS
-- =====================================================

-- Drop existing comments INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Create simpler comments INSERT policy
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'approved')
    AND depth >= 0 
    AND depth <= 3
  );

-- =====================================================
-- FIX LIKES RLS
-- =====================================================

-- Drop existing likes INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;

-- Create simpler likes INSERT policy
CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Drop existing likes DELETE policy
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

-- Create simpler likes DELETE policy
CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- =====================================================
-- FIX COMMENT LIKES RLS
-- =====================================================

-- Drop existing comment_likes INSERT policy
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;

-- Create simpler comment_likes INSERT policy
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Drop existing comment_likes DELETE policy
DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;

-- Create simpler comment_likes DELETE policy
CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check all policies
SELECT 
  tablename, 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('comments', 'likes', 'comment_likes')
ORDER BY tablename, cmd;

-- Test authentication
SELECT 
  auth.uid() as your_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'You are authenticated ✅'
    ELSE 'Not authenticated ❌'
  END as status;
