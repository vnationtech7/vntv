# Authentication Testing Checklist

Complete testing checklist for Milestone 3: Authentication & User Management

## Pre-Testing Setup

- [x] Database migrations run successfully
- [x] Environment variables configured
- [x] Supabase project accessible
- [x] Dev server running
- [x] TypeScript compilation passing

## 1. Email/Password Signup

### Happy Path
- [ ] Navigate to homepage
- [ ] Click "Sign Up" button
- [ ] Modal opens successfully
- [ ] Fill in full name, email, password
- [ ] Check "Terms of Service" checkbox
- [ ] Click "Create Account"
- [ ] **Expected**: Success, profile created, user logged in
- [ ] **Verify**: User redirected to homepage
- [ ] **Verify**: Profile exists in database
- [ ] **Verify**: User can access Settings page

### Error Cases
- [ ] Submit without full name → Error shown
- [ ] Submit without email → Error shown
- [ ] Submit with invalid email → Error shown
- [ ] Submit without password → Error shown
- [ ] Submit with short password (< 8 chars) → Error shown
- [ ] Submit without accepting terms → Error shown
- [ ] Submit with existing email → Error shown

### Email Confirmation (if enabled)
- [ ] Sign up with new email
- [ ] **Expected**: "Check your email" message
- [ ] Check email inbox
- [ ] Click confirmation link
- [ ] **Expected**: Redirected to app, logged in
- [ ] **Verify**: Profile created

## 2. Email/Password Login

### Happy Path
- [ ] Navigate to homepage (logged out)
- [ ] Click "Sign In" button
- [ ] Modal opens successfully
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] **Expected**: Success, user logged in
- [ ] **Verify**: Modal closes
- [ ] **Verify**: User redirected to homepage
- [ ] **Verify**: User email shown in header/profile

### Error Cases
- [ ] Submit without email → Error shown
- [ ] Submit without password → Error shown
- [ ] Submit with wrong password → "Invalid credentials" error
- [ ] Submit with non-existent email → "Invalid credentials" error

### Modal Interactions
- [ ] Click "Forgot password?" → Reset modal opens
- [ ] Click "Sign up" link → Signup modal opens
- [ ] Click outside modal → Modal closes
- [ ] Press Escape key → Modal closes

## 3. Google OAuth

### Sign Up with Google
- [ ] Click "Continue with Google" on signup modal
- [ ] **Expected**: Redirected to Google OAuth page
- [ ] Select Google account
- [ ] Grant permissions
- [ ] **Expected**: Redirected back to app
- [ ] **Verify**: User logged in
- [ ] **Verify**: Profile created with Google data
- [ ] **Verify**: Email matches Google account

### Sign In with Google
- [ ] Sign out first
- [ ] Click "Continue with Google" on login modal
- [ ] **Expected**: Redirected to Google OAuth page
- [ ] Select same Google account
- [ ] **Expected**: Redirected back to app, logged in
- [ ] **Verify**: Existing profile used (not duplicate)

### Error Cases
- [ ] Cancel Google OAuth → Redirected back, not logged in
- [ ] Revoke permissions → Auth fails gracefully

## 4. Password Reset

### Happy Path
- [ ] Click "Forgot password?" on login modal
- [ ] Reset modal opens
- [ ] Enter email address
- [ ] Click "Send Reset Link"
- [ ] **Expected**: "Check your email" message
- [ ] Check email inbox
- [ ] Click reset link in email
- [ ] **Expected**: Redirected to reset page
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Click "Update Password"
- [ ] **Expected**: Password updated, logged in
- [ ] **Verify**: Can log in with new password

### Error Cases
- [ ] Submit without email → Error shown
- [ ] Submit with non-existent email → Success message (security)
- [ ] New passwords don't match → Error shown
- [ ] New password too short → Error shown

## 5. Sign Out

### Happy Path
- [ ] While logged in, click "Sign Out"
- [ ] **Expected**: User logged out
- [ ] **Verify**: Redirected to homepage
- [ ] **Verify**: "Sign In" button shown
- [ ] **Verify**: Protected pages not accessible
- [ ] Try accessing /settings → Redirected to homepage

## 6. Profile Management

### View Profile
- [ ] Navigate to /settings while logged in
- [ ] **Expected**: Settings page loads
- [ ] **Verify**: Profile data displayed correctly
- [ ] **Verify**: Email shown (read-only)
- [ ] **Verify**: Full name shown
- [ ] **Verify**: Bio shown (if set)
- [ ] **Verify**: Newsletter checkbox reflects state

### Update Profile
- [ ] Change full name
- [ ] Update bio
- [ ] Toggle newsletter subscription
- [ ] Click "Save Changes"
- [ ] **Expected**: "Profile updated successfully" message
- [ ] Reload page
- [ ] **Verify**: Changes persisted

### Avatar Upload
- [ ] Click "Upload New" avatar button
- [ ] Select image file (< 2MB, JPG/PNG/GIF)
- [ ] **Expected**: Upload progress shown
- [ ] **Expected**: Avatar updates
- [ ] **Verify**: Avatar URL in database
- [ ] **Verify**: Avatar shown in Supabase Storage
- [ ] Reload page
- [ ] **Verify**: Avatar persisted

### Avatar Delete
- [ ] Upload avatar first
- [ ] Click "Delete" avatar button
- [ ] Confirm deletion
- [ ] **Expected**: Avatar removed
- [ ] **Verify**: Default avatar shown
- [ ] **Verify**: File deleted from storage
- [ ] Reload page
- [ ] **Verify**: Avatar still deleted

### Error Cases
- [ ] Upload file > 2MB → Error shown
- [ ] Upload non-image file → Error shown
- [ ] Update with empty name → Error shown

## 7. Role Management (Admin)

### Prerequisites
- [ ] Have super_admin role assigned via SQL:
  ```sql
  INSERT INTO user_roles (user_id, role_id)
  SELECT '<your-user-id>', id FROM roles WHERE name = 'super_admin';
  ```

### View Roles
- [ ] Navigate to /admin/roles
- [ ] **Expected**: Role list shown
- [ ] **Verify**: All 5 roles visible:
  - super_admin
  - editor
  - reporter
  - video_editor
  - advertising_manager

### Assign Role to User
- [ ] Navigate to /admin/users
- [ ] **Expected**: User list shown
- [ ] Click user to assign role
- [ ] Select role from dropdown
- [ ] Click "Assign Role"
- [ ] **Expected**: Role assigned successfully
- [ ] **Verify**: Role appears in user's role list
- [ ] **Verify**: Database record created

### Remove Role from User
- [ ] Find user with assigned role
- [ ] Click "Remove" next to role
- [ ] Confirm removal
- [ ] **Expected**: Role removed
- [ ] **Verify**: Role no longer in list
- [ ] **Verify**: Database record deleted

### Access Control
- [ ] Sign out
- [ ] Try accessing /admin/roles directly
- [ ] **Expected**: Redirected to homepage (403 or redirect)
- [ ] Sign in as non-admin user
- [ ] Try accessing /admin/roles
- [ ] **Expected**: "Unauthorized" message or redirect

## 8. Content Access Gates

### Article Gate

#### Anonymous User
- [ ] Sign out (or use incognito window)
- [ ] Navigate to /demo/gate
- [ ] **Verify**: "Anonymous" badge shown for article gate
- [ ] Click "Scroll Down" to increase scroll to 60%
- [ ] **Expected**: Article gate modal opens
- [ ] **Verify**: "Continue Reading" title shown
- [ ] **Verify**: Auth form displayed

#### Sign Up via Gate
- [ ] Fill signup form in gate modal
- [ ] Submit form
- [ ] **Expected**: Profile created, user logged in
- [ ] **Expected**: Gate modal closes
- [ ] **Verify**: "Authenticated" badge shown
- [ ] Reset and scroll again
- [ ] **Verify**: Gate does NOT trigger (user authenticated)

#### Sign In via Gate
- [ ] Sign out
- [ ] Navigate to /demo/gate
- [ ] Trigger article gate (scroll to 60%)
- [ ] Switch to login tab in gate modal
- [ ] Enter credentials
- [ ] Submit form
- [ ] **Expected**: User logged in, gate closes
- [ ] **Verify**: Can continue interaction

### Video Gate

#### Anonymous User
- [ ] Sign out (or use incognito window)
- [ ] Navigate to /demo/gate
- [ ] **Verify**: "Anonymous" badge shown for video gate
- [ ] Click "Play" button
- [ ] Wait for video to reach 25%
- [ ] **Expected**: Video pauses automatically
- [ ] **Expected**: Video gate modal opens
- [ ] **Verify**: "Continue Watching" title shown

#### Authenticate via Gate
- [ ] Fill login form in gate modal
- [ ] Submit form
- [ ] **Expected**: User logged in
- [ ] **Expected**: Gate closes
- [ ] **Expected**: Video resumes playback
- [ ] **Verify**: "Authenticated" badge shown

#### Authenticated User
- [ ] While logged in, click "Play" video
- [ ] Let video play past 25%
- [ ] **Verify**: Gate does NOT trigger
- [ ] **Verify**: Video plays continuously

### Gate Settings
- [ ] Check `site_settings` table in database
- [ ] **Verify**: `anonymous_article_gate_enabled` setting exists
- [ ] **Verify**: `anonymous_video_gate_enabled` setting exists
- [ ] Toggle settings to test enable/disable

## 9. Session Management

### Session Persistence
- [ ] Sign in
- [ ] Close browser tab
- [ ] Reopen application
- [ ] **Verify**: Still logged in
- [ ] **Verify**: Profile data accessible

### Session Refresh
- [ ] Sign in
- [ ] Leave browser open for 1 hour
- [ ] Interact with app
- [ ] **Verify**: Still logged in (session refreshed)

### Cross-Tab Sync
- [ ] Open app in two tabs
- [ ] Sign in on tab 1
- [ ] Switch to tab 2
- [ ] Refresh tab 2
- [ ] **Verify**: User logged in on tab 2
- [ ] Sign out on tab 1
- [ ] Switch to tab 2
- [ ] Refresh or interact
- [ ] **Verify**: User logged out on tab 2

## 10. Protected Routes

### Settings Page
- [ ] While logged out, navigate to /settings
- [ ] **Expected**: Redirected to homepage
- [ ] Sign in
- [ ] Navigate to /settings
- [ ] **Expected**: Page loads successfully

### Admin Pages
- [ ] While logged out, navigate to /admin/roles
- [ ] **Expected**: Redirected or 403 error
- [ ] Sign in as non-admin
- [ ] Navigate to /admin/roles
- [ ] **Expected**: "Unauthorized" message
- [ ] Sign in as admin
- [ ] Navigate to /admin/roles
- [ ] **Expected**: Page loads successfully

## 11. Mobile Responsiveness

### Authentication Modals
- [ ] Open on mobile viewport (< 640px)
- [ ] **Verify**: Modal fits screen
- [ ] **Verify**: Form inputs are touch-friendly
- [ ] **Verify**: Buttons are tappable
- [ ] **Verify**: No horizontal scroll
- [ ] **Verify**: Virtual keyboard doesn't obscure inputs

### Settings Page
- [ ] Open /settings on mobile
- [ ] **Verify**: Layout stacks vertically
- [ ] **Verify**: Avatar upload works on mobile
- [ ] **Verify**: All form fields accessible

### Content Gates
- [ ] Trigger article gate on mobile
- [ ] **Verify**: Gate modal responsive
- [ ] **Verify**: Form usable on small screen
- [ ] Trigger video gate on mobile
- [ ] **Verify**: Video controls accessible

## 12. Accessibility

### Keyboard Navigation
- [ ] Open login modal
- [ ] Tab through all form fields
- [ ] **Verify**: Focus visible on all elements
- [ ] **Verify**: Tab order is logical
- [ ] Press Enter on focused button
- [ ] **Verify**: Form submits
- [ ] Press Escape
- [ ] **Verify**: Modal closes

### Screen Reader
- [ ] Use screen reader (VoiceOver, NVDA, JAWS)
- [ ] Navigate through login form
- [ ] **Verify**: Labels read correctly
- [ ] **Verify**: Errors announced
- [ ] **Verify**: Success messages announced
- [ ] **Verify**: Modal role announced

### Focus Management
- [ ] Open modal
- [ ] **Verify**: Focus moves into modal
- [ ] Tab through modal
- [ ] **Verify**: Focus trapped in modal
- [ ] Close modal
- [ ] **Verify**: Focus returns to trigger button

## 13. Error Handling

### Network Errors
- [ ] Disable network connection
- [ ] Try to sign in
- [ ] **Expected**: Network error shown
- [ ] Re-enable network
- [ ] Retry
- [ ] **Expected**: Success

### Server Errors
- [ ] Temporarily break Supabase connection (wrong URL)
- [ ] Try to sign in
- [ ] **Expected**: Error message shown
- [ ] Fix connection
- [ ] Retry
- [ ] **Expected**: Success

### Validation Errors
- [ ] Enter invalid data in forms
- [ ] **Verify**: Inline validation errors shown
- [ ] **Verify**: Error messages are clear
- [ ] **Verify**: Form fields highlighted
- [ ] Fix errors
- [ ] **Verify**: Errors cleared

## 14. Performance

### Page Load Times
- [ ] Measure homepage load time
- [ ] **Target**: < 2 seconds
- [ ] Measure settings page load time
- [ ] **Target**: < 2 seconds

### Modal Opening
- [ ] Click "Sign In"
- [ ] **Verify**: Modal opens instantly (< 200ms)
- [ ] **Verify**: No layout shift

### Form Submission
- [ ] Submit login form
- [ ] **Verify**: Loading state shown immediately
- [ ] **Verify**: Response within 2 seconds
- [ ] **Verify**: Success feedback shown

## 15. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

For each browser:
- [ ] Sign up works
- [ ] Sign in works
- [ ] OAuth works
- [ ] Profile management works
- [ ] Modals display correctly
- [ ] Forms submit correctly

## Testing Summary

### Critical Issues (P0)
- [ ] No P0 issues found

### High Priority Issues (P1)
- [ ] No P1 issues found

### Medium Priority Issues (P2)
- [ ] List any found issues

### Low Priority Issues (P3)
- [ ] List any found issues

### Notes
```
Add any additional observations or notes here
```

## Sign-Off

- [ ] All critical paths tested
- [ ] No blocking issues
- [ ] Documentation updated
- [ ] Ready for next milestone

**Tested by**: _________________  
**Date**: _________________  
**Sign-off**: _________________
