-- =====================================================
-- QUICK FIX: Comments RLS Policy
-- Run this directly in Supabase SQL Editor
-- =====================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Create a simpler policy
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'approved')
    AND depth >= 0 
    AND depth <= 3
  );

-- Test: Try this query to see if it works now
-- SELECT auth.uid(); -- Should return your user ID

-- If you see your user ID above, the policy should work now
