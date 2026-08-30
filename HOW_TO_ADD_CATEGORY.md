# How to Add a New Category

## Step-by-Step Guide

### 1. Navigate to Categories Page
Go to: **http://localhost:3000/admin/categories**

### 2. Find the "Create Category" Button
The button is located in the **top-right corner** of the page header, next to the page title.

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Categories                           [+ Create Category]    │
│  Manage content categories for articles and videos           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Click the Button
Click the **"+ Create Category"** button (red button with a plus icon)

### 4. Fill Out the Form

The dialog will open with these fields:

```
┌──────────────────────────────────────────────────────┐
│  Create Category                                  [X] │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Name *                                               │
│  ┌─────────────────────────────────────────────┐    │
│  │ Politics                                     │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Slug *                                               │
│  ┌─────────────────────────────────────────────┐    │
│  │ politics (auto-generated)                    │    │
│  └─────────────────────────────────────────────┘    │
│  URL-friendly version of the name                    │
│                                                       │
│  Description                                          │
│  ┌─────────────────────────────────────────────┐    │
│  │ Coverage of political events...              │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Parent Category                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ None (Top-level category)              [▼]  │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Display Order                                        │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1                                            │    │
│  └─────────────────────────────────────────────┘    │
│  Lower numbers appear first                          │
│                                                       │
│  ☑ Active (visible on site)                         │
│                                                       │
│                            [Cancel]  [Create]        │
└──────────────────────────────────────────────────────┘
```

### 5. Using Test Data

Copy from `TEST_DATA_CATEGORIES.md`:

**Quick Entry - Politics:**
- Name: `Politics`
- Description: `Coverage of political events, government policies, and elections across Africa`
- Display Order: `1`
- Active: ✓ (checked)

### 6. Save the Category
Click the **"Create"** button at the bottom right

### 7. Success!
The dialog will close and the new category will appear in the table

## Button Location Visual

```
Page Layout:
┌─────────────────────────────────────────────────────────────┐
│ Sidebar                                                       │
│ ┌──────┐                                                     │
│ │ VNTV │  Categories                   [+ Create Category]   │
│ │      │  ─────────                     ↑                    │
│ │ Dash │  Manage content categories     THIS BUTTON          │
│ │ Arts │                                                      │
│ │ Cats │  ┌─────────────────────────────────────────────┐  │
│ │ Tags │  │ Name        Description        Status       │  │
│ │ Auth │  │ ─────────────────────────────────────────── │  │
│ │ Usrs │  │ Politics    Coverage of...     Active       │  │
│ │ Rols │  │                                              │  │
│ └──────┘  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Dialog Close Options

You can close the dialog using:
- ❌ **X button** (top-right corner of dialog)
- 🔘 **Cancel button** (bottom-left of dialog)
- ⌨️ **Escape key** on keyboard
- 🖱️ **Click outside** the dialog (on the dark backdrop)

## Troubleshooting

### "I don't see the button"
1. Make sure you're logged in as admin (vnationtech7@gmail.com)
2. Refresh the page (Cmd+R or Ctrl+R)
3. Check the browser console for errors

### "The button is not clickable"
1. Make sure the page has finished loading
2. Check that you have the latest code version
3. Try clearing cache and reloading

### "The dialog doesn't open"
1. Open browser console (F12) to check for JavaScript errors
2. Make sure the dev server is running
3. Try refreshing the page

## Next Steps

After creating categories, you can:
1. **Edit** a category by clicking the pencil icon
2. **Delete** a category by clicking the trash icon
3. **Create subcategories** by setting a parent category
4. **Reorder** categories by changing the display order
5. **Deactivate** categories by unchecking "Active"

## Related Files

- Categories Page: `/app/admin/categories/page.tsx`
- Category Dialog: `/components/cms/category-dialog.tsx`
- Page Header: `/components/cms/page-header.tsx`
- Test Data: `/TEST_DATA_CATEGORIES.md`
