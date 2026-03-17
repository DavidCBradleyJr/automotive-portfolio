# Requirements: David Bradley Automotive Photography Portfolio

**Defined:** 2026-03-14
**Core Value:** The portfolio must make David's photography the hero — every design decision serves the images, and visitors should feel the craft and passion before they ever contact him.

## v1 Requirements (Complete)

### Foundation & Theme

- [x] **FOUND-01**: Project scaffolded with Vite 6.x, vanilla HTML/CSS/JS, optimized build output
- [x] **FOUND-02**: CSS custom properties define the full design token system (colors, typography, spacing, motion)
- [x] **FOUND-03**: Dark theme implemented with off-black background (#0F0F0F) and purple accent color verified at WCAG AA contrast ratio
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

- [x] **HERO-01**: Full-viewport hero section with cinematic full-bleed background image
- [x] **HERO-02**: David Bradley name rendered in Orbitron with entrance animation on page load
- [x] **HERO-03**: Tagline text below name ("Where Speed Meets Art")
- [x] **HERO-04**: Primary CTA button scrolling to Gallery section
- [x] **HERO-05**: Hero image treated as LCP element (never lazy-loaded, fetchpriority="high", under 200KB)

### Gallery

- [x] **GAL-01**: Photo gallery section with CSS Grid layout, responsive across all screen sizes
- [x] **GAL-02**: Category filter buttons for JDM, Euro, Supercar, American Muscle, Track/Motorsport
- [x] **GAL-03**: Filter transitions animate smoothly (fade + scale) without page reload
- [x] **GAL-04**: 8–12 images per category (40–60 total)
- [x] **GAL-05**: All gallery images lazy-loaded with native loading="lazy"
- [x] **GAL-06**: PhotoSwipe 5.4 lightbox on image click — keyboard navigation, swipe on mobile, pinch-to-zoom
- [x] **GAL-07**: Gallery mobile layout uses full-width single-column (landscape automotive images must not be cropped)
- [x] **GAL-08**: CTA button after gallery ("Book a Shoot") scrolling to contact section

### Video Reel

- [x] **VID-01**: Video reel section with embedded YouTube player (placeholder embed)
- [x] **VID-02**: Video embed uses facade pattern (lite-youtube-embed) — no heavy payload on initial load
- [x] **VID-03**: Video section has heading, brief description text
- [x] **VID-04**: Responsive video container (16:9 aspect ratio maintained across all screen sizes)

### About

- [x] **ABOUT-01**: About section with photographer avatar and personal bio text
- [x] **ABOUT-02**: Bio communicates personality, passion, and automotive background
- [x] **ABOUT-03**: Two-column layout on desktop (photo left, text right), stacked on mobile
- [x] **ABOUT-04**: CTA after about section directing to contact/booking

### Behind the Scenes

- [x] **BTS-01**: Behind-the-scenes section with 2x2 grid of BTS images
- [x] **BTS-02**: Captions describing gear, location, or process
- [x] **BTS-03**: Section heading and brief intro paragraph

### Contact & Booking

- [x] **CONT-01**: Booking inquiry form with 5 fields: Name, Email, Event Type, Tentative Date, Brief Message
- [x] **CONT-02**: Form integrated with Formspree — submissions delivered to David's email
- [x] **CONT-03**: Client-side validation with inline error messages
- [x] **CONT-04**: Success state shown after submission (toast notification, no page reload)
- [x] **CONT-05**: Error state shown if submission fails, with retry guidance
- [x] **CONT-06**: Alternative contact method visible (email + social links)
- [x] **CONT-07**: No phone number field required

### Social Media

- [x] **SOCIAL-01**: Social media links in footer (Instagram @itz.dat.david, TikTok @itzdatdavid)
- [x] **SOCIAL-02**: Social wall section with 3x3 Instagram-style static grid

### Animations & Polish

- [x] **ANIM-01**: Scroll-triggered section reveals using IntersectionObserver + CSS transitions
- [x] **ANIM-02**: GSAP ScrollTrigger for hero parallax effect
- [x] **ANIM-03**: Maximum 3–4 distinct animation types site-wide
- [x] **ANIM-04**: `prefers-reduced-motion` respected — all animations disabled
- [x] **ANIM-05**: Staggered gallery item entrance animations

### Footer

- [x] **FOOT-01**: Three-column footer with name/copyright, nav links, social links
- [x] **FOOT-02**: "Book a Shoot" CTA in footer

### Performance & SEO

- [x] **PERF-01**: Lighthouse performance score ≥ 90 on mobile
- [x] **PERF-02**: LCP < 2.5 seconds
- [x] **PERF-03**: Total JavaScript bundle < 80KB gzip
- [x] **PERF-04**: All images have descriptive alt text
- [x] **PERF-05**: Descriptive image filenames
- [x] **PERF-06**: Proper heading hierarchy (one H1, logical H2/H3)
- [x] **PERF-07**: Open Graph and Twitter Card meta tags
- [x] **PERF-08**: Netlify deployment with git-based CI/CD

## v2 Requirements

### Image Storage

- [x] **STOR-01**: Images stored on Cloudinary CDN instead of git repo
- [x] **STOR-02**: Automatic WebP conversion and responsive resizing via Cloudinary URL transforms
- [x] **STOR-03**: LQIP base64 generated at build time from Cloudinary thumbnail URLs
- [x] **STOR-04**: Gallery data file auto-generated from Cloudinary metadata at build time
- [x] **STOR-05**: Existing 29 images migrated from git to Cloudinary with metadata preserved

### Admin Authentication

- [x] **AUTH-01**: Admin page at `/admin` protected by Netlify Identity login
- [x] **AUTH-02**: Only invited users (David) can access admin — no public registration

### Admin Upload

- [x] **UPLOAD-01**: Drag-and-drop upload zone with file picker fallback, accepts JPEG/PNG/WebP
- [x] **UPLOAD-02**: Batch upload — multiple photos in one session
- [x] **UPLOAD-03**: Per-image metadata form: category (dropdown), caption (text), alt text (text)
- [x] **UPLOAD-04**: Auto-generated image ID/slug from category + caption, editable
- [x] **UPLOAD-05**: Image preview shown before upload using browser URL.createObjectURL
- [x] **UPLOAD-06**: Upload proxied through Netlify Function (Cloudinary API secret stays server-side)
- [x] **UPLOAD-07**: Netlify rebuild triggered automatically after upload completes

### Admin Management

- [x] **MGMT-01**: View all uploaded gallery images in a grid with metadata
- [x] **MGMT-02**: Edit category, caption, and alt text on existing images
- [x] **MGMT-03**: Delete images from gallery (removes from Cloudinary + metadata)
- [x] **MGMT-04**: Reorder images within categories via drag or sort controls

### Build Pipeline

- [x] **BUILD-01**: Build script fetches all gallery images from Cloudinary API with metadata
- [x] **BUILD-02**: Build script generates gallery-images.js in same format as v1 (static import)
- [x] **BUILD-03**: Public site gallery component requires zero code changes
- [x] **BUILD-04**: Public site JS bundle stays under 80KB gzip (admin code never loaded by visitors)

## Future Requirements (Deferred)

### Enhanced Content

- **V2-01**: Project storytelling pages — narrative photo series with context per shoot
- **V2-02**: Before/after retouching slider
- **V2-03**: Client testimonials section
- **V2-04**: Client logo bar (brands/events photographed)

### Business Features

- **V2-05**: Pricing tiers page with service packages
- **V2-06**: Live Instagram feed via embed widget
- **V2-07**: Plausible or similar privacy-friendly analytics

### Technical

- **V2-09**: Print store / digital download integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user admin | Single owner only — no team collaboration needed |
| Real-time publish (<30s) | 2-3 min rebuild delay is acceptable for a portfolio |
| Database (Supabase/Postgres) | Cloudinary metadata + build-time generation is sufficient |
| JavaScript framework for admin | Vanilla JS matches the site, scope doesn't justify React/Vue |
| Image cropping in admin | Masonry layout handles any aspect ratio naturally |
| E-commerce / print sales | Future milestone |
| Blog | Not core to portfolio conversion |
| Live Instagram API | API instability, static images sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 through PERF-08 | Phases 1-4 (v1.0) | Complete |
| STOR-01 | Phase 5 | Complete |
| STOR-02 | Phase 5 | Complete |
| STOR-03 | Phase 5 | Complete |
| STOR-04 | Phase 5 | Complete |
| STOR-05 | Phase 5 | Complete |
| BUILD-01 | Phase 5 | Complete |
| BUILD-02 | Phase 5 | Complete |
| BUILD-03 | Phase 5 | Complete |
| BUILD-04 | Phase 5 | Complete |
| AUTH-01 | Phase 6 | Complete |
| AUTH-02 | Phase 6 | Complete |
| UPLOAD-01 | Phase 6 | Complete |
| UPLOAD-02 | Phase 6 | Complete |
| UPLOAD-03 | Phase 6 | Complete |
| UPLOAD-04 | Phase 6 | Complete |
| UPLOAD-05 | Phase 6 | Complete |
| UPLOAD-06 | Phase 6 | Complete |
| UPLOAD-07 | Phase 6 | Complete |
| MGMT-01 | Phase 7 | Complete |
| MGMT-02 | Phase 7 | Complete |
| MGMT-03 | Phase 7 | Complete |
| MGMT-04 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 56 total (all complete)
- v2 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-16 after v2.0 roadmap creation*
