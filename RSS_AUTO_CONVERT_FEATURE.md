# RSS Auto-Convert Feature

**Status:** ✅ **IMPLEMENTED**  
**Date:** August 29, 2026

---

## Overview

RSS items are now **automatically converted to published articles** when approved by admins. This streamlines the editorial workflow and ensures approved RSS content immediately appears on the public homepage.

---

## How It Works

### Automatic Conversion Flow

```
1. RSS Feed Ingested
   ↓
2. RSS Items Created (status: "pending")
   ↓
3. Admin Approves Item(s) ← [YOU ARE HERE]
   ↓
4. 🎯 AUTO-CONVERTS to Article (status: "published")
   ↓
5. Article Appears on Homepage Immediately
```

---

## Features

### ✅ Single Item Approval
- Click green checkmark on any RSS item
- Item is approved AND converted to article
- Article is published immediately
- Confirmation message shown

### ✅ Bulk Approval
- Select multiple RSS items (checkbox)
- Click **"Approve & Publish"** button
- All items are approved AND converted to articles
- All articles are published immediately
- Summary confirmation shown

### ✅ Manual Convert (Still Available)
- Purple **FileText** icon button on each item
- Allows manual conversion with confirmation
- Useful if you want to convert without changing status

---

## Article Details

When an RSS item is converted to an article, the following happens:

### Data Mapping
- **Title:** RSS item title
- **Slug:** Auto-generated from title (unique)
- **Summary:** RSS item description
- **Content:** RSS item content (or description if no content)
- **Featured Image:** RSS item image_url
- **Category:** From feed's default category (or "News")
- **Author:** "RSS Feed" author (auto-created if needed)
- **Source URL:** Original RSS item URL (preserved)
- **Source Name:** Feed's source_name
- **Status:** "published" (immediately visible)
- **Published At:** Current timestamp

### Database Updates
- `articles` table: New article record created
- `rss_items` table: `article_id` set, `status` set to "published"

---

## Admin Workflow

### Step-by-Step Process

1. **Go to:** `/admin/rss/items`

2. **Review RSS Items:**
   - Filter by "Pending" status
   - Preview items (eye icon)
   - Check content quality

3. **Approve Items:**
   - **Option A:** Single approve (green checkmark per item)
   - **Option B:** Bulk approve (select multiple → "Approve & Publish")

4. **Automatic Conversion:**
   - System creates article immediately
   - Article appears on homepage
   - RSS item marked as "published"

5. **Verify on Homepage:**
   - Go to public homepage `/`
   - Articles appear in "Latest News" section
   - Can also check `/admin/articles`

---

## Technical Implementation

### Server Action Updates

**File:** `/app/actions/rss.ts`

```typescript
export async function updateRssItemStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "published"
) {
  // Update RSS item status
  const { data, error } = await supabase
    .from("rss_items")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  // Auto-convert to article when approved
  if (status === "approved") {
    await convertRssItemToArticle(id, {
      publishImmediately: true,
    });
  }

  revalidatePath("/admin/rss/items");
  revalidatePath("/admin/articles");
  revalidatePath("/");
  
  return { data, error: null };
}
```

### Client Component Updates

**File:** `/app/admin/rss/items/rss-items-client.tsx`

- ✅ "Approve & Publish" button replaces "Bulk Approve"
- ✅ Confirmation dialog explains auto-conversion
- ✅ Success message includes article creation
- ✅ Page refresh to show updated state

---

## Future Enhancements (Optional)

### Option B: Feed-Level Auto-Publish
- Add toggle to RSS feed settings
- When `auto_publish = true`, skip review entirely
- Items go straight to published articles during ingestion

### Option C: Scheduled Auto-Convert
- Cron job runs every X hours
- Auto-converts all approved RSS items
- Good for high-volume feeds

---

## Testing Instructions

### Test Manual Conversion (Already Done ✅)
1. Go to `/admin/rss/items`
2. Select some pending items
3. Click "Approve & Publish"
4. Check homepage for new articles

### Test New RSS Items (To Verify)
1. Go to `/admin/rss/monitoring`
2. Click "Trigger All Feeds Now"
3. Wait for ingestion to complete
4. Go to `/admin/rss/items`
5. Approve new items
6. **Verify:** Articles appear on homepage immediately

---

## Summary

✅ **Approval = Auto-Convert + Publish**  
✅ **No manual "Convert to Article" step needed**  
✅ **Approved RSS items appear on homepage immediately**  
✅ **Editors maintain full control over what gets published**

This completes the RSS ingestion workflow! 🎉
