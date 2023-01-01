# Advertising Setup Guide - Quick Start

## 🚀 How to Display Ads on Your Site

### Step 1: Create an Ad Slot
1. Go to **Admin → Advertising → Ad Slots**
2. Click **"New Ad Slot"**
3. Fill in the form:
   - **Name:** `Homepage Top Banner`
   - **Key:** `homepage_top` (auto-generated)
   - **Placement:** Select `Homepage Top Banner` from dropdown
   - **Active:** ✅ Check this box
4. Click **"Create Ad Slot"**

### Step 2: Create an Advertisement
1. Go to **Admin → Advertising → Advertisements**
2. Click **"New Advertisement"**
3. Fill in the form:

   **Basic Info:**
   - **Name:** `Summer Sale 2026`
   - **Ad Slot:** Select `Homepage Top Banner` (the slot you just created)
   - **Sponsor:** Optional

   **Creative Content:**
   - **Type:** Choose `Image` or `HTML`
   - **Image:** Click "Select Image" to choose from media library
   - **Target URL:** `https://example.com/landing-page` (optional)

   **Scheduling:**
   - **Start Date:** Now (or future date)
   - **End Date:** Leave empty for ongoing
   - **Priority:** 5 (1-100, higher = shows first)
   - **Active:** ✅ Check this box

4. Click **"Create Advertisement"**

### Step 3: View Your Ad
Your ad will now appear on the homepage!

---

## 📍 Where Ads Display

### Homepage
- **Top Banner:** Above the hero section
- **Mid-Content:** Between news and videos sections

### Article Pages
- **Top Banner:** Before the article title
- **Inline Ad:** In the middle of article content
- **Sidebar:** In the related stories sidebar

### Available Ad Slots (Already Integrated)

#### Homepage Placements
- `homepage_top` - Top banner (ACTIVE ✅)
- `homepage_hero` - Hero section
- `homepage_sidebar` - Sidebar
- `homepage_mid_content` - Mid-content (ACTIVE ✅)

#### Article Placements
- `article_top` - Top banner (ACTIVE ✅)
- `article_inline` - Mid-content inline (ACTIVE ✅)
- `article_sidebar` - Sidebar (ACTIVE ✅)
- `article_bottom` - Bottom banner

#### Video Placements
- `video_top` - Top sponsor
- `video_sponsor` - Sponsorship banner
- `video_sidebar` - Sidebar

#### Category Placements
- `category_top` - Top banner
- `category_sidebar` - Sidebar

---

## 🎨 Ad Creative Options

### Option 1: Image Ads
1. Select **"Image"** as creative type
2. Click **"Select Image"**
3. Choose from media library or upload new
4. Add target URL (optional)

**Best practices:**
- Recommended size: 1200x400px for banners
- Format: JPG, PNG, or WebP
- File size: Under 500KB for fast loading

### Option 2: HTML Ads
1. Select **"HTML"** as creative type
2. Paste your HTML ad code
3. Add target URL wrapper (optional)

**Example HTML:**
```html
<div style="background: linear-gradient(to right, #ff0000, #ff6b6b); color: white; padding: 40px; text-align: center; border-radius: 8px;">
  <h2 style="font-size: 32px; margin: 0 0 10px 0;">Summer Sale!</h2>
  <p style="font-size: 18px; margin: 0;">50% off all products - Limited time only</p>
</div>
```

---

## 🎯 Ad Scheduling

### Start Date
When the ad becomes active and starts displaying.

### End Date (Optional)
When the ad stops displaying. Leave empty for ongoing campaigns.

### Priority (1-100)
- **Higher number = Shows first**
- Multiple ads in same slot rotate every 10 seconds
- Use priority to control which ads show more often

**Example:**
- Priority 10: Shows first in rotation
- Priority 5: Shows second
- Priority 1: Shows last

---

## 📊 Managing Your Ads

### Dashboard
Go to **Admin → Advertising → Dashboard** to see:
- Live campaigns count
- Scheduled campaigns
- Expired campaigns
- Active slots count

### Filtering Ads
On the **Advertisements** page:
- Search by name
- Filter by status: All, Live, Scheduled, Expired, Inactive

### Quick Actions
- **Toggle Active/Inactive:** Click the power icon
- **Edit:** Click the edit icon
- **Delete:** Click the trash icon (with confirmation)

---

## ✅ Testing Checklist

After creating your ad:
1. ✅ Ad slot is **Active**
2. ✅ Advertisement is **Active**
3. ✅ Start date is **now or in the past**
4. ✅ End date is **empty or in the future**
5. ✅ Image uploaded or HTML provided
6. ✅ Visit the page where ad should display (e.g., homepage)

---

## 🔧 Troubleshooting

### "Ad slot dropdown is empty"
**Fixed!** The dropdown now shows all slots (active and inactive). Create an ad slot first if none exist.

### "My ad doesn't show on the page"
Check:
1. Ad slot is **Active** (green badge)
2. Advertisement is **Active** (green badge)
3. Start date is in the past or now
4. End date hasn't passed
5. You're on the correct page (homepage for homepage ads, article for article ads)

### "I see 'Advertisement' text but no ad"
This means the ad slot exists on the page but no active ads are assigned to it. Create an advertisement for that slot.

---

## 🎓 Pro Tips

1. **Test with priority:** Create 2-3 ads for the same slot to see rotation
2. **Use scheduling:** Schedule seasonal campaigns in advance
3. **Monitor dashboard:** Check which campaigns are live
4. **Update regularly:** Rotate ads weekly for better engagement
5. **Track performance:** Note which ads perform best (future feature: click tracking)

---

## 📞 Need Help?

- **Documentation:** See `MILESTONE_13_COMPLETE.md` for technical details
- **Component API:** See component examples in documentation
- **Database Schema:** Check migration files in `/supabase/migrations/`

---

**Quick Links:**
- Dashboard: `/admin/ads/dashboard`
- Create Ad: `/admin/ads/new`
- Manage Slots: `/admin/ads/slots`
- View All Ads: `/admin/ads`
