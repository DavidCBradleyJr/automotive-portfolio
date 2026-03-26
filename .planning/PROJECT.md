# David Bradley — Automotive Photography Portfolio

## What This Is

A multi-page portfolio website for automotive photographer David Bradley. The site showcases high-end car photography across JDM/Import, Euro/Supercar, American Muscle, and Track/Motorsport genres with a dark cinematic luxury aesthetic. Built with Next.js and designed to attract premium clients, display work beautifully, and convert visitors into bookings. Live at https://legendary-choux-e15998.netlify.app/

## Core Value

The portfolio must make David's photography the hero — every design decision serves the images, and visitors should feel the craft and passion before they ever contact him.

## Current Milestone: v4.0 Complete Redesign

**Goal:** Rebuild the entire portfolio as a multi-page Next.js site with a dark cinematic luxury automotive aesthetic, premium polish, better conversion flow, and redesigned admin panel — using UI UX Pro Max for design system, 21st.dev for React components, and Gemini for visual assets.

**Target features:**
- Multi-page architecture: Home, Gallery, Blog, About + Contact
- Interactive 3D parallax/scroll-triggered hero showcase
- Dark cinematic luxury brand aesthetic (Porsche/McLaren caliber)
- Next.js with React components (21st.dev compatible)
- Redesigned gallery with category filtering + lightbox
- Blog pages (incorporate v3.0 work into new architecture)
- Redesigned admin panel (upload, blog editor, gallery management)
- Cloudinary integration preserved
- Collaborative asset workflow: Claude provides 21st.dev URLs + Gemini prompts, David generates and provides assets

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

- [ ] Next.js project setup with multi-page routing
- [ ] Dark cinematic design system (UI UX Pro Max generated)
- [ ] Interactive hero showcase with 3D parallax/scroll effects
- [ ] Gallery page with category filtering + lightbox
- [ ] Blog pages (listing + individual posts, markdown editor)
- [ ] About + Contact pages with booking form
- [ ] Redesigned admin panel (gallery, blog, uploads)
- [ ] 21st.dev component integration
- [ ] Cloudinary migration to Next.js Image + API routes

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
- Previous stack: Vite 6.x, vanilla HTML/CSS/JS, Netlify, GSAP, PhotoSwipe
- New stack: Next.js, React, Tailwind CSS, Netlify, Cloudinary
- Gallery: 50 entries (29 real WebP + 21 gradient placeholders), masonry layout
- Image pipeline: sharp-based `process-images.js` runs locally, outputs to git
- v2.0 replaces local pipeline with Cloudinary + browser admin

## Constraints

- **Tech Stack**: Next.js + React for public site and admin
- **Cost**: Must stay within free tiers (Netlify, Cloudinary)
- **Performance**: Gallery must remain static build-time data (no runtime API calls)
- **Bundle**: Public site JS must stay under 80KB gzip
- **Images**: Move from git to Cloudinary CDN

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-page scroll layout | More immersive, cinematic feel | ✓ Good (v1-v3), replaced v4 |
| Purple accent on dark theme | Distinctive in auto space | ✓ Good (v1-v3), redesigned v4 |
| Vite 6.x vanilla JS | Lightweight, fast builds | ✓ Good (v1-v3), replaced v4 |
| Next.js + React for v4 | Multi-page routing, 21st.dev compat, image optimization | — Active |
| Multi-page architecture | Professional, scalable, better SEO | — Active |
| Dark cinematic luxury aesthetic | Premium brand positioning (Porsche/McLaren caliber) | — Active |
| UI UX Pro Max for design system | 161 reasoning rules, industry-specific design intelligence | — Active |
| 21st.dev for React components | High-quality pre-built components, matches Next.js stack | — Active |
| Gemini for visual asset generation | User generates mockups/assets via Nano Banana 2, provides to Claude | — Active |
| Cloudinary for v2 images | Eliminates git bloat, provides CDN + transforms | — Pending |
| Netlify Identity for admin auth | Free, integrated with Netlify, JWT-based | — Pending |
| Build-time data generation | Preserves static gallery performance | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 after v4.0 milestone start*
