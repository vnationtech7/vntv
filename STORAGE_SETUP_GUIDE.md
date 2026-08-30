# Supabase Storage Setup Guide - Milestone 5

## Step 1: Run Storage Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://natnvyrukhheaaksfaug.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from: `/Users/macbookair/vnation/vntv/supabase/migrations/20260827000003_storage_buckets.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success" message

### Option B: Via Supabase CLI (If installed)

```bash
cd /Users/macbookair/vnation/vntv
supabase db push
```

## Step 2: Verify Buckets Created

1. In Supabase Dashboard, click **Storage** in the left sidebar
2. You should see 4 buckets:
   - ✅ **media** (10MB limit, public)
   - ✅ **videos** (500MB limit, public)
   - ✅ **thumbnails** (2MB limit, public)
   - ✅ **avatars** (2MB limit, public)

## Step 3: Verify Policies

1. Click on each bucket
2. Click **Policies** tab
3. Each bucket should have 4 policies:
   - ✅ Public read access
   - ✅ Authenticated users can upload
   - ✅ Users can update own files
   - ✅ Users can delete own files

## What Gets Created

### Buckets

| Bucket | Purpose | Size Limit | MIME Types |
|--------|---------|------------|------------|
| `media` | Images, PDFs | 10MB | JPEG, PNG, GIF, WebP, SVG, PDF |
| `videos` | Video files | 500MB | MP4, WebM, QuickTime, AVI |
| `thumbnails` | Video thumbnails | 2MB | JPEG, PNG, WebP |
| `avatars` | Profile pictures | 2MB | JPEG, PNG, WebP |

### Storage Structure

Files are organized by user:
```
media/
  {user_id}/
    2026/
      08/
        article-image.jpg
        
videos/
  {user_id}/
    2026/
      08/
        news-report.mp4
        
thumbnails/
  {user_id}/
    video-thumbnails/
      {video_id}/
        thumb.jpg
        
avatars/
  {user_id}/
    avatar.webp
```

### Security Model

- **Public Read:** Anyone can view files
- **Authenticated Upload:** Only logged-in users can upload
- **Owner Control:** Users can only modify/delete their own files
- **Path-Based:** Security enforced via folder structure (user_id)

## Troubleshooting

### "Bucket already exists"
✅ **Normal!** The migration uses `ON CONFLICT DO NOTHING`, so it's safe to re-run.

### "Permission denied"
❌ Make sure you're using the service role key or running as admin in dashboard.

### "Invalid MIME type"
❌ Check that you're uploading supported file types. See table above.

### Policies not showing
1. Go to Storage → Click bucket → Policies tab
2. If empty, re-run the migration
3. Check that RLS is enabled on `storage.objects` table

## Next Steps

Once storage is set up:
1. ✅ Test upload from Supabase Dashboard
2. ✅ Build upload UI in admin panel
3. ✅ Integrate with article editor
4. ✅ Add image optimization

## Testing Upload (Manual)

1. Go to Storage → media bucket
2. Click **Upload file**
3. Create a folder with your user ID: `f47ac10b-...`
4. Upload a test image
5. Copy the public URL
6. Verify you can view it in browser

## Helper Functions Created

The migration also creates:

### `get_storage_public_url(bucket, path)`
Returns public CDN URL for a file
```sql
SELECT get_storage_public_url('media', 'user-id/2026/08/image.jpg');
-- Returns: https://natnvyrukhheaaksfaug.supabase.co/storage/v1/object/public/media/...
```

### `get_storage_signed_url(bucket, path, expires)`
Placeholder for signed URLs (use SDK in production)

## Environment Variables

No new environment variables needed! Storage uses existing Supabase credentials.

## CDN

✅ **Built-in CDN:** Supabase Storage includes CDN automatically  
✅ **Global Distribution:** Files served from edge locations  
✅ **No Extra Config:** Works out of the box  

## Migration File

📄 **File:** `supabase/migrations/20260827000003_storage_buckets.sql`  
📊 **Lines:** 400+  
✅ **Idempotent:** Safe to re-run  
🔒 **Secure:** RLS policies included  

---

**Status:** Ready to run ✅  
**Next:** Run migration, then build upload UI
