# Project Research Summary

**Project:** David Bradley Automotive Photography Portfolio
**Domain:** Single-page photography portfolio website
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

This project is a single-page automotive photography portfolio -- a static site built to showcase car photography, establish brand identity, and convert visitors into booking inquiries. The expert consensus is clear: avoid frameworks entirely. No React, no Astro, no Next.js. A vanilla HTML/CSS/JS stack powered by Vite delivers everything this project needs -- fast dev experience, optimized builds, zero abstraction tax -- without solving problems the project does not have. The only meaningful dependencies are GSAP for scroll-linked animations (now fully free), PhotoSwipe for lightbox, and Formspree for form handling.

The recommended approach follows a storytelling-driven single-page architecture: Hero (hook) > Gallery (prove) > Video (deepen) > About (connect) > BTS (differentiate) > Contact (convert). Each section is an independent module with its own CSS and JS, communicating through DOM events. The dark theme with purple accent is the industry-standard aesthetic for automotive photography, and CSS custom properties make this trivial to implement. The gallery is the technical core -- it demands category filtering, progressive image loading (LQIP + lazy load), and a responsive grid that works on mobile where 60%+ of traffic arrives.

The dominant risk is performance self-sabotage. Photography sites are uniquely vulnerable: the product (images) is also the primary performance liability. Unoptimized images, animation overkill, and heavy third-party embeds (YouTube, Instagram) can each individually destroy load times. The mitigation is straightforward -- establish image conventions and performance budgets in Phase 1 before a single gallery image is added. Secondary risks include dark-theme contrast failures (verify all color pairings against WCAG AA) and SEO neglect (single-page sites with only images rank for nothing). Both are preventable with upfront discipline.

## Key Findings

### Recommended Stack

The stack is deliberately minimal. Vite provides the build pipeline (HMR, Rollup optimization, ES modules). Everything else is vanilla HTML/CSS/JS with three targeted libraries.

**Core technologies:**
- **Vite 6.x**: Build tool -- fastest dev experience for vanilla projects, no framework lock-in
- **GSAP 3.14 + ScrollTrigger + ScrollSmoother**: Animation -- industry standard for scroll-linked motion, all plugins now free since 2025 Webflow acquisition
- **PhotoSwipe 5.4**: Lightbox -- zero-dependency, ES module, spring-based gestures, CSS-variable theming
- **Formspree**: Form handling -- platform-agnostic (avoids Netlify vendor lock-in), 50 free submissions/month
- **Orbitron + Space Grotesk**: Typography -- geometric futuristic display font + clean technical body font, both from Google Fonts
- **Netlify**: Hosting -- git-based deploys, global CDN, free SSL, preview deploys

**Critical version note:** Avoid Astro 6 (requires Node 22+, solves multi-page problems this project does not have). Avoid Tailwind (bespoke design needs bespoke CSS).

### Expected Features

**Must have (table stakes):**
- Full-bleed hero with name/tagline overlay and entrance animation
- Gallery with category filtering (JDM, Euro, Muscle, Track), 8-12 images per category
- Lightbox viewer with keyboard nav, swipe on mobile
- Responsive design (mobile-first, touch-friendly)
- Contact/inquiry form (4-5 fields max, Formspree integration)
- About section with personality and passion
- Dark theme with purple accent throughout
- Image optimization (lazy load, WebP, responsive srcset)
- Smooth scroll navigation with sticky nav and section anchors
- Strategic CTAs after gallery, about, and in footer

**Should have (competitive, add after core is solid):**
- Video reel section (embedded YouTube/Vimeo with facade pattern)
- Behind-the-scenes content section
- Scroll-triggered animations (GSAP ScrollTrigger for section reveals)
- Client logo bar and testimonials

**Defer (v2+):**
- Project-based storytelling (narrative photo series)
- Before/after retouching slider
- Booking with pricing tiers
- Blog, CMS, print store integration

### Architecture Approach

The architecture is a three-layer stack: Presentation (9 HTML sections), Behavior (scroll management, gallery controller, animation orchestrator), and Performance (image loader, lazy load, LQIP). Sections are independent modules initialized from a central main.js, communicating via custom DOM events rather than direct imports. This keeps sections re-orderable and independently testable.

**Major components:**
1. **Nav** -- fixed header, scroll-spy via Intersection Observer, mobile menu toggle
2. **Hero** -- full-viewport cinematic opener, single CTA, LCP image (never lazy-loaded)
3. **Gallery** -- CSS Grid with filter buttons, data-attribute filtering, PhotoSwipe lightbox integration
4. **Image Loader** -- Intersection Observer-based lazy loading, LQIP blur-up placeholders, srcset/WebP serving
5. **Contact Form** -- client-side validation, Formspree POST via fetch, success/error states
6. **Scroll Animations** -- Intersection Observer + CSS transitions for 80% of effects, GSAP ScrollTrigger for complex timeline animations

### Critical Pitfalls

1. **Unoptimized images destroying load time** -- establish image pipeline in Phase 1: 72 DPI, max 2000px, under 400KB per image, WebP primary format, LQIP placeholders. Hero image under 200KB with `fetchpriority="high"`.
2. **Animation overkill and scroll hijacking** -- never override native scroll. Limit to opacity fades and subtle translateY. Set a strict budget of 3-4 animation types site-wide. Respect `prefers-reduced-motion`. Test on mid-range mobile.
3. **Dark theme contrast failures** -- use off-white (#E0E0E0-#F0F0F0) on off-black (#121212-#1A1A1A). Verify purple accent passes WCAG AA 4.5:1 for text. Never use purple for body copy smaller than 18px.
4. **SEO black hole** -- descriptive image filenames, meaningful alt text on every image, proper heading hierarchy, structured data (LocalBusiness + ImageGallery schema), 500+ words of real text content.
5. **Mobile gallery collapse** -- design mobile layout first. Full-width single-column for landscape images on mobile. Lightbox must support swipe, pinch-to-zoom, tap-to-close. Test on real devices.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Theme System
**Rationale:** Everything depends on the HTML skeleton, CSS custom properties, and image conventions. The color system, typography scale, and image pipeline must be established before any visual component is built. This is where 3 of the 7 critical pitfalls are prevented (image optimization, animation constraints, dark theme contrast).
**Delivers:** Project scaffolding (Vite config, file structure), HTML section shells, CSS custom properties (colors, typography, spacing), global reset/base styles, responsive breakpoints, image sizing conventions, motion design constraints document.
**Addresses:** Dark theme + purple accent, responsive foundation, smooth scroll navigation
**Avoids:** Unoptimized images (pipeline established), dark theme contrast failures (color tokens verified), animation overkill (constraints set)

### Phase 2: Hero and Navigation
**Rationale:** Hero is the first impression and establishes the visual language. Nav is needed for development navigation. Together they create a functional, visually complete starting point.
**Delivers:** Full-bleed hero with image, overlay text (Orbitron heading), entrance animation, CTA button, sticky nav with section anchors, mobile hamburger menu, scroll-spy active states.
**Uses:** GSAP (hero text animation), Intersection Observer (scroll-spy)
**Avoids:** Hero video autoplay (use still image), nav that disappears without recall

### Phase 3: Gallery, Image Pipeline, and Lightbox
**Rationale:** The gallery is the technical core and most complex component. Building it early surfaces design and performance issues. Image loading pipeline must be in place before adding volume. Lightbox extends gallery naturally.
**Delivers:** CSS Grid gallery layout, category filter buttons (JDM, Euro, Muscle, Track), data-attribute filtering with smooth transitions, LQIP progressive image loading, responsive srcset, PhotoSwipe lightbox with keyboard and touch nav.
**Addresses:** Gallery with filtering, lightbox viewer, image optimization, mobile gallery experience
**Avoids:** Gallery as archive (8-12 images per category enforced), mobile gallery collapse (designed mobile-first), all gallery images loading at once (lazy load from day one)

### Phase 4: Content Sections (About, Video, BTS)
**Rationale:** These are simpler layout sections that reuse patterns established in Phases 1-3. They fill out the storytelling arc between Gallery and Contact.
**Delivers:** About section (two-column: photo + text), video reel section (YouTube/Vimeo embed with facade pattern), behind-the-scenes grid with captions.
**Uses:** lite-youtube-embed (facade pattern), CSS Grid (BTS layout)
**Avoids:** Video autoplay with sound (muted by default, facade pattern), heavy third-party embeds (facade saves ~500KB per embed)

### Phase 5: Contact Form and CTAs
**Rationale:** Contact is the conversion endpoint. It should be built after the content funnel (hero > gallery > about) is complete so the full user journey can be tested.
**Delivers:** Booking inquiry form (4-5 fields), Formspree integration, client-side validation with inline errors, success/error states, alternative email contact, CTA buttons placed after gallery, about, and in footer.
**Avoids:** Form conversion killer (max 5 fields, phone optional, visible feedback), form that fails silently

### Phase 6: Scroll Animations and Polish
**Rationale:** Animations layer on top of working sections. Adding them too early makes debugging layout issues harder. This phase also covers responsive tuning, performance audit, and accessibility pass.
**Delivers:** Intersection Observer scroll reveals (fade + translateY), GSAP ScrollTrigger for hero parallax and text split, staggered gallery item reveals, `prefers-reduced-motion` support, Lighthouse audit pass, accessibility review (contrast, focus indicators, alt text), social links, footer.
**Addresses:** Scroll-triggered animations, social links, footer
**Avoids:** Animation overkill (budget of 3-4 types enforced), scroll hijacking (native scroll preserved)

### Phase 7: SEO, Performance, and Launch
**Rationale:** Final quality gate. SEO and structured data require all content to exist. Performance audit requires all features to be in place.
**Delivers:** Meta tags (Open Graph, Twitter Cards), structured data (LocalBusiness, ImageGallery), descriptive image filenames and alt text audit, Netlify deployment config, performance budget verification (LCP < 2.5s, total JS < 80KB gzip, CLS < 0.1), 404 page, favicon/manifest.
**Avoids:** SEO black hole (structured data, alt text, text content), EXIF data exposure (strip in pipeline)

### Phase Ordering Rationale

- **Foundation first** because 3 of 7 critical pitfalls are prevented at this stage (image conventions, color contrast, animation constraints). Getting these wrong requires expensive rework.
- **Hero + Nav before Gallery** because the hero establishes the visual language and the nav enables development navigation. The gallery then inherits established patterns.
- **Gallery is Phase 3** (not later) because it is the most complex component and the one most likely to surface architectural problems. Build the hard thing early.
- **Animations last** because they are a layer on top of working sections. Debugging layout issues is significantly harder when animation transforms are in play.
- **SEO and performance last** because they require all content and features to exist for meaningful measurement.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Gallery + Image Pipeline):** Most complex component. PhotoSwipe integration, LQIP generation, responsive image markup, and CSS Grid masonry all need concrete implementation research.
- **Phase 4 (Video Section):** lite-youtube-embed integration specifics, facade pattern implementation, and responsive video container sizing.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented Vite setup, CSS custom properties, standard project scaffolding.
- **Phase 2 (Hero + Nav):** Established patterns for sticky nav, scroll-spy, hero layout.
- **Phase 5 (Contact Form):** Formspree has clear documentation. Form validation is a solved problem.
- **Phase 6 (Animations):** GSAP documentation is excellent. Intersection Observer API is well-documented on MDN.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every technology choice is verified against official sources and current releases. GSAP free license confirmed. Vite over Astro rationale is sound. |
| Features | MEDIUM-HIGH | Based on analysis of 5+ real competitor sites (Larry Chen, Easton Chang, GFWilliams, Ted7, DW Burnett). Feature prioritization is well-grounded. |
| Architecture | HIGH | Single-page static site architecture is a thoroughly documented pattern. Section-as-module approach is straightforward. Data flows are simple. |
| Pitfalls | HIGH | Sourced from Nielsen Norman Group, Google Search Central, Format, and multiple photography-specific resources. All pitfalls are domain-validated. |

**Overall confidence:** HIGH

### Gaps to Address

- **Real image content:** v1 uses placeholder images. The image optimization pipeline (WebP/AVIF conversion, LQIP generation) should be validated with real photography to confirm the workflow works at actual file sizes.
- **Instagram feed integration:** Instagram API requires auth and approval. The decision between embed widget, static screenshots, or skipping entirely should be made during Phase 4 planning. Consider deferring to v1.x.
- **Icon approach:** Lucide Icons vs. hand-crafted inline SVGs is a minor decision to resolve during Phase 1. For the small icon set needed (social links, menu, close, arrow), either works.
- **Analytics:** No analytics tool was deeply researched. Plausible (privacy-friendly, < 1KB) is mentioned as preferred over GA4. Decide during Phase 7.
- **EXIF stripping:** The image pipeline needs a step to strip EXIF metadata (location data, camera serials) from published photos. Tool selection (sharp, squoosh CLI) should happen during Phase 3 planning.

## Sources

### Primary (HIGH confidence)
- [GSAP Documentation and Free License](https://gsap.com/) -- animation library, ScrollTrigger, all plugins free
- [PhotoSwipe v5](https://photoswipe.com/) -- lightbox library, ES module architecture
- [Vite](https://vite.dev/) -- build tool, vanilla template
- [MDN Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading) -- native image lazy loading
- [Google Search Central: Image SEO](https://developers.google.com/search/docs/appearance/google-images) -- image optimization for search
- [Nielsen Norman Group: Scrolljacking](https://www.nngroup.com/articles/scrolljacking-101/) -- scroll behavior anti-patterns

### Secondary (MEDIUM confidence)
- [GFWilliams](https://gfwilliams.net/) -- competitor analysis benchmark (custom dark portfolio)
- [Ted7](https://ted7.com/) -- competitor analysis (conversion-optimized portfolio)
- [Larry Chen](https://www.larrychenphoto.com/), [Easton Chang](https://www.eastonchang.com), [DW Burnett](https://dwburnett.com/) -- competitor analysis
- [Format: Portfolio Mistakes](https://www.format.com/magazine/resources/photography/8-mistakes-build-portfolio-website-photography) -- common photography portfolio pitfalls
- [Formspree vs Netlify Forms](https://vanillawebsites.co.uk/blog/netlify-forms-vs-formspree/) -- form service comparison
- [Netlify Forms Pricing Concerns](https://dev.to/allenarduino/netlify-forms-is-getting-expensive-here-are-the-best-alternatives-in-2026-3a7k) -- credit-based billing risks

### Tertiary (needs validation)
- [lite-youtube-embed](https://www.npmjs.com/package/@nicknisi/lite-youtube-embed) -- facade pattern implementation, verify package is current
- [Cloudinary LQIP Best Practices](https://cloudinary.com/blog/cloudinary-lqip-and-lazy-loading-best-practices) -- LQIP implementation patterns

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
