# Milestone 10: VNTV Originals - Test Guide

## Overview
This guide provides step-by-step instructions for testing the VNTV Originals platform including programme/episode CMS management, public pages, and homepage integration.

---

## Prerequisites

Before testing, ensure:
1. **Database Tables Exist:**
   - `programmes` table
   - `episodes` table
   - Both tables should have proper foreign key relationships

2. **Media Assets:**
   - Upload at least 2-3 images to Media Library for programme posters
   - Have at least 1-2 videos created in Videos CMS

3. **Access:**
   - Admin access to `/admin` routes
   - Public access to test public pages

---

## Section 1: Programme CMS (Admin)

### Test 1.1: View Programmes List
**URL:** `/admin/programmes`

**Steps:**
1. Navigate to `/admin/programmes`
2. Verify page loads without errors

**Expected Results:**
- ✅ Page displays "Programmes" header
- ✅ "New Programme" button visible in top-right
- ✅ If no programmes: Shows "No programmes yet" empty state
- ✅ If programmes exist: Shows programme cards in grid (2-3 columns on desktop)

**Programme Card Should Display:**
- Poster image (or fallback initial if no image)
- Active/Inactive status badge
- Programme type badge (if set)
- Programme name
- Presenter name (if set)
- Description excerpt (if set)
- "Created X ago" timestamp
- "Edit" button
- "Episodes" button

---

### Test 1.2: Create New Programme
**URL:** `/admin/programmes/new`

**Steps:**
1. Click "New Programme" button from programmes list
2. Fill in form:
   - **Programme Name:** "The Africa Report" (required)
   - **URL Slug:** Auto-generated as `the-africa-report` (editable)
   - **Description:** "In-depth analysis of African politics and economics"
   - **Presenter/Host:** "John Doe"
   - **Programme Type:** Select "News Analysis"
   - **Poster Image ID:** Enter a media asset ID from Media Library
   - **Active:** Check the checkbox
3. Click "Create Programme"

**Expected Results:**
- ✅ Slug auto-generates from name as you type
- ✅ Form validates required fields (name, slug)
- ✅ Shows loading state "Creating..." on submit
- ✅ Redirects to `/admin/programmes` on success
- ✅ New programme appears in list
- ✅ Success indicated by programme appearing in grid

**Future Enhancement:** 
> **Note:** Currently uses text input for Poster Image ID. Future implementation will include visual media selector/picker modal.

---

### Test 1.3: Edit Programme
**URL:** `/admin/programmes/[id]`

**Steps:**
1. From programmes list, click "Edit" on any programme
2. Update one or more fields:
   - Change description
   - Update presenter name
   - Toggle active/inactive
3. Click "Save Changes"

**Expected Results:**
- ✅ Form pre-fills with existing data
- ✅ Shows loading state "Saving..." on submit
- ✅ Redirects to programmes list on success
- ✅ Changes reflect in programme card
- ✅ If toggled to inactive: Status badge changes

---

## Section 2: Episode CMS (Admin)

### Test 2.1: View Episodes List for Programme
**URL:** `/admin/programmes/[id]/episodes`

**Steps:**
1. From programmes list, click "Episodes" button on any programme
2. Verify episodes page loads

**Expected Results:**
- ✅ Page displays "Episodes: [Programme Name]" header
- ✅ "New Episode" button visible in top-right
- ✅ If no episodes: Shows "No episodes yet" empty state
- ✅ If episodes exist: Shows episode list with thumbnails

**Episode List Item Should Display:**
- Episode thumbnail (or episode number fallback)
- Play icon if video is linked
- Episode number badge
- Published/Draft status badge
- "Video Linked" badge if video attached
- Episode title
- Description excerpt (if set)
- Video title and duration (if linked)
- Publication/creation timestamp
- "Edit" button

---

### Test 2.2: Create New Episode
**URL:** `/admin/programmes/[id]/episodes/new`

**Steps:**
1. Click "New Episode" from episodes list
2. Fill in form:
   - **Episode Number:** 1
   - **Episode Title:** "The Rise of African Tech" (required)
   - **URL Slug:** Auto-generated as `episode-1-the-rise-of-african-tech`
   - **Description:** "Exploring the booming tech industry in Africa"
   - **Video ID:** Enter a video ID from Videos CMS
   - **Custom Thumbnail ID:** (Optional) Leave blank to use video thumbnail
   - **Display Order:** 0 (lower numbers appear first)
   - **Published:** Check the checkbox
3. Click "Create Episode"

**Expected Results:**
- ✅ Slug auto-generates from episode number + title
- ✅ Form validates required fields
- ✅ Shows loading state on submit
- ✅ Redirects to episodes list on success
- ✅ New episode appears in list
- ✅ Episode shows "Video Linked" badge if video ID provided

**Important Notes:**
- **Video ID** must be from an existing video in Videos CMS
- **Thumbnail ID** is optional - will use video's thumbnail if not provided
- **Display Order** controls sorting (default: episode number descending)

---

### Test 2.3: Edit Episode
**URL:** `/admin/programmes/[id]/episodes/[episodeId]`

**Steps:**
1. From episodes list, click "Edit" on any episode
2. Update fields as needed
3. Toggle "Published" checkbox
4. Click "Save Changes"

**Expected Results:**
- ✅ Form pre-fills with existing data
- ✅ Shows loading state on submit
- ✅ Changes reflected in episodes list
- ✅ Status badge updates when toggling published state

---

## Section 3: Public Programme Pages

### Test 3.1: Programme Landing Page
**URL:** `/originals/[slug]` (e.g., `/originals/the-africa-report`)

**Steps:**
1. Navigate to `/originals/the-africa-report` (use your programme slug)
2. Verify all sections load correctly

**Expected Results:**

**Programme Header Section:**
- ✅ Poster image displays (2:3 aspect ratio)
- ✅ Programme type badge shows (if set)
- ✅ Programme name in large heading
- ✅ "Presented by [Name]" displays (if set)
- ✅ Description paragraph displays (if set)
- ✅ Episode count shows correctly
- ✅ "Watch Latest Episode" button visible (if episodes exist)
- ✅ Responsive: 2-column on desktop, 1-column on mobile

**Episodes Section:**
- ✅ "Episodes" heading displays
- ✅ Episode cards in grid (1-4 columns responsive)
- ✅ Each card shows:
  - Thumbnail image (or fallback)
  - Episode number badge
  - Play overlay on hover
  - Episode title
  - Description excerpt
  - "Published X ago" timestamp
- ✅ Clicking card navigates to episode page
- ✅ If no published episodes: Shows "No episodes available yet"

**SEO:**
- ✅ Page title: "[Programme Name] | VNTV Originals"
- ✅ Meta description populated
- ✅ Open Graph tags present (check page source)

**Limitations:**
> **Note:** Only published episodes appear on public pages. Draft episodes are hidden.

---

### Test 3.2: Episode Page
**URL:** `/originals/[programme-slug]/[episode-slug]`

**Steps:**
1. From programme landing page, click any episode card
2. Verify episode page loads with video player

**Expected Results:**

**Video Section:**
- ✅ Video player loads and displays
- ✅ Poster/thumbnail shows before play
- ✅ Video plays when clicked
- ✅ **Gating:** If not logged in, video pauses at 25% with auth modal
- ✅ **Gating:** If logged in, video plays uninterrupted
- ✅ **YouTube videos:** Play without gating (if using YouTube source)

**Episode Info Section:**
- ✅ Programme badge/link at top
- ✅ "Episode [number]" label
- ✅ Episode title in large heading
- ✅ Publication date displays
- ✅ Description shows (if set)
- ✅ Social sharing buttons present and functional
- ✅ "Back to [Programme]" link works

**Up Next Section:**
- ✅ Shows next episode suggestion (if exists)
- ✅ Next episode thumbnail displays
- ✅ Next episode title and number show
- ✅ Clicking navigates to next episode

**Related Episodes Sidebar:**
- ✅ Shows up to 4 other episodes from same programme
- ✅ Each with thumbnail and title
- ✅ Play icon on hover
- ✅ "View All Episodes" button links back to programme
- ✅ Sticky positioning on desktop

**Error Handling:**
- ✅ If episode has no video: Shows "Video not available" message
- ✅ "Back to Programme" button still works

**Limitations:**
> **Video Playback:** Full video player features from Milestone 9 apply (keyboard controls, fullscreen, orientation detection, analytics tracking)
>
> **Autoplay:** "Up Next" shows suggestion but does NOT auto-advance to next episode. User must manually click to watch next episode. (Auto-advance feature not yet implemented)

---

## Section 4: Homepage Originals Section

### Test 4.1: Originals on Homepage
**URL:** `/` (homepage)

**Steps:**
1. Navigate to homepage
2. Scroll down to VNTV Originals section

**Expected Results:**

**Section Header:**
- ✅ "VNTV ORIGINALS" heading with red accent bar
- ✅ "View All" button in top-right

**Featured Programme:**
- ✅ First active programme displays in large featured card
- ✅ 2-column layout (poster left, content right) on desktop
- ✅ "Featured" yellow badge
- ✅ Programme type displays
- ✅ Programme name, presenter, description show
- ✅ Latest episode title displays (if exists)
- ✅ "Watch Now" button with play icon
- ✅ Hover shows play overlay on poster
- ✅ Clicking navigates to `/originals/[slug]`

**Programme Cards:**
- ✅ Shows next 3 active programmes in grid (2-3 columns)
- ✅ Each card displays:
  - 2:3 aspect ratio poster
  - Programme type badge in top-right
  - Programme name
  - Presenter name
  - Play overlay on hover
- ✅ Clicking card navigates to programme page

**Conditional Display:**
- ✅ If NO active programmes: Section doesn't appear at all
- ✅ If only 1 programme: Shows only featured, no grid
- ✅ If 2-4 programmes: Shows featured + remaining in grid

**Limitations:**
> **Note:** Section automatically fetches and displays programmes marked as "Active" in CMS. No manual curation/ordering control yet. Programmes display in creation order (newest first).
>
> **Future Enhancement:** Admin UI to select featured programme and manually order programme display.

---

## Section 5: Integration Tests

### Test 5.1: Full User Journey - Create to Watch
**Complete End-to-End Flow:**

1. **CMS: Create Programme**
   - Go to `/admin/programmes/new`
   - Create programme with poster image
   - Mark as Active

2. **CMS: Add Episodes**
   - Go to `/admin/programmes/[id]/episodes/new`
   - Create 3 episodes with videos
   - Mark all as Published

3. **Public: View on Homepage**
   - Go to `/` (homepage)
   - Verify programme appears in Originals section
   - Click programme card

4. **Public: Programme Page**
   - Verify landing page shows all 3 episodes
   - Click "Watch Latest Episode"

5. **Public: Watch Episode**
   - Verify video plays
   - Test gating (if not logged in)
   - Watch past 25%
   - Check "Up Next" suggestion
   - Click related episode

**Expected Results:**
- ✅ Complete flow works without errors
- ✅ Data persists across pages
- ✅ Navigation breadcrumbs work
- ✅ Video playback functional

---

## Section 6: Edge Cases & Error Handling

### Test 6.1: Empty States
- ✅ No programmes exist: CMS shows empty state
- ✅ Programme has no episodes: Public page shows "No episodes available"
- ✅ Episode has no video: Shows "Video not available" message

### Test 6.2: Invalid URLs
- ✅ `/originals/non-existent-slug` → 404 Not Found page
- ✅ `/originals/programme-slug/bad-episode` → 404 Not Found page

### Test 6.3: Inactive Content
- ✅ Inactive programme: Does NOT appear on homepage
- ✅ Inactive programme: Public URL still accessible (or 404 - verify expected behavior)
- ✅ Draft episode: Does NOT appear on public programme page

### Test 6.4: Missing Data
- ✅ Programme without poster: Shows fallback initial
- ✅ Programme without presenter: Field simply doesn't display
- ✅ Episode without thumbnail: Uses video thumbnail or fallback
- ✅ Programme without description: No description section

---

## Known Limitations & Future Enhancements

### Current Limitations:

1. **Media Selection:**
   - CMS uses text input for image/video IDs
   - Must manually copy IDs from Media Library
   - **Future:** Visual media picker modal

2. **Programme Curation:**
   - Featured programme is always first active programme
   - No manual ordering of programmes on homepage
   - **Future:** Homepage management UI to select featured and order programmes

3. **Episode Autoplay:**
   - "Up Next" shows suggestion but doesn't auto-advance
   - User must manually click next episode
   - **Future:** Auto-advance to next episode with countdown timer

4. **Analytics:**
   - Episode views tracked via video analytics
   - No programme-level analytics dashboard yet
   - **Future:** Programme performance metrics

5. **Search & Discovery:**
   - No `/originals` hub page with all programmes
   - Homepage section only shows 4 programmes max
   - **Future:** Full originals browse page with filters

6. **Episode Scheduling:**
   - Published/unpublished toggle only
   - No future scheduling of episode releases
   - **Future:** Schedule episodes for future publication

---

## Troubleshooting

### Issue: Programme doesn't appear on homepage
**Check:**
- Is programme marked as "Active"?
- Are there other active programmes (shows max 4)?
- Clear browser cache and refresh

### Issue: Episodes don't show on programme page
**Check:**
- Are episodes marked as "Published"?
- Is episode linked to correct programme ID?

### Issue: Video doesn't play on episode page
**Check:**
- Is video_id valid and video exists in Videos CMS?
- Is video status "published"?
- Check video source_url is accessible

### Issue: Images don't load
**Check:**
- Are media asset IDs correct?
- Are images uploaded to Supabase storage?
- Check browser console for 404 errors

---

## Test Checklist Summary

### CMS (Admin):
- [ ] View programmes list
- [ ] Create new programme
- [ ] Edit programme
- [ ] Toggle active/inactive
- [ ] View episodes list
- [ ] Create new episode
- [ ] Edit episode
- [ ] Toggle published/draft

### Public Pages:
- [ ] Programme landing page loads
- [ ] All programme metadata displays
- [ ] Episodes grid displays
- [ ] Click episode navigates correctly
- [ ] Episode page loads with video
- [ ] Video playback works
- [ ] Gating functions (if not logged in)
- [ ] Next episode suggestion shows
- [ ] Related episodes sidebar works
- [ ] Social sharing buttons work
- [ ] Back navigation works

### Homepage:
- [ ] Originals section appears (if programmes exist)
- [ ] Featured programme displays correctly
- [ ] Programme cards display
- [ ] Navigation to programmes works
- [ ] Section hidden if no active programmes

### SEO:
- [ ] Page titles correct
- [ ] Meta descriptions present
- [ ] Open Graph tags present
- [ ] Canonical URLs set

---

## Success Criteria

Milestone 10 is successfully implemented if:
- ✅ All CMS forms work without errors
- ✅ Programmes and episodes can be created, edited, published
- ✅ Public programme pages display all information correctly
- ✅ Episode pages play videos with full player features
- ✅ Homepage originals section displays active programmes
- ✅ Navigation between all pages works correctly
- ✅ SEO metadata is complete
- ✅ Responsive design works on mobile and desktop
- ✅ TypeScript builds with 0 errors

---

**Test Complete!** 🎉

If all tests pass, Milestone 10 is production-ready.
