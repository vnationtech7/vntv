# Milestone 7 Testing Guide

## 🧪 Quick Test Page

We've created a dedicated test page with sample data to help you verify all Milestone 7 features.

**Test Page URL:** `http://localhost:3000/test-article`

---

## 🚀 How to Test

### Step 1: Start the Development Server

```bash
cd /Users/macbookair/vnation/vntv
npm run dev
```

Wait for the server to start, then open your browser.

---

### Step 2: Visit the Test Page

Navigate to: **http://localhost:3000/test-article**

You'll see:
- A red banner at the top with test instructions
- A full article with all Milestone 7 features
- Sample content demonstrating all block types
- Related articles sidebar
- Social sharing buttons
- Tags and author bio

---

## ✅ What to Test

### 1. Social Sharing Buttons (Below Article Content)

**Test each button:**

#### WhatsApp
- [ ] Click the WhatsApp button
- [ ] Popup window opens with WhatsApp Web
- [ ] URL and title are included in the message
- [ ] Close popup

#### Facebook
- [ ] Click the Facebook button
- [ ] Facebook share dialog opens in popup
- [ ] URL is pre-filled
- [ ] Close popup

#### X (Twitter)
- [ ] Click the X button
- [ ] Twitter/X share window opens
- [ ] URL and title are included in the tweet
- [ ] Close popup

#### LinkedIn
- [ ] Click the LinkedIn button
- [ ] LinkedIn share dialog opens
- [ ] URL is pre-filled
- [ ] Close popup

#### Copy Link
- [ ] Click the "Copy Link" button
- [ ] Button changes to show "Copied!" with checkmark
- [ ] After 2 seconds, button reverts to "Copy Link"
- [ ] Paste into a text editor to verify URL was copied

---

### 2. Rich Content Blocks

Scroll through the article and verify these block types render correctly:

#### Paragraphs
- [ ] Multiple paragraphs display with proper spacing
- [ ] Text is readable (good contrast in both themes)
- [ ] Line height is comfortable for reading

#### Headings
- [ ] H2 (large heading) - clear hierarchy
- [ ] H3 (medium heading) - smaller than H2
- [ ] H4, H5, H6 - progressively smaller
- [ ] All headings are bold and distinct from body text

#### Lists
- [ ] Unordered list shows bullet points
- [ ] Ordered list shows numbers
- [ ] List items have proper spacing
- [ ] Lists are indented correctly

#### Blockquote
- [ ] Red accent border on left side
- [ ] Panel background (theme-aware)
- [ ] Quote icon displays (Lucide Quote icon)
- [ ] Larger text size for quote content
- [ ] Author and source display at bottom

#### Divider
- [ ] Horizontal line creates visual separation
- [ ] Line is visible but subtle
- [ ] Proper spacing above and below

---

### 3. Theme Testing

#### Light Theme
- [ ] Click theme toggle in header to switch to light theme
- [ ] Article title is readable (dark text on light background)
- [ ] Body text has good contrast (≥4.5:1)
- [ ] Category badge is visible
- [ ] Share buttons are styled correctly
- [ ] Tags have proper borders and backgrounds
- [ ] Author bio box has light panel background
- [ ] Related articles sidebar is readable

#### Dark Theme
- [ ] Click theme toggle to switch to dark theme
- [ ] Article title is readable (light text on dark background)
- [ ] Body text has good contrast (≥4.5:1)
- [ ] Category badge stands out
- [ ] Share buttons work in dark mode
- [ ] Tags have proper styling
- [ ] Author bio box has dark panel background
- [ ] Related articles sidebar is readable

#### Toggle Back and Forth
- [ ] Switch between themes multiple times
- [ ] No flickering or layout shifts
- [ ] Smooth transition
- [ ] Theme preference persists on page reload

---

### 4. Responsive Design

#### Desktop (1024px+)
- [ ] Two-column layout (article + sidebar)
- [ ] Sidebar is sticky (stays visible when scrolling)
- [ ] Content max-width is comfortable for reading
- [ ] Share button labels are visible

#### Tablet (768px - 1023px)
- [ ] Layout adjusts appropriately
- [ ] Content remains readable
- [ ] Sidebar may stack or adjust
- [ ] All features accessible

#### Mobile (< 768px)
- [ ] Single-column layout
- [ ] Article title wraps properly
- [ ] Share button labels may hide (icons only)
- [ ] Related articles move below content or adjust
- [ ] Text is readable without zooming
- [ ] Touch targets are at least 44x44px

**How to test:**
1. Resize browser window to different widths
2. Use browser dev tools (F12) → Device toolbar
3. Test on actual mobile device if available

---

### 5. SEO Metadata Validation

#### View Page Source
- [ ] Right-click page → "View Page Source"
- [ ] Search for `<title>` - should include article title + " | VNTV"
- [ ] Search for `<meta name="description"` - should have excerpt
- [ ] Search for `og:title` - Open Graph title present
- [ ] Search for `og:description` - Open Graph description present
- [ ] Search for `og:type` - should be "article"
- [ ] Search for `twitter:card` - should be "summary_large_image"
- [ ] Search for `application/ld+json` - JSON-LD structured data present

#### JSON-LD Verification
- [ ] In page source, find the `<script type="application/ld+json">` block
- [ ] Copy the JSON content
- [ ] Paste into JSON formatter to verify it's valid
- [ ] Check fields: @type (should be "NewsArticle"), headline, author, publisher, datePublished

#### Robots and Sitemap
- [ ] Visit `http://localhost:3000/robots.txt`
- [ ] Verify it shows allow/disallow rules
- [ ] Visit `http://localhost:3000/sitemap.xml`
- [ ] Verify it shows list of URLs in XML format

---

### 6. Accessibility Testing

#### Keyboard Navigation
- [ ] Press Tab to navigate through interactive elements
- [ ] Share buttons are reachable via keyboard
- [ ] Tag links are reachable
- [ ] Focus indicator is visible on all elements
- [ ] Press Enter on focused share button - it activates
- [ ] Press Tab through all links in suggested articles

#### Screen Reader Simulation (Optional)
- [ ] Turn on screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Navigate through article
- [ ] Headings announce correctly
- [ ] Links announce with descriptive text
- [ ] Share buttons announce with aria-labels

#### Color Contrast
- [ ] Use browser contrast checker (dev tools → accessibility panel)
- [ ] Verify all text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Test in both light and dark themes

---

### 7. Browser Compatibility

Test in multiple browsers if available:

#### Chrome/Edge
- [ ] All features work
- [ ] Themes switch smoothly
- [ ] Share buttons open popups
- [ ] Copy link works

#### Firefox
- [ ] All features work
- [ ] Layout renders correctly
- [ ] Share functionality works

#### Safari
- [ ] All features work
- [ ] Themes work properly
- [ ] Mobile Safari (if on iOS) - test native share

---

## 📊 Expected Results

### All Tests Should Show:
✅ Social sharing works on all 5 platforms  
✅ All 9 content block types render correctly  
✅ Both light and dark themes work perfectly  
✅ Responsive on mobile, tablet, desktop  
✅ SEO metadata present in page source  
✅ Keyboard navigation works  
✅ Good color contrast in both themes  
✅ No console errors  
✅ Smooth performance  

---

## 🐛 If You Find Issues

Document any problems you find:

1. **What feature:** (e.g., "WhatsApp share button")
2. **What happened:** (e.g., "Popup didn't open")
3. **Expected behavior:** (e.g., "Should open WhatsApp Web")
4. **Browser:** (e.g., "Chrome 120 on macOS")
5. **Theme:** (e.g., "Dark theme")
6. **Screenshot:** (if possible)

---

## 🎯 Quick 5-Minute Test

If you're short on time, test these critical items:

1. ✅ Visit `/test-article`
2. ✅ Click one share button (e.g., Copy Link)
3. ✅ Toggle between light and dark themes
4. ✅ Scroll through article - verify all blocks render
5. ✅ Resize browser to mobile width
6. ✅ View page source - check for meta tags
7. ✅ Visit `/sitemap.xml` and `/robots.txt`

**If all 7 items work, Milestone 7 is functioning correctly!**

---

## 📝 Testing Checklist

Copy this checklist and mark items as you test:

```
[ ] WhatsApp share
[ ] Facebook share
[ ] X/Twitter share
[ ] LinkedIn share
[ ] Copy Link
[ ] Paragraphs render
[ ] Headings (H1-H6) render
[ ] Lists render
[ ] Blockquote renders
[ ] Divider renders
[ ] Light theme works
[ ] Dark theme works
[ ] Theme toggle smooth
[ ] Desktop layout (2 columns)
[ ] Mobile layout (1 column)
[ ] Responsive breakpoints
[ ] Page title in source
[ ] Open Graph tags in source
[ ] Twitter Card tags in source
[ ] JSON-LD structured data
[ ] robots.txt accessible
[ ] sitemap.xml accessible
[ ] Keyboard navigation works
[ ] Focus indicators visible
[ ] No console errors
[ ] Good performance
```

---

## ✨ Additional Test Pages

You can also test with real articles once you have data:

1. Create a test article in CMS (`/admin/articles/new`)
2. Publish it
3. View it at `/news/[article-slug]`
4. Test all features on the real article page

---

**Happy Testing!** 🎉

If everything works, Milestone 7 is successfully complete and ready for production!
