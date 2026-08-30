# RSS Items UI - Complete Feature List

**Status:** ✅ **FULLY IMPLEMENTED**  
**Date:** August 29, 2026

---

## All Available Actions

### 🔵 Single Item Actions (per row)

| Icon | Action | Description |
|------|--------|-------------|
| 👁️ **Eye** (Blue) | Preview | Opens modal with full RSS item preview |
| ✅ **CheckCircle** (Green) | Approve & Publish | Approves item + auto-converts to article + publishes |
| ❌ **XCircle** (Red) | Reject | Marks item as rejected |
| 🔄 **RotateCcw** (Yellow) | Set to Pending | Changes approved/rejected items back to pending |
| 📄 **FileText** (Purple) | Convert to Article | Manually converts to article immediately |
| 🔗 **ExternalLink** (Gray) | View Original | Opens original RSS source URL in new tab |
| 🗑️ **Trash2** (Red) | Delete | Permanently deletes RSS item |

---

### 📦 Bulk Actions (when items selected)

When you select multiple items using checkboxes, these buttons appear in the blue banner:

| Button | Color | Action | Description |
|--------|-------|--------|-------------|
| **Approve & Publish** | Green | Bulk approve + convert | Approves all selected items AND converts them to published articles |
| **Convert to Articles** | Purple | Bulk convert | Converts selected items to articles (without changing status) |
| **Set to Pending** | Yellow | Bulk disapprove | Changes approved/rejected items back to pending |
| **Reject** | Orange | Bulk reject | Marks all selected items as rejected |
| **Delete** | Red | Bulk delete | Permanently deletes all selected items |

---

## Workflow Examples

### Example 1: Quick Publish Flow
```
1. Go to /admin/rss/items
2. Filter by "Pending" status
3. Select items you want to publish (checkboxes)
4. Click "Approve & Publish" (green button)
   → Items are approved
   → Articles are created automatically
   → Articles are published immediately
   → Articles appear on homepage
```

### Example 2: Review Before Publishing
```
1. Go to /admin/rss/items
2. Click eye icon on an item to preview
3. Read the content in modal
4. Click "Convert to Article" in modal
   → Article created immediately
   → Confirmation shown
5. Go to /admin/articles to edit if needed
```

### Example 3: Bulk Convert Already-Approved Items
```
1. Go to /admin/rss/items
2. Filter by "Approved" status
3. Select all approved items
4. Click "Convert to Articles" (purple button)
   → All selected items converted to articles
   → Articles published immediately
```

### Example 4: Reject Low-Quality Content
```
1. Go to /admin/rss/items
2. Preview questionable items (eye icon)
3. For bad items: Click X icon to reject
4. For bulk: Select multiple → Click "Reject"
```

### Example 5: Cleanup Unwanted Items
```
1. Go to /admin/rss/items
2. Select unwanted items (checkboxes)
3. Click "Delete" (red button)
4. Confirm deletion
   → Items permanently removed
```

### Example 6: Undo Approval
```
1. Go to /admin/rss/items
2. Filter by "Approved" status
3. Find items you want to reconsider
4. Click yellow RotateCcw icon
   → Item changed back to "Pending"
5. Review again before approving
```

---

## Status Colors

| Status | Color | Badge | Meaning |
|--------|-------|-------|---------|
| **Pending** | Yellow | `bg-yellow-100 text-yellow-800` | Awaiting editorial review |
| **Approved** | Green | `bg-green-100 text-green-800` | Approved but not yet converted |
| **Rejected** | Red | `bg-red-100 text-red-800` | Rejected by editor |
| **Published** | Blue | `bg-blue-100 text-blue-800` | Converted to article + published |

---

## Auto-Convert Feature

### When Does Auto-Convert Happen?

✅ **When you approve an item:**
- Single approve (green checkmark) → Auto-converts to article
- Bulk approve → Auto-converts all to articles
- Preview modal "Approve" button → Auto-converts to article

❌ **When does it NOT auto-convert:**
- When you manually click "Convert to Article" (purple icon)
- When you change status to "Rejected"
- When you set back to "Pending"

### What Happens During Auto-Convert?

1. Article created in `articles` table
2. RSS item's `article_id` field updated
3. RSS item's `status` changed to "published"
4. Article appears on homepage immediately
5. Homepage routes revalidated

### Article Data Mapping

| Article Field | Source |
|---------------|--------|
| **title** | RSS item title |
| **slug** | Auto-generated from title (unique) |
| **summary** | RSS item description |
| **content** | RSS item content (or description) |
| **featured_image_url** | RSS item image_url |
| **category_id** | Feed's category or "News" default |
| **author_id** | "RSS Feed" author |
| **source_url** | Original RSS URL |
| **source_name** | Feed's source name |
| **status** | "published" |
| **published_at** | Current timestamp |

---

## Filter Options

### Status Filter
- All Statuses
- Pending
- Approved
- Rejected
- Published

### Feed Filter
- All Feeds
- [Individual feed names from your RSS feeds list]

Click **"Apply Filters"** button to refresh the list.

---

## Tips & Best Practices

### ✅ DO:
- Preview items before approving (eye icon)
- Use bulk actions for efficiency
- Filter by "Pending" to see new items
- Check "Approved" status for unconverted items
- Delete spam/duplicate items promptly

### ❌ DON'T:
- Approve items you haven't reviewed
- Delete items without confirmation
- Convert already-converted items (button is disabled)
- Forget to check the homepage after bulk approving

---

## Troubleshooting

### "Already converted" tooltip?
- Item was already converted to an article
- Check `/admin/articles` for the article
- Purple convert button is disabled

### Can't see approved items on homepage?
1. Check if they were converted (look for blue "Published" badge)
2. Use "Convert All to Articles" banner button
3. Or select items → "Convert to Articles" bulk button

### Want to unpublish an article?
- Go to `/admin/articles`
- Find the article
- Change status to "Draft"
- Or delete the article entirely

### Deleted item by mistake?
- RSS items deletion is permanent
- Re-run ingestion to fetch again
- Or manually create article in `/admin/articles/new`

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Select all | Click checkbox in table header |
| Deselect all | Click header checkbox again |
| Preview item | Click anywhere on row (opens preview) |

---

## Summary

🎉 **You now have complete editorial control over RSS items:**

✅ Preview before publishing  
✅ Approve → Auto-convert → Publish (one click!)  
✅ Bulk actions for efficiency  
✅ Delete unwanted content  
✅ Undo approvals (set back to pending)  
✅ Manual convert option (purple button)  
✅ Filter by status and feed  
✅ View original sources  

**The workflow is fast, intuitive, and powerful!** 🚀
