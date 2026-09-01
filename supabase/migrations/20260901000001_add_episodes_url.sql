-- =====================================================
-- ADD URL FIELD TO EPISODES TABLE
-- =====================================================
-- Allow episodes to have a direct URL for external videos
-- This provides flexibility to either use video_id or url

ALTER TABLE episodes 
ADD COLUMN url TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN episodes.url IS 'Direct video URL (YouTube, Vimeo, etc.). Use this OR video_id, not both.';
