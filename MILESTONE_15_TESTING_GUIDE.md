# Milestone 15: Analytics & Engagement Tracking - Testing Guide

## ✅ Testing Checklist

### 1. Article View Tracking

**What to Test:**
- Article views are tracked automatically on page load
- View count increments only once per 24 hours per user
- Cookie-based deduplication works

**Steps:**
```bash
1. Visit any article page: http://localhost:3000/news/[any-article-slug]
2. Open browser DevTools → Application → Cookies
3. Look for cookie: viewed_[article-id]
4. Refresh the page multiple times
5. Verify view count only increments once (check database or wait for trending to update)
```

**Expected Behavior:**
- ✅ Cookie `viewed_[article-id]` is set with 24h expiry
- ✅ View count in `articles.view_count` increments by 1
- ✅ Entry created in `article_views` table with user_id, ip_address, viewed_at
- ✅ Subsequent refreshes do NOT increment count (cookie prevents duplicate)

**Database Verification:**
```sql
-- Check article view count
SELECT id, title, view_count FROM articles WHERE slug = 'your-article-slug';

-- Check article_views table
SELECT * FROM article_views 
WHERE article_id = 'your-article-id' 
ORDER BY viewed_at DESC 
LIMIT 10;
```

---

### 2. Video Event Tracking

**What to Test:**
- Video views are tracked on page load
- Video progress events (25%, 50%, 75%, 100%) are tracked
- Gate shown/authenticated events are tracked

**Steps:**
```bash
1. Visit any video page: http://localhost:3000/video/[any-video-slug]
2. Check browser console for tracking messages
3. Play the video and watch progress
4. Check database for video_analytics entries
```

**Expected Behavior:**
- ✅ `view` event tracked on page load
- ✅ Cookie `video_viewed_[video-id]` prevents duplicate view counts
- ✅ Video view count increments in `videos.view_count`
- ✅ Events recorded in `video_analytics` table
- ✅ Progress events tracked as playback continues

**Database Verification:**
```sql
-- Check video view count
SELECT id, title, view_count FROM videos WHERE slug = 'your-video-slug';

-- Check video_analytics table
SELECT event_type, COUNT(*) as count 
FROM video_analytics 
WHERE video_id = 'your-video-id' 
GROUP BY event_type;

-- View detailed events
SELECT * FROM video_analytics 
WHERE video_id = 'your-video-id' 
ORDER BY created_at DESC 
LIMIT 20;
```

---

### 3. Search Query Tracking

**What to Test:**
- Search queries are tracked when users search
- Results count is recorded
- User ID captured if authenticated

**Steps:**
```bash
1. Go to homepage: http://localhost:3000
2. Click search icon in header
3. Enter search query: "test search"
4. Press Enter or click search
5. Check database for search_queries entry
```

**Expected Behavior:**
- ✅ Entry created in `search_queries` table
- ✅ Query text stored (trimmed)
- ✅ Results count recorded
- ✅ User ID captured if logged in
- ✅ IP address recorded
- ✅ Timestamp recorded

**Database Verification:**
```sql
-- Check search queries
SELECT * FROM search_queries 
ORDER BY created_at DESC 
LIMIT 20;

-- Top searches
SELECT query, COUNT(*) as search_count 
FROM search_queries 
GROUP BY query 
ORDER BY search_count DESC 
LIMIT 10;
```

**API Test:**
```bash
# Test search tracking API directly
curl -X POST http://localhost:3000/api/track/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "resultsCount": 5}'

# Expected: {"success":true}
```

---

### 4. Social Share Tracking

**What to Test:**
- Shares are tracked when users click share buttons
- Platform is recorded (WhatsApp, Facebook, X, LinkedIn, copy)
- Content type and ID are captured

**Steps:**
```bash
1. Visit any article: http://localhost:3000/news/[article-slug]
2. Scroll to share buttons section
3. Click any share button (WhatsApp, Facebook, X, LinkedIn, Copy Link)
4. Check database for social_shares entry
```

**Expected Behavior:**
- ✅ Entry created in `social_shares` table
- ✅ Platform recorded correctly
- ✅ Content type = 'article' or 'video'
- ✅ Content ID matches article/video ID
- ✅ User ID captured if logged in
- ✅ IP address recorded

**Database Verification:**
```sql
-- Check recent shares
SELECT * FROM social_shares 
ORDER BY shared_at DESC 
LIMIT 20;

-- Shares by platform
SELECT platform, COUNT(*) as share_count 
FROM social_shares 
GROUP BY platform 
ORDER BY share_count DESC;

-- Shares by content type
SELECT content_type, COUNT(*) as share_count 
FROM social_shares 
GROUP BY content_type;
```

**API Test:**
```bash
# Test share tracking API directly
curl -X POST http://localhost:3000/api/track-share \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "article",
    "contentId": "your-article-id",
    "platform": "whatsapp"
  }'

# Expected: {"success":true}
```

---

### 5. Analytics Dashboard

**What to Test:**
- Dashboard loads without errors
- All tabs display data
- Time range filter works
- Data is accurate

**Steps:**
```bash
1. Login as admin
2. Go to: http://localhost:3000/admin/analytics
3. Verify summary cards show numbers
4. Click through all tabs: Trending, Top Content, Categories, Authors, Engagement
5. Change time range filters (Today, Week, Month, All Time)
6. Verify data updates
```

**Expected Behavior:**
- ✅ Summary cards display correct counts
- ✅ Trending tab shows articles with scores
- ✅ Top Content tab shows articles and videos
- ✅ Categories tab shows progress bars
- ✅ Authors tab shows progress bars
- ✅ Engagement tab shows searches and shares
- ✅ Time filter updates all data
- ✅ No console errors

**Check These Metrics:**
- Article Views (should match article_views count)
- Video Views (should match video_analytics view events)
- Social Shares (should match social_shares count)
- Searches (should match search_queries count)

---

### 6. Trending Algorithm

**What to Test:**
- Homepage shows trending articles
- Trending sidebar updates based on algorithm
- Score calculation is correct
- Recent + popular articles rank high

**Steps:**
```bash
1. Go to homepage: http://localhost:3000
2. Check "TRENDING NOW" sidebar (desktop) or section (mobile)
3. Verify articles are ranked 1-10
4. Check scores in admin dashboard: /admin/analytics → Trending tab
```

**Algorithm Verification:**
```sql
-- Manually calculate trending score for an article
SELECT 
  a.id,
  a.title,
  a.view_count,
  COUNT(s.id) as share_count,
  a.published_at,
  -- Score calculation:
  -- views * 0.7 + shares * 10 * 0.2 + recency * 0.1
  (a.view_count * 0.7) + (COUNT(s.id) * 10 * 0.2) as view_share_score
FROM articles a
LEFT JOIN social_shares s ON s.content_id = a.id AND s.content_type = 'article'
WHERE a.status = 'published'
  AND a.published_at > NOW() - INTERVAL '7 days'
  AND a.view_count > 0
GROUP BY a.id
ORDER BY view_share_score DESC
LIMIT 10;
```

**Expected Behavior:**
- ✅ Top 10 trending articles displayed
- ✅ Newer articles with moderate views rank above older viral content
- ✅ Articles with shares rank higher than same-view articles without shares
- ✅ Scores update as views/shares increase

---

### 7. Data Integrity

**What to Test:**
- No duplicate tracking entries
- Timestamps are correct
- Foreign keys are valid
- RLS policies work correctly

**Database Checks:**
```sql
-- Check for orphaned article_views (article deleted but views remain)
SELECT COUNT(*) FROM article_views av
WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = av.article_id);
-- Should return 0

-- Check for orphaned video_analytics
SELECT COUNT(*) FROM video_analytics va
WHERE NOT EXISTS (SELECT 1 FROM videos v WHERE v.id = va.video_id);
-- Should return 0

-- Check for orphaned social_shares
SELECT COUNT(*) FROM social_shares s
WHERE s.content_type = 'article' 
  AND NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = s.content_id);
-- Should return 0

-- Verify timestamps are recent (not in future, not too old)
SELECT 
  'article_views' as table_name,
  MIN(viewed_at) as oldest,
  MAX(viewed_at) as newest
FROM article_views
UNION ALL
SELECT 
  'video_analytics',
  MIN(created_at),
  MAX(created_at)
FROM video_analytics
UNION ALL
SELECT 
  'social_shares',
  MIN(shared_at),
  MAX(shared_at)
FROM social_shares
UNION ALL
SELECT 
  'search_queries',
  MIN(created_at),
  MAX(created_at)
FROM search_queries;
```

---

## 🧪 Manual Testing Scenarios

### Scenario 1: New Article Publication
```
1. Publish a new article in CMS
2. Visit the article page → view count = 1
3. Share on WhatsApp → share count = 1
4. Wait 5 minutes, check homepage trending sidebar
5. Article should appear if it ranks in top 10
```

### Scenario 2: Trending Score Evolution
```
Day 1: Article published, 10 views → Score = 7 (views) + 0 (shares) + 1 (recency) = 8
Day 2: 20 views, 2 shares → Score = 14 + 4 + 0.9 = 18.9 (ranks higher)
Day 7: 100 views, 5 shares → Score = 70 + 10 + 0.1 = 80.1 (still trending)
Day 8: Older than 7 days → Not in trending (excluded)
```

### Scenario 3: Anonymous vs Authenticated Tracking
```
Anonymous User:
- Views tracked with IP address only
- Shares tracked with IP address only
- Searches tracked with IP address only

Authenticated User:
- Views tracked with user_id + IP
- Shares tracked with user_id + IP
- Searches tracked with user_id + IP
```

---

## 🐛 Common Issues & Fixes

### Issue: View count not incrementing
**Cause:** Cookie already set from previous visit
**Fix:** Clear cookies or use Incognito mode

### Issue: Video analytics not tracking
**Cause:** VideoAnalyticsTracker component not rendered
**Fix:** Verify component is in video page template

### Issue: Trending section empty
**Cause:** No articles in last 7 days with views > 0
**Fix:** Publish recent articles and view them to generate data

### Issue: Dashboard shows 0 for all metrics
**Cause:** No data in tracking tables
**Fix:** Generate test data by browsing site, sharing content, searching

### Issue: Search tracking fails silently
**Cause:** API route error (check server logs)
**Fix:** Verify migration ran: `search_queries` table exists

---

## 📊 Performance Checks

### Query Performance
```sql
-- These should execute in <100ms
EXPLAIN ANALYZE 
SELECT * FROM article_views 
WHERE article_id = 'some-uuid' 
ORDER BY viewed_at DESC 
LIMIT 10;

EXPLAIN ANALYZE
SELECT * FROM social_shares 
WHERE content_type = 'article' 
  AND content_id = 'some-uuid';

-- Check index usage
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('article_views', 'video_analytics', 'social_shares', 'search_queries');
```

### Expected Indexes:
- ✅ `article_views`: article_id, viewed_at, user_id
- ✅ `video_analytics`: video_id, event_type, created_at, user_id, session_id
- ✅ `social_shares`: content_id, shared_at
- ✅ `search_queries`: query, created_at, user_id

---

## ✅ Final Verification Checklist

Before considering M15 complete:

- [ ] Article views tracked on all article pages
- [ ] Video views tracked on all video pages
- [ ] Search queries tracked when users search
- [ ] Social shares tracked on all platforms
- [ ] Analytics dashboard loads without errors
- [ ] All dashboard tabs display data
- [ ] Time range filters work correctly
- [ ] Trending algorithm ranks articles correctly
- [ ] Homepage trending section displays
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Database queries are fast (<100ms)
- [ ] RLS policies allow tracking inserts
- [ ] Migrations applied successfully

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Run migration: `20260901000003_search_tracking.sql`
- [ ] Verify all indexes created
- [ ] Test RLS policies with different user roles
- [ ] Set up database monitoring for tracking tables
- [ ] Configure retention policy (e.g., delete views >90 days old)
- [ ] Test analytics dashboard with production data
- [ ] Verify trending algorithm with real traffic
- [ ] Set up alerts for tracking failures
- [ ] Document analytics access for team

---

## 📈 Monitoring Recommendations

**Track These Metrics:**
- Daily article views
- Daily video views
- Daily searches
- Daily shares
- Trending algorithm execution time
- Dashboard load time

**Set Up Alerts For:**
- No tracking data for >1 hour
- Dashboard errors
- Slow queries (>1 second)
- Failed tracking API calls

---

**Testing Status:** Ready for testing
**Last Updated:** January 1, 2025
**Milestone:** 15 - Analytics & Engagement Tracking
