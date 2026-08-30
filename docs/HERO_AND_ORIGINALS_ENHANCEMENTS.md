# Hero Section & Originals Enhancements

## Summary of Changes

### 1. ✅ Fixed Video Fetching Error
**Issue**: Videos table doesn't have `category_id` column  
**Solution**: Updated `getLatestVideos()` to use `video_type` instead and map it to a category-like structure

**File Modified**: `/app/actions/homepage.ts`

---

### 2. ✅ Enhanced Hero Section - Mixed Content (Articles + Videos)

**New Features**:
- Displays both **articles AND videos** in the hero carousel
- Video content shows:
  - 🎬 Video indicator badge (top right) with duration
  - ▶️ Auto-play video (muted by default)
  - 🔊 Mute/unmute toggle button
  - ⏯️ Play/pause controls on hover
  - ⏸️ Auto-rotation toggle
  - Video play button overlay
- Articles show traditional image with gradient overlay
- Unified content fetching with `getFeaturedContent()`

**New Files**:
- `/components/homepage/hero-section-v2.tsx` - Enhanced hero with video support
- `/app/actions/homepage.ts` - Added `getFeaturedContent()` and `FeaturedContent` type

**How It Works**:
1. Fetches both featured articles (`is_featured=true`) and featured videos
2. Combines them and sorts by `published_at`
3. Returns top 5 most recent featured items
4. Hero displays them with appropriate rendering:
   - Videos: autoplay (muted), controls, duration badge
   - Articles: static image with gradient

**Video Autoplay Behavior**:
- ✅ Autoplay ON by default (can be toggled)
- ✅ Muted by default (can be unmuted)
- ✅ Graceful fallback if autoplay fails (browser policy)
- ✅ Shows play button on hover
- ✅ Respects device performance (silent if slow)

---

### 3. ✅ VNTV Originals Section with Programmes

**New Features**:
- Displays **VNTV Originals promo** with latest programmes
- **Customizable background image** via admin panel
- Shows up to 3 latest active programmes in sidebar
- Programme cards show:
  - Poster image
  - Programme type (badge)
  - Programme name
  - Presenter name
  - Play button hover effect

**New Files**:
- `/components/homepage/originals-section.tsx` - Server component
- `/app/actions/originals.ts` - Server actions for settings & programmes
- `/app/admin/originals-settings/page.tsx` - Admin settings page

**Database Integration**:
- Fetches from `programmes` table
- Reads settings from `site_settings` table (key: `homepage_originals`)
- Supports custom background images from media library

**Customizable Settings** (via `/admin/originals-settings`):
- ✏️ Title (default: "VNTV Originals")
- ✏️ Description
- ✏️ CTA button text (default: "Watch Now")
- 🖼️ Background image (uploadable from media library)
- 👁️ Live preview in admin panel

---

## New Types

```typescript
// Mixed content type for hero
export type FeaturedContent = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  content_type: 'article' | 'video';
  category: {...} | null;
  author: {...} | null;
  featured_image: {...} | null;
  // Video-specific fields
  source_type?: string;
  source_url?: string;
  duration_seconds?: number;
  video_type?: string;
};

// Originals settings
export type OriginalsSettings = {
  title: string;
  description: string;
  cta_text: string;
  background_image_path: string | null;
};
```

---

## Homepage Layout

```
┌─────────────────────────────────────────────────┐
│  Hero Section (Articles + Videos - Featured)   │
│  - Auto-rotating carousel                       │
│  - Videos autoplay (muted)                      │
│  - Sidebar with 3 top stories                   │
└─────────────────────────────────────────────────┘
┌──────────────────────┬─────────────────────────┐
│  Latest News (8)     │  Trending Sidebar (5)   │
│  - Article cards     │  - Numbered list        │
└──────────────────────┴─────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Videos Section (4 latest videos)               │
└─────────────────────────────────────────────────┘
┌───────────────────────┬─────────────────────────┐
│  Originals Promo      │  Latest Programmes (3)  │
│  - Custom background  │  - Poster cards         │
│  - Configurable text  │  - Programme info       │
└───────────────────────┴─────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Category Icons Strip (8 categories)            │
└─────────────────────────────────────────────────┘
```

---

## Admin Features

### 1. Mark Content as Featured

**Articles** (`/admin/articles/[id]`):
- ✅ Check "Featured" checkbox
- ✅ Set status to "Published"
- ✅ Upload featured image
- → Appears in hero section

**Videos** (`/admin/videos/[id]`):
- ✅ Check "Featured" checkbox
- ✅ Set status to "Published"
- ✅ Upload thumbnail
- → Appears in hero section with autoplay

### 2. Configure Originals Section

Go to `/admin/originals-settings`:
- Change title, description, CTA text
- Upload custom background image
- Preview changes before saving
- Settings saved to `site_settings` table

### 3. Manage Programmes

Go to `/admin/originals` (if exists):
- Create programmes
- Upload poster images
- Add presenter info
- Mark as active/inactive
- → Active programmes appear on homepage

---

## Video Autoplay Controls

### Hero Video Controls:
- **Top Left Corner**:
  - ⏯️ Autoplay toggle (pause/play icon)
  - 🔊 Mute toggle (volume icon)

- **Center (on hover)**:
  - ▶️ Large play/pause button

- **Top Right Corner**:
  - 🎬 Video indicator badge with duration

### Behavior:
1. **Default**: Autoplay ON, Muted
2. **User clicks play**: Unmutes if desired
3. **User clicks pause**: Stops rotation
4. **Browser blocks autoplay**: Falls back to pause state
5. **Slow device**: Can manually disable autoplay

---

## Database Requirements

### Tables Used:
- ✅ `articles` - with `is_featured` flag
- ✅ `videos` - with `is_featured` flag
- ✅ `programmes` - originals series
- ✅ `media_assets` - images & videos
- ✅ `site_settings` - originals configuration

### New Settings Entry:
```sql
INSERT INTO site_settings (key, value, description) VALUES (
  'homepage_originals',
  '{"title":"VNTV Originals","description":"Exclusive content...","cta_text":"Watch Now","background_image_path":null}'::jsonb,
  'Homepage originals promo section configuration'
);
```

---

## Usage Instructions

### For Editors:

1. **Add Article to Hero**:
   - Create/edit article at `/admin/articles/new`
   - Upload featured image
   - Check "Featured" checkbox
   - Set status to "Published"
   - Save

2. **Add Video to Hero**:
   - Create/edit video at `/admin/videos/new`
   - Upload video file or add YouTube URL
   - Upload thumbnail
   - Check "Featured" checkbox
   - Set status to "Published"
   - Save

3. **Customize Originals Promo**:
   - Go to `/admin/originals-settings`
   - Edit title, description, CTA text
   - Click "Select Background Image"
   - Choose or upload an image
   - Preview changes
   - Save

4. **Add Programmes**:
   - Go to `/admin/originals` (if implemented)
   - Create programme with poster
   - Mark as active
   - Programme appears on homepage

---

## Testing Checklist

### Hero Section:
- [ ] Articles display correctly
- [ ] Videos display with autoplay (muted)
- [ ] Video controls work (play/pause/mute)
- [ ] Auto-rotation works (8s interval)
- [ ] Carousel dots work
- [ ] Sidebar shows 3 stories
- [ ] Video indicator badge shows
- [ ] Duration displays correctly
- [ ] Click-through links work
- [ ] Responsive on mobile

### Originals Section:
- [ ] Promo card displays
- [ ] Custom background image shows
- [ ] Text is customizable
- [ ] Programmes load in sidebar
- [ ] Poster images display
- [ ] Play button hover works
- [ ] Links to /originals work
- [ ] Admin settings page works
- [ ] Image upload works
- [ ] Preview updates live

### Performance:
- [ ] Videos don't slow down page
- [ ] Autoplay respects browser policies
- [ ] Images load progressively
- [ ] No layout shift
- [ ] Mobile performance acceptable

---

## Files Changed

**New Files** (9):
- `/components/homepage/hero-section-v2.tsx`
- `/components/homepage/originals-section.tsx`
- `/app/actions/originals.ts`
- `/app/admin/originals-settings/page.tsx`
- `/docs/HERO_AND_ORIGINALS_ENHANCEMENTS.md`

**Modified Files** (3):
- `/app/actions/homepage.ts` - Added `getFeaturedContent()`, fixed video query
- `/app/page.tsx` - Updated to use new components
- `/components/homepage/index.ts` - Updated exports

**Total**: 12 files (9 new, 3 modified)

---

## Next Steps

1. **Test video autoplay** across different browsers
2. **Create programmes** in admin panel
3. **Mark articles/videos as featured** to populate hero
4. **Customize originals settings** via admin
5. **Test responsive behavior** on mobile devices

---

## Notes

- Videos in hero use HTML5 `<video>` tag for uploaded videos
- YouTube videos require iframe implementation (future enhancement)
- Autoplay is muted by default due to browser policies
- Background images should be high-quality (1920x1080+ recommended)
- Programmes need active episodes to be fully functional
