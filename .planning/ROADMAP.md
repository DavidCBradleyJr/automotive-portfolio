# Roadmap: David Bradley Automotive Photography Portfolio

## Overview

This roadmap delivers a single-page automotive photography portfolio from foundation to launch in four phases. Phase 1 establishes the visual identity, theme system, hero section, and navigation -- creating a navigable, visually complete skeleton. Phase 2 tackles the gallery, the most complex and important component. Phase 3 fills out all remaining content sections (video, about, BTS, contact, social). Phase 4 layers on animations, footer, SEO, performance optimization, and prepares for deployment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation, Hero, and Navigation** - Theme system, visual identity, cinematic hero opener, and sticky navigation with scroll-spy
- [x] **Phase 2: Gallery and Image Pipeline** - Category-filtered photo grid with progressive loading and lightbox viewer (completed 2026-03-15)
- [ ] **Phase 3: Content Sections and Contact** - Video reel, about, behind-the-scenes, social wall, and booking inquiry form
- [ ] **Phase 4: Animations, Polish, and Launch** - Scroll animations, footer, SEO, performance audit, and Netlify deployment

## Phase Details

### Phase 1: Foundation, Hero, and Navigation
**Goal**: Visitors land on a polished, navigable dark-themed page with a cinematic full-bleed hero that establishes David Bradley's brand
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, HERO-01, HERO-02, HERO-03, HERO-04, HERO-05
**Success Criteria** (what must be TRUE):
  1. Opening the site in a browser shows a full-viewport cinematic hero image with David Bradley's name in Orbitron font, a tagline, and a CTA button -- all on a dark theme with purple accents
  2. A sticky navigation bar is visible at all scroll positions with section links, a wordmark, and active-section highlighting that updates as the user scrolls
  3. Clicking nav links smoothly scrolls to the corresponding section anchor; on mobile, a hamburger menu opens a full-screen overlay with the same links
  4. The site is responsive from 320px to 1440px+ and the hero image loads fast (fetchpriority high, under 200KB, never lazy-loaded)
  5. CSS custom properties define all design tokens (colors, typography, spacing) and the dark theme passes WCAG AA contrast requirements
**Plans:** 5 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Vite project, design tokens, global styles, HTML skeleton
- [ ] 01-02-PLAN.md — Hero section styling with Ken Burns animation and entrance effects
- [ ] 01-03-PLAN.md — Sticky frosted-glass navigation with scroll-spy and mobile hamburger
- [ ] 01-04-PLAN.md — (Gap closure) Fix hero image visibility and entrance animation timing
- [ ] 01-05-PLAN.md — (Gap closure) Fix mobile overlay scroll lock and active link styling

### Phase 2: Gallery and Image Pipeline
**Goal**: Visitors can browse David's portfolio by automotive category with smooth filtering and a full-featured lightbox viewer
**Depends on**: Phase 1
**Requirements**: GAL-01, GAL-02, GAL-03, GAL-04, GAL-05, GAL-06, GAL-07, GAL-08
**Success Criteria** (what must be TRUE):
  1. A photo gallery section displays images in a responsive CSS Grid layout with 8-12 placeholder images per category (JDM, Euro, Supercar, American Muscle, Track/Motorsport)
  2. Clicking category filter buttons smoothly animates the gallery to show only images from that category without page reload
  3. Clicking any gallery image opens a PhotoSwipe lightbox with keyboard navigation, mobile swipe, and pinch-to-zoom
  4. Gallery images lazy-load with LQIP blur-up effect, and on mobile the layout uses full-width single-column so landscape automotive images are never cropped
  5. A "Book a Shoot" CTA button appears after the gallery, scrolling to the contact section
**Plans:** 3/3 plans complete

Plans:
- [ ] 02-01-PLAN.md — Image processing pipeline with sharp and gallery data file
- [ ] 02-02-PLAN.md — Gallery masonry grid, category filter pills, and LQIP lazy loading
- [ ] 02-03-PLAN.md — PhotoSwipe lightbox integration with category-scoped navigation

### Phase 3: Content Sections and Contact
**Goal**: The full storytelling arc is complete -- visitors can watch video content, learn about David, see behind-the-scenes work, find social links, and submit a booking inquiry
**Depends on**: Phase 2
**Requirements**: VID-01, VID-02, VID-03, VID-04, ABOUT-01, ABOUT-02, ABOUT-03, ABOUT-04, BTS-01, BTS-02, BTS-03, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, SOCIAL-01, SOCIAL-02
**Success Criteria** (what must be TRUE):
  1. A video reel section displays an embedded video player using the facade pattern (no heavy payload on initial load), responsive at 16:9 aspect ratio, muted by default
  2. An about section presents a photographer photo and personal bio in a two-column desktop layout (stacked on mobile), with a CTA linking to contact
  3. A behind-the-scenes section shows a grid of BTS images with captions describing gear, locations, or process
  4. Submitting the booking form (Name, Email, Event Type, Tentative Date, Brief Message) delivers an email via Formspree, with client-side validation, success/error states, and no page reload
  5. Social media links (Instagram, YouTube/TikTok) are accessible, and a social wall section displays a curated static grid of social-style images
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Animations, Polish, and Launch
**Goal**: The site feels alive with tasteful scroll animations, has proper SEO and performance, and is deployed and accessible on the public internet
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, FOOT-01, FOOT-02, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08
**Success Criteria** (what must be TRUE):
  1. Sections reveal with scroll-triggered fade+translateY animations, the hero has a parallax effect via GSAP ScrollTrigger, and gallery items stagger on filter change -- with no more than 3-4 distinct animation types site-wide
  2. Users with `prefers-reduced-motion` enabled see no animations at all
  3. A footer displays David Bradley's name/copyright, social links, nav links, and a "Book a Shoot" CTA
  4. Lighthouse mobile performance score is 90+, LCP is under 2.5 seconds, total JS bundle is under 80KB gzip, and all images have descriptive alt text and filenames
  5. The site is deployed on Netlify with git-based CI/CD, has Open Graph and Twitter Card meta tags, and proper heading hierarchy (one H1, logical H2/H3 structure)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Hero, and Navigation | 5/5 | Complete | 2026-03-14 |
| 2. Gallery and Image Pipeline | 3/3 | Complete   | 2026-03-15 |
| 3. Content Sections and Contact | 0/3 | Not started | - |
| 4. Animations, Polish, and Launch | 0/2 | Not started | - |
