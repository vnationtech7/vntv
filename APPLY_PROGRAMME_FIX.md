# Fix for Programme RLS Error

## Problem
The programmes CMS page is showing "Error fetching programmes: {}" because the RLS policies don't allow editors to manage programmes.

## Solution Applied
1. ✅ Added "Programmes" link to admin sidebar
2. ✅ Created new migration with management policies

## You Need To Run This Migration

Apply the new migration to your Supabase database:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Using direct SQL (if using Supabase Studio)
# Go to SQL Editor and run the file:
# supabase/migrations/20260829000001_add_programme_episode_management_policies.sql
```

## What the Migration Does

The migration adds two RLS policies:

1. **"Editors can manage programmes"** - Allows super_admin, editor, and video_editor roles to:
   - Create new programmes
   - Update existing programmes
   - Delete programmes
   - Read all programmes (including inactive)

2. **"Editors can manage episodes"** - Same permissions for episodes

## After Migration

Once applied, you should be able to:
- ✅ View `/admin/programmes` without errors
- ✅ Create new programmes
- ✅ Edit programmes
- ✅ See all programmes (active and inactive) in CMS
- ✅ Public homepage only shows active programmes

## Verify It Works

1. Go to `/admin/programmes` - should load without error
2. Click "New Programme" - should show form
3. Homepage (`/`) - should load (Originals section hidden if no active programmes)
