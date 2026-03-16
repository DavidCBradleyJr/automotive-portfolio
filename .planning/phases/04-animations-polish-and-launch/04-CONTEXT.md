# Phase 4: Animations, Polish, and Launch - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Layer scroll animations on all sections, add hero parallax via GSAP ScrollTrigger, build the footer, run SEO/performance audit to hit Lighthouse 90+, and deploy to Netlify. Also fix the hamburger mobile menu bug (overlay behaves incorrectly when opened past the first section). This is the final phase — the site goes live.

</domain>

<decisions>
## Implementation Decisions

### Footer
- Three-column layout: Left (DB name + tagline + copyright), Center (nav links), Right (social links + Book a Shoot CTA)
- Include tagline "Where Speed Meets Art" below the name
- Copyright: "© 2026 David Bradley"
- Subtle purple border-top as separator from last section
- Social links: Instagram (@itz.dat.david) + TikTok (@itzdatdavid)
- Nav links mirror the header nav (Gallery, Video, About, BTS, Contact)
- "Book a Shoot" CTA button linking to #contact

### Scroll Animations
- Section reveals: subtle and smooth — small translateY (20-30px) with gentle fade. Content glides in, barely noticeable but polished.
- Hero parallax: medium intensity (20-30%) via GSAP ScrollTrigger — noticeable depth separation, cinematic
- Gallery items: stagger on first scroll into view (in addition to existing filter stagger)
- Max 3-4 distinct animation types site-wide (per ANIM-03):
  1. Section fade+translateY reveals
  2. Hero parallax
  3. Gallery item stagger entrance
  4. (existing) Gallery filter fade/rearrange
- All animations disabled when `prefers-reduced-motion` is enabled (per ANIM-04)

### Deployment
- Netlify with git-based CI/CD
- Netlify subdomain for now (no custom domain yet)
- Create GitHub repo and push code as part of deployment
- Configure netlify.toml from scratch
- User creates Netlify account and connects during deployment

### Bug Fix
- Hamburger mobile menu overlay acts weird after scrolling past the first section — needs investigation and fix in this phase

### Claude's Discretion
- Exact GSAP ScrollTrigger configuration (start/end triggers, scrub settings)
- Section reveal trigger thresholds (how far into viewport before animation fires)
- Gallery stagger timing on initial scroll
- netlify.toml build configuration details
- Lighthouse optimization tactics (code splitting, asset hints, etc.)
- Open Graph image choice
- Heading hierarchy audit and fixes

</decisions>

<specifics>
## Specific Ideas

- Premium aesthetic: animations should feel effortless, not flashy — like a luxury car commercial
- The 3-4 animation type budget keeps the site cohesive (no animation chaos)
- Subtle reveals > dramatic entrances — let the photography be the drama
- Hero parallax at 20-30% creates cinema-like depth without performance concerns

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/tokens.css`: All design tokens including spacing, colors, motion tokens
- `src/style.css`: `.section` class already has padding — animation adds entrance behavior
- `src/components/hero.css` + `hero.js`: Hero already has Ken Burns and entrance animation — parallax layers on top
- `src/components/gallery.js`: Already has filter stagger animation — initial scroll stagger extends this
- `src/components/nav.js`: Scroll-spy IntersectionObserver, hamburger toggle with iOS scroll lock (has bug)

### Established Patterns
- `prefers-reduced-motion` already handled in hero.css, gallery.css, nav.css, contact.js (toast)
- Component pattern: CSS + JS pair in `src/components/`
- BEM naming throughout
- Double-rAF pattern for animation timing (hero.js)

### Integration Points
- No footer element exists yet in `index.html` — needs to be added after the last section
- `src/main.js` handles all component imports and init calls
- GSAP ScrollTrigger is a new npm dependency
- `index.html` already has Open Graph tags (title, description, type) — needs image tag added
- Heading hierarchy: H1 = hero name, H2 = section headings — should be correct but needs audit
- Nav scroll-spy needs to also watch footer for scroll position
- Social handles: Instagram @itz.dat.david, TikTok @itzdatdavid (already updated in index.html)

</code_context>

<deferred>
## Deferred Ideas

- Live Instagram/TikTok API feed — v2 feature (V2-06), explicitly out of scope per requirements

</deferred>

---

*Phase: 04-animations-polish-and-launch*
*Context gathered: 2026-03-16*
