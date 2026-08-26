# VNTV Development Milestones

**Project:** VNTV - African News & Video Platform  
**Stack:** Next.js + TypeScript + Supabase + Vercel  
**Approach:** Incremental, mobile-first, production-quality at each milestone  
**Design:** Light/Dark theme support required throughout (see design preview reference)

---

## Design Requirements

Based on the provided desktop design previews, the platform must implement:

### Visual Direction
- **Dual theme system**: Fully functional light and dark themes
- **Theme toggle**: Accessible toggle button in header/navigation
- **VNTV branding**: Red accent color (#E31C23 or similar) for logo, CTAs, breaking news badges
- **Typography**: Clean, hierarchical typography with clear headline/body distinction
- **Category badges**: Colored labels (POLITICS, AFRICA, GHANA, etc.) with theme-appropriate styling
- **Cards**: Subtle borders/shadows that work in both themes
- **Video elements**: Play icons, duration overlays, thumbnails
- **Icons**: Consistent icon family throughout (category icons, social icons, UI icons)

### Key UI Elements from Design Preview
1. **Header/Navigation**
   - VNTV logo with tagline "AFRICA. OUR STORIES. OUR WAY."
   - Horizontal category navigation
   - Social media icons (Facebook, X, YouTube, Instagram, TikTok)
   - Search bar
   - Theme toggle button
   - Login/profile button

2. **Breaking News Ticker**
   - Red "BREAKING" badge with flame icon
   - Horizontal scroll with navigation arrows
   - Article headline and time
   - Theme-aware styling

3. **Hero Section**
   - Large featured image with text overlay
   - "TOP STORY" badge
   - Category badge
   - Headline, excerpt, author, date, read time
   - "READ FULL STORY" CTA button
   - Carousel dots for rotation

4. **Content Sections**
   - "LATEST NEWS" with thumbnail cards
   - "TRENDING NOW" numbered sidebar
   - "VNTV VIDEO" with play buttons and durations
   - Category icon navigation bar
   - Newsletter signup module

5. **Footer**
   - Multi-column layout (Explore, About, Support, More from VNTV)
   - Category quick links
   - Social media links
   - "Back to top" button

### Theme Implementation Notes
- Theme preference must persist across sessions
- System preference detection (prefers-color-scheme)
- Smooth transitions when toggling themes
- All components must be tested in both themes
- Color contrast must meet WCAG 2.2 AA in both themes
- Images and videos should have appropriate overlays/treatments for both themes

---

## Milestone 1: Foundation & Database Architecture

**Goal:** Establish the secure data foundation that everything else builds on

**Database**
- [ ] Create Supabase project and configure environment
- [ ] Design and implement complete database schema migrations
  - Auth domain (profiles, roles, user_roles)
  - Editorial domain (articles, categories, tags, authors, sources, revisions)
  - Media domain (media_assets, videos, video_articles)
  - Originals domain (programmes, episodes)
  - RSS domain (rss_feeds, rss_items, rss_import_logs)
  - Homepage domain (homepage_sections, homepage_items)
  - Breaking domain (breaking_news)
  - Advertising domain (ad_slots, advertisements, sponsorships)
  - Engagement domain (article_views, video_events, social_shares, newsletter_subscribers)
  - System domain (site_settings, audit_logs, redirects)
- [ ] Implement PostgreSQL indexes for performance
- [ ] Create enums for status, video types, content types
- [ ] Set up foreign key relationships and constraints

**Row Level Security (RLS)**
- [ ] Define RLS policies for all tables
- [ ] Implement public read access for published content
- [ ] Implement role-based write permissions
- [ ] Create helper functions for permission checks
- [ ] Test RLS policies thoroughly

**Authentication**
- [ ] Configure Supabase Auth
- [ ] Set up Google OAuth provider
- [ ] Prepare Facebook OAuth configuration (disabled initially)
- [ ] Configure email/password authentication
- [ ] Set up auth callbacks and middleware

**Project Structure**
- [ ] Initialize Next.js 14+ with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Set up project folder structure (app, components, lib, hooks, types, config)
- [ ] Configure Tailwind CSS or chosen CSS approach
- [ ] Create environment variable structure
- [ ] Set up Supabase client utilities (server, client, middleware)

**Type Generation**
- [ ] Generate TypeScript types from Supabase schema
- [ ] Create shared type definitions
- [ ] Set up type-safe database queries

**Deliverable:** A secure, fully-typed database with RLS policies, ready for CMS and public features

---

## Milestone 2: Design System & Core UI Components

**Goal:** Build the reusable design foundation following core-design principles

**Design Preview Reference**
The desktop design previews and HTML mockup (`vntv-ui-mockup.html`) show the expected visual direction:

**Dark Theme** (Primary in mockup):
- Deep backgrounds (#0b0b0d, #141417, #1b1b1f)
- Red accent color (#e0142c) for VNTV branding, CTAs, and breaking news
- Subtle borders (#2a2a2f) not heavy shadows
- Clean typography hierarchy with strong weight differences
- Card-based layouts with 10px border radius
- Video thumbnails with play icons and duration overlays
- Numbered trending lists with up/down arrows
- Icon-based category navigation with distinct colors
- Newsletter signup with prominent CTA
- Social media icon integration

**Light Theme** (To be implemented):
- White/off-white backgrounds
- Same red accent (#e0142c)
- Adjusted borders and muted colors for light background
- Maintains same layout and component structure

**Key Mockup Elements to Match**:
- Logo: "VNTV" with red "TV", tagline below in small caps
- Breaking ticker: "⚡ BREAKING ⚡" badge with article + time
- Hero: Image overlay with gradient scrim, TOP STORY badge, carousel dots
- Category badges: Uppercase, small, colored (POLITICS, AFRICA, GHANA, etc.)
- Trending: Numbered 01-05 with red-dimmed numbers, arrows showing trend direction
- Video cards: Play button, duration overlay (bottom-right), category badge
- Category grid: 8 boxes with colored icons and descriptions
- Newsletter: Email icon, form with adjacent Subscribe button

Both themes must be fully functional and polished from the start.

**Design Tokens**
- [ ] Define VNTV brand colors (from approved brand assets and mockup reference)
  - [ ] Light theme color palette
  - [ ] Dark theme color palette (as shown in mockup: bg #0b0b0d, panel #141417, panel-2 #1b1b1f, border #2a2a2f, red #e0142c)
  - [ ] Semantic color tokens (success, error, warning, info)
  - [ ] Category colors (Ghana red, Nigeria gold, Africa green, World blue, Politics purple, Business pink, Entertainment magenta, Sports indigo)
- [ ] Create typography scale and font configuration (Helvetica Neue or similar sans-serif)
- [ ] Define spacing system (mockup uses varied spacing: 8px, 16px, 24px, 32px base)
- [ ] Set up border radius tokens (10px for cards, 6px for buttons, 50% for avatars/circles, 4px for small elements)
- [ ] Define shadow system (light and dark variants - mockup uses minimal shadows, prefers borders)
- [ ] Create breakpoint tokens
- [ ] Set up z-index scale
- [ ] Define motion/animation tokens (easing, durations)

**Theme System**
- [ ] Implement theme context/provider (light/dark)
- [ ] Theme toggle button component
- [ ] Persist theme preference (localStorage + user profile for authenticated)
- [ ] System preference detection (prefers-color-scheme)
- [ ] Smooth theme transitions
- [ ] Theme-aware color tokens
- [ ] Test all components in both themes

**Base Components**
- [ ] Button (with all states: hover, focus-visible, active, disabled)
- [ ] Input/TextField (with label, error states, validation)
- [ ] Select/Dropdown
- [ ] Badge/Pill
- [ ] Card (following "earn the card" principle)
- [ ] Dialog/Modal (accessible, keyboard trap, focus management)
- [ ] Tabs
- [ ] Tooltip
- [ ] Avatar
- [ ] Skeleton loader
- [ ] Toast/notification
- [ ] Pagination

**Layout Components**
- [ ] Container/Wrapper
- [ ] Grid system
- [ ] Stack/Flex utilities
- [ ] Section wrapper

**Icon System**
- [ ] Select and configure coherent icon family
- [ ] Create icon component wrapper
- [ ] Set up commonly-needed icons

**Accessibility Foundation**
- [ ] Implement skip navigation
- [ ] Set up focus management utilities
- [ ] Create accessible form validation patterns
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios (≥4.5:1) for both light and dark themes
- [ ] Implement reduced-motion support
- [ ] Test theme toggle accessibility (keyboard, screen reader)

**Deliverable:** Complete, accessible design system with full light/dark theme support ready for editorial and public features

---

## Milestone 3: Authentication & User Management

**Goal:** Secure authentication system with role-based access

**Public Authentication UI**
- [ ] Login page/modal
- [ ] Signup page/modal
- [ ] Password reset flow
- [ ] Email verification handling
- [ ] OAuth callback handling
- [ ] Authentication state management

**Session Management**
- [ ] Server-side session handling with Next.js middleware
- [ ] Protected route wrappers
- [ ] Auth state persistence
- [ ] Session refresh logic

**User Profile**
- [ ] Profile creation on first login
- [ ] Profile page/settings
- [ ] Avatar upload
- [ ] Newsletter preferences
- [ ] Account management

**Role Management (Admin)**
- [ ] Role assignment UI
- [ ] User management dashboard
- [ ] Permission matrix display
- [ ] Role-based route protection

**Content Access Gate Component**
- [ ] Reusable `<ContentAccessGate />` component
- [ ] Article gate variant
- [ ] Video gate variant
- [ ] Return-to-content after authentication
- [ ] Mobile-optimized gate experience

**Deliverable:** Complete authentication system with Google login, email/password, and access gates ready for content

---

## Milestone 4: Editorial CMS - Core Content Management

**Goal:** Full editorial workflow for articles and categories

**CMS Layout & Navigation**
- [ ] Admin dashboard layout
- [ ] Side navigation with role-based visibility
- [ ] **Theme toggle in CMS** (respect user theme preference)
- [ ] Breadcrumbs
- [ ] Quick actions toolbar
- [ ] Mobile-responsive admin interface
- [ ] Test CMS in both light and dark themes

**Category Management**
- [ ] Category list view
- [ ] Create/edit category form
- [ ] Category image upload
- [ ] Slug generation and validation
- [ ] Parent category support (for subcategories)
- [ ] Display order management
- [ ] Active/inactive toggle

**Tag Management**
- [ ] Tag creation interface
- [ ] Tag autocomplete/search
- [ ] Tag merging/deletion
- [ ] Bulk tag operations

**Author Management**
- [ ] Author profile creation
- [ ] Author list view
- [ ] Author bio and avatar
- [ ] Social links configuration
- [ ] Link author to user profile (optional)
- [ ] Author page preview

**Article Editor**
- [ ] Rich structured content editor
- [ ] Block-based editing (paragraph, heading, image, gallery, video, YouTube, quote, embed, related article)
- [ ] Headline and slug editor (with auto-slug generation)
- [ ] Excerpt field
- [ ] Featured image selection
- [ ] Category and subcategory selection
- [ ] Author selection
- [ ] Tag management
- [ ] Source attribution
- [ ] SEO fields (title, description, canonical URL, social image)
- [ ] Publication controls (draft/schedule/publish)
- [ ] Breaking news toggle
- [ ] Featured toggle
- [ ] Exclusive toggle
- [ ] Sponsored content controls

**Article Workflow**
- [ ] Draft → Review → Approved → Scheduled → Published states
- [ ] Editorial review interface
- [ ] Approval/rejection with notes
- [ ] Schedule publishing
- [ ] Revision history tracking
- [ ] Revision comparison view
- [ ] Restore previous version

**Article List/Management**
- [ ] Article list with filters (status, category, author, date)
- [ ] Search articles
- [ ] Bulk operations
- [ ] Quick status changes
- [ ] Article preview

**Deliverable:** Fully functional CMS for creating, editing, and publishing articles with complete editorial workflow

---

## Milestone 5: Media Library & Video Management

**Goal:** Complete media and video management system

**Media Library**
- [ ] File upload interface (images, videos, documents)
- [ ] Drag-and-drop upload
- [ ] Progress indicators
- [ ] File validation (type, size)
- [ ] Media grid view
- [ ] Media list view
- [ ] Search and filter media
- [ ] Media metadata editor (alt text, caption, credit)
- [ ] Image preview and optimization
- [ ] Media selection modal (for use in articles)
- [ ] Bulk operations (delete, update metadata)

**Supabase Storage Integration**
- [ ] Configure storage buckets (media, videos, avatars, documents)
- [ ] Storage policies for public/private content
- [ ] Signed URL generation for private assets
- [ ] Thumbnail generation
- [ ] Image optimization pipeline

**Video Management**
- [ ] Video upload flow
- [ ] YouTube video import (URL input)
- [ ] External video support
- [ ] Video metadata editor (title, description, duration, orientation)
- [ ] Thumbnail upload/selection
- [ ] Video type classification (news, breaking, interview, documentary, short, original)
- [ ] Video status management
- [ ] Video preview

**Video-Article Relationships**
- [ ] Associate videos with articles
- [ ] Multiple videos per article support
- [ ] Display order management
- [ ] Relationship type specification
- [ ] Visual relationship manager

**Deliverable:** Complete media library with video management, ready for article embedding and standalone video content

---

## Milestone 6: Public Website - Homepage & Navigation

**Goal:** Public-facing website with CMS-driven homepage

**Global Layout**
- [ ] Header with navigation
- [ ] Logo and branding (VNTV with tagline "AFRICA. OUR STORIES. OUR WAY.")
- [ ] Primary navigation menu (Ghana, Nigeria, Africa, World, Politics, Business, Entertainment, Sports, Viral, Opinion, Video, Originals)
- [ ] **Theme toggle button in header/nav** (light/dark mode switcher)
- [ ] Social media icons in header (Facebook, X, YouTube, Instagram, TikTok)
- [ ] Mobile menu (hamburger, slide-out drawer)
- [ ] Search button/trigger with search bar
- [ ] Authentication state display (login/profile button)
- [ ] Footer with links, newsletter signup, social icons, category quick links
- [ ] Responsive behavior (mobile-first)
- [ ] Test navigation in both light and dark themes

**Breaking News Ticker**
- [ ] Horizontal scrolling/animated ticker
- [ ] "BREAKING" badge with icon (flame/alert icon as shown in design)
- [ ] Fetch active breaking news from database
- [ ] Auto-rotation if multiple stories
- [ ] Click-through to article
- [ ] Navigation arrows for manual control
- [ ] Mobile-optimized display
- [ ] Hide when no breaking news
- [ ] Theme-aware styling (red accent on both light/dark themes)

**Homepage Structure**
- [ ] Hero story section (large featured article with image overlay and text)
- [ ] "TOP STORY" badge for hero
- [ ] "READ FULL STORY" CTA button
- [ ] Secondary stories sidebar (with video play icons)
- [ ] Carousel navigation dots for hero rotation
- [ ] Latest News section with thumbnail cards
- [ ] Video section (VNTV VIDEO) with play buttons and duration overlays
- [ ] Category sections (Ghana, Nigeria, Africa, World, etc.)
- [ ] Category icon navigation bar (Ghana, Nigeria, Africa, World, Politics, Business, Entertainment, Sports icons)
- [ ] "TRENDING NOW" sidebar with numbered list
- [ ] VNTV Originals promotional section (e.g., "BEYOND HEADLINES")
- [ ] Newsletter signup module ("STAY INFORMED")
- [ ] Ad slots placement
- [ ] Skeleton loaders for async content
- [ ] "Back to top" button
- [ ] Test all sections in light and dark themes

**Homepage CMS**
- [ ] Homepage section management UI
- [ ] Section enable/disable
- [ ] Section reordering (drag-and-drop)
- [ ] Featured content selection per section
- [ ] Section configuration (title override, item count, layout style)
- [ ] Schedule section visibility
- [ ] Preview homepage changes

**Content Cards**
- [ ] Article card component (image, headline, excerpt, category badge, timestamp)
- [ ] Horizontal article card with thumbnail (for Latest News section)
- [ ] Video card component (thumbnail, title, duration overlay, play icon, category badge)
- [ ] Trending item component (numbered list item with title and time ago)
- [ ] Category badge component (small colored label like "POLITICS", "AFRICA", "GHANA")
- [ ] Bookmark icon for save functionality (future)
- [ ] Varied card sizes for hierarchy
- [ ] Hover states (subtle scale or opacity changes)
- [ ] Lazy loading images
- [ ] Responsive card layouts
- [ ] Test cards in both light and dark themes

**Deliverable:** Complete public homepage with CMS-controlled sections, ready for traffic

---

## Milestone 7: Public Website - Article Reading Experience

**Goal:** Full article reading page with SEO and sharing

**Article Page Layout**
- [ ] Article header (headline, author, date, category, featured image)
- [ ] Article body renderer (structured blocks)
- [ ] Block renderers: paragraph, heading, image, gallery, video, YouTube, quote, embed, related article
- [ ] Author byline with avatar and bio
- [ ] Publication and update timestamps
- [ ] Category and tag links
- [ ] Social sharing buttons (WhatsApp, Facebook, X, LinkedIn, copy link)
- [ ] Related articles section
- [ ] Comment section placeholder (if planned)
- [ ] Mobile-optimized reading experience
- [ ] Typography hierarchy and readability (line length, spacing, size)

**Article Anonymous Gate**
- [ ] Check `anonymous_article_gate_enabled` setting
- [ ] Trigger gate during article reading (not on preview/cards)
- [ ] Pause reading experience
- [ ] Show authentication modal
- [ ] Return user to article after authentication
- [ ] Respect authenticated users (no gate)

**Embedded Media**
- [ ] Render images with captions and credits
- [ ] Image gallery component (lightbox, navigation)
- [ ] Video embed (VNTV player)
- [ ] YouTube embed (standard iframe)
- [ ] Responsive media sizing

**SEO Implementation**
- [ ] Generate metadata from article fields
- [ ] Open Graph tags
- [ ] Twitter/X Card tags
- [ ] Article structured data (schema.org)
- [ ] Canonical URLs
- [ ] Social image generation/selection
- [ ] Dynamic `robots.txt`
- [ ] Dynamic `sitemap.xml` generation

**Slug & URL Management**
- [ ] Clean URL structure (`/news/[slug]`)
- [ ] Slug uniqueness validation
- [ ] 301 redirects for changed slugs
- [ ] 404 handling for missing articles

**Deliverable:** Complete article reading experience with SEO, social sharing, and anonymous gating

---

## Milestone 8: Public Website - Category & Navigation Pages

**Goal:** Category browsing, author pages, and search

**Category Pages**
- [ ] Category landing page with header
- [ ] Category description and image
- [ ] Article grid/list for category
- [ ] Pagination
- [ ] Filter by subcategory
- [ ] Sort options (latest, trending, featured)
- [ ] SEO for category pages

**Author Pages**
- [ ] Author profile display
- [ ] Author bio and avatar
- [ ] Social links
- [ ] List of articles by author
- [ ] Pagination
- [ ] SEO for author pages

**Search**
- [ ] Global search interface
- [ ] Search input with autocomplete suggestions
- [ ] Full-text search implementation (PostgreSQL or dedicated service)
- [ ] Search results page
- [ ] Filter results by type (articles, videos, authors)
- [ ] Highlight search terms in results
- [ ] Recent searches (optional)
- [ ] Search analytics tracking

**Tag Pages**
- [ ] Tag landing page
- [ ] Articles tagged with specific tag
- [ ] Pagination

**Trending/Popular**
- [ ] Most-read articles (today, week)
- [ ] Trending stories component
- [ ] View tracking implementation
- [ ] Display on homepage and sidebar

**Deliverable:** Complete content discovery experience with category browsing, author pages, and search

---

## Milestone 9: Video Platform - Player & Standalone Videos

**Goal:** Video playback with gating, orientation support, and standalone video pages

**Video Player Component**
- [ ] VNTV custom video player (HTML5 video or library like Video.js)
- [ ] Playback controls (play/pause, seek, volume, fullscreen)
- [ ] Progress tracking
- [ ] Duration display
- [ ] Poster image display
- [ ] Loading states
- [ ] Error handling
- [ ] Orientation detection (horizontal 16:9, vertical 9:16)
- [ ] Responsive player sizing
- [ ] Mobile-optimized controls (larger touch targets)
- [ ] Keyboard controls
- [ ] Accessibility (captions support, ARIA labels)

**Video Gating Engine**
- [ ] Check `anonymous_video_gate_enabled` setting
- [ ] Track playback progress percentage
- [ ] Pause at 25% for anonymous users
- [ ] Show authentication gate modal
- [ ] Resume playback after authentication
- [ ] Exempt YouTube videos from VNTV gating
- [ ] Only gate during active playback (not on preview/thumbnail)
- [ ] Respect authenticated users (no gate)

**YouTube Integration**
- [ ] Detect YouTube source type
- [ ] Render YouTube iframe embed
- [ ] Skip VNTV gating for YouTube
- [ ] Responsive YouTube embed

**Video Pages**
- [ ] Standalone video page (`/video/[slug]`)
- [ ] Video player (large, prominent)
- [ ] Video title and description
- [ ] View count
- [ ] Publication date
- [ ] Category and tags
- [ ] Related videos section
- [ ] Social sharing
- [ ] SEO with video structured data

**Video Analytics**
- [ ] Track video start
- [ ] Track video progress (25%, 50%, 75%, 100%)
- [ ] Track video completion
- [ ] Track gate shown and authentication conversion

**Deliverable:** Complete video platform with gating, orientation support, and standalone video experience

---

## Milestone 10: VNTV Originals - Programmes & Episodes

**Goal:** Original programming structure with series and episodes

**Programme Management (CMS)**
- [ ] Programme creation form
- [ ] Programme metadata (name, description, presenter, type)
- [ ] Programme poster image
- [ ] Programme status (active/inactive)
- [ ] Programme list view

**Episode Management (CMS)**
- [ ] Episode creation/editing
- [ ] Link episode to programme
- [ ] Episode metadata (title, number, description)
- [ ] Associate video with episode
- [ ] Episode thumbnail (if different from video)
- [ ] Episode publishing
- [ ] Episode ordering

**Public Programme Pages**
- [ ] Programme landing page (`/originals/[slug]`)
- [ ] Programme header with poster and description
- [ ] List of episodes
- [ ] Latest episode featured
- [ ] Episode grid/list
- [ ] Watch episode CTAs

**Public Episode Pages**
- [ ] Episode page (`/originals/[programme-slug]/[episode-slug]`)
- [ ] Video player
- [ ] Episode information
- [ ] Programme context/navigation
- [ ] Related episodes
- [ ] Next episode autoplay suggestion

**Originals Section**
- [ ] Originals homepage section
- [ ] Programme cards
- [ ] Featured programme/episode

**Deliverable:** Complete originals platform with programme/episode structure

---

## Milestone 11: RSS News Ingestion System

**Goal:** Automated news feed ingestion with editorial control

**RSS Feed Management (CMS)**
- [ ] RSS feed creation form (name, URL, source, country, category)
- [ ] Feed configuration (fetch interval, auto-publish, review requirement)
- [ ] Enable/disable toggle (per feed)
- [ ] Feed list view with status indicators
- [ ] Test feed fetch
- [ ] View last fetch time and status

**RSS Ingestion Engine**
- [ ] Schedule-based feed fetching (cron job or scheduled function)
- [ ] Parse RSS/Atom feeds
- [ ] Normalize content structure
- [ ] Extract metadata (title, description, URL, author, image, published date)
- [ ] Content hash calculation for deduplication
- [ ] GUID-based duplicate detection
- [ ] Create `rss_items` records
- [ ] Log import operations

**RSS Review Workflow**
- [ ] RSS items list (pending review)
- [ ] Item preview
- [ ] Convert to article (one-click or with edits)
- [ ] Auto-publish option (per feed setting)
- [ ] Bulk approve/reject
- [ ] Source attribution preservation
- [ ] Original URL linking

**RSS Monitoring**
- [ ] Feed health dashboard
- [ ] Last fetch status
- [ ] Error tracking and alerts
- [ ] Items imported vs. duplicates
- [ ] Feed performance metrics

**Deliverable:** Complete RSS ingestion pipeline with editorial control and deduplication

---

## Milestone 12: Breaking News & Homepage Management

**Goal:** Real-time breaking news and dynamic homepage curation

**Breaking News CMS**
- [ ] Breaking news creation interface
- [ ] Link to article or create custom headline
- [ ] Headline override field
- [ ] Priority setting (for multiple breaking stories)
- [ ] Start and expiration time scheduling
- [ ] Active/inactive toggle
- [ ] Breaking news list view

**Breaking News Display**
- [ ] Auto-fetch active breaking news
- [ ] Ticker rotation for multiple stories
- [ ] Auto-hide expired breaking news
- [ ] Mobile-optimized ticker

**Homepage Section Management**
- [ ] Visual section manager (drag-and-drop reordering)
- [ ] Section type selection (hero, grid, list, video, originals)
- [ ] Content selection per section (pick featured articles/videos)
- [ ] Section visibility scheduling
- [ ] Section configuration (title, item count, layout)
- [ ] Preview mode

**Homepage Item Management**
- [ ] Assign articles/videos to sections
- [ ] Set display order within section
- [ ] Item visibility scheduling
- [ ] Featured/pinned items
- [ ] Remove items from homepage

**Cache Invalidation**
- [ ] Invalidate homepage cache on content changes
- [ ] Invalidate category caches
- [ ] Invalidate article cache on updates
- [ ] Strategic revalidation (not global nukes)

**Deliverable:** Dynamic homepage with real-time breaking news and full editorial control

---

## Milestone 13: Advertising & Sponsorship

**Goal:** Ad management system with placement controls

**Ad Slot Management**
- [ ] Define ad slots (homepage_top, homepage_hero, article_top, article_inline, article_sidebar, video_sponsor, etc.)
- [ ] Slot configuration (name, placement, description)
- [ ] Active/inactive per slot

**Advertisement Management**
- [ ] Advertisement creation form
- [ ] Creative upload (image, HTML)
- [ ] Target URL
- [ ] Sponsor association
- [ ] Start and end date scheduling
- [ ] Priority setting
- [ ] Ad preview
- [ ] Active/inactive toggle

**Ad Rendering**
- [ ] Ad slot components for each placement
- [ ] Fetch active ads for slot
- [ ] Respect scheduling and priority
- [ ] Render image or HTML creatives (sanitized)
- [ ] Track impressions (optional)
- [ ] Click tracking (optional)

**Sponsored Content**
- [ ] Sponsored flag on articles
- [ ] Sponsor label display
- [ ] Clear visual differentiation
- [ ] "Sponsored" disclosure

**Advertising Dashboard**
- [ ] Active campaigns overview
- [ ] Ad performance metrics (if tracking implemented)
- [ ] Slot inventory view

**Deliverable:** Complete ad management system with placement controls and sponsored content support

---

## Milestone 14: Newsletter & Social Features

**Goal:** Newsletter subscriptions and social sharing

**Newsletter Signup**
- [ ] Newsletter signup form (email only initially)
- [ ] Subscribe to "VNTV Daily"
- [ ] Email validation
- [ ] Confirmation email (double opt-in)
- [ ] Newsletter preferences in user profile
- [ ] Unsubscribe flow
- [ ] Newsletter subscriber list (CMS)

**Social Sharing**
- [ ] Share buttons on articles and videos
- [ ] WhatsApp share
- [ ] Facebook share
- [ ] X (Twitter) share
- [ ] LinkedIn share
- [ ] Copy link to clipboard
- [ ] Share count display (optional)
- [ ] Mobile share sheet integration

**Social Metadata**
- [ ] Accurate Open Graph tags on all pages
- [ ] Twitter Card tags
- [ ] Social image generation or selection
- [ ] Preview testing (Facebook debugger, Twitter validator)

**Deliverable:** Newsletter signup system and comprehensive social sharing

---

## Milestone 15: Analytics & Engagement Tracking

**Goal:** Track user behavior and content performance

**Analytics Event Tracking**
- [ ] Integrate analytics service (Google Analytics, Plausible, or custom)
- [ ] Track article views
- [ ] Track video start, progress, completion
- [ ] Track search queries
- [ ] Track content gate shown
- [ ] Track authentication conversions from gates
- [ ] Track social shares
- [ ] Track newsletter signups
- [ ] Track ad impressions/clicks (if implementing)

**Database Event Recording**
- [ ] Record article views (lightweight, privacy-aware)
- [ ] Record video events (start, complete)
- [ ] Record social shares (for trending)
- [ ] Aggregate for trending/popular calculations

**Editorial Analytics Dashboard**
- [ ] Article performance view (views, shares, engagement)
- [ ] Video performance metrics
- [ ] Top articles (today, week, all-time)
- [ ] Top videos
- [ ] Category performance
- [ ] Author performance
- [ ] Traffic sources (if available)

**Trending Content**
- [ ] Calculate trending articles (based on recent views/shares)
- [ ] Calculate trending videos
- [ ] Display on homepage
- [ ] Real-time or near-real-time updates

**Deliverable:** Comprehensive analytics tracking with editorial dashboard

---

## Milestone 16: Site Settings & Configuration

**Goal:** CMS-driven site configuration without code deployment

**Global Settings**
- [ ] Site title and description
- [ ] Contact information
- [ ] Social media links
- [ ] Logo upload
- [ ] Favicon
- [ ] Brand colors (if customizable)

**Content Gate Settings**
- [ ] Anonymous article gate enabled/disabled toggle
- [ ] Anonymous video gate enabled/disabled toggle
- [ ] Gate configuration (e.g., video percentage threshold)

**Feature Flags**
- [ ] Newsletter enabled/disabled
- [ ] Breaking news enabled/disabled
- [ ] Comments enabled/disabled (future)
- [ ] Search enabled/disabled

**SEO Settings**
- [ ] Default meta description
- [ ] Default social image
- [ ] Google Analytics ID
- [ ] Google Search Console verification
- [ ] Sitemap configuration

**Email Settings**
- [ ] SMTP configuration (for newsletters, notifications)
- [ ] From email address
- [ ] Newsletter service integration

**Deliverable:** Complete site settings management without code changes

---

## Milestone 17: Audit Logging & Security Hardening

**Goal:** Security audit trail and production hardening

**Audit Logging**
- [ ] Log critical CMS actions (create, update, delete, publish, unpublish)
- [ ] Log user role changes
- [ ] Log settings changes
- [ ] Log authentication events (optional)
- [ ] Audit log viewer (CMS)
- [ ] Filter and search audit logs
- [ ] Export audit logs

**Security Review**
- [ ] Review all RLS policies
- [ ] Test authorization bypasses
- [ ] Verify no service role key in client code
- [ ] Input validation on all forms
- [ ] SQL injection testing
- [ ] XSS testing (especially ad HTML, article content)
- [ ] CSRF protection verification
- [ ] Rate limiting on critical endpoints (login, signup, search)
- [ ] File upload validation (type, size, content)

**Error Handling**
- [ ] Graceful error pages (404, 500)
- [ ] User-friendly error messages
- [ ] Non-sensitive error responses
- [ ] Error logging for debugging

**Performance Optimization**
- [ ] Database query optimization
- [ ] Index verification
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Caching strategy refinement
- [ ] Bundle size optimization

**Deliverable:** Audit trail and hardened security for production launch

---

## Milestone 18: Accessibility Audit & WCAG 2.2 AA Compliance

**Goal:** Ensure WCAG 2.2 AA compliance across the platform

**Automated Testing**
- [ ] Run automated accessibility audits (axe DevTools, Lighthouse)
- [ ] Fix automated findings
- [ ] Establish baseline accessibility score

**Keyboard Navigation**
- [ ] Test all interactive elements with keyboard only
- [ ] Verify logical tab order
- [ ] Test skip links
- [ ] Verify focus traps in modals
- [ ] Test escape key behavior
- [ ] Ensure all actions keyboard-accessible

**Screen Reader Testing**
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Verify semantic HTML structure
- [ ] Check ARIA labels and descriptions
- [ ] Test form labels and validation
- [ ] Verify image alt text
- [ ] Test landmark regions

**Visual & Interaction**
- [ ] Verify all color contrast ratios (≥4.5:1 for body text) **in both light and dark themes**
- [ ] Test with zoom to 200%
- [ ] Verify text reflow at different sizes
- [ ] Test reduced motion preferences
- [ ] Verify visible focus indicators
- [ ] Test touch target sizes (≥44×44px)
- [ ] **Test theme toggle accessibility** (keyboard, screen reader, visual feedback)

**Content & Structure**
- [ ] Verify heading hierarchy (no skipped levels)
- [ ] Check link text clarity (no "click here")
- [ ] Verify error messages don't rely on color alone
- [ ] Test captions/transcripts for videos (where available)

**Remediation**
- [ ] Create accessibility issue log
- [ ] Prioritize critical issues
- [ ] Fix all WCAG 2.2 AA violations
- [ ] Document known limitations

**Deliverable:** WCAG 2.2 AA compliant platform ready for diverse audiences

---

## Milestone 19: Mobile Experience Polish & Responsive Refinement

**Goal:** Ensure exceptional mobile experience across all features

**Mobile-Specific Testing**
- [ ] Test on multiple devices (iOS, Android)
- [ ] Test on multiple screen sizes
- [ ] Test portrait and landscape orientations
- [ ] Test touch interactions
- [ ] Test mobile navigation
- [ ] Test mobile video player
- [ ] Test mobile article reading

**Mobile Optimization**
- [ ] Optimize mobile menu interaction
- [ ] Refine mobile card layouts
- [ ] Optimize mobile forms (large inputs, native pickers)
- [ ] Improve mobile video controls
- [ ] Optimize mobile search interface
- [ ] Refine mobile authentication flows

**Progressive Web App (Optional)**
- [ ] Add web app manifest
- [ ] Configure app icons
- [ ] Add to home screen support
- [ ] Offline page (basic)

**Performance on Mobile**
- [ ] Test on slow 3G connections
- [ ] Optimize image loading for mobile
- [ ] Reduce JavaScript bundle for mobile
- [ ] Lazy load below-the-fold content

**Deliverable:** Polished, performant mobile experience

---

## Milestone 20: Testing, QA, & Launch Preparation

**Goal:** Comprehensive testing and production launch readiness

**Unit Testing**
- [ ] Test gating logic (article and video)
- [ ] Test permission checks
- [ ] Test slug generation
- [ ] Test RSS normalization
- [ ] Test duplicate detection
- [ ] Test content status transitions

**Integration Testing**
- [ ] Test database queries
- [ ] Test authentication flows
- [ ] Test RLS policies
- [ ] Test publishing workflow
- [ ] Test RSS import
- [ ] Test media uploads

**End-to-End Testing**
- [ ] Anonymous user browsing
- [ ] Anonymous article gate flow
- [ ] Anonymous video gate flow (VNTV videos)
- [ ] YouTube video playback (no gate)
- [ ] Google authentication
- [ ] Email signup and login
- [ ] Reporter creates draft article
- [ ] Editor approves and publishes article
- [ ] Admin disables RSS feed
- [ ] RSS feed imports content
- [ ] Admin changes homepage layout
- [ ] Advertising manager updates ad
- [ ] Mobile navigation and content discovery
- [ ] Keyboard-only navigation

**Load Testing**
- [ ] Test homepage under load
- [ ] Test article pages under load
- [ ] Test video streaming
- [ ] Test database connection pooling
- [ ] Test concurrent CMS users

**Content Migration (if applicable)**
- [ ] Import existing content
- [ ] Import media assets
- [ ] Import user accounts
- [ ] Verify data integrity

**Documentation**
- [ ] User documentation (CMS guide)
- [ ] Admin documentation (configuration, settings)
- [ ] Developer documentation (architecture, deployment)
- [ ] API documentation (if exposing APIs)

**Launch Checklist**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Storage buckets configured
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Launch communication prepared

**Deliverable:** Production-ready VNTV platform ready for public launch

---

## Post-Launch: Iteration & Enhancement

**Monitoring**
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up error tracking alerts
- [ ] Monitor database performance

**User Feedback**
- [ ] Collect user feedback
- [ ] Track support requests
- [ ] Identify pain points
- [ ] Prioritize improvements

**Feature Enhancements**
- [ ] Saved articles (authenticated users)
- [ ] Watch history
- [ ] Personalized recommendations
- [ ] Push notifications
- [ ] Comments system
- [ ] Advanced search filters
- [ ] Multi-language support (if planned)

**Platform Growth**
- [ ] Native mobile apps (iOS, Android)
- [ ] Advanced recommendation engine
- [ ] Subscription/paywall system
- [ ] Live streaming capability
- [ ] Podcast integration

---

## Development Principles for All Milestones

**Mobile-First**
Every feature must be designed and tested for mobile before desktop refinement.

**Complete Desktop Experience**
Despite mobile-first approach, desktop experience must be full-featured and polished, not an afterthought.

**Light/Dark Theme Support**
Every component, page, and feature must work perfectly in both light and dark themes. Theme is not an afterthought.

**Accessibility From Day One**
WCAG 2.2 AA compliance is built in, not retrofitted.

**Security at Every Layer**
Frontend, server, and database security work together. RLS is non-negotiable.

**Design System Consistency**
Use existing components. Create new ones only when necessary. Follow core-design principles.

**Performance Budget**
Every feature must meet performance standards. No shipping slow features.

**CMS-Driven**
Editorial staff control content and configuration without developer intervention.

**Test Before Ship**
No milestone is complete without testing: unit, integration, E2E, accessibility, mobile, keyboard.

**Incremental Value**
Each milestone delivers working, deployable features. No big-bang integration.

---

## Estimated Timeline

**Milestone 1-2:** 2-3 weeks (Foundation + Design System)  
**Milestone 3-4:** 3-4 weeks (Auth + Editorial CMS)  
**Milestone 5-6:** 2-3 weeks (Media + Public Homepage)  
**Milestone 7-8:** 2-3 weeks (Article Reading + Navigation)  
**Milestone 9-10:** 2-3 weeks (Video Platform + Originals)  
**Milestone 11-12:** 2 weeks (RSS + Breaking/Homepage Management)  
**Milestone 13-14:** 1-2 weeks (Ads + Newsletter/Social)  
**Milestone 15-16:** 1-2 weeks (Analytics + Settings)  
**Milestone 17-18:** 2 weeks (Security + Accessibility Audit)  
**Milestone 19-20:** 1-2 weeks (Mobile Polish + Launch Prep)

**Total Estimated Time:** 20-28 weeks (5-7 months)

Timeline assumes full-time focused development. Actual timeline will vary based on team size, complexity discoveries, and feedback cycles.

---

## Success Criteria

A milestone is considered **complete** when:

1. ✅ All checklist items are implemented
2. ✅ Feature works on mobile and desktop
3. ✅ **Feature works in both light and dark themes**
4. ✅ Feature is keyboard accessible
5. ✅ Feature meets WCAG 2.2 AA requirements
6. ✅ Tests pass (unit, integration, E2E as applicable)
7. ✅ RLS policies enforce permissions correctly
8. ✅ Performance is acceptable (no blocking issues)
9. ✅ Code is reviewed (if team-based)
10. ✅ Documentation is updated (if applicable)
11. ✅ Feature can be demonstrated to stakeholders

No milestone should be considered "done" if it would break production or create a poor user experience.

---

**This development plan builds VNTV incrementally while maintaining production quality at every step. Each milestone delivers real, usable features that can be demonstrated, tested, and refined before moving forward.**
