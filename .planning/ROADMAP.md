# Roadmap: David Bradley Automotive Photography Portfolio

## Milestones

- v1.0 Portfolio Launch - Phases 1-4 (shipped 2026-03-16)
- v2.0 Admin Panel & Image Pipeline - Phases 5-7 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 Portfolio Launch (Phases 1-4) - SHIPPED 2026-03-16</summary>

- [x] **Phase 1: Foundation, Hero, and Navigation** - Theme system, visual identity, cinematic hero opener, and sticky navigation with scroll-spy (completed 2026-03-14)
- [x] **Phase 2: Gallery and Image Pipeline** - Category-filtered photo grid with progressive loading and lightbox viewer (completed 2026-03-15)
- [x] **Phase 3: Content Sections and Contact** - Video reel, about, behind-the-scenes, social wall, and booking inquiry form (completed 2026-03-16)
- [x] **Phase 4: Animations, Polish, and Launch** - Scroll animations, footer, SEO, performance audit, and Netlify deployment (completed 2026-03-16)

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
**Plans:** 5/5 complete

Plans:
- [x] 01-01: Scaffold Vite project, design tokens, global styles, HTML skeleton
- [x] 01-02: Hero section styling with Ken Burns animation and entrance effects
- [x] 01-03: Sticky frosted-glass navigation with scroll-spy and mobile hamburger
- [x] 01-04: Fix hero image visibility and entrance animation timing
- [x] 01-05: Fix mobile overlay scroll lock and active link styling

### Phase 2: Gallery and Image Pipeline
**Goal**: Visitors can browse David's portfolio by automotive category with smooth filtering and a full-featured lightbox viewer
**Depends on**: Phase 1
**Requirements**: GAL-01, GAL-02, GAL-03, GAL-04, GAL-05, GAL-06, GAL-07, GAL-08
**Success Criteria** (what must be TRUE):
  1. A photo gallery section displays images in a responsive CSS Grid layout with 8-12 placeholder images per category
  2. Clicking category filter buttons smoothly animates the gallery to show only images from that category without page reload
  3. Clicking any gallery image opens a PhotoSwipe lightbox with keyboard navigation, mobile swipe, and pinch-to-zoom
  4. Gallery images lazy-load with LQIP blur-up effect, and on mobile the layout uses full-width single-column
  5. A "Book a Shoot" CTA button appears after the gallery, scrolling to the contact section
**Plans:** 3/3 complete

Plans:
- [x] 02-01: Image processing pipeline with sharp and gallery data file
- [x] 02-02: Gallery masonry grid, category filter pills, and LQIP lazy loading
- [x] 02-03: PhotoSwipe lightbox integration with category-scoped navigation

### Phase 3: Content Sections and Contact
**Goal**: The full storytelling arc is complete -- visitors can watch video content, learn about David, see behind-the-scenes work, find social links, and submit a booking inquiry
**Depends on**: Phase 2
**Requirements**: VID-01, VID-02, VID-03, VID-04, ABOUT-01, ABOUT-02, ABOUT-03, ABOUT-04, BTS-01, BTS-02, BTS-03, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, SOCIAL-01, SOCIAL-02
**Success Criteria** (what must be TRUE):
  1. A video reel section displays an embedded video player using the facade pattern, responsive at 16:9 aspect ratio
  2. An about section presents a photographer photo and personal bio in a two-column desktop layout (stacked on mobile), with a CTA linking to contact
  3. A behind-the-scenes section shows a grid of BTS images with captions describing gear, locations, or process
  4. Submitting the booking form delivers an email via Formspree, with client-side validation, success/error states, and no page reload
  5. Social media links are accessible, and a social wall section displays a curated static grid of social-style images
**Plans:** 2/2 complete

Plans:
- [x] 03-01: Video reel, about section, and behind-the-scenes grid
- [x] 03-02: Contact form with Formspree integration and social wall grid

### Phase 4: Animations, Polish, and Launch
**Goal**: The site feels alive with tasteful scroll animations, has proper SEO and performance, and is deployed on the public internet
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, FOOT-01, FOOT-02, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08
**Success Criteria** (what must be TRUE):
  1. Sections reveal with scroll-triggered animations, hero has parallax, gallery items stagger -- no more than 3-4 distinct animation types
  2. Users with prefers-reduced-motion see no animations
  3. Footer displays name/copyright, social links, nav links, and a "Book a Shoot" CTA
  4. Lighthouse mobile 90+, LCP under 2.5s, JS under 80KB gzip, all images have alt text
  5. Deployed on Netlify with OG/Twitter meta tags and proper heading hierarchy
**Plans:** 2/2 complete

Plans:
- [x] 04-01: Footer component, scroll animations, and hamburger bug fix
- [x] 04-02: SEO audit, meta tags, performance verification, and Netlify deployment

</details>

## v2.0 Admin Panel & Image Pipeline (In Progress)

**Milestone Goal:** Let David upload photos, tag them with categories/captions, and have them appear in the gallery -- all through a browser-based admin panel with no CLI or git knowledge required.

- [ ] **Phase 5: Cloudinary Storage & Build Pipeline** - Migrate images to Cloudinary CDN and generate gallery data at build time
- [ ] **Phase 6: Admin Authentication & Upload** - Protected admin panel with drag-and-drop photo upload and metadata tagging
- [ ] **Phase 7: Admin Image Management** - View, edit, delete, and reorder existing gallery images from the admin panel

## Phase Details

### Phase 5: Cloudinary Storage & Build Pipeline
**Goal**: The public gallery loads all images from Cloudinary CDN with automatic format optimization, and the build pipeline generates gallery data without any manual steps
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, BUILD-01, BUILD-02, BUILD-03, BUILD-04
**Success Criteria** (what must be TRUE):
  1. All 29 existing gallery images are served from Cloudinary CDN URLs instead of the git repo, with metadata (category, caption, alt text) preserved
  2. Gallery images are automatically delivered as WebP with responsive sizing via Cloudinary URL transforms -- no local image processing needed
  3. Running the build generates a gallery data file in the same format as v1, and the public gallery renders identically with zero code changes to the frontend
  4. LQIP base64 placeholders are generated at build time from Cloudinary thumbnail URLs, preserving the blur-up loading effect
  5. The public site JS bundle remains under 80KB gzip with no Cloudinary SDK or admin code loaded by visitors
**Plans:** 3 plans

Plans:
- [ ] 05-01-PLAN.md -- Install Cloudinary SDK, create migration script, upload 29 images
- [ ] 05-02-PLAN.md -- Create build-gallery-data.js script and wire into npm prebuild
- [ ] 05-03-PLAN.md -- Update BTS/social image paths, verify bundle size, visual check

### Phase 6: Admin Authentication & Upload
**Goal**: David can log into a browser-based admin panel and upload new photos with categories and captions that appear in the gallery after a short rebuild
**Depends on**: Phase 5
**Requirements**: AUTH-01, AUTH-02, UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin shows a Netlify Identity login gate -- only invited users (David) can access the panel, with no public registration option
  2. After login, David can drag-and-drop (or file-pick) one or more JPEG/PNG/WebP images, see previews, and fill in category, caption, and alt text per image
  3. Uploading images sends them through a Netlify Function proxy to Cloudinary (API secret never exposed to browser), and David sees success/error feedback
  4. After upload completes, a Netlify rebuild is triggered automatically, and within 2-3 minutes the new photos appear in the public gallery
**Plans**: TBD

### Phase 7: Admin Image Management
**Goal**: David can view, edit, and organize his entire gallery from the admin panel without touching code or the Cloudinary dashboard
**Depends on**: Phase 6
**Requirements**: MGMT-01, MGMT-02, MGMT-03, MGMT-04
**Success Criteria** (what must be TRUE):
  1. The admin panel shows a grid of all uploaded gallery images with their current category, caption, and alt text visible
  2. David can edit the category, caption, or alt text on any existing image and the changes persist after the next build
  3. David can delete an image from the gallery, which removes it from both Cloudinary and the gallery metadata
  4. David can reorder images within a category using drag or sort controls, and the new order is reflected on the public site after rebuild
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 -> 6 -> 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation, Hero, and Navigation | v1.0 | 5/5 | Complete | 2026-03-14 |
| 2. Gallery and Image Pipeline | v1.0 | 3/3 | Complete | 2026-03-15 |
| 3. Content Sections and Contact | v1.0 | 2/2 | Complete | 2026-03-16 |
| 4. Animations, Polish, and Launch | v1.0 | 2/2 | Complete | 2026-03-16 |
| 5. Cloudinary Storage & Build Pipeline | v2.0 | 0/3 | Not started | - |
| 6. Admin Authentication & Upload | v2.0 | 0/? | Not started | - |
| 7. Admin Image Management | v2.0 | 0/? | Not started | - |
