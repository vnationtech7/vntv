-- =====================================================
-- Enable Auto-Approve for Comments
-- Migration: 20260905000002
-- Description: Set comments to auto-approve (appear immediately)
-- =====================================================

-- Update auto_approve_comments setting to true
UPDATE site_settings 
SET value = 'true'::jsonb 
WHERE key = 'auto_approve_comments';

-- Also approve any existing pending comments (optional)
-- Uncomment the line below if you want to approve all pending comments
-- UPDATE comments SET status = 'approved' WHERE status = 'pending';

-- Verify the setting
SELECT key, value, description 
FROM site_settings 
WHERE key = 'auto_approve_comments';
