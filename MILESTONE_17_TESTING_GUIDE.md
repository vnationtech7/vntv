# Milestone 17: Audit Logging & Security Testing Guide

**Created:** September 1, 2026  
**Status:** Ready for Testing  
**Migration Status:** ✅ Successfully Applied

---

## Prerequisites

✅ Database migration applied successfully  
✅ TypeScript compilation passing  
✅ User with super_admin role exists  
✅ Development server running

---

## Part 1: Audit Logging System Tests

### Test 1.1: Access Control
**Objective:** Verify only super_admins can access audit logs

**Steps:**
1. Log out of any current session
2. Create a test user with `reporter` role (or login as reporter)
3. Navigate to `/admin/audit-logs`
4. **Expected:** Should be redirected or see "Unauthorized" error
5. Login as super_admin
6. Navigate to `/admin/audit-logs`
7. **Expected:** Should see audit logs page with filters

**Pass Criteria:**
- ✅ Non-admin users cannot access `/admin/audit-logs`
- ✅ Super_admins can access the page
- ✅ Page loads without errors

---

### Test 1.2: Initial Page Load
**Objective:** Verify audit log page loads correctly

**Steps:**
1. Login as super_admin
2. Navigate to `/admin/audit-logs`
3. Observe the page

**Expected Results:**
- ✅ Page title: "Audit Logs"
- ✅ Description: "Security audit trail and system activity monitoring"
- ✅ Filter panel with 6 filter controls:
  - User dropdown
  - Action dropdown
  - Resource Type dropdown
  - Search input
  - Start Date picker
  - End Date picker
- ✅ "Apply Filters" button
- ✅ Stats showing total logs
- ✅ Audit log table with columns:
  - Timestamp
  - User
  - Action
  - Resource
  - Entity ID
  - IP Address
- ✅ "Export CSV" button
- ✅ Pagination controls (if more than 50 logs)

---

### Test 1.3: Create Article - Audit Log Entry
**Objective:** Verify article creation is logged

**Steps:**
1. Navigate to `/admin/articles/new`
2. Create a new article:
   - Title: "Test Article for Audit Logging"
   - Slug: "test-article-audit"
   - Category: Any
   - Body: Add some content
   - Status: Draft
3. Click "Save Draft"
4. Navigate to `/admin/audit-logs`
5. Search for "test-article-audit" in the Entity ID search
6. Click "Apply Filters"

**Expected Results:**
- ✅ One audit log entry appears
- ✅ Action badge shows "CREATE" (green)
- ✅ Resource shows "ARTICLE"
- ✅ Entity ID shows the article ID or slug
- ✅ User shows your name/email
- ✅ Timestamp is recent
- ✅ IP address is captured
- ✅ Click expand arrow (if present) to see details
- ✅ New values show article data (title, slug, status: draft)

---

### Test 1.4: Update Article - Audit Log Entry with Changes
**Objective:** Verify article updates log old and new values

**Steps:**
1. Navigate to `/admin/articles`
2. Find "Test Article for Audit Logging"
3. Click "Edit"
4. Update the title to "Updated Test Article for Audit Logging"
5. Change status to "Published"
6. Click "Save Changes"
7. Navigate to `/admin/audit-logs`
8. Filter by:
   - Action: "UPDATE"
   - Resource Type: "ARTICLE"
9. Click "Apply Filters"
10. Find the most recent update entry

**Expected Results:**
- ✅ Action badge shows "UPDATE" (blue)
- ✅ Resource shows "ARTICLE"
- ✅ Click expand arrow
- ✅ **Old Values** section shows:
  - Old title: "Test Article for Audit Logging"
  - Old status: "draft"
- ✅ **New Values** section shows:
  - New title: "Updated Test Article for Audit Logging"
  - New status: "published"
- ✅ User Agent is displayed

---

### Test 1.5: Delete Article - Audit Log Entry
**Objective:** Verify article deletion is logged

**Steps:**
1. Navigate to `/admin/articles`
2. Find "Updated Test Article for Audit Logging"
3. Click "Delete" (or select and bulk delete)
4. Confirm deletion
5. Navigate to `/admin/audit-logs`
6. Filter by Action: "DELETE"
7. Click "Apply Filters"

**Expected Results:**
- ✅ Action badge shows "DELETE" (red)
- ✅ Resource shows "ARTICLE"
- ✅ Entity ID shows deleted article ID
- ✅ Old values show article data before deletion

---

### Test 1.6: User Role Assignment - Audit Log
**Objective:** Verify role changes are logged

**Steps:**
1. Navigate to `/admin/users`
2. Find a test user
3. Assign "editor" role (if not already assigned)
4. Navigate to `/admin/audit-logs`
5. Filter by Action: "ASSIGN_ROLE"
6. Click "Apply Filters"

**Expected Results:**
- ✅ Action badge shows "ASSIGN_ROLE" (purple)
- ✅ Resource shows "USER_ROLE"
- ✅ Entity ID shows user ID
- ✅ New values show role: "editor"

---

### Test 1.7: Filter by User
**Objective:** Verify user filter works correctly

**Steps:**
1. Navigate to `/admin/audit-logs`
2. In the "User" dropdown, select your name
3. Click "Apply Filters"

**Expected Results:**
- ✅ Only logs from your user appear
- ✅ All logs show your name in the User column
- ✅ Stats update to show filtered count

---

### Test 1.8: Filter by Action Type
**Objective:** Verify action type filter works

**Steps:**
1. Navigate to `/admin/audit-logs`
2. In "Action" dropdown, select "CREATE"
3. Click "Apply Filters"

**Expected Results:**
- ✅ Only "CREATE" action logs appear
- ✅ All action badges are green and show "CREATE"
- ✅ Stats update correctly

---

### Test 1.9: Filter by Resource Type
**Objective:** Verify resource type filter works

**Steps:**
1. Navigate to `/admin/audit-logs`
2. In "Resource Type" dropdown, select "ARTICLE"
3. Click "Apply Filters"

**Expected Results:**
- ✅ Only article-related logs appear
- ✅ All Resource columns show "ARTICLE"
- ✅ Stats update correctly

---

### Test 1.10: Filter by Date Range
**Objective:** Verify date range filtering works

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Set "Start Date" to today's date
3. Set "End Date" to today's date
4. Click "Apply Filters"

**Expected Results:**
- ✅ Only today's logs appear
- ✅ All timestamps are from today
- ✅ Stats update correctly

**Additional Test:**
1. Set "Start Date" to tomorrow's date
2. Click "Apply Filters"
3. **Expected:** No logs found (empty state message)

---

### Test 1.11: Search by Entity ID
**Objective:** Verify entity ID search works

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Copy an Entity ID from any log entry
3. Paste it into the "Search Entity ID" field
4. Click "Apply Filters"

**Expected Results:**
- ✅ Only logs for that specific entity appear
- ✅ All Entity ID columns match the search term

---

### Test 1.12: Clear All Filters
**Objective:** Verify filter reset works

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Apply multiple filters (user, action, date range)
3. Click "Apply Filters"
4. Observe filtered results
5. Click "Clear All" button (X icon next to "Filters")

**Expected Results:**
- ✅ All filter fields reset to empty/default
- ✅ Full log list reappears
- ✅ Stats show total count again

---

### Test 1.13: Pagination
**Objective:** Verify pagination works correctly (if more than 50 logs exist)

**Prerequisites:** Create 60+ audit log entries (create/update articles multiple times)

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Observe the page shows 50 logs
3. Click "Next" button at bottom
4. Observe page 2 loads
5. Click page number "1"
6. Observe page 1 loads
7. Click "Previous" button (should be disabled on page 1)

**Expected Results:**
- ✅ Shows 50 logs per page
- ✅ Page numbers displayed (1, 2, 3, etc.)
- ✅ Current page highlighted in red
- ✅ "Previous" disabled on first page
- ✅ "Next" disabled on last page
- ✅ Stats show "Showing X of Y logs"
- ✅ URL updates with ?page=N parameter

---

### Test 1.14: Export to CSV
**Objective:** Verify CSV export works correctly

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Optionally apply filters to export subset
3. Click "Export CSV" button
4. Wait for download
5. Open the downloaded CSV file

**Expected Results:**
- ✅ Toast notification: "Exporting audit logs..."
- ✅ File downloads: `audit-logs-YYYY-MM-DD.csv`
- ✅ CSV has headers: Timestamp, User Email, User Name, Action, Resource Type, Resource ID, IP Address, Changes
- ✅ Data matches what's visible in the table
- ✅ Changes column contains JSON (if present)
- ✅ All values properly quoted and escaped
- ✅ Toast notification: "Audit logs exported successfully"

---

### Test 1.15: Expandable Rows
**Objective:** Verify expandable rows show change details

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Find an UPDATE action entry
3. Click the chevron icon (▶) to expand
4. Observe the expanded details

**Expected Results:**
- ✅ Chevron icon changes to ▼
- ✅ Expanded section appears below the row
- ✅ Shows "Changes" heading
- ✅ Shows "Old Values" and "New Values" side by side
- ✅ Values displayed as formatted JSON
- ✅ Shows "User Agent" if captured
- ✅ Click chevron again to collapse
- ✅ Row collapses smoothly

---

### Test 1.16: Empty State
**Objective:** Verify empty state displays correctly

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Apply filters that will return no results:
   - Start Date: 2050-01-01
3. Click "Apply Filters"

**Expected Results:**
- ✅ Shows empty state message: "No audit logs found"
- ✅ Shows helper text: "Try adjusting your filters or date range"
- ✅ No table displayed
- ✅ Export button still present

---

### Test 1.17: Loading States
**Objective:** Verify loading indicators work

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Apply a filter
3. Click "Apply Filters"
4. Quickly observe the loading state

**Expected Results:**
- ✅ Loading overlay appears with spinner
- ✅ Shows "Loading..." text
- ✅ Background slightly dimmed
- ✅ Filters disabled during load
- ✅ Loading disappears when results load

---

### Test 1.18: Action Badge Colors
**Objective:** Verify action badges have correct colors

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Create test logs with different actions (create, update, delete, publish, etc.)
3. Observe the action badges

**Expected Color Scheme:**
- ✅ CREATE: Green background, dark green text
- ✅ UPDATE: Blue background, dark blue text
- ✅ DELETE: Red background, dark red text
- ✅ PUBLISH/ACTIVATE/ENABLE: Emerald background
- ✅ UNPUBLISH/DEACTIVATE/DISABLE: Orange background
- ✅ ARCHIVE: Gray background
- ✅ Other actions: Purple background

---

### Test 1.19: Responsive Design (Mobile)
**Objective:** Verify audit logs work on mobile

**Steps:**
1. Open `/admin/audit-logs` on mobile device or resize browser to mobile width
2. Test filters
3. Test table scrolling
4. Test expandable rows
5. Test pagination

**Expected Results:**
- ✅ Filters stack vertically
- ✅ Table scrolls horizontally (if needed)
- ✅ Action badges remain readable
- ✅ Expandable rows work correctly
- ✅ Pagination buttons remain accessible
- ✅ Export button accessible

---

### Test 1.20: Audit Navigation Link
**Objective:** Verify audit logs link in admin sidebar

**Steps:**
1. Login as super_admin
2. Navigate to `/admin` (dashboard)
3. Observe the left sidebar
4. Find "Audit Logs" link

**Expected Results:**
- ✅ "Audit Logs" appears in sidebar
- ✅ Position: Between "Users & Roles" and "Settings"
- ✅ Icon: Shield icon
- ✅ Click link navigates to `/admin/audit-logs`
- ✅ Link only visible to super_admins

---

## Part 2: Integration Tests (Future)

### Test 2.1: All Article Operations Logged
**Objective:** Verify comprehensive article audit trail

**Operations to Test:**
- [ ] Create article
- [ ] Update article content
- [ ] Change article status (draft → published)
- [ ] Feature article (is_featured toggle)
- [ ] Mark as breaking news
- [ ] Archive article
- [ ] Unarchive article
- [ ] Delete article

**For Each Operation:**
- ✅ Audit log entry created
- ✅ Correct action type
- ✅ Old/new values captured (for updates)
- ✅ Timestamp accurate
- ✅ User identified correctly

---

### Test 2.2: All Video Operations Logged
**Operations to Test:**
- [ ] Create video
- [ ] Update video metadata
- [ ] Publish video
- [ ] Delete video

---

### Test 2.3: Category Operations Logged
**Operations to Test:**
- [ ] Create category
- [ ] Update category
- [ ] Delete category

---

### Test 2.4: User Role Operations Logged
**Operations to Test:**
- [ ] Assign role to user
- [ ] Remove role from user

---

### Test 2.5: Settings Changes Logged
**Operations to Test:**
- [ ] Update site settings
- [ ] Update content gate settings
- [ ] Update ad settings

---

### Test 2.6: Breaking News Operations Logged
**Operations to Test:**
- [ ] Create breaking news
- [ ] Update breaking news
- [ ] Activate breaking news
- [ ] Deactivate breaking news
- [ ] Delete breaking news

---

### Test 2.7: Homepage Operations Logged
**Operations to Test:**
- [ ] Add item to homepage section
- [ ] Remove item from homepage section
- [ ] Reorder sections
- [ ] Enable/disable section

---

### Test 2.8: RSS Feed Operations Logged
**Operations to Test:**
- [ ] Create RSS feed
- [ ] Update RSS feed
- [ ] Enable/disable RSS feed
- [ ] Delete RSS feed

---

### Test 2.9: Media Operations Logged
**Operations to Test:**
- [ ] Upload media asset
- [ ] Update media metadata
- [ ] Delete media asset

---

## Part 3: Performance Tests

### Test 3.1: Query Performance with Indexes
**Objective:** Verify indexes improve query speed

**Steps:**
1. Generate 10,000+ audit log entries (script or manual)
2. Test filter queries:
   - Filter by user
   - Filter by action
   - Filter by resource type
   - Filter by date range
3. Measure query time (should be < 500ms)

**Expected Results:**
- ✅ All queries return in < 500ms
- ✅ Page loads quickly even with large dataset
- ✅ No timeout errors

---

### Test 3.2: Pagination Performance
**Objective:** Verify pagination works with large dataset

**Steps:**
1. With 10,000+ logs
2. Navigate between pages
3. Jump to last page
4. Jump back to first page

**Expected Results:**
- ✅ Page navigation is fast (< 1 second per page)
- ✅ No lag or freezing
- ✅ Correct page count displayed

---

### Test 3.3: Export Performance
**Objective:** Verify CSV export works with large dataset

**Steps:**
1. With 10,000+ logs
2. Export to CSV
3. Measure time

**Expected Results:**
- ✅ Export completes in < 10 seconds
- ✅ CSV file size reasonable (< 50MB)
- ✅ All 10,000 rows exported correctly
- ✅ No memory issues or crashes

---

## Part 4: Security Tests

### Test 4.1: Authorization Check
**Objective:** Verify non-admins cannot access audit logs

**Test Matrix:**
| Role | Access to /admin/audit-logs | Expected |
|------|---------------------------|----------|
| Anonymous | No | ✅ Redirect to login |
| Reporter | No | ✅ Unauthorized error |
| Editor | No | ✅ Unauthorized error |
| Video Editor | No | ✅ Unauthorized error |
| Advertising Manager | No | ✅ Unauthorized error |
| Super Admin | Yes | ✅ Full access |

---

### Test 4.2: API Endpoint Security
**Objective:** Verify server actions enforce authorization

**Steps:**
1. Logout
2. Attempt to call `getAuditLogs()` directly (via browser console or Postman)

**Expected Results:**
- ✅ Returns error: "Not authenticated"
- ✅ No data leaked

**Test as Reporter:**
1. Login as reporter
2. Attempt to call `getAuditLogs()`

**Expected Results:**
- ✅ Returns error: "Unauthorized"
- ✅ No data leaked

---

### Test 4.3: Data Privacy
**Objective:** Verify sensitive data not logged

**Steps:**
1. Update user password (if that operation exists)
2. Check audit log

**Expected Results:**
- ✅ Password field NOT in old/new values
- ✅ Only non-sensitive fields logged (email, name, etc.)

---

### Test 4.4: IP Address Capture
**Objective:** Verify IP address captured correctly

**Steps:**
1. Perform any logged operation
2. Check audit log entry
3. Verify IP address column

**Expected Results:**
- ✅ IP address displayed (e.g., 192.168.1.1 or IPv6)
- ✅ For localhost: 127.0.0.1 or ::1
- ✅ For production: Real client IP

---

## Part 5: Error Handling Tests

### Test 5.1: Network Error Handling
**Objective:** Verify graceful handling of network errors

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Disable network (DevTools → Network → Offline)
3. Apply filters

**Expected Results:**
- ✅ Toast error: "Failed to fetch audit logs"
- ✅ No crash or white screen
- ✅ Error message displayed
- ✅ Retry option available

---

### Test 5.2: Invalid Filter Handling
**Objective:** Verify invalid inputs handled gracefully

**Steps:**
1. Navigate to `/admin/audit-logs`
2. Enter invalid date (e.g., 2050-13-45)
3. Apply filters

**Expected Results:**
- ✅ Browser validation prevents submission OR
- ✅ Server returns friendly error
- ✅ No crash

---

## Summary Checklist

### Core Functionality
- [ ] Audit logs page loads successfully
- [ ] Filters work (all 6 types)
- [ ] Table displays logs correctly
- [ ] Expandable rows show change details
- [ ] Pagination works
- [ ] CSV export works
- [ ] Action badge colors correct
- [ ] Empty state displays
- [ ] Loading states work

### Authorization
- [ ] Only super_admins can access
- [ ] Non-admins redirected/blocked
- [ ] API endpoints secured

### Data Integrity
- [ ] Article operations logged
- [ ] User role changes logged
- [ ] Old/new values captured correctly
- [ ] IP addresses captured
- [ ] User agent captured
- [ ] Timestamps accurate

### Performance
- [ ] Queries fast with indexes
- [ ] Pagination smooth with large dataset
- [ ] Export completes reasonably

### UX/UI
- [ ] Responsive design works
- [ ] Navigation link visible
- [ ] Toast notifications work
- [ ] Error handling graceful

---

## Known Limitations

1. **Audit Log Retention:** No automatic archiving of old logs (future enhancement)
2. **Real-time Updates:** Page doesn't auto-refresh (must refresh manually)
3. **Export Limit:** CSV export limited to 10,000 rows for performance
4. **Search Scope:** Entity ID search is basic substring match (not full-text search)

---

## Bug Report Template

If you find issues, report with this format:

**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach if relevant]

**Environment:**
- Browser: [e.g., Chrome 120]
- Device: [e.g., Desktop, iPhone 15]
- User Role: [e.g., super_admin]

---

**Testing Status:** Ready for comprehensive testing  
**Next Step:** Begin systematic testing starting with Part 1
