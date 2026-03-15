# Requirements: David Bradley Automotive Photography Portfolio

**Defined:** 2026-03-14
**Core Value:** The portfolio must make David's photography the hero — every design decision serves the images, and visitors should feel the craft and passion before they ever contact him.

## v1 Requirements

### Foundation & Theme

- [x] **FOUND-01**: Project scaffolded with Vite 6.x, vanilla HTML/CSS/JS, optimized build output
- [x] **FOUND-02**: CSS custom properties define the full design token system (colors, typography, spacing, motion)
- [x] **FOUND-03**: Dark theme implemented with off-black background (#121212–#1A1A1A) and purple accent color verified at WCAG AA contrast ratio
- [x] **FOUND-04**: Orbitron (headings) and Space Grotesk (body) fonts loaded via Google Fonts with performance-safe loading strategy
- [x] **FOUND-05**: Global responsive breakpoints established (mobile-first, 320px–1440px+)
- [x] **FOUND-06**: Image sizing conventions and performance budget documented and enforced (max 2000px wide, under 400KB per image, WebP format)
- [x] **FOUND-07**: Smooth single-page scroll behavior with section anchor IDs

### Navigation

- [x] **NAV-01**: Sticky navigation header visible at all scroll positions
- [x] **NAV-02**: Nav links scroll smoothly to each section (Hero, Gallery, Video, About, BTS, Contact)
- [x] **NAV-03**: Active section highlighted in nav via Intersection Observer scroll-spy
- [x] **NAV-04**: Mobile hamburger menu with animated open/close, full-screen overlay
- [x] **NAV-05**: "David Bradley" wordmark/logo in nav header

### Hero

- [x] **HERO-01**: Full-viewport hero section with cinematic full-bleed background image (placeholder)
- [x] **HERO-02**: David Bradley name rendered in Orbitron with entrance animation on page load
- [x] **HERO-03**: Tagline text below name (e.g. "Automotive Photography")
- [x] **HERO-04**: Primary CTA button scrolling to Gallery section
- [x] **HERO-05**: Hero image treated as LCP element (never lazy-loaded, fetchpriority="high", under 200KB)

### Gallery

- [x] **GAL-01**: Photo gallery section with CSS Grid layout, responsive across all screen sizes
- [x] **GAL-02**: Category filter buttons for JDM, Euro, Supercar, American Muscle, Track/Motorsport
- [x] **GAL-03**: Filter transitions animate smoothly (fade + scale) without page reload
- [x] **GAL-04**: 8–12 placeholder images per category (40–60 total placeholders)
- [x] **GAL-05**: All gallery images lazy-loaded with LQIP (Low Quality Image Placeholder) blur-up effect
- [x] **GAL-06**: PhotoSwipe 5.4 lightbox on image click — keyboard navigation, swipe on mobile, pinch-to-zoom
- [x] **GAL-07**: Gallery mobile layout uses full-width single-column (landscape automotive images must not be cropped)
- [x] **GAL-08**: CTA button after gallery ("Book a Shoot") scrolling to contact section

### Video Reel

- [ ] **VID-01**: Video reel section with embedded YouTube or Vimeo player (placeholder embed)
- [ ] **VID-02**: Video embed uses facade pattern (lite-youtube-embed) — no 500KB+ payload on initial load
- [ ] **VID-03**: Video section has heading, brief description text, and plays muted-by-default where autoplayed
- [ ] **VID-04**: Responsive video container (16:9 aspect ratio maintained across all screen sizes)

### About

- [ ] **ABOUT-01**: About section with photographer photo (placeholder) and personal bio text
- [ ] **ABOUT-02**: Bio communicates personality, passion, and automotive background — not just credentials
- [ ] **ABOUT-03**: Two-column layout on desktop (photo left, text right), stacked on mobile
- [ ] **ABOUT-04**: CTA after about section directing to contact/booking

### Behind the Scenes

- [ ] **BTS-01**: Behind-the-scenes section with grid of BTS images (placeholders)
- [ ] **BTS-02**: Captions or short descriptions for BTS images (gear, location, process)
- [ ] **BTS-03**: Section heading and brief intro paragraph explaining the BTS content

### Contact & Booking

- [ ] **CONT-01**: Booking inquiry form with exactly 5 fields: Name, Email, Event Type (dropdown), Tentative Date, Brief Message
- [ ] **CONT-02**: Form integrated with Formspree — submissions delivered to David's email
- [ ] **CONT-03**: Client-side validation with inline error messages before submission
- [ ] **CONT-04**: Success state shown after submission (no page reload)
- [ ] **CONT-05**: Error state shown if submission fails, with retry guidance
- [ ] **CONT-06**: Alternative contact method visible (email address displayed directly)
- [ ] **CONT-07**: Phone number field is optional — not required

### Social Media

- [ ] **SOCIAL-01**: Social media links in navigation and/or footer (Instagram, potentially YouTube/TikTok)
- [ ] **SOCIAL-02**: Social wall section with curated static grid of social-style images (Instagram-style layout) — static images used instead of live API to avoid Instagram API instability

### Animations & Polish

- [ ] **ANIM-01**: Scroll-triggered section reveals using Intersection Observer + CSS transitions (opacity + translateY)
- [ ] **ANIM-02**: GSAP ScrollTrigger used for hero parallax effect and text animations only
- [ ] **ANIM-03**: Maximum 3–4 distinct animation types site-wide (no animation chaos)
- [ ] **ANIM-04**: `prefers-reduced-motion` media query respected — all animations disabled for users who prefer it
- [ ] **ANIM-05**: Staggered gallery item entrance animations on filter change

### Footer

- [ ] **FOOT-01**: Footer with David Bradley name/copyright, social links, and nav links
- [ ] **FOOT-02**: "Book a Shoot" CTA in footer

### Performance & SEO

- [ ] **PERF-01**: Lighthouse performance score ≥ 90 on mobile
- [ ] **PERF-02**: LCP (Largest Contentful Paint) < 2.5 seconds
- [ ] **PERF-03**: Total JavaScript bundle < 80KB gzip
- [ ] **PERF-04**: All images have descriptive alt text
- [ ] **PERF-05**: Descriptive image filenames (not IMG_1234.jpg)
- [ ] **PERF-06**: Proper heading hierarchy (one H1, logical H2/H3 structure)
- [ ] **PERF-07**: Open Graph and Twitter Card meta tags for social sharing
- [ ] **PERF-08**: Netlify deployment with git-based CI/CD and global CDN

## v2 Requirements

### Enhanced Content

- **V2-01**: Project storytelling pages — narrative photo series with context per shoot
- **V2-02**: Before/after retouching slider to demonstrate post-production skill
- **V2-03**: Client testimonials section
- **V2-04**: Client logo bar (brands/events photographed)

### Business Features

- **V2-05**: Pricing tiers page with service packages
- **V2-06**: Live Instagram feed via embed widget (when API approach is resolved)
- **V2-07**: Plausible or similar privacy-friendly analytics

### Technical

- **V2-08**: Headless CMS integration for content editing without code changes
- **V2-09**: Print store / digital download integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| CMS / admin panel | Static site for v1 — content edited directly in code |
| E-commerce / print sales | Future milestone, significant complexity |
| Blog | Not core to portfolio conversion goal |
| Authentication / login | No user accounts needed |
| Real-time chat | Over-engineering; inquiry form is sufficient |
| Live Instagram API | Instagram API requires app review, subject to breaking changes — use static images |
| Video autoplay with sound | Poor UX, fails mobile browser policies |
| Scroll hijacking | Kills usability, harms mobile performance |
| Tailwind CSS | Bespoke dark/purple design requires bespoke CSS |
| React / Astro / Next.js | Single-page site doesn't benefit from framework abstraction |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 through FOUND-07 | Phase 1 | Pending |
| NAV-01 through NAV-05 | Phase 1 | Pending |
| HERO-01 through HERO-05 | Phase 1 | Pending |
| GAL-01 through GAL-08 | Phase 2 | Pending |
| VID-01 through VID-04 | Phase 3 | Pending |
| ABOUT-01 through ABOUT-04 | Phase 3 | Pending |
| BTS-01 through BTS-03 | Phase 3 | Pending |
| CONT-01 through CONT-07 | Phase 3 | Pending |
| SOCIAL-01 through SOCIAL-02 | Phase 3 | Pending |
| ANIM-01 through ANIM-05 | Phase 4 | Pending |
| FOOT-01 through FOOT-02 | Phase 4 | Pending |
| PERF-01 through PERF-08 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation (coarse granularity: 4 phases)*
