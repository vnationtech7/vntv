# VNTV Supabase Database

This directory contains the database schema migrations for the VNTV platform.

## Migrations

Migrations are applied in order:

1. **20260826000001_initial_schema.sql** - Complete database schema with all tables, indexes, and triggers
2. **20260826000002_rls_policies.sql** - Row Level Security policies for all tables

## Setup Instructions

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

3. Push migrations to your project:
```bash
supabase db push
```

### Option 2: Manual Application via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order
4. Execute each migration

### Option 3: Using Migration Scripts (for local development)

```bash
npm run db:migrate
```

## Database Structure

The database is organized into logical domains:

- **Auth Domain**: User profiles, roles, permissions
- **Editorial Domain**: Articles, categories, tags, authors, revisions
- **Media Domain**: Media assets, videos, video-article relationships
- **Originals Domain**: Programmes and episodes
- **RSS Domain**: RSS feeds, items, import logs
- **Homepage Domain**: Homepage sections and items
- **Breaking News Domain**: Breaking news management
- **Advertising Domain**: Ad slots, advertisements, sponsorships
- **Engagement Domain**: Views, video events, shares, newsletter
- **System Domain**: Site settings, audit logs, redirects

## Security

All tables have Row Level Security (RLS) enabled. Security is enforced at the database level with policies for:

- Public read access to published content
- Role-based write permissions
- User-specific data access
- Admin-only operations

## Key Features

### Enums
- Article status (draft → published workflow)
- Video types and orientations
- Content types
- Media types
- User roles

### Triggers
- Automatic `updated_at` timestamp updates
- Article revision tracking (to be implemented in app logic)

### Indexes
- Optimized for common queries (slugs, status, dates)
- Performance indexes on foreign keys
- Conditional indexes on boolean flags

## Environment Variables

Make sure to set up your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
```

## Next Steps After Migration

1. Create your first super admin user via Supabase Auth
2. Assign the super_admin role via SQL:
```sql
INSERT INTO user_roles (user_id, role_id)
SELECT 'your-user-id'::uuid, id FROM roles WHERE name = 'super_admin';
```

3. Configure Supabase Storage buckets:
   - `media` (for images and documents)
   - `videos` (for video files)
   - `avatars` (for user/author avatars)
   - `documents` (for additional documents)

4. Set up Google OAuth in Supabase Auth settings

## Troubleshooting

### Migration Errors

If you encounter errors during migration:

1. Check that the migration files are being applied in order
2. Verify your Supabase project is accessible
3. Check the Supabase logs in the dashboard

### RLS Issues

If you're getting permission errors:

1. Verify the user has the correct role assigned
2. Check the RLS policies in the dashboard
3. Use the secret key for admin operations (bypasses RLS)

## Reference

- [Supabase Documentation](https://supabase.com/docs)
- [VNTV Technical Blueprint](../Blueprint.md)
- [VNTV Product Specification](../Product_spec.md)
