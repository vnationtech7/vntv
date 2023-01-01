# Google AdSense Integration Guide

## 🎯 Overview

The advertising system now supports **dual ad serving**:
1. **Custom Ads** - Your own advertisements created in the CMS
2. **Google AdSense** - Automatic fallback to AdSense when no custom ads exist

### Key Features ✅
- ✅ **Smart Fallback** - AdSense shows only when no custom ads available
- ✅ **Graceful Empty State** - No space taken if both disabled or empty
- ✅ **Easy Toggle** - Enable/disable AdSense and custom ads independently
- ✅ **Database Configuration** - No code changes needed, all in database
- ✅ **Slot-Level Control** - Different AdSense units for each placement

---

## 🚀 Quick Setup

### Step 1: Enable AdSense in Admin
1. Go to **Admin → Advertising → Settings** (super_admin only)
2. Under "Google AdSense Configuration":
   - ✅ Check **"Enable Google AdSense"**
   - Enter your **Publisher ID** (e.g., `pub-1234567890123456`)
   - Enter your **Ad Client** (e.g., `ca-pub-1234567890123456`)
3. Enter **Ad Slot IDs** for each placement (from AdSense dashboard)
4. Click **"Save Settings"**

### Step 2: Configure Global Settings
1. In the same page, under "Global Advertising Settings":
   - ✅ **Enable Custom Ads** - Show your custom advertisements
   - ✅ **Enable AdSense Fallback** - Show AdSense when no custom ads
   - ✅ **Show "Advertisement" Label** - Display transparency label
2. Click **"Save Settings"**

### Step 3: Test
- Visit your homepage
- If no custom ads exist, AdSense will display
- If custom ads exist, they show first (AdSense hidden)

---

## 📊 How It Works

### Priority System

```
1. Custom Ads (if enabled and available)
   ↓ (if none)
2. Google AdSense (if enabled and fallback enabled)
   ↓ (if disabled)
3. Empty State (no space taken, UI flows naturally)
```

### Example Scenarios

| Custom Ads | AdSense | Fallback | What Displays |
|------------|---------|----------|---------------|
| ✅ Enabled, Has ads | ✅ Enabled | ✅ Enabled | **Custom ads** |
| ✅ Enabled, No ads | ✅ Enabled | ✅ Enabled | **AdSense ads** |
| ✅ Enabled, No ads | ✅ Enabled | ❌ Disabled | **Nothing** (empty) |
| ❌ Disabled | ✅ Enabled | ✅ Enabled | **AdSense ads** |
| ❌ Disabled | ❌ Disabled | - | **Nothing** (empty) |

---

## 🗂️ Database Schema

### Site Settings Table
```sql
-- Existing table with new entries
site_settings (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,        -- 'google_adsense' or 'ads_global_settings'
  value JSONB,            -- Configuration object
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ
)
```

### Google AdSense Config Structure
```json
{
  "enabled": true,
  "publisher_id": "pub-1234567890123456",
  "ad_client": "ca-pub-1234567890123456",
  "auto_ads_enabled": false,
  "slots": {
    "homepage_top": "1234567890",
    "homepage_sidebar": "0987654321",
    "article_top": "1122334455",
    "article_sidebar": "5544332211",
    "article_inline": "6677889900"
  }
}
```

### Global Ads Settings Structure
```json
{
  "custom_ads_enabled": true,
  "adsense_fallback_enabled": true,
  "show_ad_label": true
}
```

---

## 🔧 Technical Implementation

### Component Flow (`AdSlot.tsx`)

```typescript
1. Load data in parallel:
   - Custom ads for this slot
   - AdSense configuration
   - Global settings

2. Check priorities:
   if (custom_ads_enabled && has_custom_ads) {
     → Show custom ad
   } else if (adsense_enabled && fallback_enabled && has_slot_id) {
     → Show AdSense
   } else {
     → Return null (graceful empty state)
   }

3. Render:
   - Custom ads rotate every 10 seconds if multiple
   - AdSense renders with proper <ins> tag
   - Optional "Advertisement" label
```

### AdSense Rendering

The component uses Next.js `<Script>` component:
```tsx
<ins
  className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"
/>
<Script
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
  }}
/>
```

---

## 📍 Available Ad Placements

### Homepage
- `homepage_top` - Top banner above hero
- `homepage_sidebar` - Right sidebar (not integrated yet)

### Article Pages
- `article_top` - Before article title
- `article_inline` - Mid-content
- `article_sidebar` - Related stories sidebar

### Future Placements (Ready to Use)
- `video_top`, `video_sponsor`, `video_sidebar`
- `category_top`, `category_sidebar`

---

## 🎨 UI/UX Behavior

### With Ads (Custom or AdSense)
```
┌─────────────────────────┐
│                         │
│    [Advertisement]      │  ← Ad displays here
│                         │
└─────────────────────────┘
   Advertisement           ← Optional label
```

### Without Ads (Empty State)
```
┌─────────────────────────┐
│                         │
│    [Content flows]      │  ← No gap, no empty space
│    [naturally here]     │
│                         │
└─────────────────────────┘
```

**Key Point:** When no ads exist, the component returns `null`, so the UI doesn't have empty ad slots taking up space.

---

## ⚙️ Configuration Options

### Global Settings

**Custom Ads Enabled**
- Default: `true`
- Controls: Whether custom ads from CMS are shown
- When disabled: Only AdSense shows (if enabled)

**AdSense Fallback Enabled**
- Default: `true`
- Controls: Whether AdSense fills empty custom ad slots
- When disabled: AdSense never shows (even if enabled)

**Show Ad Label**
- Default: `true`
- Controls: Display "Advertisement" text below ads
- Purpose: Transparency and FTC compliance

### AdSense Settings

**Enable Google AdSense**
- Default: `false`
- Controls: Master switch for AdSense integration
- Requires: Publisher ID and Ad Client

**Publisher ID**
- Format: `pub-1234567890123456`
- Where to find: AdSense dashboard → Account → Account Information

**Ad Client**
- Format: `ca-pub-1234567890123456`
- Where to find: AdSense dashboard → Ads → Ad units → Ad code

**Ad Slot IDs**
- Format: 10-digit numbers (e.g., `1234567890`)
- Where to find: AdSense dashboard → Ads → Create ad unit
- Note: Create separate ad units for each placement

---

## 🔒 Security & Access Control

### Admin Access
- **Settings Page:** Super Admin only (`super_admin` role)
- **Other Ad Pages:** Super Admin + Advertising Manager
- **Database:** RLS policies enforce role-based access

### Frontend Access
- **Reading Settings:** Public (needed for AdSense rendering)
- **Updating Settings:** Super Admin only

---

## 📝 Migration Details

**File:** `/supabase/migrations/20260831000001_site_settings_adsense.sql`

**What it does:**
1. Inserts `google_adsense` configuration (default: disabled)
2. Inserts `ads_global_settings` (default: enabled)
3. Uses `ON CONFLICT DO NOTHING` (safe to run multiple times)

**To apply:**
```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor
```

---

## 🧪 Testing Guide

### Test 1: Custom Ads Only
1. Disable AdSense in settings
2. Create a custom ad for `homepage_top`
3. Visit homepage → Should see custom ad
4. Delete the custom ad
5. Refresh → Should see nothing (empty state)

### Test 2: AdSense Fallback
1. Enable AdSense in settings
2. Enable fallback
3. Ensure NO custom ads for `homepage_top`
4. Visit homepage → Should see AdSense
5. Create a custom ad for `homepage_top`
6. Refresh → Should see custom ad (AdSense hidden)

### Test 3: Both Disabled
1. Disable custom ads
2. Disable AdSense
3. Visit homepage → Should see nothing (graceful empty state)
4. UI should flow naturally without gaps

### Test 4: Label Toggle
1. Enable either custom or AdSense ads
2. Toggle "Show Ad Label" off
3. Refresh → No "Advertisement" text
4. Toggle on
5. Refresh → "Advertisement" text appears

---

## 🐛 Troubleshooting

### AdSense not showing
1. ✅ Check AdSense is **enabled** in settings
2. ✅ Check **fallback is enabled** in global settings
3. ✅ Check **no custom ads exist** for that slot
4. ✅ Check **slot ID is entered** for that placement
5. ✅ Check **Publisher ID and Ad Client** are correct
6. ✅ Wait 10-15 minutes (AdSense can be slow to activate)

### Custom ads not showing
1. ✅ Check custom ads are **enabled** in global settings
2. ✅ Check ad slot is **active**
3. ✅ Check advertisement is **active**
4. ✅ Check **start date** is in the past
5. ✅ Check **end date** hasn't passed

### Empty space appearing
This shouldn't happen! The component returns `null` when no ads exist.
If you see empty space:
1. Check browser dev tools → Inspect element
2. Look for `<div class="ad-slot">` with no content
3. Report as bug (this is not expected behavior)

---

## 📚 API Reference

### Server Actions

**`getGoogleAdSenseConfig()`**
```typescript
// Returns AdSense configuration
const { data, error } = await getGoogleAdSenseConfig();
// data: GoogleAdSenseConfig | null
```

**`getAdsGlobalSettings()`**
```typescript
// Returns global advertising settings
const { data, error } = await getAdsGlobalSettings();
// data: AdsGlobalSettings | null
```

**`updateGoogleAdSenseConfig(config)`**
```typescript
// Updates AdSense configuration (super_admin only)
await updateGoogleAdSenseConfig({
  enabled: true,
  publisher_id: "pub-123...",
  ad_client: "ca-pub-123...",
  auto_ads_enabled: false,
  slots: { ... }
});
```

**`updateAdsGlobalSettings(settings)`**
```typescript
// Updates global settings (super_admin only)
await updateAdsGlobalSettings({
  custom_ads_enabled: true,
  adsense_fallback_enabled: true,
  show_ad_label: true
});
```

---

## 🎓 Best Practices

### For Publishers

1. **Test First**
   - Set up AdSense in test mode
   - Verify ads display correctly
   - Then enable for production

2. **Monitor Performance**
   - Check AdSense dashboard for impressions
   - Compare custom vs AdSense revenue
   - Optimize based on data

3. **Content Policy**
   - Ensure content complies with AdSense policies
   - Don't click your own ads
   - Don't encourage clicks

### For Developers

1. **Cache Settings**
   - Settings are read on every page load
   - Consider caching if high traffic
   - Revalidate after updates

2. **Error Handling**
   - Component gracefully handles missing config
   - No errors if settings don't exist
   - Defaults to safe values

3. **Future Enhancements**
   - Analytics integration
   - A/B testing custom vs AdSense
   - Auto-optimize based on revenue

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Auto-optimize: Switch to AdSense if custom ads underperform
- [ ] Analytics dashboard: Track AdSense vs custom ad performance
- [ ] A/B testing: Test different ad placements
- [ ] Scheduling: Schedule AdSense vs custom ads by time/day
- [ ] Geo-targeting: Different ads for different regions

### Migration Path
When we add these features, we'll update the `google_adsense` and `ads_global_settings` JSONB values without schema changes.

---

## 📞 Support

- **Documentation:** This file
- **Technical Details:** See `MILESTONE_13_COMPLETE.md`
- **Component Code:** `/components/ads/ad-slot.tsx`
- **Settings Page:** `/app/admin/ads/settings/page.tsx`
- **Database Migration:** `/supabase/migrations/20260831000001_site_settings_adsense.sql`

---

**Version:** 1.0  
**Last Updated:** August 31, 2026  
**Status:** ✅ Production Ready
