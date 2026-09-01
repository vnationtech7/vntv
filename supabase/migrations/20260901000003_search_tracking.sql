-- Search query tracking table
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_search_queries_query ON search_queries(query);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX idx_search_queries_user_id ON search_queries(user_id) WHERE user_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert search queries
CREATE POLICY "Anyone can insert search queries"
  ON search_queries
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Users can view their own searches
CREATE POLICY "Users can view their own searches"
  ON search_queries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE search_queries IS 'Tracks search queries for analytics and content discovery insights';
