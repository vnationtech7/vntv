# VNTV Technical Blueprint

**Version:** 1.0
**Status:** Implementation Blueprint
**Date:** August 26, 2026
**Stack:** Next.js + TypeScript + Supabase + Vercel
**Design system:** VNTV brand system + `inhaq/core-design-skills` principles
**Deployment:** Existing Vercel automatic deployment; **do not create `vercel.json`**

---

## 1. Executive architecture

VNTV will be built as a **content-first, server-rendered editorial platform** with Supabase as the source of truth for content, users, permissions, media metadata, editorial workflows and configuration.

```text
                         ┌─────────────────────┐
                         │      VNTV WEB       │
                         │      Next.js        │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
       Public Website          Authenticated CMS      API / Server
             │                      │                  Operations
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
                              Supabase
                                    │
       ┌───────────────┬────────────┼──────────────┬──────────────┐
       ▼               ▼            ▼              ▼              ▼
   PostgreSQL       Auth        Storage       Edge/Server      RLS
       │
       ├── Editorial
       ├── Video
       ├── RSS
       ├── Advertising
       ├── Homepage
       ├── Users/Roles
       ├── Analytics
       └── System
```

The architecture deliberately separates:

* **presentation**
* **content**
* **authentication**
* **authorization**
* **media**
* **ingestion**
* **editorial workflow**
* **configuration**

This prevents the public site from becoming tightly coupled to the CMS.

---

# 2. Architectural principles

The implementation must follow these principles.

### 2.1 Database is the source of truth

Published editorial content comes from Supabase.

The frontend must not maintain a second unofficial content database.

### 2.2 Server-first

Use Next.js Server Components and server-side data access by default.

Use Client Components only when interaction requires them.

Examples:

* Video player
* Search interaction
* Login modal
* CMS editors
* Drag-and-drop homepage ordering
* Toggles
* Interactive filters

### 2.3 Secure by default

Never rely on frontend hiding for authorization.

Supabase RLS and server-side authorization enforce access.

### 2.4 CMS-driven

Editorial staff must be able to change content without code deployment.

### 2.5 Content and presentation are separate

An article should not contain frontend-specific HTML assumptions wherever structured content can be used instead.

### 2.6 Progressive enhancement

Public content should remain useful even if JavaScript is limited.

### 2.7 Mobile-first

Mobile is a primary experience, not a reduced desktop experience.

### 2.8 Design-system-first

Kiro must create reusable components and tokens before producing large numbers of page-specific components.

---

# 3. Next.js application structure

Recommended App Router structure:

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── news/
│   │   ├── category/
│   │   ├── video/
│   │   ├── originals/
│   │   ├── search/
│   │   ├── author/
│   │   └── ...
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── callback/
│   │   └── ...
│   │
│   ├── (cms)/
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── articles/
│   │       ├── videos/
│   │       ├── media/
│   │       ├── rss/
│   │       ├── breaking/
│   │       ├── homepage/
│   │       ├── originals/
│   │       ├── advertising/
│   │       ├── users/
│   │       ├── analytics/
│   │       └── settings/
│   │
│   ├── api/
│   │   ├── rss/
│   │   ├── webhooks/
│   │   └── ...
│   │
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── editorial/
│   ├── video/
│   ├── auth/
│   ├── advertising/
│   └── cms/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── content/
│   ├── video/
│   ├── gating/
│   ├── rss/
│   ├── seo/
│   ├── analytics/
│   └── validation/
│
├── hooks/
├── types/
└── config/
```

The exact folder naming can change during implementation, but the separation of concerns should remain.

---

# 4. Route architecture

## Public routes

```text
/
 /breaking
 /ghana
 /nigeria
 /africa
 /world
 /politics
 /business
 /entertainment
 /sports
 /viral
 /opinion
 /video
 /originals

 /news/[slug]
 /video/[slug]
 /originals/[slug]
 /originals/[slug]/[episode]
 /author/[slug]
 /search
```

Category routes can eventually be generated dynamically from CMS-managed categories.

---

# 5. Authentication routes

```text
/login
/signup
/auth/callback
/auth/forgot-password
/auth/reset-password
```

Google OAuth uses Supabase Auth.

Facebook is architecturally supported but can remain disabled until enabled in Supabase/provider configuration.

---

# 6. Admin route architecture

```text
/admin
/admin/articles
/admin/articles/new
/admin/articles/[id]
/admin/articles/[id]/edit

/admin/videos
/admin/videos/new
/admin/videos/[id]/edit

/admin/media

/admin/categories
/admin/tags
/admin/authors

/admin/breaking
/admin/homepage

/admin/rss
/admin/rss/new
/admin/rss/[id]

/admin/originals
/admin/originals/[id]

/admin/advertising
/admin/advertising/slots
/admin/advertising/campaigns

/admin/users
/admin/roles

/admin/analytics
/admin/settings
/admin/audit
```

Admin routes must be protected at both routing/server level and database level.

---

# 7. Supabase database architecture

## Core tables

### Authentication/application

```text
profiles
roles
user_roles
```

### Editorial

```text
articles
article_revisions
categories
tags
article_tags
authors
sources
```

### Media

```text
media_assets
videos
video_articles
```

### Originals

```text
programmes
episodes
```

### RSS

```text
rss_feeds
rss_items
rss_import_logs
```

### Homepage

```text
homepage_sections
homepage_items
```

### Breaking

```text
breaking_news
```

### Advertising

```text
ad_slots
advertisements
sponsorships
```

### Engagement

```text
article_views
video_events
social_shares
newsletter_subscribers
```

### System

```text
site_settings
audit_logs
redirects
```

---

# 8. Core database relationships

```text
profiles
   │
   └── user_roles ── roles

authors
   │
   └── articles
          │
          ├── categories
          ├── article_tags ── tags
          ├── article_revisions
          ├── video_articles ── videos
          └── media_assets

programmes
   │
   └── episodes
          │
          └── videos

rss_feeds
   │
   └── rss_items
          │
          └── articles

homepage_sections
   │
   └── homepage_items
          ├── articles
          └── videos

ad_slots
   │
   └── advertisements
```

---

# 9. Article schema

Recommended structure:

```text
articles
----------------------------
id UUID PK
title TEXT
slug TEXT UNIQUE
excerpt TEXT
body JSONB
category_id UUID
author_id UUID
featured_image_id UUID
source_id UUID
status article_status
content_type TEXT
is_breaking BOOLEAN
is_featured BOOLEAN
is_exclusive BOOLEAN
is_sponsored BOOLEAN
sponsor_label TEXT
scheduled_at TIMESTAMPTZ
published_at TIMESTAMPTZ
seo_title TEXT
seo_description TEXT
canonical_url TEXT
social_image_id UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Why `body JSONB`?

The article body should support structured blocks rather than being one uncontrolled HTML string.

For example:

```text
paragraph
heading
image
gallery
video
quote
embed
related-story
```

This gives the editorial team richer content without forcing arbitrary HTML into the system.

---

# 10. Article content blocks

Example conceptual structure:

```json
{
  "type": "video",
  "videoId": "..."
}
```

or:

```json
{
  "type": "image",
  "mediaId": "...",
  "caption": "...",
  "alt": "..."
}
```

Supported initial blocks:

* Paragraph
* Heading
* Image
* Gallery
* Video
* YouTube
* Quote
* Embed
* Related article

The block editor should sanitize and validate content.

---

# 11. Article status

Use a PostgreSQL enum or controlled value:

```text
draft
review
approved
scheduled
published
rejected
archived
```

Only authorized roles can transition content between states.

---

# 12. Revision architecture

`article_revisions` stores snapshots.

```text
article_revisions
----------------------------
id
article_id
version
title
excerpt
body
changed_by
change_summary
created_at
```

A database transaction should be used when publishing a revision.

---

# 13. Category architecture

```text
categories
----------------------------
id
name
slug
description
parent_id
image_id
display_order
is_active
created_at
updated_at
```

Add unique indexes for slugs.

Use `parent_id` for future subcategories.

---

# 14. Tags

```text
tags
----------------------------
id
name
slug
created_at
```

```text
article_tags
----------------------------
article_id
tag_id
```

Composite primary key:

```text
(article_id, tag_id)
```

---

# 15. Authors

Authors should be separate from authentication.

```text
authors
----------------------------
id
profile_id nullable
name
slug
bio
avatar_id
social_links JSONB
is_active
created_at
updated_at
```

This allows VNTV to have author pages even for legacy/imported authors who don't have CMS accounts.

---

# 16. Media architecture

```text
media_assets
----------------------------
id
file_name
storage_path
media_type
mime_type
file_size
width
height
duration
alt_text
caption
credit
uploaded_by
created_at
updated_at
```

Supabase Storage contains the actual object.

The database contains metadata.

---

# 17. Storage buckets

Recommended initial buckets:

```text
media
videos
avatars
documents
```

Storage access must be controlled using Supabase policies.

Publicly displayed assets can use controlled public URLs or signed URLs depending on content requirements.

Private editorial assets must never be exposed simply because their path is known.

---

# 18. Video schema

```text
videos
----------------------------
id
title
slug
description
source_type
source_url
storage_path
thumbnail_id
duration_seconds
orientation
video_type
programme_id
is_exclusive
is_featured
status
published_at
created_by
created_at
updated_at
```

### `source_type`

```text
upload
youtube
external
```

### `orientation`

```text
horizontal
vertical
```

### `video_type`

```text
news
breaking
interview
documentary
short
original
standalone
```

---

# 19. Article/video relationship

Use:

```text
video_articles
----------------------------
video_id
article_id
display_order
relationship_type
```

This allows:

```text
one article → multiple videos
one video → multiple articles
```

which satisfies the locked specification.

---

# 20. YouTube handling

A YouTube video record stores the YouTube identifier/URL.

The player component identifies:

```text
source_type === "youtube"
```

and disables the VNTV gating engine.

The frontend must never accidentally treat a YouTube embed as a VNTV-hosted video.

---

# 21. Video gating engine

Create a dedicated module:

```text
lib/gating/video-gate.ts
```

It receives:

```text
video
user
settings
playbackState
```

and determines whether playback may continue.

Conceptually:

```text
if user authenticated:
    allow

if video.source_type === youtube:
    allow

if video is exclusive:
    apply entitlement rules

if anonymous_video_gate_enabled === false:
    allow

if playback_percentage < 25:
    allow

otherwise:
    pause + show authentication gate
```

The 25% threshold must be calculated from actual duration, not a fixed time.

---

# 22. Video player requirements

The VNTV player must report:

* Play
* Pause
* Progress
* Duration
* Completion
* Error
* Fullscreen
* Muted state where useful

The gating logic should not depend on a fragile timer.

Use actual playback progress.

---

# 23. Article gating engine

Create:

```text
lib/gating/article-gate.ts
```

The gate is invoked only from the actual article reading page.

It must not run on:

* homepage
* category cards
* search results
* previews
* related-content cards

When enabled for anonymous users, the article reader invokes the gate according to the approved product behavior.

The exact visual interruption should be implemented as a reusable accessible component.

---

# 24. Authentication gate component

Create a reusable:

```text
<ContentAccessGate />
```

It can be used by:

* article gate
* video gate
* exclusive-content gate

It should support:

* Login
* Sign up
* Google
* Email
* Future Facebook provider

It must preserve the user's intended destination.

Example:

```text
User was reading article
        ↓
Gate appears
        ↓
Login
        ↓
Return to same article
```

For videos, authentication should return the user to the same video state where technically possible.

---

# 25. Authentication implementation

Use Supabase SSR authentication patterns appropriate to Next.js.

The application must maintain authenticated session state securely across server and client boundaries.

Do not expose service-role credentials to client-side code.

Environment variables should include only the required public and server secrets.

---

# 26. RSS ingestion architecture

RSS should be implemented as a controlled pipeline.

```text
Scheduled trigger
       ↓
Load enabled feeds
       ↓
Fetch RSS
       ↓
Parse
       ↓
Normalize
       ↓
Validate
       ↓
Deduplicate
       ↓
Create rss_items
       ↓
Editorial workflow
       ↓
Optional article creation
```

---

# 27. RSS tables

### `rss_feeds`

```text
id
name
url
source_name
country
category_id
is_enabled
auto_publish
requires_review
fetch_interval
last_fetched_at
last_success_at
last_error
created_at
updated_at
```

### `rss_items`

```text
id
feed_id
external_id
guid
title
description
content
url
author
image_url
published_at
fetched_at
status
article_id
content_hash
raw_payload
created_at
```

### `rss_import_logs`

```text
id
feed_id
started_at
completed_at
status
items_found
items_imported
duplicates_found
errors
```

---

# 28. RSS controls

Admin UI:

```text
Feed                 Enabled     Auto Publish
------------------------------------------------
Reuters              ON          OFF
BBC Africa           ON          OFF
Feed C               OFF         OFF
```

A disabled feed must not be fetched by the ingestion process.

Changing the switch must take effect without deployment.

---

# 29. RSS scheduling

The technical blueprint should use a reliable scheduled execution mechanism compatible with the existing deployment environment.

The implementation should avoid assuming that a long-running server process exists.

The ingestion operation must be **idempotent**.

If the same feed is processed twice, it should not create duplicate content.

---

# 30. Homepage architecture

Use database-driven sections:

```text
homepage_sections
----------------------------
id
name
section_type
display_order
is_enabled
configuration JSONB
created_at
updated_at
```

```text
homepage_items
----------------------------
id
section_id
article_id nullable
video_id nullable
display_order
starts_at
ends_at
is_active
```

This permits editorial control without creating a new table for every homepage section.

---

# 31. Breaking-news system

```text
breaking_news
----------------------------
id
article_id
headline_override
priority
starts_at
expires_at
is_active
created_by
created_at
updated_at
```

A scheduled process/query determines which breaking stories are active.

Expired breaking stories automatically disappear from the ticker.

---

# 32. Programmes and episodes

```text
programmes
----------------------------
id
name
slug
description
poster_id
presenter
programme_type
is_active
created_at
updated_at
```

```text
episodes
----------------------------
id
programme_id
title
slug
description
episode_number
video_id
thumbnail_id
published_at
created_at
updated_at
```

---

# 33. Advertising architecture

```text
ad_slots
----------------------------
id
name
key
description
placement
is_active
```

Examples:

```text
homepage_top
homepage_hero
homepage_feed
article_top
article_inline
article_sidebar
article_bottom
video_sponsor
```

Advertisements:

```text
advertisements
----------------------------
id
slot_id
name
creative_type
image_id
html_content
target_url
sponsor_id
starts_at
ends_at
priority
is_active
created_at
updated_at
```

Only trusted/admin-controlled HTML should ever be rendered.

---

# 34. Site settings

Use typed settings where possible rather than making everything an arbitrary JSON blob.

Required product settings include:

```text
anonymous_article_gate_enabled
anonymous_video_gate_enabled
newsletter_enabled
breaking_news_enabled
```

Other settings can include branding and social configuration.

Sensitive infrastructure secrets do **not** belong here.

---

# 35. RLS architecture

RLS is mandatory.

### Public users

Can read only:

```text
published articles
active categories
published videos
published programmes
published episodes
active homepage content
active advertisements
public author profiles
```

### Anonymous users

No write access.

### Reporter

Can create/edit permitted drafts.

### Editor

Can review and publish editorial content.

### Video Editor

Can manage permitted media/video records.

### Advertising Manager

Can manage advertising entities.

### Super Admin

Full authorized access.

---

# 36. RLS rule

The frontend must never be considered the security boundary.

This is insufficient:

```text
if (!isAdmin) hideDeleteButton()
```

Instead:

```text
Frontend authorization
+
Server authorization
+
Supabase RLS
```

must all align.

---

# 37. Audit logging

Sensitive actions should create audit records:

```text
CREATE
UPDATE
DELETE
PUBLISH
UNPUBLISH
APPROVE
REJECT
LOGIN/SECURITY EVENTS where appropriate
SETTINGS_CHANGE
ROLE_CHANGE
```

The audit record should include actor, entity, action and timestamp.

Avoid storing unnecessary sensitive information.

---

# 38. Search architecture

Initial implementation can use PostgreSQL full-text search.

Create appropriate indexes over:

* Article title
* Excerpt
* Body
* Tags
* Author
* Video title

Search results must filter to publicly accessible/published records.

If search volume grows significantly, a dedicated search service can be introduced later without redesigning the editorial model.

---

# 39. SEO architecture

Next.js metadata APIs should generate:

* `<title>`
* Description
* Canonical URL
* Open Graph
* Twitter/X metadata
* Article metadata
* Video metadata

Generate:

```text
/sitemap.xml
/robots.txt
```

Use dynamic sitemap generation from published content.

News/article structured data should be generated from canonical article records.

---

# 40. URL and slug rules

Published URLs must be stable.

Changing an article headline must **not** automatically change its URL.

If a slug must change, create a redirect:

```text
redirects
----------------------------
id
from_path
to_path
status_code
created_at
```

Prefer `301` for permanent editorial URL changes.

---

# 41. Caching and revalidation

Public content should use Next.js caching/revalidation where appropriate.

Content changes should be able to trigger targeted cache invalidation.

For example:

```text
Publish article
      ↓
Revalidate article
Revalidate category
Revalidate homepage
```

Do not globally invalidate the entire site for every content change.

---

# 42. Analytics event model

Frontend events should use a consistent event taxonomy.

Examples:

```text
article_view
video_start
video_progress
video_complete
content_gate_shown
content_gate_login
content_gate_signup
share
search
newsletter_signup
```

Events should include only data necessary for the analytics purpose.

---

# 43. Performance architecture

### Images

Use Next.js image optimization where compatible with the media source.

### Video

Don't preload full video unnecessarily.

Use poster/thumbnail first.

### JavaScript

Keep interactive islands small.

### Fonts

Limit font variants.

### Database

Add indexes to frequently queried:

* slug
* status
* published_at
* category
* author
* tags
* feed IDs
* video source
* homepage ordering

### Pagination

Never load an unlimited article/video list.

---

# 44. Accessibility architecture

Target WCAG 2.2 AA.

Components must provide:

* Semantic HTML
* Keyboard navigation
* Visible focus
* Skip links
* Correct heading hierarchy
* Form labels
* Accessible errors
* Dialog focus management
* Escape behavior
* Screen-reader labels
* Accessible video controls
* Captions support
* Reduced-motion support
* Sufficient contrast
* Touch-friendly controls

The content gate is particularly important: authentication must not produce an inaccessible modal.

---

# 45. Design system architecture

Create centralized tokens:

```text
colors
typography
spacing
radii
shadows
breakpoints
motion
z-index
```

The exact VNTV brand values should come from the approved project assets/design reference rather than being reinvented by individual components.

Build foundational components:

```text
Button
Input
Select
Badge
Dialog
Tabs
Dropdown
Tooltip
Card
Avatar
Skeleton
Toast
Pagination
```

Then VNTV-specific components:

```text
BreakingTicker
NewsCard
HeroStory
ArticleHeader
ArticleBody
VideoCard
VideoPlayer
VideoGate
ArticleGate
AuthorCard
CategoryHeader
ProgrammeCard
AdSlot
NewsletterSignup
SearchBar
```

---

# 46. Kiro UI autonomy

Kiro is explicitly allowed to make design decisions **within the locked product requirements**.

It should use `core-design` principles to determine:

* spacing
* composition
* hierarchy
* responsive layout
* interaction patterns
* animation
* component composition
* visual polish

It must **not** use the skill as an excuse to change:

* VNTV's brand identity
* authentication requirements
* gating behavior
* content model
* editorial workflow
* roles
* accessibility requirements
* YouTube exemption
* RSS controls

The agent should favor **fewer, stronger components** over a huge collection of decorative UI.

---

# 47. Security architecture

Never commit:

```text
SUPABASE_SERVICE_ROLE_KEY
private API keys
OAuth client secrets
database passwords
```

Client receives only values explicitly intended to be public.

Server-only operations use protected environment variables.

File uploads must validate:

* MIME type
* file size
* file extension
* authorization

Admin operations should use server-side validation with schemas.

---

# 48. Validation

Use a consistent schema-validation layer, such as Zod or an equivalent established validation library.

Validate:

* Article creation
* Article updates
* Publishing
* Categories
* Tags
* RSS URLs
* Advertisement configuration
* User/role changes
* Media metadata
* Site settings

Never trust browser-submitted values.

---

# 49. Error handling

Create consistent application error handling.

Public users should receive useful but non-sensitive errors.

Admin users should receive actionable validation messages.

Server logs may contain technical details, but these must not leak into public responses.

---

# 50. Testing strategy

### Unit tests

For:

* Gating logic
* Permissions
* Slug generation
* RSS normalization
* Duplicate detection
* Validation
* Content status transitions

### Integration tests

For:

* Supabase queries
* Authentication
* RLS
* Publishing workflow
* RSS import
* Media handling

### End-to-end tests

Critical journeys:

1. Anonymous article browsing
2. Anonymous article gate
3. Anonymous VNTV video gate
4. YouTube video playback without VNTV gate
5. Google login
6. Email signup/login
7. Reporter creates article
8. Editor approves/publishes
9. Admin disables RSS feed
10. RSS feed imports content
11. Admin changes homepage
12. Advertising manager changes ad
13. Mobile navigation
14. Keyboard-only navigation

---

# 51. Environment configuration

Use environment variables for infrastructure configuration.

Conceptually:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Plus provider-specific credentials where required.

The exact variable names should follow the chosen Supabase/Next.js implementation conventions.

No secrets are stored in the database.

---

# 52. Deployment

The project is deployed through the existing Vercel Git integration.

The implementation must **not create `vercel.json`**.

Deployment pipeline:

```text
Developer
   ↓
Git push
   ↓
Vercel automatic build
   ↓
Tests/build
   ↓
Deployment
```

Supabase migrations should be version-controlled and applied through the chosen migration workflow.

---

# 53. Supabase migrations

Database changes must be migration-based.

Example:

```text
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_roles.sql
    ├── 003_editorial.sql
    ├── 004_media.sql
    ├── 005_video.sql
    ├── 006_rss.sql
    ├── 007_homepage.sql
    ├── 008_ads.sql
    └── ...
```

Do not manually modify production schema without a corresponding migration.

---

# 54. Implementation phases

## Phase 1 — Foundation

* Next.js project architecture
* Supabase connection
* Authentication
* Profiles
* Roles
* RLS foundation
* Design tokens
* Core UI components
* Public layout
* Header/footer/navigation

## Phase 2 — Editorial CMS

* Articles
* Categories
* Tags
* Authors
* Media
* Draft/review/publish workflow
* Revisions
* Search
* SEO

## Phase 3 — Public editorial experience

* Homepage
* Category pages
* Article pages
* Breaking ticker
* Related stories
* Author pages
* Search

## Phase 4 — Video

* Video CMS
* Uploaded videos
* YouTube
* Horizontal/vertical presentation
* Video player
* Article/video relationships
* Video pages
* VNTV Originals

## Phase 5 — Access control

* Google authentication
* Anonymous article gate
* Anonymous video gate
* 25% playback threshold
* YouTube exemption
* Exclusive content architecture

## Phase 6 — RSS

* Feed management
* Enable/disable
* Fetching
* Parsing
* Deduplication
* Import review
* Attribution
* Publishing

## Phase 7 — Commercial

* Ad slots
* Advertisements
* Sponsorship
* Newsletter

## Phase 8 — Analytics/operations

* Analytics events
* Trending
* Audit logs
* Admin dashboards
* Performance optimization
* Accessibility audit
* Security review

---

# 55. Definition of done

The VNTV MVP is not considered complete merely because pages render.

A feature is complete when it satisfies:

```text
Functional
+
Secure
+
Responsive
+
Accessible
+
Tested
+
CMS-manageable
+
SEO-compatible
+
Performance-appropriate
```

For example, the video gate is not complete just because a modal appears at 25%.

It must also:

* correctly identify anonymous users
* ignore YouTube
* use actual playback percentage
* pause playback
* work on mobile
* be keyboard accessible
* support Google/email authentication
* return the user appropriately after authentication
* respect the global setting
* not activate on previews
* not break normal authenticated playback

---

# 56. Final architecture

The finished system should conceptually look like this:

```text
                         ┌───────────────────┐
                         │     VNTV WEB      │
                         │      Next.js      │
                         └─────────┬─────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
        PUBLIC SITE              AUTH                 CMS
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                              SERVER LAYER
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
         Supabase DB           Supabase Auth        Supabase Storage
             │
 ┌───────────┼───────────┬────────────┬─────────────┐
 ▼           ▼           ▼            ▼             ▼
Editorial   Video       RSS        Advertising    System
 │           │           │            │             │
Articles    Videos      Feeds        Ads           Audit
Authors     YouTube     Items        Sponsors      Settings
Tags        Originals   Imports
Breaking
Homepage
```

## The most important architectural decisions are now fixed

**Supabase is the source of truth.**

**Next.js is the presentation/application layer.**

**RLS is the security boundary.**

**CMS controls editorial behavior.**

**RSS is an ingestion pipeline, not a blind publishing mechanism.**

**VNTV videos can be gated at 25% when enabled.**

**YouTube videos are never subjected to that VNTV gate.**

**Article gating happens only inside the article-reading experience.**

**Video gating happens only during actual playback.**

**Authentication is email + Google initially, with Facebook-ready architecture.**

**The CMS controls whether anonymous gating is enabled.**

**VNTV's design system remains controlled by the approved brand direction, while Kiro has autonomy to apply `core-design` principles to produce a polished interface.**

**Vercel automatic deployment remains untouched; no `vercel.json`.**

This blueprint is now detailed enough to serve as the implementation contract for Kiro. The strongest next step is to turn **Sections 7–18 into the actual Supabase migration/schema + RLS specification**, because that becomes the foundation everything else builds against.
