# Phase 2: Gallery and Image Pipeline - Research

**Researched:** 2026-03-15
**Domain:** Image gallery, masonry layout, lightbox, build-time image processing
**Confidence:** HIGH

## Summary

This phase builds a category-filtered photo gallery with masonry layout, PhotoSwipe 5.4 lightbox, and a build-time image pipeline using sharp. The gallery displays 40-60 images across 5 automotive categories with pill-shaped filter buttons, smooth filter transitions, and LQIP blur-up lazy loading. A Node.js build script processes 29 real JPGs from `~/Pictures/cars/` into optimized WebP files and generates tiny base64 LQIP placeholders.

CSS native masonry (`grid-lanes`) is still experimental with no cross-browser support, so the masonry layout should use CSS `column-count` -- a well-supported, zero-dependency approach that naturally handles mixed-height images. PhotoSwipe 5.4.4 is the current stable release with full ESM support, dynamic caption plugin, and all required features (keyboard nav, swipe, pinch-to-zoom).

**Primary recommendation:** Use CSS `column-count` for masonry, sharp for build-time image processing (WebP + LQIP), PhotoSwipe 5.4.4 for lightbox, and a JS data file for gallery image metadata.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Masonry layout with mixed image heights -- images keep natural aspect ratio, staggered like Pinterest
- 3 columns desktop (1440px+), 2 columns tablet, 1 column mobile
- Medium gap spacing: 16-20px between images
- Mobile: edge-to-edge full bleed, single column
- Pill-shaped filter buttons: "All", "JDM", "Euro", "Supercar", "American Muscle", "Track/Motorsport"
- Active pill gets purple fill (#7C3AED), inactive pills are outlined/ghost style
- Default to "All" on page load
- Filter bar sticks below nav when scrolling
- Filter animation: fade out non-matching, rearrange, fade in matching
- PhotoSwipe lightbox with captions showing "Car Name -- Category"
- Near-black backdrop (95%+ opacity)
- No image counter in lightbox
- Navigation scoped to active category only
- Source images: 29 real photos from `~/Pictures/cars/` + gradient placeholders (40-60 total)
- Build-time processing: Vite plugin converts originals to WebP, resizes to max 2000px
- Claude distributes 29 real images across categories as it sees fit
- Image data in JS data file
- All gallery images lazy-loaded with LQIP blur-up

### Claude's Discretion
- Exact masonry implementation approach (CSS columns vs JS-based)
- LQIP generation method (tiny inline base64 vs separate low-res files)
- Vite plugin choice for image processing
- Filter animation timing and easing
- Gradient placeholder design for filler images
- How to generate descriptive filenames from DSC-numbered originals (PERF-05)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within Phase 2 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAL-01 | Photo gallery section with CSS Grid layout, responsive across all screen sizes | CSS column-count masonry with responsive breakpoints (3/2/1 col) |
| GAL-02 | Category filter buttons for JDM, Euro, Supercar, American Muscle, Track/Motorsport | Pill buttons with data-category attributes, JS filtering |
| GAL-03 | Filter transitions animate smoothly (fade + scale) without page reload | CSS transitions on opacity/transform, JS class toggling |
| GAL-04 | 8-12 placeholder images per category (40-60 total placeholders) | JS data file with image metadata, gradient placeholders for non-real images |
| GAL-05 | All gallery images lazy-loaded with LQIP blur-up effect | sharp generates 16px base64 WebP placeholders, IntersectionObserver triggers load |
| GAL-06 | PhotoSwipe 5.4 lightbox -- keyboard nav, swipe, pinch-to-zoom | PhotoSwipe 5.4.4 with dynamic caption plugin |
| GAL-07 | Gallery mobile layout uses full-width single-column | CSS column-count:1 at mobile breakpoint, no padding |
| GAL-08 | CTA button after gallery ("Book a Shoot") scrolling to contact section | Reuse existing .btn--primary pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| photoswipe | 5.4.4 | Lightbox viewer | De facto standard for image lightboxes, ESM, no dependencies, 19KB gzip |
| photoswipe-dynamic-caption-plugin | 1.2.7 | Lightbox captions | Official companion plugin by same author, auto-positions captions |
| sharp | ^0.33.x | Build-time image processing | Fastest Node.js image processor (libvips), WebP/resize/LQIP |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | Masonry layout | CSS column-count -- no library needed |
| (none) | - | Lazy loading | Native IntersectionObserver -- no library needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS column-count | JS masonry (Masonry.js) | JS adds ~25KB, column-count is zero-dep and handles this use case |
| CSS column-count | CSS grid-lanes/masonry | Experimental, no cross-browser support (only Safari TP, Firefox flag) |
| sharp (build script) | vite-imagetools | vite-imagetools works via import URLs -- awkward for batch processing 29 source files into public/ |
| sharp (build script) | vite-plugin-lqip | Designed for framework import workflows, not standalone batch processing |

**Installation:**
```bash
npm install photoswipe photoswipe-dynamic-caption-plugin
npm install -D sharp
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    gallery.css          # Gallery section styles (masonry, filters, items)
    gallery.js           # Gallery init, filtering logic, PhotoSwipe setup
  data/
    gallery-images.js    # Image metadata array (category, caption, filename, lqip)
scripts/
  process-images.js      # Build-time: sharp script to process ~/Pictures/cars/ images
public/
  images/
    gallery/             # Processed WebP gallery images (output of build script)
```

### Pattern 1: CSS Column-Count Masonry
**What:** Pure CSS masonry using `column-count` with responsive breakpoints
**When to use:** Mixed-height image grids where items flow top-to-bottom per column
**Example:**
```css
/* Source: standard CSS columns approach */
.gallery__grid {
  column-count: 3;
  column-gap: var(--gallery-gap);
}

.gallery__item {
  break-inside: avoid;
  margin-bottom: var(--gallery-gap);
}

@media (max-width: 1024px) {
  .gallery__grid { column-count: 2; }
}

@media (max-width: 640px) {
  .gallery__grid {
    column-count: 1;
    padding: 0; /* full-bleed mobile */
  }
  .gallery__item { margin-bottom: 0; }
}
```

**Important note about column-count ordering:** Items flow top-to-bottom, then left-to-right. This means item 1 is top of column 1, item 2 is below it, etc. This is natural for a gallery but differs from CSS Grid's left-to-right flow. When filtering, the re-arrangement is automatic as hidden items are removed from flow.

### Pattern 2: Filter with Data Attributes
**What:** Category filtering using data attributes and CSS class toggling
**When to use:** Client-side filtering without page reload
**Example:**
```javascript
// Each gallery item has data-category="jdm" etc.
function filterGallery(category) {
  const items = document.querySelectorAll('.gallery__item');
  items.forEach(item => {
    const match = category === 'all' || item.dataset.category === category;
    item.classList.toggle('gallery__item--hidden', !match);
  });
}
```

### Pattern 3: LQIP Blur-Up with IntersectionObserver
**What:** Show tiny blurred placeholder, swap to full image when in viewport
**When to use:** All lazy-loaded gallery images
**Example:**
```javascript
// Image element starts with base64 LQIP as src, real URL in data-src
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.onload = () => img.classList.add('gallery__img--loaded');
      observer.unobserve(img);
    }
  });
}, { rootMargin: '200px' });
```
```css
.gallery__img {
  filter: blur(20px);
  transition: filter 0.4s ease;
}
.gallery__img--loaded {
  filter: blur(0);
}
```

### Pattern 4: PhotoSwipe Integration with Category Scoping
**What:** Initialize PhotoSwipe so navigation cycles only through visible (filtered) images
**When to use:** When lightbox navigation should respect active filter
**Example:**
```javascript
// Source: https://photoswipe.com/getting-started/
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery-grid',
  children: '.gallery__item:not(.gallery__item--hidden) a',
  pswpModule: () => import('photoswipe'),
  bgOpacity: 0.95,
  loop: true,
  padding: { top: 20, bottom: 20, left: 0, right: 0 },
});
```

**Key insight for category scoping:** Reinitialize or destroy+recreate the lightbox instance after each filter change, passing updated `children` selector that excludes hidden items. PhotoSwipe reads items from DOM on init, so changing the selector and reinitializing ensures navigation is scoped to the active category.

### Pattern 5: Sticky Filter Bar
**What:** Filter buttons stick below the nav on scroll
**When to use:** Long gallery sections where filters should stay accessible
**Example:**
```css
.gallery__filters {
  position: sticky;
  top: var(--nav-height); /* 4rem, from tokens.css */
  z-index: 90; /* below nav z-index */
  background: var(--color-bg);
}
```

### Anti-Patterns to Avoid
- **Importing all images via Vite JS imports:** Don't `import img from './photo.webp'` for 50+ images. Use public/ directory and reference by path string.
- **CSS Grid for masonry:** `grid-template-rows: masonry` is not production-ready. Don't use it.
- **Loading all images eagerly:** 40-60 images at full resolution kills page load. LQIP + lazy load is mandatory.
- **Single PhotoSwipe instance across filters:** The lightbox will navigate through ALL items including hidden ones. Must reinitialize on filter change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image lightbox | Custom modal with img navigation | PhotoSwipe 5.4 | Pinch-to-zoom, keyboard nav, swipe, preloading, animation -- 100s of edge cases |
| Image resizing/WebP conversion | Custom ffmpeg/canvas scripts | sharp | libvips is 4-5x faster than ImageMagick, handles ICC profiles, rotation |
| LQIP generation | Manual Photoshop export of thumbnails | sharp resize(16).webp({quality:20}).toBuffer() | Automated, consistent, generates base64 inline |
| Masonry layout | JavaScript-based position calculation | CSS column-count | Zero JS, zero dependencies, browser-native reflow |

**Key insight:** The image pipeline is a build-time concern solved by a standalone Node.js script using sharp. Don't try to make Vite's import system handle batch processing of 29+ source photos -- a simple `scripts/process-images.js` that runs before build is cleaner and more debuggable.

## Common Pitfalls

### Pitfall 1: Column-Count Item Ordering Surprise
**What goes wrong:** Developer expects left-to-right item flow, but CSS columns flow top-to-bottom
**Why it happens:** CSS columns are designed for text, flowing content down columns
**How to avoid:** Accept the top-to-bottom flow -- it's natural for image galleries. Don't fight it with JS reordering.
**Warning signs:** Images appear in unexpected order compared to data array sequence

### Pitfall 2: PhotoSwipe Requires Explicit Width/Height
**What goes wrong:** Lightbox shows blank slides or tiny images
**Why it happens:** PhotoSwipe needs `data-pswp-width` and `data-pswp-height` attributes on every link element to pre-allocate slide size
**How to avoid:** Store image dimensions in the data file, output as data attributes on the anchor elements
**Warning signs:** Images flash or resize after lightbox opens

### Pitfall 3: Filter Animation Jank
**What goes wrong:** Filtering causes layout shift, items jump around
**Why it happens:** Removing items from column-count flow causes instant reflow
**How to avoid:** Use opacity/visibility transitions first (fade out), then apply `display:none` after transition ends. Use `transitionend` event or animation timing.
**Warning signs:** Items visibly jump to new positions before animation completes

### Pitfall 4: LQIP Base64 Bloats HTML
**What goes wrong:** 50+ inline base64 strings add significant weight to initial HTML
**Why it happens:** Each 16px WebP base64 is ~100-200 bytes, but 50 of them add 5-10KB to HTML
**How to avoid:** This is actually acceptable -- 5-10KB is far less than loading 50 placeholder images. The trade-off is correct. But keep LQIP tiny (16px max dimension).
**Warning signs:** None -- this is the intended behavior

### Pitfall 5: Sharp Requires Native Build on Install
**What goes wrong:** `npm install sharp` fails on some platforms or CI environments
**Why it happens:** sharp uses native libvips bindings
**How to avoid:** sharp v0.33+ uses prebuilt binaries for most platforms (macOS ARM64/x64, Linux x64). Install as devDependency since it's only used at build time.
**Warning signs:** Node.js version mismatch or missing build tools

### Pitfall 6: Sticky Filter Under Fixed Nav
**What goes wrong:** Filter bar disappears behind the fixed nav or overlaps it
**Why it happens:** `position: sticky` + `top` value doesn't account for nav height
**How to avoid:** Set `top: var(--nav-height)` (4rem) on the sticky filter bar. Ensure z-index is below nav (which is fixed) but above gallery content.
**Warning signs:** Filter bar scrolls behind or in front of nav

## Code Examples

### Build Script: Process Images with Sharp
```javascript
// scripts/process-images.js
// Source: https://sharp.pixelplumbing.com/
import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const SOURCE_DIR = join(process.env.HOME, 'Pictures/cars');
const OUTPUT_DIR = 'public/images/gallery';
const MAX_WIDTH = 2000;
const LQIP_SIZE = 16;

async function processImage(inputPath, outputName) {
  // Full-size WebP
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  await image
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(OUTPUT_DIR, `${outputName}.webp`));

  // LQIP base64
  const lqipBuffer = await sharp(inputPath)
    .resize(LQIP_SIZE)
    .webp({ quality: 20 })
    .toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  return {
    filename: `${outputName}.webp`,
    width: Math.min(metadata.width, MAX_WIDTH),
    height: Math.round(metadata.height * (Math.min(metadata.width, MAX_WIDTH) / metadata.width)),
    lqip,
  };
}
```

### Gallery Data File
```javascript
// src/data/gallery-images.js
export const galleryImages = [
  {
    id: 'nissan-gtr-r34-blue',
    src: '/images/gallery/nissan-gtr-r34-blue.webp',
    lqip: 'data:image/webp;base64,UklGR...',
    width: 2000,
    height: 1333,
    category: 'jdm',
    caption: 'Nissan GT-R R34',
    alt: 'Blue Nissan GT-R R34 photographed at sunset',
  },
  // ... more images
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'jdm', label: 'JDM' },
  { id: 'euro', label: 'Euro' },
  { id: 'supercar', label: 'Supercar' },
  { id: 'american-muscle', label: 'American Muscle' },
  { id: 'track', label: 'Track/Motorsport' },
];
```

### PhotoSwipe with Dynamic Captions
```javascript
// Source: https://photoswipe.com/getting-started/ + dynamic caption plugin
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipeDynamicCaption from 'photoswipe-dynamic-caption-plugin';
import 'photoswipe/style.css';
import 'photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css';

function initLightbox() {
  const lightbox = new PhotoSwipeLightbox({
    gallery: '#gallery-grid',
    children: '.gallery__item:not(.gallery__item--hidden) a',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.95,
    loop: true,
    counterEl: false,       // No image counter per user decision
    padding: { top: 20, bottom: 40, left: 0, right: 0 },
  });

  const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
    type: 'below',
    captionContent: (slide) => slide.data.element?.dataset.caption || '',
  });

  lightbox.init();
  return lightbox;
}
```

### Gradient Placeholder Generator
```javascript
// For filler images (non-real photos) -- CSS gradient rectangles
function generateGradientPlaceholder(category) {
  const gradients = {
    jdm: ['#1a1a2e', '#e94560'],
    euro: ['#1a1a2e', '#3498db'],
    supercar: ['#1a1a2e', '#f39c12'],
    'american-muscle': ['#1a1a2e', '#e74c3c'],
    track: ['#1a1a2e', '#2ecc71'],
  };
  const [from, to] = gradients[category];
  // Render as canvas, export to WebP, or use CSS gradient directly
  return `linear-gradient(135deg, ${from}, ${to})`;
}
```

### Filter Animation Sequence
```javascript
// Smooth filter: fade out -> reflow -> fade in
function animateFilter(category) {
  const items = document.querySelectorAll('.gallery__item');
  const duration = 250; // ms

  // Phase 1: Fade out non-matching
  items.forEach(item => {
    const match = category === 'all' || item.dataset.category === category;
    if (!match) item.classList.add('gallery__item--fading');
  });

  // Phase 2: After fade, hide and show
  setTimeout(() => {
    items.forEach(item => {
      const match = category === 'all' || item.dataset.category === category;
      item.classList.toggle('gallery__item--hidden', !match);
      item.classList.remove('gallery__item--fading');
    });

    // Phase 3: Fade in newly visible
    requestAnimationFrame(() => {
      const visible = document.querySelectorAll('.gallery__item:not(.gallery__item--hidden)');
      visible.forEach((item, i) => {
        item.style.animationDelay = `${i * 30}ms`;
        item.classList.add('gallery__item--entering');
      });
    });

    // Reinit PhotoSwipe for new filter scope
    reinitLightbox();
  }, duration);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Masonry.js library | CSS column-count (or experimental grid-lanes) | 2023+ | Zero JS dependency for layout |
| PhotoSwipe 4 (jQuery-era API) | PhotoSwipe 5.4 (ESM, no dependencies) | 2022 | Complete rewrite, modern API |
| Manual image optimization | sharp (or vite-imagetools) | 2020+ | Automated build pipeline |
| loading="lazy" only | LQIP blur-up + IntersectionObserver | 2020+ | Better perceived performance |

**Deprecated/outdated:**
- CSS `grid-template-rows: masonry`: Renamed to `display: grid-lanes` in spec, but neither is production-ready (experimental in Safari TP 234, Firefox behind flag)
- PhotoSwipe 4: Completely different API, do not reference v4 docs

## Open Questions

1. **Gradient placeholder visual design**
   - What we know: Need 15-30 gradient placeholder images to supplement the 29 real photos
   - What's unclear: Whether to generate these as actual WebP files (via sharp/canvas) or use CSS gradients in the HTML
   - Recommendation: Use CSS gradients applied as background-image on placeholder items. Simpler, no extra files, still looks intentional. Add a camera/car icon overlay via CSS pseudo-element to indicate "placeholder".

2. **Descriptive filenames from DSC-numbered originals**
   - What we know: Source files are DSC01745.JPG through DSC01902.JPG. PERF-05 requires descriptive filenames.
   - What's unclear: Without seeing the actual photo content, can't auto-generate semantic names
   - Recommendation: The build script renames based on the gallery data file mapping. The data file assigns descriptive names (e.g., "red-porsche-911-sunset") that the implementer writes when distributing images across categories.

3. **counterEl option availability**
   - What we know: PhotoSwipe docs show `counterEl` is not in the main options list, but the UI can be customized
   - What's unclear: Whether `counterEl: false` works as a direct option
   - Recommendation: If `counterEl` doesn't work as option, hide via CSS: `.pswp__counter { display: none; }`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAL-01 | Gallery renders with responsive columns | manual | Visual inspection at 3 breakpoints | N/A |
| GAL-02 | Filter buttons render for all 5 categories + All | manual | Visual inspection | N/A |
| GAL-03 | Filtering animates smoothly | manual | Visual inspection with DevTools | N/A |
| GAL-04 | 40-60 total images across categories | unit | Count entries in gallery-images.js | -- Wave 0 |
| GAL-05 | Images lazy-load with LQIP blur-up | manual | Network tab inspection + visual | N/A |
| GAL-06 | PhotoSwipe opens with keyboard/swipe/pinch | manual | Interactive testing on desktop + mobile | N/A |
| GAL-07 | Mobile layout is full-width single-column | manual | DevTools responsive mode at 375px | N/A |
| GAL-08 | CTA button scrolls to contact section | manual | Click test | N/A |

### Sampling Rate
- **Per task commit:** Visual inspection in browser (`npm run dev`)
- **Per wave merge:** Full responsive check at 375px, 768px, 1440px
- **Phase gate:** All 8 GAL requirements visually verified

### Wave 0 Gaps
- This phase is primarily visual/interactive -- most validation is manual browser testing
- Build script (`scripts/process-images.js`) can be validated by running it and checking output file count/sizes
- No test framework installation needed for this phase (visual components)

## Sources

### Primary (HIGH confidence)
- [PhotoSwipe Getting Started](https://photoswipe.com/getting-started/) - setup, HTML structure, ESM imports
- [PhotoSwipe Options](https://photoswipe.com/options/) - bgOpacity, loop, padding, counter, pinch
- [PhotoSwipe Data Sources](https://photoswipe.com/data-sources/) - dynamic dataSource, filtering approach
- [sharp documentation](https://sharp.pixelplumbing.com/) - resize, WebP output, buffer operations
- [sharp npm](https://www.npmjs.com/package/sharp) - version, installation

### Secondary (MEDIUM confidence)
- [PhotoSwipe Dynamic Caption Plugin](https://github.com/dimsemenov/photoswipe-dynamic-caption-plugin) - caption setup, CSS import
- [lqip-modern](https://github.com/transitive-bullshit/lqip-modern) - LQIP pattern validation (16px, quality 20, base64)
- [Chrome Masonry Update](https://developer.chrome.com/blog/masonry-update) - grid-lanes status
- [MDN Masonry Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Masonry_layout) - experimental status

### Tertiary (LOW confidence)
- [vite-imagetools npm](https://www.npmjs.com/package/vite-imagetools) - considered but not recommended for this use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - PhotoSwipe 5.4.4 verified from official docs, sharp is well-established
- Architecture: HIGH - CSS column-count masonry is proven, patterns verified from multiple sources
- Pitfalls: HIGH - PhotoSwipe width/height requirement and filter reinit documented in official docs
- Image pipeline: MEDIUM - sharp LQIP approach is well-documented but build script is custom (no existing example to copy exactly)

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable libraries, no breaking changes expected)
