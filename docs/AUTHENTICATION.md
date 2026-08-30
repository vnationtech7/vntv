# Authentication System Documentation

Complete guide to VNTV's authentication and user management system.

## Overview

The authentication system provides:
- **Email/Password Authentication** - Traditional signup and login
- **OAuth Providers** - Google OAuth (Facebook ready)
- **Session Management** - Secure server-side sessions with Next.js middleware
- **User Profiles** - Automatic profile creation and management
- **Role-Based Access Control** - Admin, Editor, Reporter, Video Editor, Advertising Manager roles
- **Content Access Gates** - Gate articles and videos for anonymous users

## Architecture

### Tech Stack
- **Supabase Auth** - Backend authentication service
- **Next.js App Router** - Server-side rendering and routing
- **Server Actions** - Type-safe server operations
- **Row Level Security** - Database-level access control

### Key Components
- `components/auth/` - Authentication UI components
- `app/auth/` - Auth server actions and callbacks
- `app/profile/` - Profile management actions
- `hooks/use-profile.ts` - Profile data hook
- `lib/supabase/` - Supabase client utilities

## Setup

### Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

1. **Run Migrations**:
   ```sql
   -- Run in Supabase SQL Editor
   -- 1. Initial schema (creates tables)
   -- See: supabase/migrations/20260826000001_initial_schema.sql
   
   -- 2. RLS policies (enables security)
   -- See: supabase/migrations/20260827000002_rls_policies.sql
   ```

2. **Verify Tables**:
   - `profiles` - User profile data
   - `roles` - Available roles
   - `user_roles` - User-role assignments

### OAuth Configuration

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Configure in Supabase Dashboard → Authentication → Providers → Google

#### Facebook OAuth (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app and get credentials
3. Configure in Supabase Dashboard → Authentication → Providers → Facebook

## Usage

### Client-Side Authentication

```tsx
import { useAuth } from "@/components/auth/auth-provider";

export function MyComponent() {
  const { openLogin, openSignup, user, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={openLogin}>Sign In</button>
          <button onClick={openSignup}>Sign Up</button>
        </div>
      )}
    </div>
  );
}
```

### Server-Side Authentication

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/");
  }

  return <div>Protected content for {user.email}</div>;
}
```

### Server Actions

```tsx
import { signIn, signUp, signOut } from "@/app/auth/actions";

// Sign in
const result = await signIn(formData);
if (result.error) {
  console.error(result.error);
}

// Sign up
const result = await signUp(formData);
if (result.error) {
  console.error(result.error);
}

// Sign out
await signOut();
```

## Authentication Flows

### 1. Email/Password Signup

**Flow:**
1. User fills signup form (email, password, full name)
2. `signUp()` action creates Supabase auth user
3. If email confirmation disabled → User logged in immediately
4. `createProfile()` creates profile record with service role
5. User redirected to homepage

**Components:**
- `SignupModal` - Signup form UI
- `app/auth/actions.ts:signUp` - Server action
- `app/profile/actions.ts:createProfile` - Profile creation

### 2. Email/Password Login

**Flow:**
1. User enters email and password
2. `signIn()` action authenticates with Supabase
3. Session cookie set automatically
4. User redirected to homepage

**Components:**
- `LoginModal` - Login form UI
- `app/auth/actions.ts:signIn` - Server action

### 3. OAuth Login (Google)

**Flow:**
1. User clicks "Continue with Google"
2. `signInWithOAuth()` redirects to Google
3. User authorizes on Google
4. Google redirects to `/auth/callback`
5. Callback route exchanges code for session
6. Profile created if doesn't exist
7. User redirected to homepage

**Components:**
- `LoginModal` / `SignupModal` - OAuth buttons
- `app/auth/actions.ts:signInWithOAuth` - Initiates OAuth
- `app/auth/callback/route.ts` - Handles callback

### 4. Password Reset

**Flow:**
1. User clicks "Forgot password"
2. Enters email in reset modal
3. `resetPassword()` sends reset email
4. User clicks link in email
5. Supabase redirects to reset page
6. User sets new password

**Components:**
- `ResetPasswordModal` - Reset request form
- `app/auth/actions.ts:resetPassword` - Server action

### 5. Sign Out

**Flow:**
1. User clicks sign out
2. `signOut()` clears session
3. User redirected to homepage

**Components:**
- `app/auth/actions.ts:signOut` - Server action

## Profile Management

### Profile Structure

```typescript
interface Profile {
  id: string;              // UUID (matches auth.users.id)
  email: string;           // Email address
  full_name: string | null; // Display name
  avatar_url: string | null; // Avatar image URL
  bio: string | null;       // User bio
  newsletter_subscribed: boolean; // Newsletter opt-in
  created_at: string;      // Timestamp
  updated_at: string;      // Timestamp
}
```

### Profile Actions

```typescript
import { createProfile, updateProfile, uploadAvatar, deleteAvatar } from "@/app/profile/actions";

// Create profile (auto-called after signup)
await createProfile(userId, email);

// Update profile
await updateProfile({
  full_name: "John Doe",
  bio: "Software developer",
  newsletter_subscribed: true,
});

// Upload avatar
const formData = new FormData();
formData.append("avatar", file);
await uploadAvatar(formData);

// Delete avatar
await deleteAvatar();
```

### Profile Hook

```tsx
import { useProfile } from "@/hooks/use-profile";

export function ProfileComponent() {
  const { profile, loading, error, refetch } = useProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile</div>;

  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>{profile.email}</p>
    </div>
  );
}
```

## Role-Based Access Control

### Available Roles

- **super_admin** - Full system access
- **editor** - Editorial review and publishing
- **reporter** - Create and manage articles
- **video_editor** - Manage video content
- **advertising_manager** - Manage advertising and sponsorships

### Role Management

```typescript
import { assignRole, removeRole, getUserRoles } from "@/app/admin/roles/actions";

// Assign role to user
await assignRole(userId, roleId);

// Remove role from user
await removeRole(userId, roleId);

// Get user's roles
const roles = await getUserRoles(userId);
```

### Role Checking

```typescript
import { hasRole, isAdmin } from "@/lib/auth-helpers";

// Check if user has specific role
if (await hasRole(userId, "editor")) {
  // User is an editor
}

// Check if user is admin
if (await isAdmin(userId)) {
  // User is admin
}
```

### Protected Routes

```tsx
import { AdminRoute } from "@/components/auth/admin-route";

export default function AdminPage() {
  return (
    <AdminRoute>
      <div>Admin-only content</div>
    </AdminRoute>
  );
}
```

## Content Access Gates

### Overview

Content gates require anonymous users to authenticate before accessing premium content.

### Configuration

Set in `site_settings` table:
- `anonymous_article_gate_enabled` - Enable article gating
- `anonymous_video_gate_enabled` - Enable video gating

### Article Gate

```tsx
import { ContentAccessGate } from "@/components/content";
import { useContentGate } from "@/hooks/use-content-gate";

export function ArticlePage({ article, gateEnabled }) {
  const { showGate, triggerGate, closeGate } = useContentGate({
    type: "article",
    enabled: gateEnabled,
    contentTitle: article.title,
  });

  useEffect(() => {
    // Trigger gate at 50% scroll
    const handleScroll = () => {
      const progress = (window.scrollY / document.body.scrollHeight) * 100;
      if (progress > 50) {
        triggerGate();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <article>{/* Content */}</article>
      <ContentAccessGate
        type="article"
        isOpen={showGate}
        onClose={closeGate}
        contentTitle={article.title}
      />
    </>
  );
}
```

### Video Gate

```tsx
import { ContentAccessGate } from "@/components/content";
import { useContentGate } from "@/hooks/use-content-gate";

export function VideoPlayer({ video, gateEnabled }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showGate, triggerGate, closeGate } = useContentGate({
    type: "video",
    enabled: gateEnabled,
    contentTitle: video.title,
  });

  const handleTimeUpdate = () => {
    const progress = (videoRef.current!.currentTime / videoRef.current!.duration) * 100;
    
    // Trigger gate at 25%
    if (progress >= 25) {
      videoRef.current!.pause();
      triggerGate();
    }
  };

  return (
    <>
      <video ref={videoRef} onTimeUpdate={handleTimeUpdate} />
      <ContentAccessGate
        type="video"
        isOpen={showGate}
        onClose={closeGate}
        onAuthenticated={() => videoRef.current?.play()}
        contentTitle={video.title}
      />
    </>
  );
}
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

**Profiles:**
- Users can read all profiles
- Users can insert their own profile
- Users can update their own profile

**User Roles:**
- Everyone can read roles
- Only service role can manage assignments

**Content:**
- Everyone can read published content
- Authenticated users can create content
- Users can update their own content

### Service Role Usage

The service role key bypasses RLS and is used for:
- Creating profiles after signup
- Admin operations
- System-level tasks

**Security Rules:**
- ✅ Only use in server-side code
- ✅ Never expose to browser
- ✅ Keep in `.env.local` (not `NEXT_PUBLIC_*`)
- ✅ Only for specific admin operations

### Session Management

- Sessions stored in HTTP-only cookies
- Automatic refresh handled by Supabase
- Middleware validates sessions on protected routes
- Sessions expire after inactivity

## Testing

### Manual Testing Checklist

#### Email/Password Authentication
- [ ] Sign up with new email
- [ ] Verify email confirmation (if enabled)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password (should fail)
- [ ] Sign out successfully

#### OAuth Authentication
- [ ] Sign up with Google
- [ ] Sign in with Google
- [ ] Profile created automatically

#### Profile Management
- [ ] Update profile name
- [ ] Update bio
- [ ] Upload avatar
- [ ] Delete avatar
- [ ] Toggle newsletter subscription
- [ ] Changes persist after page reload

#### Password Reset
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Sign in with new password

#### Content Access Gates
- [ ] Article gate shows for anonymous users
- [ ] Video gate shows at 25% playback
- [ ] Gates don't show for authenticated users
- [ ] After authentication, content resumes
- [ ] Gates only trigger once per session

#### Role Management
- [ ] Assign role to user
- [ ] Remove role from user
- [ ] Role-based route protection works
- [ ] Admin UI accessible by admins only

### Demo Page

Visit `/demo/gate` to test content access gates interactively.

## Troubleshooting

### Common Issues

**Profile not created after signup**
- Check if RLS policies are applied
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check server logs for errors
- Ensure migrations are run

**OAuth callback fails**
- Verify redirect URI in OAuth provider settings
- Check `NEXT_PUBLIC_SITE_URL` is correct
- Ensure Supabase project has OAuth configured

**Session not persisting**
- Check cookies are enabled
- Verify middleware is configured
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct

**Rate limiting on signup**
- Wait 5-10 minutes
- Disable email confirmation for development
- Use different email addresses

### Debug Tips

```typescript
// Check current user
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log("Current user:", user);

// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log("Session:", session);

// Check profile
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
console.log("Profile:", profile);
```

## API Reference

### Server Actions

#### Auth Actions (`app/auth/actions.ts`)
- `signIn(formData)` - Email/password login
- `signUp(formData)` - Email/password signup
- `signOut()` - Sign out current user
- `signInWithOAuth(provider)` - OAuth login
- `resetPassword(email)` - Request password reset
- `updatePassword(password)` - Update password

#### Profile Actions (`app/profile/actions.ts`)
- `createProfile(userId, email)` - Create new profile
- `updateProfile(updates)` - Update profile fields
- `uploadAvatar(formData)` - Upload avatar image
- `deleteAvatar()` - Delete avatar image

#### Role Actions (`app/admin/roles/actions.ts`)
- `createRole(data)` - Create new role
- `updateRole(id, data)` - Update role
- `deleteRole(id)` - Delete role
- `getRoles()` - Get all roles
- `assignRole(userId, roleId)` - Assign role to user
- `removeRole(userId, roleId)` - Remove role from user
- `getUserRoles(userId)` - Get user's roles
- `getUsers()` - Get all users

### Hooks

#### useAuth
```typescript
const {
  user,          // Current user or null
  loading,       // Loading state
  openLogin,     // Open login modal
  openSignup,    // Open signup modal
  openReset,     // Open reset modal
  signOut,       // Sign out function
} = useAuth();
```

#### useProfile
```typescript
const {
  profile,       // User profile or null
  loading,       // Loading state
  error,         // Error message or null
  refetch,       // Refetch profile
} = useProfile();
```

#### useContentGate
```typescript
const {
  showGate,      // Whether gate is shown
  triggerGate,   // Function to trigger gate
  closeGate,     // Function to close gate
  isAuthenticated, // Whether user is authenticated
} = useContentGate({ type, enabled, contentTitle });
```

## Maintenance

### Adding New OAuth Provider

1. Configure provider in Supabase Dashboard
2. Add button in `LoginModal` and `SignupModal`
3. Test authentication flow
4. Update documentation

### Modifying Profile Fields

1. Update database schema migration
2. Update TypeScript types
3. Update `ProfileForm` component
4. Update `updateProfile` action
5. Test changes

### Adding New Roles

1. Update `user_role` enum in migration
2. Add to `roles` table via SQL or UI
3. Update documentation
4. Test role assignment

## Migration Guide

### From Legacy Auth

If migrating from legacy authentication:

1. Export user data
2. Create migration script
3. Import users to Supabase Auth
4. Create profiles for all users
5. Assign roles based on legacy system
6. Test authentication flows
7. Update all auth references in code

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs/guides/auth
- Review this documentation
- Check server logs for errors
- Test with demo page: `/demo/gate`
