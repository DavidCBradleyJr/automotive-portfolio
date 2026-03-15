# Phase 2: Gallery and Image Pipeline - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Category-filtered photo gallery with lazy loading, LQIP blur-up, and PhotoSwipe lightbox. Visitors can browse David's portfolio by automotive category (JDM, Euro, Supercar, American Muscle, Track/Motorsport) with smooth filter transitions and a full-featured image viewer. Includes an image pipeline to convert source JPGs to optimized WebP at build time.

</domain>

<decisions>
## Implementation Decisions

### Grid Layout
- Masonry layout with mixed image heights — images keep their natural aspect ratio, staggered like Pinterest
- 3 columns on desktop (1440px+), scales down responsively (2 columns tablet, 1 column mobile)
- Medium gap spacing: 16-20px between images
- Mobile: edge-to-edge full bleed, single column — landscape automotive shots fill the width completely (GAL-07)

### Filter Interaction
- Pill-shaped buttons in a horizontal row: "All", "JDM", "Euro", "Supercar", "American Muscle", "Track/Motorsport"
- Active pill gets purple fill (#7C3AED), inactive pills are outlined/ghost style
- Default to "All" showing every image on page load
- Filter bar sticks below the nav when scrolling through the gallery — always accessible
- Filter animation: non-matching images fade out, grid rearranges, matching images fade in (smooth, not instant)

### Lightbox (PhotoSwipe)
- Captions showing car name + category (e.g. "Nissan GT-R R34 — JDM")
- Near-black backdrop (95%+ opacity) — full focus on the image, matches dark theme
- No image counter — cleaner, more cinematic
- Navigation scoped to active category only — if viewing JDM, arrows cycle through JDM images
- Keyboard navigation, mobile swipe, pinch-to-zoom per GAL-06

### Image Pipeline
- Source images: 29 real photos from `~/Pictures/cars/` (DSC-numbered JPGs) + generated gradient placeholders to fill remaining slots (40-60 total across 5 categories)
- Build-time processing: Vite plugin converts originals to WebP, resizes to max 2000px — originals stay intact
- Claude distributes the 29 real images across categories as it sees fit
- All gallery images lazy-loaded with LQIP blur-up effect (GAL-05)
- Image data (filename, category, caption) stored in a JS data file for easy editing

### Claude's Discretion
- Exact masonry implementation approach (CSS columns vs JS-based)
- LQIP generation method (tiny inline base64 vs separate low-res files)
- Vite plugin choice for image processing
- Filter animation timing and easing
- Gradient placeholder design for filler images
- How to generate descriptive filenames from DSC-numbered originals (PERF-05)

</decisions>

<specifics>
## Specific Ideas

- Photography is the star — design recedes to let images breathe (from Phase 1 context)
- Premium feel: high-end watch brand meets supercar — luxurious, not flashy
- Purple (#7C3AED) accent on active filter pill matches the CTA buttons and nav accent established in Phase 1
- User's real photos are in `~/Pictures/cars/` — 29 DSC-numbered JPG files

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/tokens.css`: Full design token system — colors, typography, spacing, component tokens
- `src/style.css`: `.section` class with padding, `.section__heading` with Orbitron, `.btn--primary` button style
- `src/components/hero.css` + `hero.js`: Component pattern (CSS + JS pair, exported init function)

### Established Patterns
- Component structure: `src/components/{name}.css` + `src/components/{name}.js` with `init{Name}()` function
- All CSS imports go through `src/main.js`
- Three-tier CSS custom properties (primitives → semantic → component)
- BEM naming: `.block__element--modifier`
- `prefers-reduced-motion` respected in all animation CSS

### Integration Points
- Gallery section stub exists in `index.html`: `<section class="section" id="gallery">` with `<h2 class="section__heading">Gallery</h2>`
- Nav scroll-spy already watches `#gallery` section via IntersectionObserver
- Hero CTA button already links to `#gallery`
- `src/main.js` is the entry point — gallery CSS/JS imports and `initGallery()` call go here

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-gallery-and-image-pipeline*
*Context gathered: 2026-03-15*
