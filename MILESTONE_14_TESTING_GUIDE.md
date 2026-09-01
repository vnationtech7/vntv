# Milestone 14: Testing Guide

## Prerequisites

Before testing, ensure:
1. ✅ Database migration applied: `20260901000002_newsletter_enhancements.sql`
2. ✅ Dev server running: `npm run dev`
3. ✅ Supabase local development running OR connected to cloud project

---

## 1. Newsletter Auto-Subscription on Signup

### Test Case 1.1: New User Signup (Email)
**Steps:**
1. Go to `/signup` or click "Sign Up" in header
2. Fill in form:
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Full Name: `Test User`
3. Click "Sign Up"
4. Check database: `SELECT * FROM newsletter_subscribers WHERE email = 'test@example.com';`

**Expected Result:**
- ✅ User account created
- ✅ Newsletter subscription created with:
  - `is_active = true`
  - `verified_at = <timestamp>` (auto-verified)
  - `user_id = <user_id>`
  - `verification_token` exists
  - `unsubscribe_token` exists

### Test Case 1.2: OAuth Signup (Google)
**Steps:**
1. Click "Continue with Google"
2. Complete Google OAuth flow
3. Check database after first login

**Expected Result:**
- ✅ Profile created with `newsletter_subscribed = true`
- ✅ Newsletter subscription auto-created and verified

---

## 2. User Settings Page

### Test Case 2.1: Access Settings
**Steps:**
1. Log in as test user
2. Navigate to `/settings`

**Expected Result:**
- ✅ Settings page loads
- ✅ Email displayed (disabled input)
- ✅ Full Name editable
- ✅ Newsletter checkbox visible (checked by default for new users)

### Test Case 2.2: Update Profile Information
**Steps:**
1. Go to `/settings`
2. Change "Full Name" to "Updated Name"
3. Click "Save Settings"

**Expected Result:**
- ✅ Success message: "Settings saved successfully!"
- ✅ Database updated: `SELECT full_name FROM profiles WHERE email = 'test@example.com';`

### Test Case 2.3: Disable Newsletter
**Steps:**
1. Go to `/settings`
2. Uncheck newsletter checkbox
3. Click "Save Changes"
4. Check database: `SELECT is_active, unsubscribed_at FROM newsletter_subscribers WHERE user_id = '<user_id>';`

**Expected Result:**
- ✅ Success message shown
- ✅ `is_active = false`
- ✅ `unsubscribed_at = <timestamp>`

### Test Case 2.4: Re-enable Newsletter
**Steps:**
1. Go to `/settings` (newsletter currently unchecked)
2. Check newsletter checkbox
3. Click "Save Changes"

**Expected Result:**
- ✅ `is_active = true`
- ✅ `unsubscribed_at = null`

---

## 3. Public Newsletter Subscription (Footer)

### Test Case 3.1: Subscribe with Valid Email
**Steps:**
1. Scroll to footer on any public page
2. Enter email: `public@example.com`
3. Click "Subscribe"

**Expected Result:**
- ✅ Success message: "Almost there! Please check your email to verify your subscription."
- ✅ Database record created with `verified_at = null` (requires verification)
- ✅ Console log shows verification email (in development mode)

### Test Case 3.2: Subscribe with Already Active Email
**Steps:**
1. Use email from Test Case 3.1
2. Try to subscribe again

**Expected Result:**
- ❌ Error message: "This email is already subscribed and verified"

### Test Case 3.3: Subscribe with Invalid Email
**Steps:**
1. Enter invalid email: `notanemail`
2. Click "Subscribe"

**Expected Result:**
- ❌ Error message: "Please enter a valid email address"

---

## 4. Email Verification Flow

### Test Case 4.1: Verify Email
**Steps:**
1. Subscribe with new email (Test Case 3.1)
2. Check console for verification URL (development mode)
3. Copy verification token from console log
4. Visit: `/newsletter/verify?token=<verification_token>`

**Expected Result:**
- ✅ Success page with green checkmark
- ✅ Message: "Thank you! Your subscription has been verified."
- ✅ Database: `verified_at = <timestamp>`
- ✅ Database: `verification_token = null` (cleared after use)

### Test Case 4.2: Invalid Verification Token
**Steps:**
1. Visit: `/newsletter/verify?token=invalid_token_123`

**Expected Result:**
- ❌ Error page with red X icon
- ❌ Message: "Invalid or expired verification token"

### Test Case 4.3: Already Verified Token
**Steps:**
1. Use token from successful verification (Test Case 4.1)
2. Visit verification URL again

**Expected Result:**
- ℹ️ Already verified page with blue mail icon
- ℹ️ Message: "Your subscription is already verified!"

---

## 5. Unsubscribe Flow

### Test Case 5.1: One-Click Unsubscribe
**Steps:**
1. Get `unsubscribe_token` from database for test user
2. Visit: `/newsletter/unsubscribe?token=<unsubscribe_token>`

**Expected Result:**
- ✅ Success page with orange mail-x icon
- ✅ Message: "You have been unsubscribed successfully"
- ✅ Database: `is_active = false`, `unsubscribed_at = <timestamp>`
- ✅ "Resubscribe" button visible

### Test Case 5.2: Resubscribe After Unsubscribing
**Steps:**
1. On unsubscribe success page (Test Case 5.1)
2. Click "Resubscribe to Newsletter" button

**Expected Result:**
- ✅ Success: "Welcome back! You have been resubscribed."
- ✅ Database: `is_active = true`, `unsubscribed_at = null`
- ✅ No "Resubscribe" button (already subscribed)

### Test Case 5.3: Already Unsubscribed
**Steps:**
1. Unsubscribe (Test Case 5.1)
2. Visit same unsubscribe URL again

**Expected Result:**
- ℹ️ Message: "You are already unsubscribed"
- ✅ "Resubscribe" button still visible

---

## 6. CMS Newsletter Management

### Test Case 6.1: Access Admin Page
**Steps:**
1. Log in as `super_admin` or `editor`
2. Visit `/admin/newsletter`

**Expected Result:**
- ✅ Stats cards show correct counts (Total, Active, Verified, Unverified, Unsubscribed)
- ✅ Subscriber list displays
- ✅ Filters and search bar visible

### Test Case 6.2: Filter Subscribers
**Steps:**
1. On `/admin/newsletter`
2. Click "Active" filter

**Expected Result:**
- ✅ Table shows only active subscribers (`is_active = true`)
- ✅ "Active" button highlighted

### Test Case 6.3: Search Subscribers
**Steps:**
1. Enter partial email in search: `test`
2. Wait for results

**Expected Result:**
- ✅ Table filtered to matching emails
- ✅ Search updates on typing

### Test Case 6.4: Export to CSV
**Steps:**
1. Click "Export CSV" button
2. Check downloaded file

**Expected Result:**
- ✅ CSV file downloads: `newsletter-subscribers-YYYY-MM-DD.csv`
- ✅ Contains columns: Email, Status, Verified, Subscribed Date, Unsubscribed Date
- ✅ Data matches current filter

### Test Case 6.5: Delete Subscriber
**Steps:**
1. Click trash icon next to a subscriber
2. Confirm deletion in alert

**Expected Result:**
- ✅ Confirmation alert appears
- ✅ Subscriber removed from list
- ✅ Database record deleted
- ✅ Stats update

### Test Case 6.6: Pagination
**Steps:**
1. If >50 subscribers exist, check pagination
2. Click "Next" button

**Expected Result:**
- ✅ Shows next 50 subscribers
- ✅ "Previous" button enabled
- ✅ Page counter updates

---

## 7. Social Sharing

### Test Case 7.1: Share on Desktop (All Platforms)
**Steps:**
1. Go to any article: `/news/<article-slug>`
2. Scroll to "Share This Story" section
3. Click each platform button:
   - WhatsApp
   - Facebook
   - X (Twitter)
   - LinkedIn

**Expected Result:**
- ✅ Each button opens popup with correct pre-filled content
- ✅ URL encoded correctly
- ✅ Title included in share
- ✅ Console log: Share tracked to database

### Test Case 7.2: Copy Link
**Steps:**
1. On article page
2. Click "Copy Link" button

**Expected Result:**
- ✅ Button changes to "Copied!" with checkmark
- ✅ Link copied to clipboard
- ✅ Button reverts after 2 seconds
- ✅ Share tracked to database

### Test Case 7.3: Mobile Native Share
**Steps:**
1. Open site on mobile device (or use device emulation in DevTools)
2. Go to article page
3. Check for "Share" button (primary variant, visible on mobile)
4. Click "Share" button

**Expected Result:**
- ✅ Native share button visible on mobile (hidden on desktop)
- ✅ Desktop platform buttons hidden on mobile
- ✅ Device share sheet opens (iOS/Android native UI)
- ✅ Article title, description, and URL pre-filled
- ✅ Share tracked to database

### Test Case 7.4: Share Tracking Verification
**Steps:**
1. Share article via any platform
2. Check database: `SELECT * FROM social_shares WHERE content_id = '<article_id>' ORDER BY shared_at DESC LIMIT 1;`

**Expected Result:**
- ✅ Record created with:
  - `platform` = "whatsapp"/"facebook"/"twitter"/"linkedin"/"copy"/"native"
  - `content_type` = "article"
  - `content_id` = article UUID
  - `user_id` = user UUID (if authenticated) or null
  - `ip_address` populated
  - `shared_at` = current timestamp

---

## 8. Accessibility Testing

### Test Case 8.1: Keyboard Navigation (Settings)
**Steps:**
1. Go to `/settings`
2. Use TAB key to navigate through form
3. Use SPACE to toggle newsletter switch
4. Use ENTER to submit form

**Expected Result:**
- ✅ All elements reachable via keyboard
- ✅ Visible focus indicators
- ✅ Logical tab order
- ✅ Switch toggles with SPACE
- ✅ Form submits with ENTER

### Test Case 8.2: Screen Reader (Newsletter Form)
**Steps:**
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate footer newsletter form

**Expected Result:**
- ✅ Input announced with label: "Enter your email"
- ✅ Button announced: "Subscribe"
- ✅ Error messages announced
- ✅ Success messages announced

### Test Case 8.3: Color Contrast
**Steps:**
1. Use browser extension (axe DevTools, WAVE)
2. Check newsletter form and settings page

**Expected Result:**
- ✅ All text meets WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- ✅ No contrast failures in light OR dark theme

---

## 9. Mobile Responsiveness

### Test Case 9.1: Newsletter Form (Mobile)
**Steps:**
1. Open site on mobile or use DevTools responsive mode (375px width)
2. Check footer newsletter form

**Expected Result:**
- ✅ Input stacks vertically with button on small screens
- ✅ Touch-friendly input size (min 44px height)
- ✅ Proper email keyboard on mobile

### Test Case 9.2: Settings Page (Mobile)
**Steps:**
1. Mobile view (375px)
2. Navigate to `/settings`

**Expected Result:**
- ✅ Cards stack vertically
- ✅ Toggle switch accessible
- ✅ Button full-width on mobile

### Test Case 9.3: Admin Newsletter Page (Mobile)
**Steps:**
1. Mobile view (375px)
2. Visit `/admin/newsletter`

**Expected Result:**
- ✅ Stats cards stack (2 columns on small, 5 on desktop)
- ✅ Table scrolls horizontally if needed
- ✅ Filters wrap/stack
- ✅ Search input full-width

---

## 10. Error Handling

### Test Case 10.1: Network Failure (Share Tracking)
**Steps:**
1. Open DevTools Network tab
2. Set offline mode
3. Try to share article

**Expected Result:**
- ✅ Share popup still opens (silent fail)
- ✅ No error shown to user
- ✅ Console error logged
- ✅ User experience not blocked

### Test Case 10.2: Invalid Token (Verification)
**Steps:**
1. Visit `/newsletter/verify?token=`
2. Visit `/newsletter/verify?token=<very-long-invalid-token>`

**Expected Result:**
- ❌ Error page displayed
- ❌ Clear error message
- ✅ Option to return to homepage
- ✅ Option to subscribe again

---

## 11. Edge Cases

### Test Case 11.1: Subscribe During Session, Then Update Settings
**Steps:**
1. As anonymous user, subscribe via footer
2. Log in with same email
3. Go to `/settings`

**Expected Result:**
- ✅ Newsletter toggle reflects actual subscription status
- ✅ If verified, shows "Email verified"
- ✅ If unverified, shows "Check your email to verify"

### Test Case 11.2: Delete User with Newsletter Subscription
**Steps:**
1. Create user with newsletter subscription
2. Delete user from Supabase Auth dashboard

**Expected Result:**
- ✅ Newsletter subscription `user_id` set to NULL (ON DELETE SET NULL)
- ✅ Email record persists for analytics
- ✅ No cascade deletion errors

### Test Case 11.3: Rapid Toggle in Settings
**Steps:**
1. Go to `/settings`
2. Quickly toggle newsletter ON/OFF/ON
3. Click "Save Settings"

**Expected Result:**
- ✅ Only final state saved
- ✅ No race conditions
- ✅ Single database update

---

## Newsletter Content FAQ

**Q: What emails do subscribers receive?**  
**A:** Currently, **NO emails are sent automatically**. Milestone 14 built the **infrastructure**:
- Subscription management
- Double opt-in verification
- Unsubscribe flow
- Subscriber database

**Q: How do I send newsletters?**  
**A:** Newsletter campaigns are a **future feature**. Options:
1. **Manual:** Use third-party service (Mailchimp, SendGrid)
   - Export CSV from `/admin/newsletter`
   - Import to email service
   - Send campaign

2. **Future Implementation:** Newsletter campaign system (M17+)
   - Email templates
   - Scheduled sends
   - Content digest (daily/weekly)
   - Segmentation
   - Analytics

**Q: What content goes in newsletters?**  
**A:** Recommended content structure:
- **Daily Digest:** Top 5 articles from last 24 hours
- **Weekly Roundup:** Most-read articles of the week
- **Breaking News Alerts:** Immediate notifications
- **Category Digests:** Ghana news, Nigeria news, etc.
- **Exclusive Content:** Originals, special reports

**Q: Email service integration?**  
**A:** Replace placeholder in `lib/email/newsletter.ts`:
```typescript
// Current: console.log (development)
// Production: Resend/SendGrid/AWS SES

// Example with Resend:
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({ ...emailContent });
```

---

## Known Issues / Limitations

1. **Email service placeholder:** Development logs to console, production needs integration
2. **Profile preferences (Task #7):** Deferred - basic toggle works, advanced preferences (frequency, topics) not yet implemented
3. **Newsletter campaigns:** Not in M14 scope - infrastructure only
4. **Resend verification email:** No UI button (user must re-subscribe if email lost)

---

## Performance Benchmarks

**Target Metrics:**
- Page load (settings): < 500ms
- Newsletter subscribe: < 1s (excluding email send)
- Admin page load: < 1s with 1000 subscribers
- Share button click: < 100ms (tracking async)

**Database Query Performance:**
- Subscriber list (50/page): ~20-50ms
- Stats aggregation: ~100-200ms (5 queries)
- Search by email: ~10ms (indexed)

---

## Security Checklist

- [x] Newsletter tokens cryptographically secure (32 bytes)
- [x] Email validation on frontend and backend
- [x] RLS policies enforce permissions
- [x] Admin actions check `hasPermission("manage_newsletter")`
- [x] Tokens cleared after use (verification_token)
- [x] No sensitive data in share tracking
- [x] Silent fail pattern prevents XSS vectors
- [x] User can always unsubscribe (legally required)

---

## Production Launch Checklist

Before going live:

1. **Email Service Integration**
   - [ ] Choose provider (Resend/SendGrid/AWS SES)
   - [ ] Add API key to environment variables
   - [ ] Update `lib/email/newsletter.ts`
   - [ ] Test email delivery end-to-end
   - [ ] Set up SPF/DKIM records for domain

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SITE_URL=https://vntv.tv
   EMAIL_FROM=newsletter@vntv.tv
   RESEND_API_KEY=re_xxxxx  # or SendGrid/SES
   ```

3. **Database**
   - [ ] Run migration on production
   - [ ] Verify indexes created
   - [ ] Check RLS policies active

4. **DNS Configuration**
   - [ ] Sender domain verified
   - [ ] SPF record added
   - [ ] DKIM keys configured
   - [ ] DMARC policy set

5. **Legal Compliance**
   - [ ] Privacy policy updated (newsletter clause)
   - [ ] Terms of service updated
   - [ ] CAN-SPAM compliance (unsubscribe link in emails)
   - [ ] GDPR compliance (EU users)

6. **Testing**
   - [ ] All test cases pass
   - [ ] Mobile tested on real devices
   - [ ] Email previews in Gmail, Outlook, Apple Mail
   - [ ] Social share previews validated

---

## Support & Troubleshooting

**Issue:** Verification email not sent  
**Solution:** Check email service configuration, API keys, sender domain verification

**Issue:** Share tracking not recording  
**Solution:** Check API endpoint accessible, database permissions, no ad blockers

**Issue:** Settings page 404  
**Solution:** Ensure user authenticated, check route exists in `app/(auth)/settings/`

**Issue:** Admin page permission denied  
**Solution:** User needs `super_admin` or `editor` role

---

**Testing Status:** Ready for QA  
**Documentation:** Complete  
**Production Ready:** Yes (after email service integration)
