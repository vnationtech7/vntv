# VNTV

VNTV is a modern, mobile-first African news and video platform built for digital journalism, editorial publishing, original programming, video distribution, and scalable newsroom operations.

The platform combines a public-facing news experience with a complete editorial CMS, media library, video platform, RSS ingestion system, advertising management, authentication, analytics, and configurable content-access controls.

---

## Technology

* **Next.js**
* **React**
* **TypeScript**
* **Supabase**

  * PostgreSQL
  * Authentication
  * Storage
  * Row Level Security
* **Vercel**

  * Automatic Git-based deployment
* Responsive CSS/Tailwind implementation as appropriate
* `inhaq/core-design-skills` principles for frontend design and UI quality

> Do not create or add a `vercel.json` file. Deployment is already configured through Vercel's automatic deployment workflow.

---

## Product Vision

VNTV is designed to operate as a complete digital newsroom rather than a simple news website.

The platform supports:

* Breaking news
* Ghana news
* Nigeria news
* Africa news
* World news
* Politics
* Business
* Entertainment
* Sports
* Viral/trending content
* Opinion
* Video
* VNTV Originals
* YouTube content
* Original VNTV video
* RSS/news-feed ingestion
* Advertising and sponsorship
* Newsletter distribution
* Search
* SEO
* Editorial analytics

The architecture is designed to support future expansion without requiring a fundamental rewrite of the platform.

---

# Core Principles

## Content-first

Supabase is the source of truth for VNTV's editorial content.

## CMS-driven

Editorial staff should be able to manage content and homepage presentation without developer intervention.

## Secure by default

Authorization must be enforced at the server and database level. Frontend visibility is never considered sufficient security.

## Mobile-first

Mobile is a primary experience, especially for video and news consumption.

## Performance-first

The application should minimize unnecessary client-side JavaScript, optimize media, use appropriate caching, and remain usable on slower connections.

## Accessibility-first

The platform targets **WCAG 2.2 AA**.

## Design-system-first

The application should use reusable components and centralized design tokens rather than page-specific styling decisions.

---

# Content Types

## Articles

Articles support:

* Headline
* Slug
* Excerpt
* Rich structured body
* Category
* Author
* Featured image
* Gallery
* Tags
* Associated videos
* Source
* Publication date
* Updated date
* Breaking status
* Featured status
* Exclusive status
* Sponsored status
* SEO metadata
* Social metadata

Article content uses structured content blocks where appropriate rather than relying on uncontrolled HTML.

Supported blocks include:

* Paragraph
* Heading
* Image
* Gallery
* Video
* YouTube
* Quote
* Embed
* Related article

---

# Video

VNTV supports:

* Original uploaded video
* YouTube video
* External video
* Standalone video
* Article-associated video
* Programme/episode video

Video orientations:

* **16:9 horizontal**
* **9:16 vertical**

Video types include:

* News
* Breaking news
* Interview
* Documentary
* Short
* Original
* Standalone

---

# Article + Video Relationships

Articles and videos are independent content types but can be connected.

An article can contain or reference multiple videos.

A video can be associated with multiple articles.

This allows VNTV to support both:

* Video-led stories
* Article-led stories
* Standalone videos
* Articles containing video
* Videos containing related editorial context

---

# Anonymous Content Access

Anonymous visitors can browse VNTV normally.

They can see:

* Homepage
* Categories
* Headlines
* Article previews
* Video previews
* Public programme pages
* Normal unrestricted content

VNTV has configurable anonymous-content gating.

## Article Gate

Controlled by:

`anonymous_article_gate_enabled`

When disabled, anonymous users can read normal articles completely.

When enabled, anonymous users can enter the article experience but will encounter the authentication gate according to the configured reading-access behavior.

The gate must **never activate on previews, homepage cards, category cards, search results, or other non-reading surfaces**.

## Video Gate

Controlled by:

`anonymous_video_gate_enabled`

When enabled, anonymous users may watch approximately **25% of a VNTV-controlled video's duration** before playback is paused and authentication is requested.

The gate is based on actual playback progress, not a fixed number of seconds.

### Important

The video gate only operates while a video is actively playing.

It must not activate because a video is:

* Visible
* Loaded
* Displayed as a card
* Present in a homepage section
* Shown in a preview

## YouTube Exception

YouTube videos are **never subjected to VNTV's anonymous video gate**.

YouTube playback remains governed by YouTube.

---

# Authentication

Initial authentication methods:

1. Email/password
2. Google Login

The architecture is prepared for:

3. Facebook Login

Authentication is handled through Supabase Auth.

Application-specific user information is stored separately in application profile tables.

---

# Exclusive Content

The content model supports exclusive content independently of the normal anonymous gating settings.

This allows VNTV to introduce premium or restricted content in the future without redesigning the content architecture.

---

# Editorial Workflow

Articles use a controlled editorial lifecycle:

```text
Draft
  ↓
Review
  ↓
Approved
  ↓
Scheduled
  ↓
Published
  ↓
Updated
  ↓
Archived
```

Editors can reject content and return it to the author.

Article revisions are retained so previous versions can be reviewed or restored.

---

# Breaking News

Breaking news is managed independently from ordinary article publishing.

Editors can:

* Mark stories as breaking
* Add stories to the breaking ticker
* Override ticker headlines
* Set priority
* Schedule activation
* Schedule expiration
* Remove stories from the ticker

---

# Homepage

The homepage is CMS-controlled.

Initial sections include:

1. Breaking ticker
2. Hero story
3. Secondary stories
4. Latest News
5. Video
6. Ghana
7. Nigeria
8. Africa
9. World
10. Politics
11. Business
12. Entertainment
13. Sports
14. Viral
15. VNTV Originals
16. Newsletter
17. Footer

Editors can enable, disable, reorder, and configure sections without changing application code.

---

# RSS News Ingestion

VNTV supports importing news from external RSS feeds.

Administrators can configure:

* Feed name
* RSS URL
* Source
* Country/region
* Category
* Attribution
* Fetch interval
* Enabled state
* Auto-publish state
* Review requirement

Each feed has an independent enable/disable control.

Example:

```text
Reuters       ON
BBC Africa    ON
Source C      OFF
```

A disabled feed must not be fetched.

---

## RSS Editorial Pipeline

RSS content does not automatically become trusted VNTV editorial content by default.

The ingestion process is:

```text
RSS Feed
   ↓
Fetch
   ↓
Parse
   ↓
Normalize
   ↓
Validate
   ↓
Duplicate Detection
   ↓
Imported / Pending Review
   ↓
Editor
   ↓
Publish
```

Auto-publishing can be enabled for individual feeds where appropriate.

Imported content retains source attribution and its original URL.

---

# VNTV Originals

The platform supports original VNTV programming such as:

* D'Opinion
* Beyond Headlines
* Documentaries
* Interviews
* Future original programmes

Content is organized as:

```text
Programme
   ↓
Episode
   ↓
Video
```

Episodes can also have associated articles.

---

# Search

Search covers published content including:

* Headlines
* Article body
* Categories
* Tags
* Authors
* Video titles
* Programme names

Search results must respect content publication and access rules.

---

# Advertising

Advertising is CMS-managed.

Supported advertising areas include:

* Homepage
* Article pages
* Inline article placements
* Sidebar
* Video sponsorship
* Sponsored content

Advertising positions must be configurable without modifying application code.

Advertisements support:

* Creative
* Target URL
* Sponsor
* Start date
* End date
* Priority
* Active state

---

# Newsletter

VNTV supports newsletter subscriptions.

The initial newsletter can be:

**VNTV Daily**

The architecture should allow additional newsletter categories in the future.

---

# Social Sharing

Articles and videos support sharing to appropriate platforms, including:

* WhatsApp
* Facebook
* X
* LinkedIn where appropriate
* Copy link

Social metadata should be generated automatically from content.

---

# SEO

Published content should support:

* SEO title
* Meta description
* Canonical URL
* Open Graph metadata
* Social images
* Article structured data
* Video structured data where appropriate
* Author information
* Publication dates
* Updated dates
* XML sitemap
* Robots configuration

Published URLs should remain stable.

If an editorial slug changes, the application should support redirects.

---

# User Roles

Initial CMS roles:

### Super Admin

Full platform control.

### Editor

Editorial review and publishing.

### Reporter / Writer

Create and manage permitted drafts.

### Video Editor

Manage video and media.

### Advertising Manager

Manage advertising and sponsorship.

Permissions are enforced using Supabase Row Level Security and server-side authorization.

---

# Database Domains

The Supabase database is organized into logical domains.

```text
AUTH
├── profiles
├── roles
└── user_roles

EDITORIAL
├── articles
├── article_revisions
├── categories
├── tags
├── article_tags
├── authors
└── sources

MEDIA
├── media_assets
├── videos
└── video_articles

ORIGINALS
├── programmes
└── episodes

RSS
├── rss_feeds
├── rss_items
└── rss_import_logs

HOMEPAGE
├── homepage_sections
└── homepage_items

BREAKING
└── breaking_news

ADVERTISING
├── ad_slots
├── advertisements
└── sponsorships

ENGAGEMENT
├── article_views
├── video_events
├── social_shares
└── newsletter_subscribers

SYSTEM
├── site_settings
├── audit_logs
└── redirects
```

Database migrations are version-controlled.

---

# Security

The application must use:

* Supabase Row Level Security
* Server-side authorization
* Role-based permissions
* Secure authentication
* Protected admin routes
* Secure storage policies
* Input validation
* File validation
* Protected server credentials
* Audit logging

The Supabase service-role key must never be exposed to the browser.

Secrets must never be committed to Git.

---

# Accessibility

VNTV targets WCAG 2.2 AA.

The UI must support:

* Keyboard navigation
* Screen readers
* Semantic HTML
* Visible focus states
* Skip navigation
* Logical heading hierarchy
* Accessible forms
* Accessible authentication dialogs
* Accessible video controls
* Captions where available
* Transcripts where available
* Meaningful image alt text
* Sufficient color contrast
* Reduced motion
* Responsive text and zoom
* Accessible touch targets

Accessibility must be considered during component creation rather than added after implementation.

---

# Design System

VNTV uses its approved brand colors, typography direction, and icon style.

The design system should centralize:

* Colors
* Typography
* Spacing
* Radii
* Shadows
* Breakpoints
* Motion
* Z-index

The application should use a coherent icon family.

Do not mix unrelated icon styles.

---

# Kiro Design Instructions

The project uses the installed `inhaq/core-design-skills`.

Kiro has autonomy to make UI decisions within the locked product requirements.

The skill should be treated as a **design-principles framework**, not as a template to copy blindly.

Kiro should:

* Think like a senior product designer
* Inspect existing components before creating new ones
* Prefer reusable components
* Establish visual hierarchy before implementation
* Use intentional typography
* Maintain consistent spacing
* Design mobile and desktop deliberately
* Avoid generic AI-generated UI patterns
* Avoid unnecessary gradients
* Avoid excessive rounded cards
* Avoid decorative elements without purpose
* Use animation deliberately
* Respect reduced-motion preferences
* Validate the rendered UI
* Maintain accessibility
* Preserve VNTV's brand identity

The agent may make creative design decisions, but must not change locked product behavior.

---

# Performance

VNTV should prioritize:

* Fast initial rendering
* Optimized images
* Responsive images
* Lazy loading where appropriate
* Limited client-side JavaScript
* Server rendering
* Efficient database queries
* Appropriate caching
* Incremental revalidation
* Efficient video loading
* Good performance on slower mobile connections

Large media should not be unnecessarily loaded before user interaction.

---

# Testing

The project should include:

## Unit tests

For:

* Access gating
* Permissions
* Validation
* Slug handling
* RSS normalization
* Duplicate detection
* Editorial transitions

## Integration tests

For:

* Supabase
* Authentication
* RLS
* Publishing
* RSS ingestion
* Media
* CMS permissions

## End-to-end tests

Critical user journeys include:

* Anonymous browsing
* Article gating
* Video gating
* YouTube playback
* Google login
* Email login
* Article creation
* Editorial review
* Publishing
* RSS enable/disable
* RSS import
* Homepage management
* Advertising management
* Mobile navigation
* Keyboard navigation

---

# Deployment

VNTV uses Vercel's existing automatic deployment.

```text
Git Push
   ↓
Vercel
   ↓
Build
   ↓
Deploy
```

Do **not** add:

```text
vercel.json
```

unless a future infrastructure decision explicitly requires it.

---

# Development Principles

Before implementing a feature:

1. Understand the existing architecture.
2. Check whether a reusable component already exists.
3. Check the database model.
4. Check authorization requirements.
5. Check accessibility requirements.
6. Check responsive behavior.
7. Implement the smallest maintainable solution.
8. Test the feature.
9. Validate the rendered UI.
10. Update documentation when architecture changes.

Avoid unnecessary abstractions, duplicated components, and premature optimization.

---

# Project Roadmap

## Phase 1 — Foundation

* Next.js architecture
* Supabase integration
* Authentication
* Profiles and roles
* RLS
* Design system
* Core UI
* Public shell

## Phase 2 — Editorial CMS

* Articles
* Categories
* Tags
* Authors
* Media
* Editorial workflow
* Revisions
* Search
* SEO

## Phase 3 — Public Platform

* Homepage
* Category pages
* Article pages
* Breaking news
* Related content
* Author pages
* Search

## Phase 4 — Video

* Video CMS
* Uploads
* YouTube
* Horizontal/vertical video
* Video player
* Article/video relationships
* VNTV Originals

## Phase 5 — Authentication & Access

* Google Login
* Email authentication
* Anonymous article gate
* Anonymous video gate
* 25% playback restriction
* YouTube exemption
* Exclusive-content architecture

## Phase 6 — RSS

* Feed management
* Feed enable/disable
* RSS fetching
* Normalization
* Deduplication
* Editorial review
* Attribution

## Phase 7 — Commercial

* Advertising slots
* Advertisements
* Sponsorship
* Newsletter

## Phase 8 — Production Hardening

* Analytics
* Trending
* Audit logs
* Security review
* Accessibility audit
* Performance optimization
* End-to-end testing

---

# Definition of Done

A feature is considered complete only when it is:

**Functional + Secure + Accessible + Responsive + Tested + CMS-manageable + SEO-compatible + Performance-appropriate**

A visually complete page is not considered finished if its underlying permissions, data model, accessibility, or editorial workflow are incomplete.

---

# License and Ownership

This repository contains the VNTV application and project-specific implementation.

Third-party dependencies and imported design skills retain their respective licenses and attribution requirements.

The `inhaq/core-design-skills` project is used as a design-principles resource and should not be represented as VNTV-owned code.

---

# Current Status

**Product specification:** Locked
**Technical blueprint:** Defined
**Database architecture:** Defined
**Authentication architecture:** Defined
**Content-gating behavior:** Defined
**RSS architecture:** Defined
**Video architecture:** Defined
**UI direction:** Defined
**Implementation:** Ready to begin

---

## Next implementation priority

Start with **Supabase migrations, database types, roles, and RLS policies** before building the CMS or public pages. This establishes the security and data foundation that every subsequent VNTV feature depends on.


---

# ✅ Completed Milestones

## Milestone 1: Foundation & Database Architecture (Complete)
- Complete Supabase project setup
- 30+ tables across 9 domains (Auth, Editorial, Media, Originals, RSS, Homepage, Breaking, Advertising, Engagement, System)
- 7 enums for type safety
- 40+ RLS policies for security
- 25+ performance indexes
- Helper functions (user_has_role, is_admin)
- TypeScript types generated from schema
- Complete documentation in `DATABASE.md`

## Milestone 2: Design System & Core UI Components (Complete)
- Complete design token system (colors, typography, spacing)
- Full light/dark theme support with system preference detection
- 50+ reusable UI components (Button, Input, Dialog, etc.)
- Layout components (Container, Grid, Stack, Section)
- Icon system with 100+ Lucide icons
- Accessibility utilities (focus management, screen readers, keyboard navigation)
- Interactive showcase at `/design-system`

## Milestone 3: Authentication & User Management (Complete)
- ✅ Email/password and Google OAuth authentication
- ✅ Supabase Auth integration with session management
- ✅ Auto-created user profiles with avatar upload
- ✅ Role-based access control (RBAC) system
- ✅ Admin pages for role and user management (`/admin/roles`, `/admin/users`)
- ✅ Content access gates for articles and videos
- ✅ Protected routes (client and server-side)
- ✅ Settings page at `/settings`
- ✅ Interactive gate demo at `/demo/gate`
- ✅ Complete documentation and testing checklist

**Authentication Docs:**
- [Complete Authentication Guide](./docs/AUTHENTICATION.md) - Full system documentation
- [Quick Start Guide](./docs/QUICK_START_AUTH.md) - Get auth running in 5 minutes
- [Testing Checklist](./docs/TESTING_CHECKLIST.md) - Comprehensive test coverage
- [Database Documentation](./docs/DATABASE.md) - Complete schema reference

**Next:** Milestone 4 - Editorial CMS (Core Content Management)
