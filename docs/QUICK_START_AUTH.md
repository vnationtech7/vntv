# Quick Start: Authentication Setup

Get VNTV authentication up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account created
- Git repository cloned

## Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `vntv-production` (or your choice)
   - Database Password: (strong password)
   - Region: (closest to your users)
4. Wait for project to initialize (~2 minutes)

## Step 2: Get API Keys

1. In Supabase Dashboard, go to **Settings → API**
2. Copy these values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (click "Reveal" first)

## Step 3: Configure Environment

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**⚠️ Important**: Never commit `.env.local` to git!

## Step 4: Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy content from `supabase/migrations/20260826000001_initial_schema.sql`
3. Paste and click "Run"
4. Wait for completion (should see "Success")
5. Copy content from `supabase/migrations/20260827000002_rls_policies.sql`
6. Paste and click "Run"
7. Wait for completion

**Verify**: Check **Database → Tables** - you should see ~30 tables including `profiles`, `roles`, etc.

## Step 5: Disable Email Confirmation (Dev Only)

For faster local development:

1. Go to **Authentication → Providers → Email**
2. Toggle OFF "Confirm email"
3. Click "Save"

**Note**: Re-enable this before going to production!

## Step 6: Configure Google OAuth (Optional)

### Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Configure consent screen if needed
6. Application type: **Web application**
7. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
8. Click "Create"
9. Copy Client ID and Client Secret

### Configure in Supabase

1. Go to **Authentication → Providers**
2. Find "Google" and enable it
3. Paste Client ID and Client Secret
4. Click "Save"

## Step 7: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 8: Test Authentication

### Test Email/Password Signup

1. Click "Sign Up" button
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Check "Terms of Service"
4. Click "Create Account"
5. ✅ Should be logged in immediately
6. Navigate to `/settings`
7. ✅ Should see profile page

### Test Sign Out

1. Click "Sign Out"
2. ✅ Should be logged out
3. Try accessing `/settings`
4. ✅ Should redirect to homepage

### Test Login

1. Click "Sign In"
2. Enter: `test@example.com` / `password123`
3. Click "Sign In"
4. ✅ Should be logged in

### Test Google OAuth (if configured)

1. Click "Continue with Google"
2. Select Google account
3. ✅ Should be logged in
4. Navigate to `/settings`
5. ✅ Profile created with Google data

## Step 9: Make Yourself Admin

Run this SQL in Supabase SQL Editor (replace with your user ID):

```sql
-- Find your user ID
SELECT id, email FROM auth.users;

-- Assign super_admin role
INSERT INTO user_roles (user_id, role_id)
SELECT 'your-user-id-here', id 
FROM roles 
WHERE name = 'super_admin';
```

Now visit `/admin/roles` - you should have access!

## Troubleshooting

### "Profile not created"

**Fix**: Check if service role key is set correctly in `.env.local`

```bash
# Verify it's set
echo $SUPABASE_SERVICE_ROLE_KEY

# Restart dev server
npm run dev
```

### "Invalid credentials"

**Fix**: Email confirmation might be enabled

1. Check email inbox for confirmation link
2. Or disable email confirmation (see Step 5)

### "Rate limit exceeded"

**Fix**: Wait 10 minutes or use different email

### OAuth not working

**Fix**: Check redirect URI matches exactly:
```
https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

### Can't access admin pages

**Fix**: Assign super_admin role (see Step 9)

## What's Next?

- ✅ Authentication working
- ✅ Profile management working
- ✅ Admin access configured

### Explore Features

- Visit `/demo/gate` to test content gates
- Visit `/settings` to update your profile
- Visit `/admin/roles` to manage roles
- Visit `/admin/users` to manage users

### Read Full Documentation

- [Authentication Documentation](./AUTHENTICATION.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
- [Milestones](../milestones.md)

### Production Checklist

Before deploying to production:

- [ ] Re-enable email confirmation
- [ ] Configure production Supabase project
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Update OAuth redirect URIs to production
- [ ] Test all auth flows in production
- [ ] Set up monitoring and logging
- [ ] Configure email templates in Supabase

## Need Help?

- Check [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- Review [AUTHENTICATION.md](./AUTHENTICATION.md)
- Check server logs for errors
- Test with [demo page](/demo/gate)

---

**That's it!** You now have a fully functional authentication system. 🎉
