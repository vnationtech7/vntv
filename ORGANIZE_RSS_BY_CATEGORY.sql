-- =====================================================
-- Organize RSS Feeds by Category
-- Maps each RSS feed to its appropriate category
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Step 1: Get category IDs for reference
-- Run this first to see the category IDs
SELECT id, name, slug FROM categories 
WHERE slug IN ('ghana', 'nigeria', 'africa', 'world', 'politics', 'business', 'entertainment', 'sports', 'viral', 'opinion')
ORDER BY name;

-- Step 2: Update Nigeria RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'nigeria')
WHERE name IN (
  'Vanguard Nigeria',
  'The Guardian Nigeria',
  'Premium Times',
  'P.M. News',
  'Daily Post Nigeria',
  'Channels Television',
  'Leadership Nigeria',
  'Ripples Nigeria',
  'THEWILL Nigeria',
  'Sahara Reporters',
  'PUNCH Nigeria',
  'The Nation Nigeria',
  'Information Nigeria',
  'Legit.ng',
  'Daily Trust'
);

-- Step 3: Update Ghana RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'ghana')
WHERE name IN (
  'MyJoyOnline',
  'Citi Newsroom',
  'Citi Newsroom Business',
  'Citi Newsroom Sports',
  'Modern Ghana'
);

-- Step 4: Update Africa RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'africa')
WHERE name IN (
  'Africanews',
  'BBC Africa',
  'AllAfrica',
  'RFI Africa',
  'AllAfrica Nigeria'
);

-- Step 5: Update World/International RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'world')
WHERE name IN (
  'NBC News',
  'CBS News',
  'NPR News',
  'New York Times',
  'PBS NewsHour',
  'BBC World',
  'New York Times World'
);

-- Step 6: Update Business RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'business')
WHERE name IN (
  'BBC Business',
  'TechCrunch',
  'WIRED',
  'The Verge',
  'Engadget',
  'Ars Technica',
  'BBC Science',
  'BBC Technology'
);

-- Step 7: Update Sports RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'sports')
WHERE name IN (
  'BBC Sport',
  'BBC Football',
  'ESPN',
  'Sky Sports',
  'ESPN Soccer'
);

-- Step 8: Update Entertainment RSS Feeds
UPDATE rss_feeds 
SET category_id = (SELECT id FROM categories WHERE slug = 'entertainment')
WHERE name IN (
  'Variety',
  'Deadline',
  'The Hollywood Reporter',
  'TMZ',
  'Page Six'
);

-- Step 9: Verify the updates
-- Check how many feeds are now organized by category
SELECT 
  c.name as category_name,
  c.slug as category_slug,
  COUNT(r.id) as feed_count,
  ARRAY_AGG(r.name ORDER BY r.name) as feed_names
FROM categories c
LEFT JOIN rss_feeds r ON r.category_id = c.id
WHERE c.slug IN ('ghana', 'nigeria', 'africa', 'world', 'politics', 'business', 'entertainment', 'sports')
GROUP BY c.id, c.name, c.slug
ORDER BY feed_count DESC, c.name;

-- Step 10: Check for any unmapped feeds
SELECT 
  id,
  name,
  url,
  category_id,
  is_enabled
FROM rss_feeds
WHERE category_id IS NULL
ORDER BY name;

-- Step 11: Summary statistics
SELECT 
  'Total RSS Feeds' as metric,
  COUNT(*) as count
FROM rss_feeds
UNION ALL
SELECT 
  'Feeds with Category' as metric,
  COUNT(*) as count
FROM rss_feeds
WHERE category_id IS NOT NULL
UNION ALL
SELECT 
  'Feeds without Category' as metric,
  COUNT(*) as count
FROM rss_feeds
WHERE category_id IS NULL
UNION ALL
SELECT 
  'Enabled Feeds' as metric,
  COUNT(*) as count
FROM rss_feeds
WHERE is_enabled = true;
