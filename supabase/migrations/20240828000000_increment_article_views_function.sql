-- Create function to increment article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_article_views(UUID) TO authenticated, anon;
