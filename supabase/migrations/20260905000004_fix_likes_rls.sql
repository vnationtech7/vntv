-- =====================================================
-- Fix Likes RLS Policy
-- Migration: 20260905000004
-- Description: Simplify RLS policy for creating likes
-- =====================================================

-- Drop the existing restrictive policy for INSERT
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;

-- Create a simpler policy for INSERT
CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be authenticated (checked by TO authenticated)
    -- User ID must match the authenticated user
    auth.uid() = user_id
  );

-- Also fix the DELETE policy if needed
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'likes' 
ORDER BY cmd;
