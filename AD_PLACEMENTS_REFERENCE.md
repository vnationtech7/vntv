# Ad Placements Reference Guide

## ✅ Complete & Verified - All placements are correct

Last Updated: August 31, 2026

---

## How It Works

### Key Concept: `placement` vs `key`
- **`placement`**: Standard value from AD_PLACEMENTS constants (used for matching)
- **`key`**: User-defined identifier (can be anything, just needs to be unique)

**When creating an ad slot:**
- `name`: Human-readable (e.g., "Home Top Banner")
- `key`: Unique identifier (e.g., "home", "banner_1") - user's choice
- **`placement`: MUST be one of the values below** (this is what matches to components)

---

## Available Placements

### 📱 Homepage Placements

| Placement | Dimensions | Ratio | Component |
|-----------|------------|-------|-----------|
| `homepage_top` | 1200×225px | 16:3 | `<HomepageTopBanner />` |
| `homepage_hero` | 1200×675px | 16:9 | `<HomepageHeroAd />` |
| `homepage_sidebar` | 300×300px | 1:1 | `<HomepageSidebar />` |
| `homepage_mid_content` | 1200×225px | 16:3 | `<HomepageMidContent />` |

**Usage in code:**
```tsx
import { HomepageTopBanner, HomepageMidContent } from "@/components/ads";

// In app/page.tsx
<HomepageTopBanner />
<HomepageMidContent />
```

---

### 📰 Article Placements

| Placement | Dimensions | Ratio | Component |
|-----------|------------|-------|-----------|
| `article_top` | 1200×225px | 16:3 | `<ArticleTopBanner />` |
| `article_inline` | 800×200px | 4:1 | `<ArticleInline />` |
| `article_sidebar` | 300×300px | 1:1 | `<ArticleSidebar />` |
| `article_bottom` | 1200×225px | 16:3 | `<ArticleBottomBanner />` |

**Usage in code:**
```tsx
import { ArticleTopBanner, ArticleInline, ArticleSidebar } from "@/components/ads";

// In article page
<ArticleTopBanner />
<div className="grid grid-cols-[2fr_1fr]">
  <article>
    {/* Article content */}
    <ArticleInline />
  </article>
  <aside>
    <ArticleSidebar />
  </aside>
</div>
<ArticleBottomBanner />
```

---

### 🎥 Video Placements

| Placement | Dimensions | Ratio | Component |
|-----------|------------|-------|-----------|
| `video_top` | 1200×225px | 16:3 | `<VideoTopBanner />` |
| `video_sponsor` | 1200×150px | 16:2 | `<VideoTopSponsor />` |
| `video_sidebar` | 300×300px | 1:1 | `<VideoSidebar />` |

**Usage in code:**
```tsx
import { VideoTopBanner, VideoTopSponsor, VideoSidebar } from "@/components/ads";

// In video page
<VideoTopBanner />
<VideoTopSponsor />
<VideoSidebar />
```

---

### 📂 Category Placements

| Placement | Dimensions | Ratio | Component |
|-----------|------------|-------|-----------|
| `category_top` | 1200×225px | 16:3 | `<CategoryTopBanner />` |
| `category_sidebar` | 300×300px | 1:1 | `<CategorySidebar />` |

**Usage in code:**
```tsx
import { CategoryTopBanner, CategorySidebar } from "@/components/ads";

// In category page
<CategoryTopBanner />
<CategorySidebar />
```

---

## Creating Ad Slots (Admin)

### Step 1: Go to Admin → Advertising → Ad Slots → New Ad Slot

### Step 2: Fill the form

**Example for Homepage Top Banner:**
```
Name: Home Banner               ← Your choice (human-readable)
Key: home_main_banner          ← Your choice (unique identifier)
Placement: homepage_top        ← MUST match a placement from table above
Description: Top banner...     ← Optional
Active: ✓                      ← Check to enable
```

### Step 3: Key Points

✅ **`placement` MUST be one of the 13 values from the tables above**
✅ **`key` can be anything unique** (e.g., "home", "banner1", "top_ad")
✅ **`name` is just for display** (e.g., "Home Top Banner", "Main Homepage Ad")

❌ **Don't use custom placement values** - they won't match any components

---

## Creating Advertisements

### Step 1: Select the Ad Slot
When creating an ad, select the ad slot you created (e.g., "Home Banner")

### Step 2: Upload Image
The system will show the required dimensions based on the **placement** field of that slot.

Example:
- If slot has `placement: "homepage_top"` → Requires 1200×225px (16:3)
- If slot has `placement: "article_sidebar"` → Requires 300×300px (1:1)

### Step 3: Strict Validation
❌ Upload 800×800px for homepage_top → **BLOCKED** (wrong ratio)
✅ Upload 1200×225px for homepage_top → **ACCEPTED** ✓

---

## Technical Details

### How the System Works

1. **Component renders** with placement value:
   ```tsx
   <AdSlot slotKey="homepage_top" />
   ```

2. **Database query** matches by `placement`:
   ```sql
   SELECT * FROM advertisements a
   JOIN ad_slots s ON a.slot_id = s.id
   WHERE s.placement = 'homepage_top'
     AND s.is_active = true
     AND a.is_active = true
     AND a.starts_at <= NOW()
     AND (a.expires_at IS NULL OR a.expires_at >= NOW())
   ORDER BY a.priority DESC
   ```

3. **Ad displays** with correct dimensions and `object-fit: contain`

### Database Schema

```sql
-- ad_slots table
CREATE TABLE ad_slots (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,      -- "Home Top Banner"
  key TEXT UNIQUE NOT NULL,        -- "home_main" (user choice)
  placement TEXT NOT NULL,         -- "homepage_top" (MUST match constant)
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- advertisements table
CREATE TABLE advertisements (
  id UUID PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id),
  name TEXT NOT NULL,
  creative_type TEXT,              -- 'image' or 'html'
  image_path TEXT,                 -- Path in 'advertisements' bucket
  image_width INTEGER,
  image_height INTEGER,
  target_url TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

---

## Quick Reference: All 13 Placements

```typescript
// Homepage (4)
homepage_top          // 1200×225 (16:3)
homepage_hero         // 1200×675 (16:9)
homepage_sidebar      // 300×300 (1:1)
homepage_mid_content  // 1200×225 (16:3)

// Article (4)
article_top           // 1200×225 (16:3)
article_inline        // 800×200 (4:1)
article_sidebar       // 300×300 (1:1)
article_bottom        // 1200×225 (16:3)

// Video (3)
video_top             // 1200×225 (16:3)
video_sponsor         // 1200×150 (16:2)
video_sidebar         // 300×300 (1:1)

// Category (2)
category_top          // 1200×225 (16:3)
category_sidebar      // 300×300 (1:1)
```

---

## Troubleshooting

### Ad not displaying?

1. **Check browser console** for logs with 🎯 or 🔍 emojis
2. **Verify placement value** in ad_slots table matches a constant
3. **Check ad is active** and start date is in the past
4. **Check ad slot is active**
5. **Verify image uploaded** (image_path exists) or html_content for HTML ads

### Common Issues

**❌ Ad slot with `placement: "home_top_banner"`**
- Not in constants, component won't find it
- Solution: Change to `"homepage_top"`

**❌ Ad created but shows 0 results**
- Placement mismatch between slot and component
- Check `ad_slots.placement` value

**❌ Image won't upload**
- Wrong aspect ratio (strict validation)
- Check required dimensions for that placement

---

## Files Reference

- **Constants**: `/lib/constants/ad-placements.ts`
- **Components**: `/components/ads/`
  - `homepage-ad-slots.tsx`
  - `article-ad-slots.tsx`
  - `video-ad-slots.tsx`
  - `category-ad-slots.tsx`
  - `ad-slot.tsx` (core component)
- **Actions**: `/app/actions/advertisements.ts`
- **Admin Pages**: `/app/admin/ads/`

---

## Summary

✅ **13 placements defined and verified**
✅ **All components use correct placement values**
✅ **Query matches by `placement` field (not `key`)**
✅ **Strict aspect ratio validation enforced**
✅ **TypeScript clean, build passing**

**Key Takeaway**: When creating ad slots, the `placement` field MUST be one of the 13 values listed above. The `key` field can be anything unique you want.
