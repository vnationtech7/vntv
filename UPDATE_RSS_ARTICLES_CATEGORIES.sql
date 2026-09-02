-- =====================================================
-- Update Articles Created from RSS Items
-- Assign categories to articles based on their RSS feed
-- =====================================================

-- Step 1: Check the current state
-- See how many RSS-converted articles have no category
SELECT 
  COUNT(*) as total_rss_articles,
  COUNT(a.category_id) as articles_with_category,
  COUNT(*) - COUNT(a.category_id) as articles_without_category
FROM articles a
WHERE a.source_name = 'RSS Feed' 
   OR a.author_id = (SELECT id FROM authors WHERE slug = 'rss-feed');

-- Step 2: See which RSS feeds have articles
SELECT 
  f.name as feed_name,
  c.name as feed_category,
  COUNT(i.id) as total_items,
  COUNT(i.article_id) as converted_articles,
  COUNT(a.id) FILTER (WHERE a.category_id IS NULL) as articles_without_category
FROM rss_feeds f
LEFT JOIN categories c ON f.category_id = c.id
LEFT JOIN rss_items i ON i.feed_id = f.id
LEFT JOIN articles a ON i.article_id = a.id
GROUP BY f.id, f.name, c.name
ORDER BY total_items DESC;

-- Step 3: Update articles with category from their RSS feed
-- This updates all existing RSS-converted articles
UPDATE articles a
SET category_id = f.category_id
FROM rss_items i
JOIN rss_feeds f ON i.feed_id = f.id
WHERE a.id = i.article_id
  AND a.category_id IS NULL  -- Only update if no category set
  AND f.category_id IS NOT NULL;  -- Only if feed has category

-- Step 4: Verify the update
SELECT 
  c.name as category,
  COUNT(a.id) as article_count
FROM articles a
JOIN categories c ON a.category_id = c.id
WHERE a.source_name = 'RSS Feed'
   OR a.author_id = (SELECT id FROM authors WHERE slug = 'rss-feed')
GROUP BY c.id, c.name
ORDER BY article_count DESC;

-- Step 5: Check if any RSS articles still have no category
SELECT 
  a.id,
  a.title,
  a.slug,
  f.name as feed_name,
  f.category_id as feed_has_category
FROM articles a
JOIN rss_items i ON i.article_id = a.id
JOIN rss_feeds f ON i.feed_id = f.id
WHERE a.category_id IS NULL
LIMIT 20;

-- Step 6: Summary
SELECT 
  'RSS Articles' as type,
  COUNT(*) as total,
  COUNT(a.category_id) as with_category,
  COUNT(*) - COUNT(a.category_id) as without_category,
  ROUND(100.0 * COUNT(a.category_id) / NULLIF(COUNT(*), 0), 1) as percentage_categorized
FROM articles a
WHERE a.source_name = 'RSS Feed'
   OR a.author_id = (SELECT id FROM authors WHERE slug = 'rss-feed');
