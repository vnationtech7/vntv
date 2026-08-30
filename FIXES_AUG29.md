# Fixes Applied - August 29, 2026

## 🔧 Issues Fixed

### 1. Avatar Upload Not Working ✅

**Problem:**
- User settings avatar upload was failing despite bucket existing
- Code was uploading to `media` bucket with path `avatars/{filename}`
- RLS policies required `{user_id}/{filename}` structure

**Solution:**
- Changed bucket from `media` to dedicated `avatars` bucket
- Updated file path structure to `{user_id}/avatar-{timestamp}.{ext}`
- Updated delete logic to match new path structure

**Files Modified:**
- `/app/profile/actions.ts` - Fixed uploadAvatar() and deleteAvatar() functions

**Testing:**
1. Go to `/settings` or `/profile`
2. Click "Upload new" avatar
3. Select an image file (max 2MB, JPG/PNG/WebP)
4. Avatar should upload successfully
5. Click "Delete" to test deletion

---

### 2. "View All" Links Going to 404 ✅

**Problem:**
- Homepage "View All" button for "VNTV ORIGINALS" linked to `/originals`
- Page didn't exist (only dynamic `/originals/[slug]` existed)
- Users got 404 error when clicking "View All"

**Solution:**
- Created new `/originals/page.tsx` listing all active programmes
- Shows programme posters in responsive grid
- Displays episode count badge on each poster
- Hover effect with play icon overlay
- Links to individual programme pages

**Files Created:**
- `/app/originals/page.tsx` - VNTV Originals listing page

**Testing:**
1. Go to homepage
2. Scroll to "VNTV ORIGINALS" section
3. Click "View All" button
4. Should see grid of all VNTV original programmes
5. Click any programme to view episodes

---

## ✅ Verification

### Avatar Upload
```bash
# Test flow:
1. Login to site
2. Go to /settings
3. Upload avatar
4. Check Supabase Storage > avatars bucket > {your-user-id}/ folder
5. Should see uploaded file
```

### Originals Page
```bash
# Test flow:
1. Go to homepage (/)
2. Find "VNTV ORIGINALS" section
3. Click "View All"
4. Should see /originals page with programme grid
5. Click any programme card
6. Should navigate to /originals/{slug}
```

---

## 📝 Notes

### Storage Structure
The avatar storage now follows the RLS policy structure:
- **Bucket:** `avatars`
- **Path:** `{user_id}/avatar-{timestamp}.{ext}`
- **Example:** `f47ac10b-58cc-4372-a567-0e02b2c3d479/avatar-1724938472123.webp`

### Other "View All" Links
These already work correctly:
- ✅ `/news` - Latest News section
- ✅ `/videos` - VNTV Video section

---

## 🚀 Production Ready

Both fixes are production-safe:
1. **Avatar upload** - Uses existing RLS policies, no migration needed
2. **Originals page** - Pure addition, no existing functionality affected

Deploy with confidence! 🎉
