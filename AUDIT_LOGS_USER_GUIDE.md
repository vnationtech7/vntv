# Audit Logs - User Guide

**For:** Super Administrators  
**Purpose:** Track and monitor all administrative actions on your VNTV platform  
**Access:** `/admin/audit-logs`

---

## 📖 What Are Audit Logs?

### Simple Explanation
Audit logs are like a **detailed security camera** for your CMS. They record:
- **WHO** did something (which admin user)
- **WHAT** they did (created, updated, deleted, published, etc.)
- **WHEN** they did it (exact date and time)
- **WHAT CHANGED** (before and after values)
- **WHERE FROM** (IP address and browser)

### Why Do You Need This?

**Security & Accountability:**
- Know exactly who made changes
- Investigate suspicious activity
- Meet compliance requirements (GDPR, data protection)

**Troubleshooting:**
- "Who deleted this article?"
- "Why did this video disappear?"
- "When was this setting changed?"

**Team Management:**
- Monitor editor activity
- Track content workflow
- Review team member actions

**Legal & Compliance:**
- Provide evidence for audits
- Maintain data protection records
- Track sensitive changes

---

## 🎯 What Gets Logged?

### Content Operations
✅ **Articles:**
- Create new article
- Update article content
- Publish article
- Unpublish article
- Delete article
- Feature article
- Mark as breaking news

✅ **Videos:**
- Upload video
- Update video details
- Publish video
- Delete video

✅ **Categories, Tags, Authors:**
- Create, update, delete
- Change category structure

### Settings & Configuration
✅ **Site Settings:**
- Global settings changes
- SEO settings updates
- Email configuration
- Feature flag toggles

✅ **Breaking News:**
- Create breaking news alert
- Activate/deactivate alert
- Delete alert

✅ **Homepage Management:**
- Add content to homepage sections
- Remove content
- Reorder sections

### User & Access Management
✅ **User Roles:**
- Assign roles to users
- Remove roles from users

✅ **RSS Feeds:**
- Create RSS feed
- Enable/disable feed
- Update feed settings

### Media
✅ **Media Uploads:**
- Upload images/videos
- Update metadata
- Delete media files

---

## 🖥️ How to Use Audit Logs

### Accessing Audit Logs

1. **Login** as a super administrator
2. Go to admin sidebar → Click **"Audit Logs"** (with shield icon)
3. You'll see the audit logs page

---

## 📊 Understanding the Audit Logs Page

### Main View

The page shows a **table** with these columns:

| Column | What It Shows | Example |
|--------|---------------|---------|
| **Timestamp** | When action happened | Sep 1, 2026, 11:45 AM |
| **User** | Who did it | John Doe (john@vntv.com) |
| **Action** | What they did | CREATE, UPDATE, DELETE |
| **Resource** | Type of item | ARTICLE, VIDEO, USER_ROLE |
| **Entity ID** | Which specific item | article-slug or UUID |
| **IP Address** | Where from | 192.168.1.1 |

### Action Badges (Color-Coded)

- 🟢 **Green (CREATE)** - Something new was created
- 🔵 **Blue (UPDATE)** - Something was changed
- 🔴 **Red (DELETE)** - Something was removed
- 🟢 **Emerald (PUBLISH/ACTIVATE)** - Content went live
- 🟠 **Orange (UNPUBLISH/DEACTIVATE)** - Content taken down
- ⚫ **Gray (ARCHIVE)** - Content archived
- 🟣 **Purple (ASSIGN_ROLE/REMOVE_ROLE)** - Permission changes

---

## 🔍 Using Filters

### Why Filter?
With hundreds or thousands of log entries, filters help you find exactly what you need.

### Available Filters

#### 1. **User Filter**
**Use When:** You want to see what a specific person did

**Example:**
- "What articles did Sarah publish this week?"
- "Show me all actions by John Doe"

**How:**
1. Click "User" dropdown
2. Select the user's name
3. Click "Apply Filters"

---

#### 2. **Action Filter**
**Use When:** You want to see a specific type of action

**Example:**
- "Show me all deletions"
- "What was published today?"
- "Who assigned roles recently?"

**How:**
1. Click "Action" dropdown
2. Select action type (CREATE, UPDATE, DELETE, etc.)
3. Click "Apply Filters"

**Available Actions:**
- CREATE - New items created
- UPDATE - Items modified
- DELETE - Items removed
- PUBLISH - Content published
- UNPUBLISH - Content unpublished
- ARCHIVE - Content archived
- FEATURE/UNFEATURE - Featured status changed
- ASSIGN_ROLE/REMOVE_ROLE - Permission changes
- ENABLE/DISABLE - Settings toggled
- ACTIVATE/DEACTIVATE - Features turned on/off
- UPLOAD - Files uploaded
- IMPORT - Data imported

---

#### 3. **Resource Type Filter**
**Use When:** You want to see changes to a specific type of content

**Example:**
- "Show all article changes"
- "What videos were uploaded?"
- "Who modified user roles?"

**How:**
1. Click "Resource Type" dropdown
2. Select type (ARTICLE, VIDEO, USER_ROLE, etc.)
3. Click "Apply Filters"

**Available Types:**
- ARTICLE - News articles
- VIDEO - Video content
- PROGRAMME - Original programmes
- EPISODE - Programme episodes
- CATEGORY - Content categories
- TAG - Article tags
- AUTHOR - Author profiles
- USER_ROLE - User permissions
- SITE_SETTINGS - Configuration
- BREAKING_NEWS - Breaking news alerts
- HOMEPAGE_SECTION - Homepage content
- RSS_FEED - RSS feeds
- MEDIA_ASSET - Uploaded files

---

#### 4. **Search Entity ID**
**Use When:** You're looking for changes to a specific item

**Example:**
- "What happened to article 'breaking-news-ghana'?"
- "Show me the history of video with ID xyz"

**How:**
1. Type the article slug, ID, or part of it
2. Click "Apply Filters"

**Tips:**
- Can search by article slug (e.g., "breaking-news-ghana")
- Can search by UUID (if you have it)
- Partial matches work (search "ghana" finds "ghana-elections")

---

#### 5. **Date Range**
**Use When:** You want to see actions during a specific time period

**Example:**
- "What changed last week?"
- "Show me all actions from January"
- "What happened on September 1st?"

**How:**
1. Set "Start Date" (when to begin searching)
2. Set "End Date" (when to stop)
3. Click "Apply Filters"

**Common Use Cases:**
- **Last 24 hours:** Start = yesterday, End = today
- **Last week:** Start = 7 days ago, End = today
- **Specific day:** Start = Sept 1, End = Sept 1
- **This month:** Start = Sept 1, End = Sept 30

---

### Combining Filters

**You can use multiple filters together!**

**Example 1: "What did John delete last week?"**
- User: John Doe
- Action: DELETE
- Start Date: 7 days ago
- End Date: Today

**Example 2: "Show me all article publishes this month"**
- Resource Type: ARTICLE
- Action: PUBLISH
- Start Date: September 1
- End Date: September 30

**Example 3: "Who changed user roles yesterday?"**
- Resource Type: USER_ROLE
- Start Date: Yesterday
- End Date: Yesterday

---

## 🔍 Viewing Change Details

### Expandable Rows

For UPDATE and DELETE actions, you can see **what actually changed**.

**How to View Details:**
1. Find a log entry with UPDATE or DELETE action
2. Look for the **▶ arrow icon** on the left
3. Click the arrow
4. The row expands showing:
   - **Old Values** (what it was before)
   - **New Values** (what it became)
   - **User Agent** (browser/device info)

### Example: Article Update

**Before Expanding:**
```
Sep 1, 11:45 AM | John Doe | UPDATE | ARTICLE | ghana-elections
```

**After Expanding:**
```
Old Values:
{
  "title": "Ghana Elections 2024",
  "status": "draft"
}

New Values:
{
  "title": "Ghana Elections 2024 - Final Results",
  "status": "published"
}

User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
```

**What This Tells You:**
- John Doe changed the article title (added "- Final Results")
- He also published the article (status: draft → published)
- He did it from a Mac computer using Chrome

---

## 📥 Exporting Audit Logs

### Why Export?

**Common Reasons:**
- Compliance audits (provide to auditors)
- Legal requirements (evidence for investigations)
- Long-term archiving (keep records for years)
- Analysis in Excel/Google Sheets
- Sharing with management

### How to Export

1. **Apply filters** (optional - export only what you need)
2. Click **"Export CSV"** button (top right)
3. Wait a few seconds
4. File downloads automatically: `audit-logs-2026-09-01.csv`
5. Open in Excel, Google Sheets, or any spreadsheet program

### What's in the CSV?

The exported file contains:
- Timestamp
- User Email
- User Name
- Action
- Resource Type
- Resource ID
- IP Address
- Changes (as JSON text)

**Limits:**
- Maximum 10,000 logs per export
- If you have more, apply filters to narrow down

---

## 📊 Pagination

### Navigating Large Log Lists

**If you have many logs:**
- Page shows **50 logs at a time**
- Use pagination controls at the bottom
- See stats: "Showing 50 of 1,250 logs"

**Navigation Options:**
- **Previous** button - Go to previous page
- **Page numbers** (1, 2, 3, 4, 5) - Jump to specific page
- **Next** button - Go to next page

**Current page** is highlighted in red

---

## 🎯 Common Use Cases

### Use Case 1: "Who Deleted This Article?"

**Scenario:** An article disappeared and you need to know who removed it.

**Steps:**
1. Go to Audit Logs
2. Filter by:
   - Action: DELETE
   - Resource Type: ARTICLE
3. Search for the article slug or browse recent deletions
4. Find the entry - it shows who deleted it and when

---

### Use Case 2: "Track Content Workflow"

**Scenario:** You want to see the full lifecycle of an article.

**Steps:**
1. Go to Audit Logs
2. Search Entity ID: Enter the article slug
3. Click "Apply Filters"
4. You'll see all actions on that article:
   - Created by Reporter A
   - Updated 3 times by Reporter A
   - Published by Editor B
   - Featured by Super Admin
   - Unpublished by Editor C (with reason in changes)

---

### Use Case 3: "Investigate Unauthorized Changes"

**Scenario:** A setting was changed and you need to investigate.

**Steps:**
1. Go to Audit Logs
2. Filter by:
   - Resource Type: SITE_SETTINGS
   - Date Range: Last 7 days
3. Review all settings changes
4. Expand rows to see old/new values
5. Identify who made the change and when
6. Take appropriate action

---

### Use Case 4: "Monthly Activity Report"

**Scenario:** You need to report on content activity for the month.

**Steps:**
1. Go to Audit Logs
2. Filter by:
   - Start Date: September 1
   - End Date: September 30
3. Export to CSV
4. Open in Excel
5. Create pivot tables:
   - Actions by user
   - Content created vs deleted
   - Peak activity times

---

### Use Case 5: "Security Audit"

**Scenario:** You're doing a security review and need to check permission changes.

**Steps:**
1. Go to Audit Logs
2. Filter by:
   - Action: ASSIGN_ROLE or REMOVE_ROLE
   - Date Range: Last 90 days
3. Review all permission changes
4. Verify each change was authorized
5. Export for security records

---

## 🔐 Security & Privacy

### Who Can See Audit Logs?

**Only Super Administrators.**

**Why?**
- Audit logs contain sensitive information
- Shows system vulnerabilities (what admins can do)
- Privacy concerns (tracks all admin activity)
- Compliance requirement (restricted access)

### What's NOT Logged?

**For Privacy:**
- ❌ User passwords (never logged)
- ❌ API keys or secrets
- ❌ Payment information
- ❌ Personal user data (beyond email)

**What IS Logged:**
- ✅ Admin actions only (not regular users)
- ✅ CMS changes
- ✅ Configuration changes
- ✅ Content management actions

### Data Retention

**Current Setup:**
- All audit logs stored indefinitely
- No automatic deletion
- Can be exported for long-term archiving

**Future Enhancement:**
- May add automatic archiving of logs > 1 year old
- Will maintain compliance requirements

---

## 💡 Best Practices

### For Super Admins

**1. Regular Reviews**
- Check audit logs weekly
- Look for unusual patterns
- Monitor new team members closely

**2. Investigate Anomalies**
- Unexpected deletions
- Off-hours activity
- Multiple failed attempts

**3. Export Important Periods**
- Before major launches
- After security incidents
- For compliance audits
- Monthly backups

**4. Train Your Team**
- Explain that actions are logged
- Emphasize accountability
- Encourage proper workflow

**5. Use for Onboarding**
- Show new admins what gets logged
- Review their first actions together
- Teach proper CMS usage

---

## 🚨 Red Flags to Watch For

### Suspicious Activity Patterns

**⚠️ Mass Deletions**
- Many articles deleted quickly
- Could be: Angry employee, compromised account
- **Action:** Investigate immediately, review backups

**⚠️ Off-Hours Activity**
- Actions at 3 AM when no one should be working
- Could be: Unauthorized access
- **Action:** Check IP addresses, verify with user

**⚠️ Permission Changes**
- User keeps assigning themselves super_admin
- Unexpected role assignments
- **Action:** Review team structure, revoke if needed

**⚠️ Rapid Settings Changes**
- Site settings changed multiple times in minutes
- Could be: Testing, or confusion
- **Action:** Check with user, verify intent

**⚠️ Unknown IP Addresses**
- Actions from unfamiliar locations
- Could be: VPN, travel, or breach
- **Action:** Verify with user, force password reset if suspicious

---

## 📱 Mobile Access

**Currently:**
- Audit logs page is responsive
- Works on tablets and phones
- May require horizontal scrolling for full table

**Best Experience:**
- Desktop/laptop for full view
- Tablet for quick checks
- Phone for urgent investigations

---

## ❓ Frequently Asked Questions

### Q: Can I delete audit logs?
**A:** No. Audit logs are permanent for compliance and security. They cannot be deleted by any user.

### Q: Can other admins (editors, reporters) see audit logs?
**A:** No. Only super_admins can access audit logs. This is intentional for security.

### Q: Why can't I see my own actions?
**A:** You can! Use the User filter to select yourself and see all your actions.

### Q: How far back do logs go?
**A:** From September 1, 2026 (when the feature was launched) onwards. All future actions are logged automatically.

### Q: Can I undo an action from audit logs?
**A:** No. Audit logs are read-only. They show history but don't provide undo functionality. You'll need to manually reverse the action (e.g., restore deleted content from backups).

### Q: What if I see suspicious activity?
**A:** 
1. Export the relevant logs immediately
2. Contact super admin or management
3. Consider forcing password reset for affected users
4. Review recent changes for damage
5. Consult security team if serious

### Q: Can audit logs be used in legal proceedings?
**A:** Yes. Audit logs are admissible as evidence because they:
- Include timestamps
- Track IP addresses
- Show exact changes
- Are tamper-proof (cannot be edited)

### Q: How do I search for multiple articles at once?
**A:** Currently, search one at a time. For bulk analysis, export to CSV and use Excel/Sheets filtering.

### Q: Why are some entries missing change details?
**A:** Only UPDATE and DELETE actions show old/new values. CREATE actions only show new values. Other actions (PUBLISH, ACTIVATE) may not have detailed changes.

---

## 🛠️ Troubleshooting

### Problem: "Unauthorized" Error

**Solution:** Only super_admins can access. Verify your role in `/admin/users`.

### Problem: No Logs Showing

**Possible Reasons:**
- Filters too restrictive (clear filters and try again)
- No actions logged yet (system just launched)
- Date range doesn't include any activity

**Solution:** Click "Clear All" and browse unfiltered.

### Problem: Export Takes Too Long

**Reason:** Too many logs to export (>10,000)

**Solution:** Apply more specific filters to reduce dataset.

### Problem: Can't Find Specific Article

**Reason:** Searching by title (we search by ID/slug)

**Solution:** Get the article slug from the URL and search for that.

---

## 📞 Support

### Need Help?

**For Technical Issues:**
- Check this guide first
- Review testing guide (MILESTONE_17_TESTING_GUIDE.md)
- Contact development team

**For Training:**
- Share this guide with new super admins
- Schedule onboarding session
- Practice with recent logs

---

## 🎓 Summary

**Audit Logs = Your CMS Security Camera**

✅ **Tracks:** Who, What, When, Where  
✅ **Filters:** User, Action, Type, Date, Search  
✅ **Details:** Old/New values for changes  
✅ **Export:** CSV for analysis  
✅ **Access:** Super admins only  
✅ **Purpose:** Security, compliance, troubleshooting  

**Start Using:**
1. Go to `/admin/audit-logs`
2. Explore recent activity
3. Try different filters
4. Expand some rows to see details
5. Export a sample CSV

**Remember:**
- All admin actions are logged automatically
- Logs cannot be edited or deleted
- Use for accountability and security
- Regular reviews recommended

---

**Document Version:** 1.0  
**Last Updated:** September 1, 2026  
**Feature Status:** Production-Ready ✅
