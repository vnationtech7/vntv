-- Create video_analytics table for tracking video events
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'start', 'progress_25', 'progress_50', 'progress_75', 'complete', 'gate_shown', 'gate_authenticated'
  event_data JSONB, -- Additional data about the event
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Browser session identifier
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX idx_video_analytics_event_type ON video_analytics(event_type);
CREATE INDEX idx_video_analytics_created_at ON video_analytics(created_at);
CREATE INDEX idx_video_analytics_user_id ON video_analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_video_analytics_session_id ON video_analytics(session_id);

-- Enable Row Level Security
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert analytics events (both authenticated and anonymous)
CREATE POLICY "Anyone can insert video analytics"
  ON video_analytics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Only authenticated users can view their own analytics
CREATE POLICY "Users can view their own video analytics"
  ON video_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all analytics (assuming you have an admin role)
-- CREATE POLICY "Admins can view all video analytics"
--   ON video_analytics
--   FOR SELECT
--   TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to increment video view count (if not already exists)
CREATE OR REPLACE FUNCTION increment_video_view(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_video_view(UUID) TO authenticated, anon;

-- Add comment to table
COMMENT ON TABLE video_analytics IS 'Tracks video playback events for analytics and engagement metrics';
