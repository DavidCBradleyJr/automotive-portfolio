# David Bradley — Automotive Photography Portfolio

## What This Is

A single-page scroll portfolio website for automotive photographer David Bradley. The site showcases high-end car photography across JDM/Import, Euro/Supercar, American Muscle, and Track/Motorsport genres. It is designed to attract premium clients, display work beautifully, and convert visitors into bookings. Live at https://legendary-choux-e15998.netlify.app/

## Core Value

The portfolio must make David's photography the hero — every design decision serves the images, and visitors should feel the craft and passion before they ever contact him.

## Current Milestone: v3.0 Blog

**Goal:** Let David publish blog posts about shoots directly from the admin panel — with a markdown editor, photo attachments from the gallery or new uploads, and a dedicated /blog page with individual post pages. The main page shows a featured/recent post preview.

**Target features:**
- Blog page at `/blog` with post listing and individual post pages (`/blog/post-slug`)
- Featured/recent post preview section on the main page
- Markdown editor in admin with formatting toolbar + live preview
- Photo insertion from existing gallery or new upload (auto-added to gallery)
- Blog post data stored and generated at build time (same static pattern as gallery)
- Post metadata: title, slug, date, cover image, tags, excerpt

## Requirements

### Validated

- ✓ Hero section with cinematic opener and branding — v1.0
- ✓ Photo gallery with category filtering (JDM, Euro, Muscle, Track, Supercar) — v1.0
- ✓ About section with photographer story — v1.0
- ✓ Video reel section — v1.0
- ✓ Behind the scenes section — v1.0
- ✓ Booking/inquiry form (Formspree) — v1.0
- ✓ Social media wall — v1.0
- ✓ Contact section with multiple methods — v1.0
- ✓ Smooth single-page scroll navigation — v1.0
- ✓ Dark theme with purple accent — v1.0
- ✓ Responsive across all devices — v1.0
- ✓ Scroll animations and parallax — v1.0
- ✓ SEO meta tags and Netlify deployment — v1.0

### Active

- [ ] Blog page at /blog with post listing and individual post pages
- [ ] Featured/recent post preview on main page
- [ ] Markdown editor in admin with toolbar + live preview
- [ ] Photo insertion from gallery or new upload
- [ ] Blog post storage and build-time generation

### Out of Scope

- E-commerce / print sales — future consideration
- Blog — not part of current roadmap
- Live Instagram/TikTok API feed — static images sufficient (V2-06 deferred)
- Multi-user admin — single owner only
- Real-time publish (sub-30s) — 2-3 min rebuild delay is acceptable

## Context

- Photographer: David Bradley
- Social: Instagram @itz.dat.david, TikTok @itzdatdavid
- Specialty: JDM/Import, Euro/Supercar, American Muscle, Track/Motorsport
- Current stack: Vite 6.x, vanilla HTML/CSS/JS, Netlify, GSAP, PhotoSwipe
- Gallery: 50 entries (29 real WebP + 21 gradient placeholders), masonry layout
- Image pipeline: sharp-based `process-images.js` runs locally, outputs to git
- v2.0 replaces local pipeline with Cloudinary + browser admin

## Constraints

- **Tech Stack**: Keep vanilla JS for public site; admin can be vanilla JS too
- **Cost**: Must stay within free tiers (Netlify, Cloudinary)
- **Performance**: Gallery must remain static build-time data (no runtime API calls)
- **Bundle**: Public site JS must stay under 80KB gzip
- **Images**: Move from git to Cloudinary CDN

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-page scroll layout | More immersive, cinematic feel | ✓ Good |
| Purple accent on dark theme | Distinctive in auto space | ✓ Good |
| Vite 6.x vanilla JS | Lightweight, fast builds | ✓ Good |
| Cloudinary for v2 images | Eliminates git bloat, provides CDN + transforms | — Pending |
| Netlify Identity for admin auth | Free, integrated with Netlify, JWT-based | — Pending |
| Build-time data generation | Preserves static gallery performance | — Pending |

---
*Last updated: 2026-03-16 after v2.0 milestone start*
