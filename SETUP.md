# VNTV Setup Guide

This guide will walk you through setting up the VNTV platform from scratch.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- A Supabase account (free tier is fine for development)

## Step 1: Clone and Install

```bash
cd /Users/macbookair/vnation/vntv
npm install
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Sign in with GitHub (vnationtech7)
3. Click "New Project"
4. Fill in the details:
   - **Name**: `vntv` or `vntv-production`
   - **Database Password**: Choose a strong password and **save it securely**
   - **Region**: Choose closest to your target audience (EU-West for Africa or Asia-Pacific)
   - **Pricing Plan**: Free (for development)
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be ready

## Step 3: Get API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. You'll see a section called "Project API keys"
3. If you don't see **Publishable key** and **Secret key**, create them:
   - Click "Create new API keys" button
   - This will generate the new key format alongside legacy keys
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Publishable key** (starts with: `sb_publishable_`)
   - **Secret key** (starts with: `sb_secret_`)

## Step 4: Configure Environment Variables

1. Create `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
SUPABASE_SECRET_KEY=sb_secret_your_key_here

# Google OAuth (configure after setting up auth)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5: Apply Database Migrations

### Option A: Using Supabase SQL Editor (Recommended for first-time setup)

1. Go to your Supabase dashboard > **SQL Editor**
2. Click "New query"
3. Copy the entire content of `supabase/migrations/20260826000001_initial_schema.sql`
4. Paste and click "Run"
5. Wait for completion (should show success)
6. Create another new query
7. Copy the entire content of `supabase/migrations/20260826000002_rls_policies.sql`
8. Paste and click "Run"
9. Verify success

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 6: Configure Supabase Storage

1. Go to **Storage** in your Supabase dashboard
2. Create these buckets:
   - `media` (public)
   - `videos` (public)
   - `avatars` (public)
   - `documents` (private)

3. For each **public** bucket, set policies:
   - Go to the bucket settings
   - Enable "Public bucket" or add policies for public read access

## Step 7: Configure Google OAuth

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Choose "Web application"
7. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
8. Copy **Client ID** and **Client Secret**

9. In Supabase dashboard, go to **Authentication** > **Providers**
10. Enable **Google**
11. Paste your Client ID and Client Secret
12. Save

## Step 8: Create Your First Admin User

1. Run the development server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. You should see the VNTV setup page
4. Sign up with Google OAuth (or email/password)

5. Get your user ID from Supabase:
   - Go to **Authentication** > **Users** in Supabase dashboard
   - Copy your user's UUID

6. Assign super_admin role via SQL Editor:
```sql
INSERT INTO user_roles (user_id, role_id)
SELECT 'your-user-id-uuid'::uuid, id 
FROM roles 
WHERE name = 'super_admin';
```

## Step 9: Verify Setup

1. Check that the app runs without errors
2. Verify database tables exist in Supabase **Table Editor**
3. Test authentication (sign in/out)
4. Check that your user has the super_admin role:
```sql
SELECT u.email, r.name as role
FROM profiles u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.id = 'your-user-id-uuid'::uuid;
```

## Step 10: Generate TypeScript Types (Optional but Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types
supabase gen types typescript --linked > types/supabase.ts
```

## Troubleshooting

### "Invalid API key" errors

- Make sure you're using the new **publishable key** format (starts with `sb_publishable_`)
- Check that environment variables are set correctly in `.env.local`
- Restart the Next.js dev server after changing environment variables

### Database migration errors

- Make sure migrations are applied in order
- Check Supabase logs for specific error messages
- Verify your database password is correct

### RLS "permission denied" errors

- Check that you're logged in
- Verify your user has the correct role assigned
- Review RLS policies in Supabase dashboard > **Authentication** > **Policies**

### OAuth not working

- Verify redirect URIs are correct in Google Cloud Console
- Check that Google provider is enabled in Supabase
- Make sure Client ID and Secret are correctly entered

## Next Steps

Once setup is complete, you're ready for:

✅ **Milestone 1 Complete**: Foundation & Database Architecture  
➡️ **Milestone 2 Next**: Design System & Core UI Components

See [milestones.md](./milestones.md) for the full development plan.

## Useful Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types

# Database
supabase db push     # Push migrations
supabase db pull     # Pull remote schema
supabase gen types typescript --linked > types/supabase.ts  # Generate types
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
