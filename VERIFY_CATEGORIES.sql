-- Check if all navigation categories exist
SELECT 
  id,
  name,
  slug,
  description,
  parent_id
FROM categories
WHERE slug IN (
  'ghana', 'nigeria', 'africa', 'world', 
  'politics', 'business', 'entertainment', 'sports',
  'viral', 'opinion'
)
ORDER BY name;

-- If any are missing, create them:
-- INSERT INTO categories (name, slug, description, display_order)
-- VALUES 
--   ('Ghana', 'ghana', 'News and stories from Ghana', 1),
--   ('Nigeria', 'nigeria', 'News and stories from Nigeria', 2),
--   ('Africa', 'africa', 'Pan-African news and stories', 3),
--   ('World', 'world', 'International news and global affairs', 4),
--   ('Politics', 'politics', 'Political news and analysis', 5),
--   ('Business', 'business', 'Business, economy and finance news', 6),
--   ('Entertainment', 'entertainment', 'Entertainment, celebrity and lifestyle news', 7),
--   ('Sports', 'sports', 'Sports news and coverage', 8),
--   ('Viral', 'viral', 'Trending and viral stories', 9),
--   ('Opinion', 'opinion', 'Opinion pieces and commentary', 10)
-- ON CONFLICT (slug) DO NOTHING;
