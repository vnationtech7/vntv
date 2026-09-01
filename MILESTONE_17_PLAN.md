y# Milestone 17: Audit Logging & Security Hardening

**Goal:** Security audit trail and production hardening

**Status:** 🚀 **STARTING** - September 1, 2026

---

## Overview

This milestone focuses on establishing a comprehensive audit trail for all critical CMS actions and hardening the platform's security posture for production launch. We will implement logging, security reviews, error handling, and performance optimization.

---

## Tasks Breakdown

### 1. Audit Logging System

#### 1.1 Audit Log Schema
- [x] Review existing `audit_logs` table in database
- [ ] Verify all necessary fields (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, created_at)
- [ ] Add indexes for performance (user_id, action, created_at, resource_type)

#### 1.2 Logging Implementation
- [ ] Create `logAuditEvent()` server action
- [ ] Log article operations (create, update, delete, publish, unpublish, feature, archive)
- [ ] Log video operations (create, update, delete, publish)
- [ ] Log programme/episode operations (create, update, delete)
- [ ] Log category operations (create, update, delete)
- [ ] Log author operations (create, update, delete)
- [ ] Log tag operations (create, update, delete, merge)
- [ ] Log user role changes (assign, remove roles)
- [ ] Log settings changes (site settings, content gate settings)
- [ ] Log breaking news operations (create, update, delete, activate, deactivate)
- [ ] Log homepage section changes (reorder, enable/disable, content assignment)
- [ ] Log RSS feed operations (create, update, delete, enable/disable)
- [ ] Log media operations (upload, update metadata, delete)
- [ ] Log authentication events (optional: login, logout, failed attempts)

#### 1.3 Audit Log Viewer (CMS)
- [ ] Create `/admin/audit-logs` page
- [ ] Display audit logs in table format
- [ ] Show: timestamp, user, action, resource type, resource ID, changes summary
- [ ] Implement pagination (50 logs per page)
- [ ] Add filters:
  - [ ] Date range picker
  - [ ] User filter (dropdown)
  - [ ] Action type filter (create, update, delete, etc.)
  - [ ] Resource type filter (article, video, user, etc.)
- [ ] Add search functionality (search by resource ID, user email)
- [ ] Show old/new values diff (expandable row)
- [ ] Export audit logs (CSV format)
- [ ] Add to admin navigation sidebar

---

### 2. Security Review & Hardening

#### 2.1 Row Level Security (RLS) Review
- [ ] Review all RLS policies in `supabase/migrations`
- [ ] Test public read access (anonymous users can read published content)
- [ ] Test role-based write permissions (reporters can create drafts, editors can publish)
- [ ] Test admin-only access (user roles, site settings)
- [ ] Verify no RLS bypasses exist
- [ ] Test with different user roles (anonymous, authenticated, reporter, editor, admin)
- [ ] Document any policy changes

#### 2.2 Service Role Key Security
- [ ] Audit all server-side code for service role usage
- [ ] Verify service role key NEVER exposed to client
- [ ] Ensure service role only used in server actions/API routes
- [ ] Check environment variables are not leaked
- [ ] Review `.env` and `.env.local` security

#### 2.3 Input Validation
- [ ] Review all form inputs for validation
- [ ] Verify server-side validation on all mutations
- [ ] Check file upload validation (type, size, mime-type)
- [ ] Validate slugs (alphanumeric, hyphens only)
- [ ] Validate URLs (proper URL format)
- [ ] Validate email addresses (proper format)
- [ ] Sanitize HTML content (if accepting rich HTML from ads)
- [ ] Validate image dimensions and file sizes
- [ ] Test with malicious inputs (SQL injection attempts, XSS payloads)

#### 2.4 SQL Injection Testing
- [ ] Review all database queries for parameterization
- [ ] Test search queries with SQL injection payloads
- [ ] Test filter parameters with special characters
- [ ] Verify Supabase client properly escapes all inputs
- [ ] Test dynamic queries (if any)

#### 2.5 XSS (Cross-Site Scripting) Testing
- [ ] Test article content rendering (ensure no script execution)
- [ ] Test ad HTML rendering (sanitize or sandbox)
- [ ] Test user-generated content (author bios, comments if implemented)
- [ ] Test metadata fields (title, description, alt text)
- [ ] Verify Next.js automatic escaping working correctly
- [ ] Test with XSS payloads in various fields

#### 2.6 CSRF Protection
- [ ] Verify Next.js built-in CSRF protection active
- [ ] Test form submissions from external sites
- [ ] Verify server actions properly protected
- [ ] Check API routes (if any) have CSRF tokens

#### 2.7 Rate Limiting
- [ ] Implement rate limiting on login endpoint
- [ ] Implement rate limiting on signup endpoint
- [ ] Implement rate limiting on password reset
- [ ] Implement rate limiting on search endpoint
- [ ] Implement rate limiting on media upload
- [ ] Use Vercel Edge Config or Upstash Redis
- [ ] Set appropriate limits (10 login attempts per IP per 15 min, etc.)

#### 2.8 File Upload Security
- [ ] Verify file type validation (check magic bytes, not just extension)
- [ ] Verify file size limits enforced
- [ ] Check image files are actually images
- [ ] Prevent executable uploads (no .exe, .sh, .bat)
- [ ] Verify Supabase Storage RLS policies
- [ ] Test with malicious file uploads

---

### 3. Error Handling & User Experience

#### 3.1 Error Pages
- [ ] Custom 404 page (not-found.tsx) - Already exists, review and enhance
- [ ] Custom 500 error page (error.tsx)
- [ ] Custom offline page (for PWA - optional)
- [ ] Ensure error pages work in both themes
- [ ] Add "Back to Home" and search functionality
- [ ] Test error pages in production mode

#### 3.2 User-Friendly Error Messages
- [ ] Review all error messages shown to users
- [ ] Ensure no technical details exposed (stack traces, DB errors)
- [ ] Provide actionable guidance ("Try again" vs "Contact support")
- [ ] Toast notifications for transient errors
- [ ] Modal dialogs for critical errors
- [ ] Form validation errors clear and helpful

#### 3.3 Error Logging for Debugging
- [ ] Set up error logging service (Sentry recommended)
- [ ] Log client-side errors (React error boundaries)
- [ ] Log server-side errors (API routes, server actions)
- [ ] Log database errors (with sanitized queries)
- [ ] Include user context (user ID, role) in logs
- [ ] Exclude sensitive data from logs (passwords, tokens)
- [ ] Set up error alerting for critical issues

---

### 4. Performance Optimization

#### 4.1 Database Query Optimization
- [ ] Review slow queries in Supabase dashboard
- [ ] Analyze query plans for complex queries
- [ ] Add missing indexes:
  - [ ] articles(status, published_at)
  - [ ] articles(category_id, published_at)
  - [ ] articles(featured, published_at)
  - [ ] videos(status, published_at)
  - [ ] rss_items(feed_id, published_at)
  - [ ] article_views(article_id, created_at)
  - [ ] video_events(video_id, event_type, created_at)
- [ ] Optimize N+1 query problems (use joins or batch fetching)
- [ ] Test with large datasets (1000+ articles, 500+ videos)

#### 4.2 Index Verification
- [ ] Review all table indexes
- [ ] Verify foreign key indexes exist
- [ ] Check for unused indexes (remove if any)
- [ ] Test index usage with EXPLAIN ANALYZE
- [ ] Document index strategy

#### 4.3 Image Optimization
- [ ] Verify Next.js Image component used everywhere
- [ ] Set appropriate image quality (75-85 for photos)
- [ ] Use WebP format where supported
- [ ] Implement responsive images (srcset)
- [ ] Lazy load images below the fold
- [ ] Optimize uploaded images (compress on upload)
- [ ] Test image loading performance

#### 4.4 Code Splitting & Lazy Loading
- [ ] Verify Next.js automatic code splitting
- [ ] Lazy load heavy components (video player, modals)
- [ ] Use dynamic imports for CMS components
- [ ] Lazy load admin pages
- [ ] Lazy load search dialog
- [ ] Test bundle sizes (< 200KB gzipped for main bundle)

#### 4.5 Caching Strategy Refinement
- [ ] Review revalidation tags used
- [ ] Set appropriate stale-while-revalidate times
- [ ] Cache static assets (60 seconds for homepage, 5 minutes for articles)
- [ ] Implement incremental static regeneration (ISR) where appropriate
- [ ] Cache API responses (if exposing APIs)
- [ ] Test cache invalidation flows

#### 4.6 Bundle Size Optimization
- [ ] Analyze bundle size with `@next/bundle-analyzer`
- [ ] Tree-shake unused dependencies
- [ ] Replace heavy libraries with lighter alternatives (if any)
- [ ] Remove console.logs in production
- [ ] Minimize CSS (Tailwind purge working?)
- [ ] Target < 1MB total page weight for homepage

---

## Technical Implementation Details

### Audit Logging Schema

```typescript
// types/audit.ts
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive"
  | "feature"
  | "assign_role"
  | "remove_role"
  | "enable"
  | "disable";

export type ResourceType =
  | "article"
  | "video"
  | "programme"
  | "episode"
  | "category"
  | "tag"
  | "author"
  | "user_role"
  | "site_settings"
  | "breaking_news"
  | "homepage_section"
  | "rss_feed"
  | "media_asset";

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
```

### Audit Logging Function

```typescript
// app/actions/audit.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function logAuditEvent(params: {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn("Audit log attempted without authenticated user");
    return;
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
  const userAgent = headersList.get("user-agent");

  const { error } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    old_values: params.oldValues,
    new_values: params.newValues,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error("Failed to log audit event:", error);
  }
}
```

### Rate Limiting Example

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"), // 10 requests per 15 minutes
  analytics: true,
});

export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 uploads per hour
  analytics: true,
});
```

---

## Testing Checklist

### Audit Logging Tests
- [ ] Article created → Audit log entry exists
- [ ] Article published → Audit log shows status change
- [ ] User role assigned → Audit log shows role change
- [ ] Settings updated → Audit log shows old/new values
- [ ] Audit log viewer shows all logs
- [ ] Filters work correctly
- [ ] Export CSV works
- [ ] Pagination works

### Security Tests
- [ ] RLS policies prevent unauthorized access
- [ ] Service role key not exposed in client bundles
- [ ] SQL injection attempts blocked
- [ ] XSS payloads sanitized
- [ ] File upload validation works
- [ ] Rate limiting prevents brute force
- [ ] CSRF protection active

### Error Handling Tests
- [ ] 404 page displays correctly
- [ ] 500 error page displays correctly
- [ ] Form validation errors show helpful messages
- [ ] Network errors show retry options
- [ ] Error logging captures issues

### Performance Tests
- [ ] Homepage loads in < 2 seconds (3G)
- [ ] Article page loads in < 1.5 seconds
- [ ] Database queries < 100ms average
- [ ] Images lazy load properly
- [ ] Bundle sizes meet targets

---

## Success Criteria

✅ Audit log captures all critical CMS actions  
✅ Audit log viewer functional with filters and export  
✅ All RLS policies reviewed and tested  
✅ No security vulnerabilities found in penetration testing  
✅ Rate limiting prevents abuse  
✅ Error pages work in both themes  
✅ Error logging captures issues for debugging  
✅ Homepage performance budget met (< 2s load time)  
✅ Database queries optimized (< 100ms average)  
✅ Bundle size under 1MB for homepage  

---

## Files to Create/Modify

### New Files
- `app/actions/audit.ts` - Audit logging functions
- `app/admin/audit-logs/page.tsx` - Audit log viewer page
- `components/admin/audit-log-table.tsx` - Audit log table component
- `components/admin/audit-log-filters.tsx` - Filter controls
- `lib/rate-limit.ts` - Rate limiting utilities
- `lib/security.ts` - Security utilities (input sanitization, etc.)
- `app/error.tsx` - Global error boundary
- `supabase/migrations/20260901000005_audit_log_indexes.sql` - Performance indexes

### Files to Modify
- `app/actions/articles.ts` - Add audit logging
- `app/actions/videos.ts` - Add audit logging
- `app/actions/users.ts` - Add audit logging
- `app/actions/settings.ts` - Add audit logging
- `app/admin/layout.tsx` - Add audit logs link to sidebar
- `.env.example` - Add rate limiting env vars
- `middleware.ts` - Add rate limiting (if needed)

---

## Documentation to Create

- `docs/AUDIT_LOGGING.md` - Audit logging guide
- `docs/SECURITY.md` - Security best practices
- `docs/PERFORMANCE.md` - Performance optimization guide
- `docs/ERROR_HANDLING.md` - Error handling patterns

---

## Next Steps

1. Review existing `audit_logs` table schema
2. Implement `logAuditEvent()` function
3. Add audit logging to all critical server actions
4. Create audit log viewer page
5. Conduct security review (RLS, input validation, etc.)
6. Implement rate limiting
7. Optimize database queries and add indexes
8. Test everything in both themes
9. Document all changes

---

**Ready to begin implementation!** 🚀
