# Comments System Troubleshooting

## Error: "Failed to create comment"

### Step 1: Check if Migration Was Run

Run this in Supabase SQL Editor:

```sql
-- Check if comments table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'comments'
);
```

**Expected Result**: `true`

If `false`, **run the migration**:
```sql
-- Run the contents of:
-- supabase/migrations/20260905000001_comments_likes_system.sql
```

### Step 2: Check Settings

```sql
-- Check if comments are enabled
SELECT key, value 
FROM site_settings 
WHERE key IN ('comments_enabled', 'auto_approve_comments', 'require_email_verified_to_comment');
```

**Expected Results**:
```
comments_enabled: true
auto_approve_comments: true
require_email_verified_to_comment: true (or false)
```

If missing, run:
```sql
INSERT INTO site_settings (key, value, description) VALUES
  ('comments_enabled', 'true'::jsonb, 'Enable comments system'),
  ('auto_approve_comments', 'true'::jsonb, 'Auto-approve comments'),
  ('require_email_verified_to_comment', 'false'::jsonb, 'Require verified email')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Step 3: Check User Profile

```sql
-- Replace YOUR_USER_ID with your actual user ID
SELECT id, email, email_verified, role
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

If `email_verified` is `false` and `require_email_verified_to_comment` is `true`, either:
- Verify your email, OR
- Disable the requirement:

```sql
UPDATE site_settings 
SET value = 'false'::jsonb 
WHERE key = 'require_email_verified_to_comment';
```

### Step 4: Check RLS Policies

```sql
-- Check if RLS is enabled on comments table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'comments';
```

**Expected**: `rowsecurity: true`

```sql
-- Check insert policy exists
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'comments'
  AND cmd = 'INSERT';
```

**Expected**: Policy named "Authenticated users can create comments"

### Step 5: Test Direct Insert

Try inserting a test comment directly (replace values):

```sql
-- Get your user ID first
SELECT auth.uid();

-- Try inserting a test comment
INSERT INTO comments (
  content_type,
  content_id,
  user_id,
  body,
  body_html,
  status
) VALUES (
  'article',
  'YOUR_ARTICLE_ID',  -- Replace with actual article ID
  auth.uid(),         -- Your user ID
  'Test comment',
  'Test comment',
  'approved'
);
```

**If this fails**, check the error message.

### Step 6: Check Browser Console

Open browser console (F12) and look for detailed error messages.

Common errors and solutions:

#### Error: "new row violates row-level security policy"
**Solution**: RLS policy is blocking. Check if user is authenticated:
```sql
-- Verify authentication helper functions exist
SELECT proname FROM pg_proc WHERE proname IN ('is_authenticated', 'has_role', 'has_any_role');
```

If missing, run the RLS helpers from the migration.

#### Error: "relation 'comments' does not exist"
**Solution**: Migration not run. Run the migration file.

#### Error: "Please verify your email address"
**Solution**: Either verify email or disable requirement:
```sql
UPDATE site_settings 
SET value = 'false'::jsonb 
WHERE key = 'require_email_verified_to_comment';
```

#### Error: "duplicate key value violates unique constraint"
**Solution**: There might be a unique constraint issue. Check:
```sql
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'comments'::regclass;
```

### Step 7: Check Article/Video/Episode ID

Make sure the content ID you're commenting on exists:

```sql
-- For articles
SELECT id, title FROM articles WHERE id = 'YOUR_CONTENT_ID';

-- For videos  
SELECT id, title FROM videos WHERE id = 'YOUR_CONTENT_ID';

-- For episodes
SELECT id, title FROM episodes WHERE id = 'YOUR_CONTENT_ID';
```

### Step 8: Enable Detailed Logging

Add this temporarily to `app/actions/comments.ts` in the createComment function:

```typescript
console.log('Creating comment:', {
  contentType,
  contentId,
  userId: user.id,
  bodyLength: body.length,
  status,
  depth
});
```

Check server logs (terminal where `npm run dev` is running) for the output.

### Common Solutions

#### Quick Fix 1: Disable Email Verification
```sql
UPDATE site_settings 
SET value = 'false'::jsonb 
WHERE key = 'require_email_verified_to_comment';
```

#### Quick Fix 2: Ensure Auto-Approval
```sql
UPDATE site_settings 
SET value = 'true'::jsonb 
WHERE key = 'auto_approve_comments';
```

#### Quick Fix 3: Verify User Profile
```sql
-- Check if your profile exists
SELECT * FROM profiles WHERE id = auth.uid();

-- If missing, create it
-- (This should be automatic, but just in case)
```

### Step 9: Test with Simple Comment

Try posting a very simple comment:
- Single word: "Test"
- No special characters
- On a recent article

### Step 10: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try posting a comment
4. Look for the POST request
5. Check the Response for detailed error

### Get Help

If still not working, provide:
1. ✅ Browser console error (exact message)
2. ✅ Network tab response
3. ✅ Result of Step 1 (table exists?)
4. ✅ Result of Step 2 (settings values)
5. ✅ Result of Step 3 (user profile)

---

## Most Common Issue

**90% of the time**: Migration not run or email verification blocking.

**Quick test**:
```sql
-- Disable email verification temporarily
UPDATE site_settings 
SET value = 'false'::jsonb 
WHERE key = 'require_email_verified_to_comment';

-- Ensure auto-approval
UPDATE site_settings 
SET value = 'true'::jsonb 
WHERE key = 'auto_approve_comments';

-- Try commenting again
```
