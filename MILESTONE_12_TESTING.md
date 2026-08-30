# Milestone 12: UI Testing Guide

## Prerequisites
1. Start the dev server: `npm run dev`
2. Log in to admin panel as super_admin or editor
3. Navigate to: `http://localhost:3000/admin`

---

## Test 1: Breaking News Management

### Access the Page
- Go to: `http://localhost:3000/admin/breaking-news`
- ✅ Should see "Breaking News" page with stats dashboard
- ✅ Should see 4 stat cards: Total, Live Now, Scheduled, Inactive

### Create Breaking News
1. Click **"Add Breaking News"** button
2. Fill out the form:
   - **Headline**: "Test Breaking News Item"
   - **Link Destination**: Select "Link to Article"
   - Search for and select any published article
   - **Priority**: 5
   - **Start Time**: Current time
   - **End Time**: 1 day from now
   - **Active**: Checked
3. Click **"Create Breaking News"**
4. ✅ Should redirect back to list
5. ✅ Should see new item in table with green "Live" badge

### Test Status Badges
- ✅ "Live" = Green badge with pulsing dot
- ✅ "Scheduled" = Blue badge (create one with future start time)
- ✅ "Expired" = Orange badge (create one with past end time)
- ✅ "Inactive" = Gray badge

### Test Actions
1. **Toggle Status**:
   - Click the green power icon → Should turn gray and item becomes "Inactive"
   - Click gray power-off icon → Should turn green and item becomes "Live"
   
2. **Edit**:
   - Click blue edit icon
   - ✅ Should navigate to edit page with form pre-filled
   - Change headline, click "Save Changes"
   - ✅ Should see updated headline in list

3. **Delete**:
   - Click red trash icon
   - ✅ Should show confirmation dialog
   - Confirm deletion
   - ✅ Item should disappear from list

### Test Link Types
Create breaking news with different link types:
1. **No Link**: Select "No Link" → Headline only, no clickable link
2. **Article Link**: Select "Link to Article" → Should link to `/news/{slug}`
3. **External URL**: Select "External URL" → Enter `https://example.com`

---

## Test 2: Breaking News Ticker (Public)

### View on Homepage
1. Go to: `http://localhost:3000/` (public homepage)
2. ✅ Should see red ticker bar below header
3. ✅ Should show "BREAKING" badge with flame icon
4. ✅ Should display the headline

### Test Auto-Rotation (if multiple items)
1. Create 2+ active breaking news items
2. ✅ Ticker should auto-rotate every 8 seconds
3. ✅ Fade transition between items

### Test Manual Navigation
- ✅ Click left arrow → Previous item
- ✅ Click right arrow → Next item
- ✅ Click indicator dots → Jump to specific item
- ✅ Hover over ticker → Auto-rotation pauses

### Test Links
- Click on ticker headline:
  - Article link: ✅ Should navigate to article page
  - External URL: ✅ Should open in new tab
  - No link: ✅ Nothing happens (text only)

---

## Test 3: Homepage Section Management

### Access the Page
- Go to: `http://localhost:3000/admin/homepage`
- ✅ Should see "Homepage Management" page
- ✅ Should see 4 stat cards: Total Sections, Enabled, Featured, Custom

### View Existing Sections
- ✅ Should see table with existing sections
- ✅ Each row shows:
  - Display order with drag handle icon
  - Section name and description
  - Type badge (colored)
  - Layout icon (grid/list/carousel/hero)
  - Settings badges (max items, show images, etc.)
  - Status (Enabled/Disabled)
  - Action buttons

### Test Section Actions
1. **Toggle Enable/Disable**:
   - Click green power icon → Section becomes disabled
   - Click gray power-off icon → Section becomes enabled

2. **Edit** (if edit page exists):
   - Click blue edit icon
   - ✅ Should navigate to edit page

3. **Delete**:
   - Click red trash icon
   - ✅ Should show confirmation warning about removing items
   - Cancel → Nothing happens
   - Confirm → Section disappears

### Test Quick Tips Panel
- ✅ Should see blue info panel at bottom with usage tips

---

## Test 4: Cache Revalidation

### Test Breaking News Cache
1. Create a new breaking news item
2. Open public homepage in **incognito/private window**
3. ✅ New breaking news should appear immediately (no refresh needed)
4. Toggle breaking news to inactive in admin
5. Refresh public homepage
6. ✅ Breaking news should disappear from ticker

### Test Homepage Sections Cache
1. Disable a homepage section in admin
2. Check public homepage
3. ✅ Section should be hidden (may need refresh)

---

## Test 5: Permissions & Security (if using roles)

### As Editor or Super Admin
- ✅ Can access `/admin/breaking-news`
- ✅ Can create breaking news
- ✅ Can update breaking news
- ✅ Can toggle status

### As Admin (super_admin only)
- ✅ Can delete breaking news
- ✅ Can delete homepage sections

### As Reporter (if role exists)
- ❌ Should NOT see "Breaking News" in sidebar
- ❌ Should get 403 or redirect if accessing directly

---

## Test 6: Responsive Design

### Desktop (1920x1080)
- ✅ Breaking news list table displays all columns
- ✅ Homepage sections table is readable
- ✅ Ticker shows full headline

### Tablet (768px)
- ✅ Stats cards stack in 2 columns
- ✅ Tables have horizontal scroll if needed
- ✅ Ticker remains visible

### Mobile (375px)
- ✅ Stats cards stack vertically
- ✅ Tables scroll horizontally
- ✅ Ticker shows with arrows but may hide dots
- ✅ Forms are usable

---

## Test 7: Edge Cases

### Breaking News
1. **Empty State**:
   - Delete all breaking news
   - ✅ Should show empty state with "Add Breaking News" button
   - ✅ Public ticker should not appear

2. **Expired Items**:
   - Create breaking news with past end time
   - ✅ Should show "Expired" badge in admin
   - ✅ Should NOT appear on public site

3. **Scheduled Items**:
   - Create breaking news with future start time
   - ✅ Should show "Scheduled" badge in admin
   - ✅ Should NOT appear on public site yet

### Forms
1. **Validation**:
   - Try to submit empty headline → ✅ Should show error
   - Select "Link to Article" but don't pick article → ✅ Should show error
   - Select "External URL" but leave URL empty → ✅ Should show error

2. **Article Search**:
   - Type in search box
   - ✅ Should show autocomplete results after 300ms
   - Click result → ✅ Should select article
   - Click X → ✅ Should clear selection

---

## Common Issues & Fixes

### Issue: Ticker not appearing
- Check: Is there at least 1 active breaking news?
- Check: Is start_time <= now and (expires_at is null or > now)?
- Check: Browser console for errors

### Issue: Changes not appearing
- Check: Cache revalidation logs in terminal
- Try: Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check: Supabase RLS policies are enabled

### Issue: "Unauthorized" errors
- Check: User is logged in
- Check: User has correct role (editor or super_admin)
- Check: Session is valid

### Issue: Form submission fails
- Check: Browser console for error messages
- Check: Network tab for failed requests
- Check: Supabase logs for RLS policy violations

---

## Success Criteria

✅ All 7 test sections pass  
✅ No console errors  
✅ Responsive on all screen sizes  
✅ Cache updates work correctly  
✅ Permissions enforced properly  
✅ Forms validate correctly  
✅ Public ticker displays and rotates  

---

## Report Issues

If any test fails, note:
1. Which test section
2. What you expected
3. What actually happened
4. Console errors (if any)
5. Screenshots (if helpful)
