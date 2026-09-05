-- =====================================================
-- Fix Comments RLS Policy
-- Migration: 20260905000003
-- Description: Simplify RLS policy for creating comments
-- =====================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Create a simpler policy that just checks authentication
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be authenticated (checked by TO authenticated)
    -- User ID must match the authenticated user
    auth.uid() = user_id
    -- Status must be pending or approved (not rejected or deleted)
    AND status IN ('pending', 'approved')
    -- Depth must be valid
    AND depth >= 0 
    AND depth <= 3
  );

-- Verify the policy was created
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'comments' AND cmd = 'INSERT';
