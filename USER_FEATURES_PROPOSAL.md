# User Profile Features - Proposal

**Date:** September 1, 2026  
**Status:** Planning / Future Implementation  
**Priority:** Medium-High

---

## Overview

Currently, the user profile page only includes basic settings (name, email, password, avatar, newsletter subscription). This document proposes 10 user experience features to enhance engagement and personalization.

---

## Proposed User Features

### 1. Watch History 📺
**Priority:** HIGH

**Description:**  
Track all videos and articles a user has viewed, allowing them to revisit content easily.

**Features:**
- Chronological list of watched videos
- Article reading history
- Last viewed timestamp
- Resume from where you left off
- Clear individual items or entire history
- Filter by content type (video, article, shorts)

**Database Schema:**
```sql
CREATE TABLE user_watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'video', 'article', 'episode'
  content_id UUID NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_seconds INTEGER DEFAULT 0, -- For videos
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, content_type, content_id)
);
```

**UI Location:**
- `/settings/history` - Dedicated history page
- Profile dropdown - "Watch History" link

---

### 2. Watch Later / Save for Later 🔖
**Priority:** HIGH

**Description:**  
Allow users to bookmark content to watch or read later.

**Features:**
- One-click save button on all content
- Organized saved list in profile
- Sort by: date saved, content type, category
- Bulk actions (remove all, mark as read)
- Notifications when saved content has updates

**Database Schema:**
```sql
CREATE TABLE user_saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'video', 'article', 'episode', 'programme'
  content_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- Optional user notes
  UNIQUE(user_id, content_type, content_id)
);
```

**UI Location:**
- `/settings/saved` - Saved content page
- Floating "Save" button on content pages
- Collections/folders for organization

---

### 3. Resume Video Playback ▶️
**Priority:** HIGH

**Description:**  
Automatically resume videos from where the user left off.

**Features:**
- Track playback position for each video
- "Continue Watching" section on homepage
- Resume prompt when returning to a video
- Works across devices (if logged in)
- Clear progress option

**Implementation:**
- Store progress in `user_watch_history.progress_seconds`
- Update every 10 seconds during playback
- Show progress bar on video thumbnails
- Auto-resume when clicking video again

**UI Location:**
- Homepage - "Continue Watching" carousel
- `/settings/history` - Resume points visible
- Video player - "Resume from [timestamp]" prompt

---

### 4. Reading List 📚
**Priority:** MEDIUM

**Description:**  
Curated reading list separate from generic "saved" content, focused on articles.

**Features:**
- Add articles to reading list
- Mark as read/unread
- Estimated reading time
- Export reading list (PDF, email)
- Offline reading mode (PWA)
- Reading streaks and stats

**Database Schema:**
```sql
CREATE TABLE user_reading_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal', -- 'high', 'normal', 'low'
  UNIQUE(user_id, article_id)
);
```

**UI Location:**
- `/settings/reading-list` - Dedicated reading list page
- Article pages - "Add to Reading List" button

---

### 5. Personalized Recommendations 🎯
**Priority:** MEDIUM

**Description:**  
AI-powered content recommendations based on viewing/reading history.

**Features:**
- "Recommended for You" section
- Based on watch history, saved content, categories
- Similar content suggestions
- Trending in your interests
- Weekly digest email of recommendations

**Algorithm Factors:**
- Categories of content viewed
- Time spent on content
- Content completion rate
- Explicit preferences (follow topics)
- Social signals (shares, likes)

**UI Location:**
- Homepage - "Recommended for You" section
- `/settings/recommendations` - Manage preferences
- Email - Weekly personalized digest

---

### 6. Follow Topics & Categories 🏷️
**Priority:** MEDIUM

**Description:**  
Allow users to follow specific categories, topics, or tags to get personalized feeds.

**Features:**
- Follow/unfollow categories (Ghana, Politics, Sports, etc.)
- Follow specific tags
- Custom feed based on followed topics
- Notifications for new content in followed topics
- Manage all follows in one place

**Database Schema:**
```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  follow_type TEXT NOT NULL, -- 'category', 'tag', 'author', 'programme'
  follow_id UUID NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, follow_type, follow_id)
);
```

**UI Location:**
- `/settings/following` - Manage all follows
- Category pages - "Follow" button
- Tag pages - "Follow" button
- Profile - "My Feed" tab

---

### 7. Viewing Preferences ⚙️
**Priority:** LOW-MEDIUM

**Description:**  
Granular control over content viewing experience.

**Features:**
- **Video Settings:**
  - Auto-play next video (on/off)
  - Default playback quality
  - Autoplay on page load
  - Captions/subtitles default
  - Playback speed preference
  
- **Article Settings:**
  - Font size preference
  - Reading mode (serif/sans-serif)
  - Line spacing
  - Content width (narrow/wide)
  
- **Feed Settings:**
  - Content density (compact/comfortable/spacious)
  - Show/hide content types
  - Default sort order

**Database Schema:**
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  video_autoplay BOOLEAN DEFAULT TRUE,
  video_quality TEXT DEFAULT 'auto',
  article_font_size TEXT DEFAULT 'medium',
  article_font_family TEXT DEFAULT 'sans-serif',
  feed_density TEXT DEFAULT 'comfortable',
  preferences JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**UI Location:**
- `/settings/preferences` - Dedicated preferences page

---

### 8. Activity Stats & Analytics 📊
**Priority:** LOW

**Description:**  
Show users their engagement statistics and activity insights.

**Features:**
- Total watch time
- Articles read this month
- Favorite categories (most viewed)
- Activity calendar (GitHub-style)
- Streaks (consecutive days active)
- Personal milestones and badges
- Export personal data

**Metrics Tracked:**
- Videos watched (count, duration)
- Articles read (count, time spent)
- Most active time of day
- Most viewed categories
- Completion rate
- Shares and social engagement

**UI Location:**
- `/settings/activity` - Stats dashboard
- Profile page - Activity summary widget

---

### 9. Playlists & Collections 📂
**Priority:** MEDIUM

**Description:**  
Create custom playlists of videos or collections of articles.

**Features:**
- Create named playlists/collections
- Add videos or articles to multiple playlists
- Public or private playlists
- Share playlists with others
- Collaborative playlists (optional)
- Sort and reorder items
- Playlist artwork/thumbnail

**Database Schema:**
```sql
CREATE TABLE user_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES user_playlists(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, content_type, content_id)
);
```

**UI Location:**
- `/settings/playlists` - Manage all playlists
- `/playlists/[id]` - View playlist
- Content pages - "Add to Playlist" button

---

### 10. Notifications & Alerts 🔔
**Priority:** MEDIUM

**Description:**  
In-app and email notifications for personalized content updates.

**Features:**
- **Notification Types:**
  - New content in followed topics
  - Breaking news alerts
  - Video upload from followed programmes
  - Comment replies (if comments enabled)
  - Newsletter reminders
  - Weekly digest
  
- **Notification Settings:**
  - Toggle each notification type
  - Choose delivery method (in-app, email, both)
  - Set quiet hours
  - Frequency control (instant, daily digest, weekly)

**Database Schema:**
```sql
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_content', 'breaking_news', 'reply', etc.
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  breaking_news BOOLEAN DEFAULT TRUE,
  new_content_in_topics BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}'::jsonb
);
```

**UI Location:**
- Header - Notification bell icon with badge
- `/settings/notifications` - Notification center
- `/settings/notifications/preferences` - Settings

---

## Implementation Priority

### Phase 1: Core Engagement (High Priority)
1. ✅ Watch History
2. ✅ Watch Later / Save for Later
3. ✅ Resume Video Playback

### Phase 2: Personalization (Medium Priority)
4. ⏳ Reading List
5. ⏳ Follow Topics & Categories
6. ⏳ Playlists & Collections
7. ⏳ Notifications & Alerts

### Phase 3: Enhancement (Low Priority)
8. ⏳ Personalized Recommendations
9. ⏳ Viewing Preferences
10. ⏳ Activity Stats & Analytics

---

## Technical Considerations

### Performance
- Index all foreign keys and frequently queried columns
- Use pagination for history and saved content lists
- Cache user preferences in localStorage
- Lazy load recommendation algorithms

### Privacy
- Give users full control over data
- Export/download personal data option
- Clear history/data options
- GDPR compliance
- Privacy-focused analytics

### Scalability
- Use JSONB for flexible preference storage
- Consider separate microservice for recommendations
- Queue system for notifications
- Efficient database queries with proper indexes

### Security
- RLS policies for all user data tables
- User can only access their own data
- Audit logging for sensitive operations
- Rate limiting for API endpoints

---

## Database Migrations Needed

1. `user_watch_history` table
2. `user_saved_content` table
3. `user_reading_list` table
4. `user_follows` table
5. `user_preferences` table
6. `user_playlists` and `playlist_items` tables
7. `user_notifications` and `notification_preferences` tables
8. Indexes for performance
9. RLS policies for security

---

## UI/UX Requirements

### New Pages Required
- `/settings/history` - Watch/read history
- `/settings/saved` - Saved content
- `/settings/reading-list` - Reading list
- `/settings/following` - Followed topics
- `/settings/preferences` - Viewing preferences
- `/settings/activity` - Activity stats
- `/settings/playlists` - Manage playlists
- `/settings/notifications` - Notification center
- `/playlists/[id]` - Public playlist view

### Profile Navigation Updates
- Add tabs or sidebar menu for all sections
- Better organization of settings
- Visual indicators for new notifications
- Quick actions (save, follow) on content cards

### Content Cards Updates
- Add "Save" button
- Add "Add to Playlist" menu
- Show progress bar for in-progress videos
- Show "Saved" indicator
- Show "Following" badge on categories

---

## Analytics & Tracking

### User Engagement Metrics
- Feature adoption rate
- Most used features
- Time spent in profile sections
- Save/follow conversion rates
- Playlist creation rate
- Notification open rates

### Content Performance
- Most saved content
- Most completed videos
- Most added to playlists
- Highest engagement categories

---

## Success Metrics

### Engagement
- ↑ Session duration
- ↑ Pages per session
- ↑ Return visitor rate
- ↑ Content completion rate

### Retention
- ↑ Weekly active users
- ↑ Monthly active users
- ↓ Bounce rate
- ↑ Average session frequency

### Personalization
- ↑ Recommended content click-through rate
- ↑ Followed topics/categories
- ↑ Saved content
- ↑ Playlist creation

---

## Future Enhancements (Beyond Phase 3)

1. **Social Features**
   - Follow other users
   - Share playlists
   - Activity feed
   - User profiles

2. **Advanced Recommendations**
   - ML-based content suggestions
   - Collaborative filtering
   - A/B testing recommendation algorithms

3. **Offline Mode**
   - Download videos/articles for offline viewing
   - Sync when back online
   - PWA capabilities

4. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Better offline experience

5. **Gamification**
   - Badges and achievements
   - Reading/watching streaks
   - Leaderboards
   - Points system

---

## Estimated Development Time

### Phase 1 (Core Engagement)
- Watch History: 2-3 days
- Save for Later: 2 days
- Resume Playback: 2-3 days
- **Total: 1-1.5 weeks**

### Phase 2 (Personalization)
- Reading List: 1-2 days
- Follow Topics: 2-3 days
- Playlists: 3-4 days
- Notifications: 3-4 days
- **Total: 2-2.5 weeks**

### Phase 3 (Enhancement)
- Recommendations: 4-5 days
- Viewing Preferences: 2 days
- Activity Stats: 2-3 days
- **Total: 1.5-2 weeks**

**Grand Total: 4.5-6 weeks for all features**

---

## Conclusion

These 10 user features will significantly enhance the VNTV user experience, increasing engagement, retention, and personalization. Starting with Phase 1 (core engagement features) will provide immediate value to users while building a foundation for more advanced features in later phases.

---

**Document Created:** September 1, 2026  
**Next Steps:**  
1. Review and prioritize features
2. Design UI mockups for new pages
3. Create database migrations
4. Implement Phase 1 features
5. Test and gather user feedback
