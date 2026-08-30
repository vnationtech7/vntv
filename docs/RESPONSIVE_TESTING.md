# Responsive Design Testing Guide

## Breakpoints

The VNTV website uses the following Tailwind CSS breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1023px (sm - lg)
- **Desktop**: 1024px - 1279px (lg - xl)
- **Large Desktop**: ≥ 1280px (xl+)

## Components to Test

### 1. Public Header
- **Mobile (< 640px)**:
  - [ ] Hamburger menu icon visible
  - [ ] Navigation hidden behind menu
  - [ ] VNTV logo visible
  - [ ] Theme toggle accessible
  - [ ] Search icon visible

- **Tablet (640px - 1023px)**:
  - [ ] Hamburger menu still active
  - [ ] Logo and tagline visible
  - [ ] Social icons visible

- **Desktop (≥ 1024px)**:
  - [ ] Full horizontal navigation visible
  - [ ] All 13 menu items displayed
  - [ ] Social icons in header
  - [ ] Search bar visible
  - [ ] Auth buttons visible

### 2. Breaking News Ticker
- **Mobile (< 640px)**:
  - [ ] Single line ticker
  - [ ] BREAKING badge visible
  - [ ] Headline truncates properly
  - [ ] Navigation arrows hidden or compact
  - [ ] Progress dots hidden

- **Tablet & Desktop (≥ 640px)**:
  - [ ] Full ticker layout
  - [ ] Navigation arrows visible
  - [ ] Progress dots visible
  - [ ] Time ago visible

### 3. Hero Section
- **Mobile (< 640px)**:
  - [ ] Single column layout
  - [ ] Main hero full width
  - [ ] Side stories stack below
  - [ ] Image aspect ratio maintained
  - [ ] Text readable

- **Tablet (640px - 1023px)**:
  - [ ] Still single column
  - [ ] Larger hero image
  - [ ] Side stories 2-column grid

- **Desktop (≥ 1024px)**:
  - [ ] 2-column layout (2fr + 1fr)
  - [ ] Main hero left, side stories right
  - [ ] Side stories stack vertically
  - [ ] Auto-rotation works
  - [ ] Carousel dots visible

### 4. Latest News Section
- **Mobile (< 640px)**:
  - [ ] Single column grid
  - [ ] Cards full width
  - [ ] Images visible

- **Tablet (640px - 1023px)**:
  - [ ] 2-column grid
  - [ ] Cards evenly spaced

- **Desktop (1024px - 1279px)**:
  - [ ] 3-column grid
  - [ ] Proper gaps

- **Large Desktop (≥ 1280px)**:
  - [ ] 4-column grid
  - [ ] Maximum content width

### 5. Trending Sidebar
- **Mobile & Tablet (< 1024px)**:
  - [ ] Appears below Latest News
  - [ ] Full width
  - [ ] Horizontal layout option

- **Desktop (≥ 1024px)**:
  - [ ] Sticky positioning
  - [ ] Fixed sidebar width
  - [ ] Stays in viewport on scroll
  - [ ] Proper spacing from content

### 6. Video Section
- **Mobile (< 640px)**:
  - [ ] Single column
  - [ ] Video cards full width
  - [ ] Play overlay visible
  - [ ] Duration badge readable

- **Tablet (640px - 1023px)**:
  - [ ] 2-column grid

- **Desktop (1024px - 1279px)**:
  - [ ] 3-column grid

- **Large Desktop (≥ 1280px)**:
  - [ ] 4-column grid

### 7. Category Strip
- **Mobile (< 640px)**:
  - [ ] 2-column grid
  - [ ] Icons scale properly
  - [ ] Text readable
  - [ ] Spacing adequate

- **Tablet (640px - 1023px)**:
  - [ ] 4-column grid
  - [ ] Better spacing

- **Desktop (≥ 1024px)**:
  - [ ] 8-column grid (all categories visible)
  - [ ] Hover effects work
  - [ ] Icons and colors distinct

### 8. Originals Promo
- **All Breakpoints**:
  - [ ] Responsive padding
  - [ ] Text scales properly
  - [ ] Background gradient visible
  - [ ] CTA button accessible
  - [ ] Hover effects work on desktop

### 9. Footer
- **Mobile (< 640px)**:
  - [ ] Single column
  - [ ] Links stack vertically
  - [ ] Newsletter form full width
  - [ ] Social icons horizontal
  - [ ] Back to top button visible

- **Tablet (640px - 1023px)**:
  - [ ] 2-column grid for link groups
  - [ ] Newsletter centered

- **Desktop (≥ 1024px)**:
  - [ ] 4-column grid
  - [ ] All sections visible
  - [ ] Proper spacing
  - [ ] Newsletter form inline

## Theme Testing

### Dark Theme (Default)
- [ ] Background colors: `--bg: #0b0b0d`, `--panel: #141417`
- [ ] Text readable on dark background
- [ ] Red accent (`#e0142c`) visible
- [ ] Border colors subtle (`#2a2a2f`)
- [ ] Images have proper contrast
- [ ] Loading skeletons visible

### Light Theme
- [ ] Background colors inverted
- [ ] Text readable on light background
- [ ] Red accent still visible
- [ ] Borders appropriate
- [ ] Images don't wash out
- [ ] Loading skeletons visible

## Loading States

### Hero Section
- [ ] Skeleton shows correct layout
- [ ] Gradient animation smooth
- [ ] Transitions to content seamlessly

### Breaking News Ticker
- [ ] Skeleton matches final layout
- [ ] No layout shift on load

### Article Cards
- [ ] Image placeholder visible
- [ ] Text skeletons appropriate size
- [ ] No content jump

### Video Cards
- [ ] Play overlay shows after load
- [ ] Duration badge positioned correctly

### Trending Items
- [ ] Number badge skeleton
- [ ] Text lines match final content

## Performance Checks

- [ ] Images lazy load
- [ ] Fonts load without FOUT
- [ ] Smooth scrolling
- [ ] No layout shifts (CLS)
- [ ] Fast Time to Interactive (TTI)
- [ ] Animations don't cause jank

## Accessibility

- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Color contrast passes WCAG AA
- [ ] Responsive images have alt text

## Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Testing Tools

- **Responsive Design Mode**: Browser DevTools (F12 → Device Toolbar)
- **Lighthouse**: Performance, accessibility audit
- **WAVE**: Accessibility checker
- **axe DevTools**: Accessibility testing
- **BrowserStack**: Cross-browser testing
