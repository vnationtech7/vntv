# VNTV — LOCKED FULL PRODUCT SPECIFICATION

**Status: PRODUCT SPEC LOCKED**
**Date: August 26, 2026**
**Implementation stack:** Next.js + TypeScript + Supabase + Vercel automatic deployment
**UI direction:** premium editorial/news experience, mobile-first, accessibility-first, using the installed `inhaq/core-design-skills` principles with strong autonomy for the Kiro agent.

This specification resolves the requirements discussed so far and adds the necessary rules where the original requirements were ambiguous.

---

# 1. Product definition

**VNTV** is a digital-first African news and video platform combining:

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
* Original VNTV programmes
* News video
* YouTube video
* Uploaded/original video
* RSS-fed external news
* Advertising and sponsorship
* Newsletter/distribution
* Editorial CMS

The platform must work as both a **public media website** and a **full newsroom/content-management system**.

---

# 2. Technology stack

## Frontend

* Next.js
* React
* TypeScript
* Responsive CSS/Tailwind as appropriate to the existing project
* Server/client components used deliberately
* SEO-friendly rendering
* Mobile-first architecture

## Backend

**Supabase**

* PostgreSQL
* Supabase Auth
* Supabase Storage
* Row Level Security
* Database functions/triggers where appropriate

## Deployment

**Vercel**

* Automatic deployment
* Existing deployment configuration is retained
* **Do not create `vercel.json`**

## External services/content

* Google authentication
* Email/password authentication
* Facebook authentication later
* YouTube
* RSS feeds
* Analytics
* Social platforms
* Email/newsletter provider where selected

---

# 3. Authentication

VNTV supports three authentication methods.

### MVP

1. Email/password
2. Google Login

### Later

3. Facebook Login

Authentication must be designed so Facebook can be enabled later without restructuring the user system.

Supabase Auth is the authentication authority.

Application-specific user information lives in the application's profile tables rather than being duplicated unnecessarily in the auth system.

---

# 4. Anonymous users

Users who have not signed in can browse VNTV.

They can:

* View the homepage
* Browse categories
* See article cards
* See article previews/excerpts
* See video thumbnails
* See video previews
* Watch unrestricted content
* Browse public navigation
* View public programme pages
* See advertising
* Share public URLs

However, VNTV has an **optional anonymous-content interruption system**.

---

# 5. Anonymous article restriction

The CMS contains a global setting controlling article gating.

### Setting

`anonymous_article_gate_enabled`

When **OFF**:

> Anonymous users can read normal published articles in full.

When **ON**:

> Anonymous users can view the article preview, but after entering the actual article-reading experience, VNTV interrupts access and requests sign-in/sign-up.

### Critical behavior

The interruption **must not occur on:**

* Homepage
* Category page
* Search results
* Article cards
* Article previews
* Related-story cards
* Navigation
* Other non-reading surfaces

It may only occur when the anonymous user has entered the **actual article reading experience**.

The purpose is to allow discovery before requiring registration.

---

# 6. Anonymous video restriction

The platform has a separate setting:

`anonymous_video_gate_enabled`

When **OFF**:

Anonymous users can watch normal VNTV videos in full.

When **ON**:

Anonymous users can watch approximately **25% of the video**, after which playback is interrupted and the user is asked to sign up/sign in.

The interruption should occur at:

> **25% of the video's duration**

rather than at a fixed number of seconds.

This must work for VNTV-controlled video playback.

---

# 7. Video interruption rules

This is an important locked requirement.

The interruption can happen **only while the user is actually playing the video**.

It must **not** trigger merely because:

* The video appears on screen
* The video thumbnail is visible
* A preview card is displayed
* The video is present on the homepage
* The video is visible in a category
* The video is loaded but has not started playing

The system must distinguish:

`video visible`

from:

`video actively playing`.

---

# 8. YouTube exception

**YouTube videos are excluded from the VNTV anonymous video-gating system.**

Reason:

> YouTube content is already governed by YouTube's own viewing model and is generally freely accessible.

Therefore:

```text
VNTV uploaded video
→ VNTV gating applies when enabled

VNTV-hosted/original video
→ VNTV gating applies when enabled

YouTube video
→ VNTV gating does NOT apply
```

This rule is absolute unless deliberately changed in a future product revision.

---

# 9. Exclusive content

The system must support content marked:

`exclusive = true`

Exclusive content is always restricted according to its configured access policy.

The platform therefore distinguishes:

### Normal content

Controlled by the anonymous gating settings.

### Exclusive content

Requires the appropriate authenticated/access entitlement regardless of the normal anonymous setting.

This allows VNTV to introduce premium/exclusive content later without redesigning the content model.

---

# 10. Article/video relationship

Articles and videos are **independent content types**, but they can be associated.

### Article can contain:

* Embedded VNTV video
* YouTube video
* Uploaded video
* Multiple videos
* Video thumbnail
* Video within article body

### Video can have:

* Associated article
* Related articles
* Standalone description/content
* Programme
* Episode
* Category
* Tags

Therefore:

```text
Article
   ↕
Video
```

is a many-to-many-capable relationship rather than forcing every video to belong to exactly one article.

---

# 11. Video types

VNTV supports:

### Hosted/original video

Uploaded and managed by VNTV.

### YouTube video

Referenced through YouTube.

### External video

Supported where editorially appropriate.

### Standalone video

A video without an associated article.

### Article video

A video associated with an article.

### Programme video

An episode belonging to a VNTV Original programme.

---

# 12. Video aspect ratios

The platform supports:

### Horizontal

`16:9`

Used for:

* News
* Interviews
* Documentaries
* Programmes
* Standard video

### Vertical

`9:16`

Used for:

* Shorts
* Social-style video
* Mobile-first video

The CMS must know the video's orientation/aspect ratio so the frontend can select the correct presentation.

---

# 13. Content categories

Initial editorial categories:

* Breaking News
* Ghana
* Nigeria
* Africa
* World
* Politics
* Business
* Entertainment
* Sports
* Viral
* Opinion
* Video
* VNTV Originals

Categories must be CMS-managed rather than permanently hardcoded.

Categories may support subcategories.

---

# 14. Article specification

Each article supports:

* Headline
* Slug
* Excerpt
* Body
* Category
* Subcategory
* Author
* Featured image
* Additional media
* Gallery
* Tags
* Associated videos
* Source
* Publication date
* Updated date
* Status
* Breaking flag
* Featured flag
* Exclusive flag
* Sponsored flag
* Sponsorship label
* SEO title
* SEO description
* Canonical URL
* Social image
* Alt text
* Caption
* Credit
* Editorial notes

---

# 15. Editorial workflow

Articles follow:

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

The system must retain revision history.

---

# 16. Article revisions

Every significant article modification can be recorded.

Revision history includes:

* Version
* Author/editor
* Timestamp
* Previous headline
* Previous body
* Change summary

Editors with appropriate permission can restore previous versions.

---

# 17. Breaking news

Breaking news is a dedicated editorial feature.

Editors can:

* Mark article as breaking
* Add it to breaking ticker
* Override ticker headline
* Set priority
* Schedule start
* Schedule expiry
* Remove it from ticker

The breaking ticker is therefore independent from simply setting `article.is_breaking`.

---

# 18. Homepage

Homepage sections are CMS-controlled.

Initial structure:

1. Breaking ticker
2. Header/navigation
3. Hero story
4. Secondary stories
5. Latest News
6. Video
7. Ghana
8. Nigeria
9. Africa
10. World
11. Politics
12. Business
13. Entertainment
14. Sports
15. Viral
16. VNTV Originals
17. Newsletter
18. Footer

Admins/editors can:

* Enable/disable sections
* Reorder sections
* Select featured content
* Schedule content
* Change section titles where appropriate

The frontend must not require a developer to rearrange editorial sections.

---

# 19. RSS/news-feed system

VNTV includes an administrator-managed RSS ingestion system.

Admin can add:

* Feed name
* RSS URL
* Source
* Country/region
* Category
* Attribution
* Fetch interval
* Enabled/disabled state
* Auto-publish state
* Review requirement

Example:

```text
BBC Africa       ON
Reuters          ON
Source C         OFF
```

### Feed ON

The system fetches and processes new items.

### Feed OFF

The system stops importing from that feed.

---

# 20. RSS editorial safety

**RSS content must not automatically become trusted VNTV editorial content.**

Default:

```text
RSS
 ↓
Fetch
 ↓
Normalize
 ↓
Duplicate detection
 ↓
Imported/Pending Review
 ↓
Editor
 ↓
Publish
```

Auto-publishing is configurable per feed.

The system must retain source attribution and original URL.

---

# 21. RSS duplicate detection

The ingestion system must detect obvious duplicates using identifiers such as:

* Feed ID
* External ID
* GUID
* Canonical URL
* Normalized title

The architecture should leave room for more sophisticated similarity detection later.

---

# 22. Media library

CMS media library supports:

* Images
* Videos
* Documents where necessary
* Thumbnails
* Alt text
* Captions
* Credits
* File metadata
* Reuse across content

Supabase Storage holds the actual files.

PostgreSQL stores metadata.

---

# 23. VNTV Originals

The platform supports programmes such as:

* D'Opinion
* Beyond Headlines
* Documentaries
* Interviews
* Future programmes

Structure:

```text
Programme
   ↓
Season/optional grouping
   ↓
Episode
   ↓
Video
```

Episodes can also have associated articles.

---

# 24. Search

VNTV requires site search across published content.

Search should cover:

* Headlines
* Article body
* Categories
* Tags
* Authors
* Video titles
* Programme names

Results must respect publication/access permissions.

---

# 25. Related content

Articles should support related content.

Initial recommendations can use:

* Category
* Tags
* Keywords
* Recency

Architecture should allow a future recommendation engine.

---

# 26. Trending / most-read

The platform should track enough engagement data to support:

* Trending
* Most Read Today
* Most Read This Week
* Popular Videos

This can initially be rule-based rather than AI-driven.

---

# 27. User accounts

Registered users have:

* Profile
* Name
* Email
* Avatar
* Preferences
* Newsletter preferences
* Account status

Future capabilities can include:

* Saved articles
* Watch history
* Personal recommendations
* Notifications

These should be architecturally possible but don't need to be MVP UI unless included in the implementation phase.

---

# 28. Advertising

Advertising is CMS-managed.

Admin can create/manage:

* Homepage ads
* Article ads
* Inline ads
* Sidebar ads
* Video sponsorship
* Sponsored content

Ad slots must be configurable without code changes.

Each advertisement can have:

* Creative
* Target URL
* Sponsor
* Start date
* End date
* Active state
* Priority

---

# 29. Sponsored content

Sponsored content must be clearly distinguishable from editorial content.

The CMS supports:

* Sponsored flag
* Sponsor name
* Sponsored label
* Campaign association

Visual treatment must not mislead users into thinking sponsored content is independent editorial reporting.

---

# 30. Newsletter

VNTV supports newsletter signup.

Initial option:

**VNTV Daily**

Architecture should allow additional newsletter categories later.

---

# 31. Social sharing

Articles and videos support easy sharing to relevant platforms, including:

* WhatsApp
* Facebook
* X
* LinkedIn where appropriate
* Copy link

Social metadata must be generated correctly for articles and videos.

---

# 32. SEO

Every indexable article supports:

* SEO title
* Meta description
* Canonical URL
* Open Graph metadata
* Social image
* Structured data
* Clean slug
* Publication date
* Updated date
* Author information

The system should generate appropriate news/article/video structured data.

---

# 33. Analytics

VNTV integrates analytics rather than attempting to replace a dedicated analytics platform.

Track important events such as:

* Article view
* Video start
* Video completion
* Search
* Share
* Newsletter signup
* Authentication
* Gating interruption
* Registration conversion

The product database may retain selected lightweight metrics for editorial features such as trending.

---

# 34. Admin roles

Initial roles:

### Super Admin

Full system control.

### Editor

Content review, publishing and editorial management.

### Reporter/Writer

Create and manage permitted articles/drafts.

### Video Editor

Manage video content and media.

### Advertising Manager

Manage ads and sponsorships.

Permissions must be enforced through Supabase RLS and server-side authorization, not merely frontend UI visibility.

---

# 35. Accessibility

Target:

**WCAG 2.2 AA**

Required capabilities include:

1. Keyboard navigation
2. Screen-reader semantic structure
3. Accessible video controls
4. Captions where available
5. Video transcripts where available
6. Meaningful image alt text
7. Strong colour contrast
8. Reduced-motion support
9. Responsive text/zoom behavior
10. Accessible touch targets
11. Visible focus states
12. Form labels and useful validation
13. Error messages that don't rely solely on colour
14. Skip navigation
15. Logical heading hierarchy
16. Accessible authentication/gating dialogs

Accessibility is a product requirement, not a later enhancement.

---

# 36. Design system

The Kiro agent has access to **`inhaq/core-design-skills`**.

The agent is given **design autonomy**, but must apply the skill's principles rather than mechanically copying its examples.

The design objective is:

> **Premium editorial product, not generic AI-generated dashboard.**

Kiro should:

* Inspect existing components before creating new ones
* Establish reusable design tokens
* Maintain consistent spacing
* Use strong editorial hierarchy
* Prioritize typography
* Avoid unnecessary card proliferation
* Avoid excessive rounded containers
* Avoid gratuitous gradients
* Avoid decorative UI without purpose
* Use motion intentionally
* Preserve accessibility
* Design responsive behavior deliberately
* Validate the rendered interface
* Reuse components where appropriate
* Adapt the design principles to VNTV rather than blindly reproducing another product's aesthetic

### Brand direction

The VNTV interface should use the **approved VNTV brand colors and icon style from the supplied project/reference materials**.

The implementation should centralize these in design tokens rather than scattering hard-coded values throughout components.

Icons should follow **one coherent icon family/style** throughout the application.

No random mixture of icon styles.

---

# 37. Performance

The platform targets:

* Fast initial page loads
* Mobile-first performance
* Optimized images
* Responsive image sizing
* Lazy loading where appropriate
* Minimal client-side JavaScript
* Efficient caching
* SEO-friendly server rendering
* Good performance on slower connections

Video should not unnecessarily load large media before the user interacts with it.

---

# 38. Anonymous gating UX

The gate must feel like a **content-access transition**, not an aggressive advertisement.

For articles:

```text
Article preview
      ↓
User opens article
      ↓
Reading begins
      ↓
Gate condition reached
      ↓
Sign in / Sign up
```

For videos:

```text
Video starts
      ↓
25% playback
      ↓
Playback pauses
      ↓
Sign in / Sign up
```

The gate should explain the benefit clearly.

It must offer:

* Google login
* Email signup/login
* Future Facebook login

It must not trap the user in an inaccessible modal.

---

# 39. Gate configuration

Admin settings must allow:

```text
Anonymous article gate
[ ON / OFF ]

Anonymous video gate
[ ON / OFF ]
```

These are independent.

Therefore:

```text
Article ON
Video ON
```

or:

```text
Article OFF
Video ON
```

or:

```text
Article ON
Video OFF
```

or:

```text
Article OFF
Video OFF
```

are all valid configurations.

YouTube remains exempt from the video gate.

---

# 40. Content access matrix

| Content                     | Anonymous                       | Signed-in             |
| --------------------------- | ------------------------------- | --------------------- |
| Homepage                    | Full                            | Full                  |
| Article preview             | Full                            | Full                  |
| Normal article, gate OFF    | Full                            | Full                  |
| Normal article, gate ON     | Restricted by gate              | Full                  |
| Normal VNTV video, gate OFF | Full                            | Full                  |
| Normal VNTV video, gate ON  | 25% playback                    | Full                  |
| YouTube video               | Full                            | Full                  |
| Exclusive article           | Restricted                      | Based on entitlement  |
| Exclusive video             | Restricted                      | Based on entitlement  |
| RSS preview                 | Public according to publication | Full                  |
| Admin CMS                   | No                              | Authorized roles only |

---

# 41. Security

Required:

* Supabase RLS
* Role-based authorization
* Secure server-side mutations
* Input validation
* Protected admin routes
* Secure file upload policies
* No service-role keys exposed to browser
* No sensitive credentials in source control
* Rate limiting where necessary
* Secure authentication flows
* Audit logging for sensitive CMS actions

---

# 42. Database domains

The locked database architecture is:

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
├── video_articles
└── video_playlists/programmes

ORIGINALS
├── programmes
├── episodes
└── guests

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

This is the **logical model**. The technical blueprint will determine exact columns, indexes, constraints, foreign keys, RLS policies, triggers and migrations.

---

# 43. Things explicitly NOT in the MVP

To prevent scope creep, these are **future-capability areas**, not requirements that Kiro should quietly build now:

* Native iOS app
* Native Android app
* Complex AI recommendation engine
* Full subscription/paywall billing
* Advanced multilingual publishing
* Automated AI fact checking
* Automated AI journalism
* Complex advertising bidding system
* WhatsApp chatbot
* Full offline article synchronization
* Advanced personalization engine

The architecture should not prevent them later.

---

# 44. Implementation rules for Kiro

Kiro should **not improvise product behavior** where this specification is explicit.

If the specification says:

> YouTube is exempt from video gating

Kiro implements that exact rule.

If the specification says:

> Gating happens during actual reading/playback, not preview

Kiro must preserve that distinction.

If the specification says:

> RSS can be turned off

the CMS must expose the control.

If a technical decision is necessary that is not specified, Kiro should choose the simplest robust solution consistent with:

**security → accessibility → performance → maintainability → visual quality.**

The installed `core-design` skill is a **design-principle resource**, not permission to redesign VNTV's product requirements.

---

# 45. Final scope lock

### The VNTV MVP is therefore:

**Public platform**

* News
* Articles
* Video
* YouTube
* VNTV Originals
* Search
* Categories
* Breaking news
* Homepage
* Social sharing
* Newsletter
* Advertising
* SEO

**CMS**

* Articles
* Videos
* Media
* Authors
* Categories
* Tags
* Breaking news
* Homepage
* RSS feeds
* RSS review
* Ads
* Programmes
* Users/roles
* Settings
* Analytics visibility
* Audit trail

**Authentication**

* Email/password
* Google
* Facebook-ready architecture

**Access control**

* Anonymous users
* Configurable article gate
* Configurable video gate
* 25% VNTV-video threshold
* YouTube exemption
* Exclusive content support

**Infrastructure**

* Next.js
* TypeScript
* Supabase
* Supabase Auth
* Supabase Storage
* PostgreSQL
* RLS
* Vercel automatic deployment
* No `vercel.json`

**Design**

* VNTV brand system
* Approved colors
* Consistent iconography
* `core-design` principles
* Kiro design autonomy within the product rules
* Responsive
* WCAG 2.2 AA
* Premium editorial visual language

