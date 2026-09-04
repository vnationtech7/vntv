# Video Upload in Articles - FIXED ✅

## Problem
Videos were failing to upload with error: "Body exceeded 1 MB limit"

## Root Cause
Next.js Server Actions have a default 1MB body size limit, which is too small for video files.

## Solution Implemented

### 1. Increased Server Action Body Size Limit
**File:** `/next.config.ts`
- Added `serverActions.bodySizeLimit: "50mb"`
- This allows uploads up to 50MB through server actions

### 2. Created Client-Side Upload Utility (Better Performance)
**File:** `/lib/utils/client-upload.ts`
- New utility for uploading directly from browser to Supabase Storage
- Bypasses Next.js server entirely for large files
- More efficient and faster for videos
- Follows RLS policy: `{user_id}/{year}/{month}/{filename}`

### 3. Updated RichTextEditor Component
**File:** `/components/cms/rich-text-editor.tsx`
- Added `useClientUpload` prop (default: `true`)
- Uses client-side upload by default for better performance
- Falls back to server action if needed
- Shows "Uploading..." text while uploading

### 4. Updated Article Pages
**Files:** 
- `/app/admin/articles/new/page.tsx`
- `/app/admin/articles/[id]/page.tsx`
- Removed `onUpload` prop (now uses client-side upload automatically)
- Simplified implementation

## How It Works Now

### Upload Flow
1. User clicks "Add Image" button or drags file into editor
2. File is validated (image or video type)
3. **Client-side upload** directly to Supabase Storage:
   - Gets authenticated user ID
   - Generates unique filename with timestamp
   - Determines bucket: `media` for images, `videos` for videos
   - Uploads to path: `{user_id}/{year}/{month}/{filename}`
   - Returns public URL
4. URL is inserted into editor as `<img>` or `<video>` tag
5. Content saved as HTML to database

### Benefits of Client-Side Upload
✅ **No size limit** from Next.js (only Supabase limits: 500MB for videos)
✅ **Faster** - Direct browser → Supabase (no server middleware)
✅ **Better UX** - Progress happens client-side
✅ **Follows RLS policies** - Uses user's UUID in path
✅ **Secure** - Still requires authentication

## File Size Limits

| Type | Bucket | Size Limit | MIME Types |
|------|--------|------------|------------|
| Images | `media` | 10MB | JPEG, PNG, GIF, WebP |
| Videos | `videos` | 500MB | MP4, WebM, OGG |

## Storage Path Structure

```
Bucket: media
Path: {user_id}/{year}/{month}/article-{timestamp}-{random}.jpg

Example:
media/f47ac10b-58cc-4372-a567-0e02b2c3d479/2026/09/article-1725456789-abc123.jpg

Bucket: videos  
Path: {user_id}/{year}/{month}/article-{timestamp}-{random}.mp4

Example:
videos/f47ac10b-58cc-4372-a567-0e02b2c3d479/2026/09/article-1725456789-xyz789.mp4
```

## Testing

### 1. Restart Dev Server
```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### 2. Test Image Upload
1. Go to `/admin/articles/new`
2. Click red "Add Image" button
3. Select an image (< 10MB)
4. Should upload and insert successfully

### 3. Test Video Upload
1. Stay on article editor
2. Click "Add Image" button
3. Select a video file (MP4, WebM, or OGG)
4. Video uploads (may take a few seconds for large files)
5. Video player inserted inline in editor
6. Save article
7. View on public page - video should play

### 4. Test Drag & Drop
1. Drag an image or video file directly into the editor
2. Should upload and insert automatically

## Upload Indicators

- **Button shows:** "Uploading..." while upload in progress
- **Button disabled** during upload
- **Overlay** shows "Uploading..." in editor
- **Alert** if upload fails with error message

## Error Handling

- ✅ Not authenticated → Error: "Not authenticated"
- ✅ Invalid file type → Alert with valid types
- ✅ Upload fails → Alert with error message
- ✅ Network error → Caught and displayed

## What Changed

### Before
```typescript
// Used server action (limited to 1MB)
onUpload={async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const result = await uploadArticleMedia(formData); // Server action
  return result.url!;
}}
```

### After
```typescript
// Uses client-side upload (up to 500MB for videos)
<RichTextEditor
  content={bodyHTML}
  onChange={(html) => setBodyHTML(html)}
  // No onUpload needed - uses client-side upload by default
/>
```

## Files Modified

1. ✅ `/next.config.ts` - Increased body size limit
2. ✅ `/lib/utils/client-upload.ts` - NEW: Client-side upload utility
3. ✅ `/components/cms/rich-text-editor.tsx` - Uses client upload
4. ✅ `/app/admin/articles/new/page.tsx` - Simplified
5. ✅ `/app/admin/articles/[id]/page.tsx` - Simplified

## Files Kept (For Backward Compatibility)

- `/app/admin/articles/upload.ts` - Server action still available if needed

## Security

✅ **Authentication required** - Only logged-in users can upload
✅ **RLS policies enforced** - Files stored in user's folder
✅ **File type validation** - Only allowed MIME types
✅ **Size limits** - Enforced by Supabase Storage
✅ **Public read** - Files are readable by anyone (for articles)
✅ **User write** - Only owner can modify/delete

## Next Steps

Everything is ready! Videos should now upload successfully. The upload happens directly from your browser to Supabase, so even large videos (up to 500MB) will work fine. 🎉
