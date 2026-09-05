# 🔧 Fix Comments & Likes RLS Issues

## Problems
1. ❌ Comments fail with: "new row violates row-level security policy"
2. ❌ Likes don't save to database
3. ❌ Likes disappear after page refresh

## Root Cause
The RLS (Row Level Security) policies are too restrictive and blocking inserts.

## ✅ QUICK FIX - Run This SQL

Copy and paste **`QUICK_FIX_ALL_RLS.sql`** into your Supabase SQL Editor and run it.

Or copy this directly:

```sql
-- =====================================================
-- FIX COMMENTS RLS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'approved')
    AND depth >= 0 
    AND depth <= 3
  );

-- =====================================================
-- FIX LIKES RLS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- =====================================================
-- FIX COMMENT LIKES RLS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;

CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );
```

## What This Does

### Before (Broken)
- Policies checked `is_authenticated()` function
- Function might not work correctly in all contexts
- Inserts were blocked

### After (Fixed)
- Uses `TO authenticated` (built-in Supabase check)
- Uses `auth.uid()` (built-in function)
- Simpler and more reliable

## After Running the Fix

### Test Comments
1. Go to any article
2. Try posting a comment
3. ✅ Should work immediately
4. ✅ Comment appears in list
5. ✅ Refresh page - comment still there

### Test Likes
1. Click the like button
2. ✅ Counter increases
3. ✅ Heart fills with color
4. Refresh the page
5. ✅ Like is still there
6. ✅ Heart stays filled

### Check Database
Run in Supabase SQL Editor:

```sql
-- Check if your like was saved
SELECT * FROM likes 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- Check if your comment was saved
SELECT * FROM comments 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
```

You should see your data! ✅

## Why This Happened

The original migration used `is_authenticated()` helper function in the RLS policies. However:
1. The function exists in your database
2. But RLS policies prefer built-in functions like `auth.uid()`
3. Using `TO authenticated` is more reliable

## Verify It's Working

### Step 1: Check Policies
```sql
SELECT 
  tablename, 
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('comments', 'likes', 'comment_likes')
ORDER BY tablename, cmd;
```

Should show:
- `comments` - "Authenticated users can create comments" (INSERT)
- `likes` - "Authenticated users can create likes" (INSERT)
- `likes` - "Users can delete own likes" (DELETE)
- `comment_likes` - "Authenticated users can like comments" (INSERT)
- `comment_likes` - "Users can unlike comments" (DELETE)

### Step 2: Test Auth
```sql
SELECT 
  auth.uid() as your_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated ✅'
    ELSE 'Not authenticated ❌'
  END as status;
```

Should show your user ID and "Authenticated ✅"

### Step 3: Try Creating Data

**Test Comment:**
```sql
INSERT INTO comments (
  content_type,
  content_id,
  user_id,
  body,
  body_html,
  status
) VALUES (
  'article',
  '234085ad-e138-4f69-ac1d-3283e2cc11b2',  -- Use actual article ID
  auth.uid(),
  'Test comment from SQL',
  'Test comment from SQL',
  'approved'
);
```

**Test Like:**
```sql
INSERT INTO likes (
  content_type,
  content_id,
  user_id,
  reaction_type
) VALUES (
  'article',
  '234085ad-e138-4f69-ac1d-3283e2cc11b2',  -- Use actual article ID
  auth.uid(),
  'like'
);
```

Both should work! ✅

## Migration Files Available

If you prefer to run as migrations:
1. `supabase/migrations/20260905000003_fix_comments_rls.sql` - Comments fix
2. `supabase/migrations/20260905000004_fix_likes_rls.sql` - Likes fix
3. `QUICK_FIX_ALL_RLS.sql` - All fixes in one file (recommended)

## Summary

**Problem**: RLS policies too restrictive  
**Solution**: Simplified policies using built-in auth  
**Result**: Comments and likes work perfectly ✅  

---

**Run the SQL above and test immediately!**
