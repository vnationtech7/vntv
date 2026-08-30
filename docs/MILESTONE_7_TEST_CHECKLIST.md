# Milestone 7: Article Reading Experience - Test Checklist

## Testing Date: August 28, 2026
## Status: Ready for Testing

---

## Theme Testing

### Light Theme Tests

#### Article Page Layout
- [ ] Header displays correctly (logo, navigation, theme toggle)
- [ ] Article title is readable and properly sized
- [ ] Category badge has good contrast
- [ ] Meta information (author, date) is visible
- [ ] Featured image displays with proper sizing
- [ ] Excerpt box has appropriate border and background
- [ ] Body content is readable (good contrast ratio ≥ 4.5:1)
- [ ] All text is legible against light background

#### Content Blocks
- [ ] Paragraphs have proper spacing and line height
- [ ] Headings (H1-H6) have clear hierarchy
- [ ] Images display with captions and credits
- [ ] Video players have visible controls
- [ ] YouTube embeds display correctly
- [ ] Blockquotes have proper styling with red accent
- [ ] Lists (ordered/unordered) are properly formatted
- [ ] Dividers are visible but subtle

#### Interactive Elements
- [ ] Share buttons have good contrast and hover states
- [ ] Share buttons show proper icons (WhatsApp, Facebook, X, LinkedIn, Copy)
- [ ] Copy Link button shows "Copied!" feedback
- [ ] Tag links have visible hover states
- [ ] Related articles cards are readable

#### Footer Elements
- [ ] Tags section displays clearly
- [ ] Author bio box has appropriate background
- [ ] Related articles sidebar is readable
- [ ] Footer displays correctly

---

### Dark Theme Tests

#### Article Page Layout
- [ ] Header displays correctly with dark background
- [ ] Article title is readable with good contrast
- [ ] Category badge has good contrast on dark background
- [ ] Meta information is visible against dark theme
- [ ] Featured image displays properly
- [ ] Excerpt box has appropriate dark styling
- [ ] Body content is readable (good contrast ratio ≥ 4.5:1)
- [ ] All text is legible against dark background

#### Content Blocks
- [ ] Paragraphs have proper contrast in dark mode
- [ ] Headings stand out with proper hierarchy
- [ ] Images display correctly on dark background
- [ ] Video players are visible with controls
- [ ] YouTube embeds display correctly
- [ ] Blockquotes have proper dark theme styling with red accent
- [ ] Lists are properly formatted and visible
- [ ] Dividers are visible with appropriate opacity

#### Interactive Elements
- [ ] Share buttons have good contrast in dark mode
- [ ] Share buttons maintain hover states
- [ ] Copy Link button feedback is visible
- [ ] Tag links have visible hover states in dark mode
- [ ] Related articles cards are readable on dark background

#### Footer Elements
- [ ] Tags section displays clearly in dark mode
- [ ] Author bio box has appropriate dark background
- [ ] Related articles sidebar maintains readability
- [ ] Footer displays correctly in dark theme

---

## Functional Testing

### Social Sharing
- [ ] WhatsApp share opens correctly with encoded URL and title
- [ ] Facebook share opens in popup window
- [ ] X (Twitter) share includes URL and title
- [ ] LinkedIn share works correctly
- [ ] Copy Link copies full URL to clipboard
- [ ] Copy Link shows "Copied!" confirmation for 2 seconds
- [ ] Share links work on mobile devices

### Content Rendering
- [ ] Paragraphs render with proper spacing
- [ ] All heading levels (H1-H6) render correctly
- [ ] Images load and display with alt text
- [ ] Image captions and credits display below images
- [ ] Videos have working controls (play, pause, seek, volume)
- [ ] YouTube videos embed and play correctly
- [ ] Blockquotes display with quote icon and proper formatting
- [ ] Lists render with proper bullets/numbers
- [ ] Dividers create visual separation
- [ ] Empty/missing content shows fallback message

### Navigation & Links
- [ ] Category badge links to category page
- [ ] Tag links go to tag pages
- [ ] Author name links to author profile (if implemented)
- [ ] Related articles cards link to correct articles
- [ ] Back navigation works correctly
- [ ] Article URLs are clean (/news/[slug])

### SEO & Metadata
- [ ] Page title includes article title and " | VNTV"
- [ ] Meta description uses article excerpt
- [ ] Open Graph tags are present in page source
- [ ] Twitter Card tags are present
- [ ] JSON-LD structured data is in page source
- [ ] Canonical URL is set correctly
- [ ] Article schema includes author, date, publisher
- [ ] Images have proper Open Graph tags

### Performance
- [ ] Page loads in under 3 seconds
- [ ] Images use lazy loading
- [ ] Featured image loads with priority
- [ ] No layout shift during content load
- [ ] Suggested articles load efficiently

---

## Responsive Testing

### Mobile (320px - 767px)
- [ ] Article title wraps properly
- [ ] Featured image fits screen width
- [ ] Body content is readable without zooming
- [ ] Share buttons stack or wrap appropriately
- [ ] Share button labels show/hide correctly
- [ ] Related articles move to bottom or hide
- [ ] Navigation is accessible
- [ ] Touch targets are at least 44x44px

### Tablet (768px - 1023px)
- [ ] Two-column layout works on tablets
- [ ] Related articles sidebar displays properly
- [ ] Images scale appropriately
- [ ] All interactive elements are accessible

### Desktop (1024px+)
- [ ] Three-column layout displays correctly (2 cols content, 1 col sidebar)
- [ ] Related articles sidebar is sticky
- [ ] Max-width container keeps content readable
- [ ] All spacing is appropriate

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Share buttons can be activated with Enter/Space
- [ ] Links can be activated with Enter
- [ ] Focus indicators are visible

### Screen Reader
- [ ] Article structure is logical (heading hierarchy)
- [ ] Images have descriptive alt text
- [ ] Share buttons have aria-labels
- [ ] Links have descriptive text
- [ ] Content blocks announce correctly

### Color Contrast
- [ ] All text meets WCAG AA standards (4.5:1 for normal text)
- [ ] Large text meets 3:1 ratio
- [ ] Interactive elements meet contrast requirements
- [ ] Focus indicators are visible

---

## SEO Validation

### Meta Tags Check (View Page Source)
```html
<!-- Should see: -->
<title>Article Title | VNTV</title>
<meta name="description" content="Article excerpt..." />
<meta property="og:title" content="Article Title" />
<meta property="og:description" content="Article excerpt..." />
<meta property="og:image" content="https://..." />
<meta property="og:url" content="https://vntv.com/news/article-slug" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://vntv.com/news/article-slug" />
```

### Structured Data (JSON-LD)
- [ ] Check page source for `<script type="application/ld+json">`
- [ ] Validate with Google Rich Results Test
- [ ] Ensure @type is "NewsArticle"
- [ ] Verify headline, description, image, datePublished, author, publisher

### Sitemap
- [ ] Visit `/sitemap.xml`
- [ ] Verify articles are included
- [ ] Check lastModified dates
- [ ] Ensure priority values are set
- [ ] Verify changeFrequency is set

### Robots.txt
- [ ] Visit `/robots.txt`
- [ ] Verify allow rules for public pages
- [ ] Verify disallow rules for admin/api
- [ ] Check sitemap reference

---

## Browser Compatibility

### Chrome/Edge (Chromium)
- [ ] All features work correctly
- [ ] Themes switch smoothly
- [ ] Videos play correctly
- [ ] Share functionality works

### Firefox
- [ ] All features work correctly
- [ ] Themes render properly
- [ ] Videos play correctly
- [ ] Share popups work

### Safari (Desktop & iOS)
- [ ] All features work correctly
- [ ] Themes work on Safari
- [ ] Videos play correctly
- [ ] Share functionality works (including native share on iOS)

---

## Test Results Summary

**Total Tests:** 150+
**Passed:** ___ / ___
**Failed:** ___ / ___
**Blockers:** ___

**Light Theme Status:** ⬜ Pass / ⬜ Fail
**Dark Theme Status:** ⬜ Pass / ⬜ Fail
**Mobile Responsive:** ⬜ Pass / ⬜ Fail
**SEO Implementation:** ⬜ Pass / ⬜ Fail

---

## Known Issues

_(Document any issues found during testing)_

1. 
2. 
3. 

---

## Sign-off

- [ ] All critical tests passing
- [ ] Both themes work correctly
- [ ] Mobile responsive
- [ ] SEO metadata present
- [ ] Accessibility verified

**Tested by:** _______________
**Date:** _______________
**Approved for Production:** ⬜ Yes / ⬜ No
