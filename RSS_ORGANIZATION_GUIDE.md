# RSS Feeds Organization by Category 📰

**Date:** September 2, 2026  
**Status:** Ready to Apply  
**Impact:** Data-only update, no code changes

---

## 🎯 What This Does

Organizes all 50 RSS feeds into their appropriate categories (Ghana, Nigeria, Africa, World, Business, Sports, Entertainment) by setting the `category_id` field in the `rss_feeds` table.

---

## ✅ Safe to Run

**Why it's safe:**
- ✅ Only updates existing data
- ✅ No schema changes
- ✅ No code modifications
- ✅ No route changes
- ✅ Idempotent (can run multiple times safely)
- ✅ Doesn't affect RSS ingestion
- ✅ Doesn't break existing functionality

---

## 📊 Feed Distribution by Category

### 🇳🇬 Nigeria (15 feeds)
1. Vanguard Nigeria
2. The Guardian Nigeria
3. Premium Times
4. P.M. News
5. Daily Post Nigeria
6. Channels Television
7. Leadership Nigeria
8. Ripples Nigeria
9. THEWILL Nigeria
10. Sahara Reporters
11. PUNCH Nigeria
12. The Nation Nigeria
13. Information Nigeria
14. Legit.ng
15. Daily Trust

### 🇬🇭 Ghana (5 feeds)
1. MyJoyOnline
2. Citi Newsroom
3. Citi Newsroom Business
4. Citi Newsroom Sports
5. Modern Ghana

### 🌍 Africa (5 feeds)
1. Africanews
2. BBC Africa
3. AllAfrica
4. RFI Africa
5. AllAfrica Nigeria

### 🌐 World (7 feeds)
1. NBC News
2. CBS News
3. NPR News
4. New York Times
5. PBS NewsHour
6. BBC World
7. New York Times World

### 💼 Business (8 feeds)
Includes Technology & Science feeds:
1. BBC Business
2. TechCrunch
3. WIRED
4. The Verge
5. Engadget
6. Ars Technica
7. BBC Science
8. BBC Technology

### ⚽ Sports (5 feeds)
1. BBC Sport
2. BBC Football
3. ESPN
4. Sky Sports
5. ESPN Soccer

### 🎬 Entertainment (5 feeds)
1. Variety
2. Deadline
3. The Hollywood Reporter
4. TMZ
5. Page Six

---

## 🚀 How to Apply

### Step 1: Backup (Optional but Recommended)
```sql
-- Create a backup of current state
CREATE TABLE rss_feeds_backup AS 
SELECT * FROM rss_feeds;
```

### Step 2: Run the Organization Script
```sql
-- Copy and paste from ORGANIZE_RSS_BY_CATEGORY.sql
-- Or run in Supabase SQL Editor
```

### Step 3: Verify Results
The script automatically shows:
- Feeds organized by category
- Count per category
- Any unmapped feeds
- Summary statistics

---

## 📋 What Happens After

### Immediate Benefits:
1. **Better Organization** - Feeds grouped by topic
2. **Easier Management** - Filter feeds by category in admin
3. **Improved Discovery** - Users find relevant RSS content
4. **Category Pages** - RSS items appear in correct category pages

### Future Enhancements (Optional):
1. **Admin Dashboard** - Group feeds by category
2. **Selective Ingestion** - Enable/disable categories
3. **Category RSS Feeds** - Generate category-specific RSS feeds
4. **Analytics** - Track feed performance by category

---

## 🔍 Verification Queries

### Check Feed Distribution
```sql
SELECT 
  c.name as category,
  COUNT(r.id) as feeds,
  STRING_AGG(r.name, ', ' ORDER BY r.name) as feed_names
FROM categories c
LEFT JOIN rss_feeds r ON r.category_id = c.id
GROUP BY c.name
ORDER BY feeds DESC;
```

### Check Unmapped Feeds
```sql
SELECT name, url 
FROM rss_feeds 
WHERE category_id IS NULL;
```

### Check Feed Status
```sql
SELECT 
  c.name as category,
  COUNT(r.id) FILTER (WHERE r.is_enabled = true) as enabled_feeds,
  COUNT(r.id) FILTER (WHERE r.is_enabled = false) as disabled_feeds
FROM categories c
LEFT JOIN rss_feeds r ON r.category_id = c.id
GROUP BY c.name
ORDER BY enabled_feeds DESC;
```

---

## 🔄 Rollback (If Needed)

If you created a backup and want to rollback:

```sql
-- Restore from backup
UPDATE rss_feeds 
SET category_id = b.category_id
FROM rss_feeds_backup b
WHERE rss_feeds.id = b.id;

-- Or full restore
DROP TABLE rss_feeds;
ALTER TABLE rss_feeds_backup RENAME TO rss_feeds;
```

---

## 💡 Usage Examples

### Admin: View Feeds by Category
```sql
SELECT 
  f.name,
  f.url,
  f.is_enabled,
  f.last_fetched_at,
  c.name as category
FROM rss_feeds f
JOIN categories c ON f.category_id = c.id
WHERE c.slug = 'nigeria'
ORDER BY f.name;
```

### Get RSS Items by Category
```sql
SELECT 
  i.title,
  i.published_at,
  f.name as feed_name,
  c.name as category
FROM rss_items i
JOIN rss_feeds f ON i.feed_id = f.id
JOIN categories c ON f.category_id = c.id
WHERE c.slug = 'sports'
  AND i.status = 'approved'
ORDER BY i.published_at DESC
LIMIT 20;
```

### Category RSS Feed Count
```sql
SELECT 
  c.name,
  COUNT(DISTINCT f.id) as total_feeds,
  COUNT(i.id) as total_items,
  COUNT(i.id) FILTER (WHERE i.status = 'approved') as approved_items
FROM categories c
LEFT JOIN rss_feeds f ON f.category_id = c.id
LEFT JOIN rss_items i ON i.feed_id = f.id
GROUP BY c.id, c.name
ORDER BY total_feeds DESC;
```

---

## 🎨 Future Admin UI Features

With categories organized, you can build:

### 1. Category Filter in Admin
```typescript
// In admin RSS feeds page
<select onChange={filterByCategory}>
  <option value="">All Categories</option>
  <option value="nigeria">Nigeria</option>
  <option value="ghana">Ghana</option>
  <option value="africa">Africa</option>
  <option value="world">World</option>
  <option value="business">Business</option>
  <option value="sports">Sports</option>
  <option value="entertainment">Entertainment</option>
</select>
```

### 2. Category Statistics Dashboard
```
Nigeria:    15 feeds  | 1,234 items | 89% approval rate
Ghana:       5 feeds  |   456 items | 92% approval rate
Africa:      5 feeds  |   789 items | 85% approval rate
World:       7 feeds  |   234 items | 78% approval rate
Business:    8 feeds  |   567 items | 81% approval rate
Sports:      5 feeds  |   890 items | 95% approval rate
Entertainment: 5 feeds | 345 items | 88% approval rate
```

### 3. Bulk Category Actions
```typescript
// Enable/disable all feeds in a category
UPDATE rss_feeds 
SET is_enabled = true 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'sports');
```

---

## 📈 Expected Results

After running the script:

```
✅ 50 RSS feeds total
✅ 50 feeds organized (100%)
✅ 0 unmapped feeds
✅ 7 active categories
✅ No structural changes
✅ No broken functionality
```

---

## 🚨 Important Notes

1. **Feeds Match by Name** - The script matches feeds by their exact names from `RSS_FEEDS.md`
2. **Case Sensitive** - Feed names must match exactly
3. **New Feeds** - Future feeds can be assigned categories on creation
4. **Manual Assignment** - Admin can change categories anytime via admin panel
5. **No Auto-Categorization** - RSS items don't automatically inherit category (they're linked via feed)

---

## ✅ Ready to Run

**File:** `ORGANIZE_RSS_BY_CATEGORY.sql`

**Steps:**
1. Open Supabase SQL Editor
2. Copy contents of `ORGANIZE_RSS_BY_CATEGORY.sql`
3. Paste and run
4. Review verification results
5. Done! ✨

**Time:** < 1 second  
**Risk:** Very low (data-only update)  
**Rollback:** Easy (restore from backup)

---

## 🎉 Benefits

After organization:
- ✅ RSS feeds grouped logically
- ✅ Easier admin management
- ✅ Better content discovery
- ✅ Category-specific filtering
- ✅ Improved analytics potential
- ✅ Foundation for future features

---

**Status:** Ready to apply  
**Next:** Run the SQL script in Supabase
