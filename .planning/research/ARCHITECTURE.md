# Architecture Research

**Domain:** Single-page automotive photography portfolio
**Researched:** 2026-03-14
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Nav    │  │   Hero   │  │ Gallery  │  │  About   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Video   │  │   BTS    │  │ Contact  │  │  Footer  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     Behavior Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Scroll Mgr   │  │ Gallery Ctrl │  │ Animation    │       │
│  │ (IO + GSAP)  │  │ (Filter/LB)  │  │ Orchestrator │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                     Performance Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Image Loader  │  │ Lazy Load    │  │ LQIP /       │       │
│  │ (srcset/fmt)  │  │ (IO-based)   │  │ Placeholder  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                     External Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Form Service  │  │ Video Host   │  │ Social Feed  │       │
│  │ (Formspree)   │  │ (YouTube/    │  │ (Instagram   │       │
│  │               │  │  Vimeo)      │  │  embed/API)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Section Order (Storytelling + Conversion Flow)

The section order follows a deliberate narrative arc: hook, prove, connect, convert.

| Order | Section | Purpose | Rationale |
|-------|---------|---------|-----------|
| 1 | **Nav** (fixed) | Orientation, quick-jump | Always visible; anchors the page identity |
| 2 | **Hero** | Emotional hook | Full-bleed cinematic image sets the tone immediately. Single CTA: "View My Work" scroll-to-gallery |
| 3 | **Gallery** | Prove the craft | Right after the hook -- visitor came for photos, show them fast. Category filtering (JDM, Euro, Muscle, Track) |
| 4 | **Video Reel** | Deepen engagement | After static proof, motion adds dimension. Autoplay-muted teaser or embedded player |
| 5 | **About** | Build personal connection | Now that work has impressed, let the person behind it become real |
| 6 | **Behind the Scenes** | Authenticity + differentiation | Shows process, gear, dedication. Separates David from template portfolios |
| 7 | **Social / Instagram** | Social proof + freshness | Shows active presence, recent work. Validates that David is current |
| 8 | **Contact / Booking** | Conversion | By this point, visitor has been primed through the full funnel. Inquiry form with premium feel |
| 9 | **Footer** | Wrap-up | Copyright, social links, secondary nav |

**Why this order works:** The hero hooks emotionally. Gallery immediately delivers on the promise (do not make visitors wait through About/Bio to see photos -- that kills bounce rate). Video deepens the experience. About humanizes. BTS differentiates. Social validates. Contact converts. Each section builds on the previous one's emotional momentum.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Nav | Fixed navigation, smooth-scroll links, active section highlighting | Sticky header with scroll-spy via Intersection Observer |
| Hero | Full-viewport cinematic opener, brand identity, single CTA | Full-bleed background image with overlay text, ken-burns or subtle parallax |
| Gallery | Filterable photo grid, lightbox viewing, category navigation | CSS Grid with filter buttons, lightbox overlay for full-view |
| Video Reel | Embedded cinematic video playback | YouTube/Vimeo iframe with facade pattern (thumbnail until click) |
| About | Photographer story, portrait, credentials | Two-column layout: photo + text, scroll-reveal |
| BTS | Behind-the-scenes content, gear, process | Image carousel or mini-gallery with captions |
| Social Wall | Instagram feed display | Embedded feed or static grid of recent posts |
| Contact | Booking inquiry form, contact methods | Form with validation, submits to Formspree/Netlify Forms |
| Footer | Copyright, social icons, back-to-top | Simple dark footer with icon links |

## Recommended Project Structure

```
src/
├── index.html              # Single-page entry point, all sections
├── css/
│   ├── main.css            # Global styles, CSS custom properties (theme)
│   ├── sections/
│   │   ├── nav.css         # Navigation styles
│   │   ├── hero.css        # Hero section
│   │   ├── gallery.css     # Gallery grid + lightbox
│   │   ├── video.css       # Video embed section
│   │   ├── about.css       # About section
│   │   ├── bts.css         # Behind the scenes
│   │   ├── social.css      # Social wall
│   │   ├── contact.css     # Contact/booking form
│   │   └── footer.css      # Footer
│   └── utilities.css       # Reusable utility classes, animations
├── js/
│   ├── main.js             # Entry point, initializes all modules
│   ├── modules/
│   │   ├── nav.js          # Scroll-spy, mobile menu toggle
│   │   ├── gallery.js      # Filtering, lightbox, masonry layout
│   │   ├── video.js        # Facade pattern for video embeds
│   │   ├── scroll-animations.js  # IO + GSAP scroll reveals
│   │   ├── image-loader.js       # Lazy loading, LQIP, srcset
│   │   ├── social.js       # Instagram feed loading
│   │   └── form.js         # Form validation + submission
│   └── utils/
│       ├── dom.js          # DOM helper functions
│       └── throttle.js     # Scroll/resize throttling
├── assets/
│   ├── images/
│   │   ├── hero/           # Hero background images
│   │   ├── gallery/        # Portfolio images (placeholder v1)
│   │   │   ├── jdm/
│   │   │   ├── euro/
│   │   │   ├── muscle/
│   │   │   └── track/
│   │   ├── about/          # Photographer portrait
│   │   ├── bts/            # Behind the scenes photos
│   │   └── placeholders/   # LQIP blurred thumbnails
│   ├── video/              # Video poster images
│   └── fonts/              # Custom typography files
└── vendor/                 # Third-party (GSAP, etc.)
```

### Structure Rationale

- **css/sections/:** One CSS file per section keeps styles scoped and maintainable. A single-page site can get messy fast without clear boundaries.
- **js/modules/:** Each module owns one concern. gallery.js never touches nav behavior. scroll-animations.js is a shared orchestrator that multiple sections consume.
- **assets/images/ by category:** Mirrors the gallery filter categories, making it trivial to swap placeholders for real photos later.
- **No framework folder complexity:** This is a static site. No components/, no stores/, no routes/. The HTML is the component tree.

## Architectural Patterns

### Pattern 1: Section-as-Module

**What:** Each page section is an independent module with its own CSS, JS initialization, and DOM scope. Modules are initialized from `main.js` and communicate through DOM events, not direct imports of each other.
**When to use:** Always -- this is the core pattern for this project.
**Trade-offs:** Slight overhead in event wiring vs. direct coupling, but keeps sections independently testable and re-orderable.

```javascript
// js/modules/gallery.js
export function initGallery() {
  const gallery = document.querySelector('[data-section="gallery"]');
  const filters = gallery.querySelectorAll('[data-filter]');
  const items = gallery.querySelectorAll('[data-category]');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;
      filterItems(items, category);
      // Emit event so scroll-animations can re-observe new visible items
      gallery.dispatchEvent(new CustomEvent('gallery:filtered', { detail: { category } }));
    });
  });
}
```

### Pattern 2: Facade Pattern for Video Embeds

**What:** Render a static thumbnail image that looks like a video player. Only load the actual iframe when the user clicks. This avoids loading 500KB+ of YouTube/Vimeo JS on every page load.
**When to use:** Always for embedded video on performance-critical pages.
**Trade-offs:** Slight delay on first play click, but eliminates massive initial payload.

```javascript
// js/modules/video.js
export function initVideoFacade() {
  const facades = document.querySelectorAll('[data-video-id]');
  facades.forEach(el => {
    el.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${el.dataset.videoId}?autoplay=1`;
      iframe.allow = 'autoplay; encrypted-media';
      el.replaceWith(iframe);
    }, { once: true });
  });
}
```

### Pattern 3: Progressive Image Loading (LQIP + Lazy Load)

**What:** Embed a tiny (20x20px) blurred placeholder as a base64 data URI. Use Intersection Observer to lazy-load the full-resolution image when it enters the viewport. Transition from blur to sharp with a CSS fade.
**When to use:** Every image below the fold. Never lazy-load the hero (LCP image).
**Trade-offs:** Requires generating LQIP thumbnails at build time. Worth the effort -- photography sites live or die by perceived load speed.

```html
<!-- HTML structure -->
<div class="img-wrapper" data-src="assets/images/gallery/jdm/photo-01.webp">
  <img src="data:image/jpeg;base64,/9j/4AAQ..." alt="JDM car" class="lqip" />
</div>
```

```javascript
// js/modules/image-loader.js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const wrapper = entry.target;
      const fullImg = new Image();
      fullImg.src = wrapper.dataset.src;
      fullImg.onload = () => {
        wrapper.classList.add('loaded');
        wrapper.querySelector('.lqip').src = fullImg.src;
      };
      observer.unobserve(wrapper);
    }
  });
}, { rootMargin: '200px' });
```

### Pattern 4: Scroll-Spy Navigation

**What:** Use Intersection Observer to track which section is currently visible and update the nav's active state accordingly. No scroll event listeners needed.
**When to use:** Fixed navigation on any single-page scroll site.
**Trade-offs:** None significant. IO is the correct tool for this.

```javascript
// js/modules/nav.js
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      activeLink?.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(section => observer.observe(section));
```

## Data Flow

### User Scroll Flow (Primary)

```
User Scrolls
    |
    v
Intersection Observer (passive, async)
    |
    ├──> Nav Module: update active link highlight
    ├──> Image Loader: load images entering viewport
    └──> Scroll Animations: trigger reveal animations (fade, slide, scale)
```

### Gallery Interaction Flow

```
User Clicks Filter Button
    |
    v
Gallery Module
    ├──> Filter items by data-category attribute (show/hide with CSS)
    ├──> Emit 'gallery:filtered' event
    │       └──> Scroll Animations re-observe newly visible items
    └──> Re-trigger masonry layout recalculation

User Clicks Gallery Image
    |
    v
Gallery Module (Lightbox)
    ├──> Create overlay with full-res image
    ├──> Trap focus inside lightbox (accessibility)
    ├──> Keyboard nav (arrow keys, Escape to close)
    └──> Preload adjacent images for smooth browsing
```

### Contact Form Flow

```
User Fills Form → Client-side Validation
    |                      |
    |  (invalid)           |  (valid)
    v                      v
Show Inline Errors    POST to Formspree/Netlify Forms
                           |
                           v
                    Show Success Message
                    (no page reload)
```

### Image Loading Flow

```
Page Load
    |
    v
Hero Image: load immediately (no lazy load, this is LCP)
    |
    v
Below-fold Images: render LQIP placeholder (base64, instant)
    |
    v
Intersection Observer fires (image enters viewport + 200px margin)
    |
    v
Fetch full-res WebP/AVIF via srcset
    |
    v
CSS transition: blur(20px) → blur(0) over 400ms
```

## Animation Strategy for Dark Automotive Aesthetic

### Principles

1. **Restrained, not flashy.** Automotive luxury is about confidence, not fireworks. Animations should feel like a camera slowly revealing a car under studio lighting.
2. **Dark-to-light reveals.** Elements emerge from the dark background. Fade + slight upward translate (20-30px) is the workhorse animation.
3. **Staggered timing.** Gallery items, text blocks, and elements within a section animate in sequence, not simultaneously. 50-100ms stagger between items.
4. **Purple accent glow.** Subtle box-shadow or text-shadow with the purple accent color on hover states. Not neon -- more like ambient light.
5. **Smooth scroll.** CSS `scroll-behavior: smooth` as baseline, with GSAP ScrollToPlugin for programmatic smooth-scroll if needed.

### Recommended Animation Library Approach

Use **Intersection Observer + CSS transitions** for simple reveals (80% of animations). Reserve **GSAP ScrollTrigger** for complex effects:

| Animation Type | Tool | When |
|----------------|------|------|
| Fade-in on scroll | IO + CSS | Section headings, text blocks, images |
| Staggered gallery reveal | IO + CSS with `transition-delay` | Gallery items appearing |
| Parallax hero | GSAP ScrollTrigger | Hero background subtle movement |
| Text split/reveal | GSAP SplitText | Hero headline dramatic entrance |
| Lightbox open/close | CSS transitions | Gallery lightbox overlay |
| Nav background change | IO callback | Nav becomes opaque after hero |

### CSS Animation Classes

```css
/* Base reveal state */
[data-reveal] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
[data-reveal-stagger] > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

[data-reveal-stagger].revealed > *:nth-child(1) { transition-delay: 0ms; }
[data-reveal-stagger].revealed > *:nth-child(2) { transition-delay: 80ms; }
[data-reveal-stagger].revealed > *:nth-child(3) { transition-delay: 160ms; }
/* ... etc */
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Portfolio v1 (current) | Static HTML/CSS/JS, placeholder images, Formspree for forms. No build step needed initially. |
| Real photos deployed | Add image optimization pipeline (Sharp/squoosh CLI). Generate WebP + AVIF + LQIP at build time. Consider a CDN (Cloudflare, Cloudinary). |
| High traffic / viral | CDN is sufficient. Static site scales infinitely behind a CDN. No server to overload. |
| CMS needed later | Add headless CMS (Contentful, Sanity) with a static site generator or light build step. Architecture stays the same, data source changes. |

### Scaling Priorities

1. **First bottleneck:** Image weight. A photography portfolio with 30+ full-res images will be 50-100MB without optimization. Solution: WebP/AVIF conversion + responsive srcset + lazy loading.
2. **Second bottleneck:** Third-party embeds (YouTube, Instagram). Solution: facade pattern for video, static snapshots or `loading="lazy"` for social embeds.

## Anti-Patterns

### Anti-Pattern 1: Loading All Gallery Images on Page Load

**What people do:** Put 40+ full-resolution images in `<img>` tags with no lazy loading.
**Why it's wrong:** 100MB+ initial payload. 15+ second load time. Google penalizes, users bounce. Photography sites are the worst offenders of this.
**Do this instead:** Lazy load everything below the fold. Use LQIP placeholders. Serve WebP/AVIF. Use srcset for responsive sizes.

### Anti-Pattern 2: Hero Video Autoplay at Full Resolution

**What people do:** Autoplay a 1080p background video in the hero section.
**Why it's wrong:** 20-50MB video download before the page is usable. Destroys mobile experience and data plans.
**Do this instead:** Use a high-quality still image for hero. If video is desired, use a facade pattern with a poster image. Or limit autoplay to a short (5-10s), heavily compressed, muted loop.

### Anti-Pattern 3: Scroll-Hijacking

**What people do:** Override native scroll behavior to create "slide-by-slide" transitions between sections.
**Why it's wrong:** Feels broken to users. Breaks accessibility. Conflicts with trackpad/touch gestures. Users hate it -- every UX study confirms this.
**Do this instead:** Use native smooth scrolling. Trigger animations on scroll position using Intersection Observer, but never fight the scroll itself.

### Anti-Pattern 4: Putting About Before Gallery

**What people do:** Structure as Hero > About > Gallery, treating it like a resume.
**Why it's wrong:** Visitors came for photos. Making them scroll through biography text before seeing work dramatically increases bounce rate.
**Do this instead:** Hero > Gallery > Video > About. Let the work speak first. The "About" earns attention only after the portfolio has impressed.

### Anti-Pattern 5: Monolithic CSS/JS Files

**What people do:** Put all styles in one 2000-line CSS file and all scripts in one 1500-line JS file.
**Why it's wrong:** Impossible to maintain, debug, or extend. One section's styles bleed into another.
**Do this instead:** One CSS file per section, one JS module per behavior. Import/concatenate at build time if desired.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Formspree / Netlify Forms | POST form data via fetch, handle response in JS | No backend needed. Free tier sufficient for portfolio contact volume. Formspree supports file uploads if needed later. |
| YouTube / Vimeo | Iframe embed with facade pattern | Use `data-video-id` attribute, load iframe on click only. Include poster image. |
| Instagram Feed | Embed widget or static image grid | Instagram's API requires auth and approval. Simpler: use an embed widget service (e.g., SnapWidget, Elfsight) or manually curate static images. |
| Google Fonts / Adobe Fonts | Link in `<head>` with `font-display: swap` | Preconnect to font CDN. Use `font-display: swap` to prevent FOIT (flash of invisible text). |
| Analytics | Google Analytics 4 or Plausible | Add script tag. Plausible is privacy-friendly and lightweight (< 1KB). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Gallery <-> Scroll Animations | Custom DOM events | Gallery emits `gallery:filtered` when layout changes, scroll module re-observes |
| Image Loader <-> All Sections | Intersection Observer | Image loader observes `[data-src]` elements globally, sections just use the attribute |
| Nav <-> All Sections | Intersection Observer | Nav observes `section[id]` elements, no coupling to section internals |
| Contact Form <-> External Service | HTTP POST (fetch) | Form module handles validation, serialization, and response display |

## Suggested Build Order

Build order follows dependency chains. Each phase produces something visually complete.

| Phase | What to Build | Depends On | Why This Order |
|-------|---------------|------------|----------------|
| 1 | **Foundation:** HTML structure (all sections as empty shells), CSS custom properties (theme colors, typography scale), global reset/base styles | Nothing | Everything else attaches to this skeleton |
| 2 | **Hero + Nav** | Foundation | Creates the first impression. Nav is needed to navigate during development. Hero establishes the visual language for all other sections. |
| 3 | **Gallery (grid + filtering)** | Foundation, theme | Core feature. Most complex component. Build early to surface design/performance issues. |
| 4 | **Image Loading Pipeline** | Gallery | Gallery needs lazy loading + LQIP to be performant. Add this before adding more images. |
| 5 | **Lightbox** | Gallery | Extends gallery. Users expect to click and see full-size images. |
| 6 | **About + BTS sections** | Foundation, theme | Simpler layout sections. Reuse patterns established by hero/gallery. |
| 7 | **Video Reel section** | Foundation | Facade pattern for embed. Independent of other sections. |
| 8 | **Contact / Booking Form** | Foundation | Form + Formspree integration. Independent but conversion-critical. |
| 9 | **Social Wall** | Foundation | Depends on external service decision. Can be a static grid initially. |
| 10 | **Scroll Animations** | All sections exist | Add animations last. They layer on top of working sections. Adding them too early makes debugging layout issues harder. |
| 11 | **Polish:** Responsive tuning, performance audit, accessibility pass | Everything | Final quality sweep. |

**Key dependency insight:** The gallery (Phase 3) and image loading pipeline (Phase 4) are the technical core. Get these right early. Everything else is simpler layout work that reuses established patterns.

## Sources

- [Pixpa: 25+ Best Photography Portfolio Website Examples](https://www.pixpa.com/blog/photography-portfolio-websites)
- [MDN: Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading)
- [FrontendTools: Image Optimization 2025](https://www.frontendtools.tech/blog/modern-image-optimization-techniques-2025)
- [Request Metrics: Complete Image Optimization Guide 2026](https://requestmetrics.com/web-performance/high-performance-images/)
- [Cloudinary: LQIP and Lazy Loading Best Practices](https://cloudinary.com/blog/cloudinary-lqip-and-lazy-loading-best-practices)
- [GSAP ScrollTrigger](https://gsap.com/scroll/)
- [Codrops: Scroll-Revealed WebGL Gallery with GSAP](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/)
- [CL Creative: Intersection Observer vs GSAP for Scroll Animations](https://www.clcreative.co/blog/should-you-use-the-intersection-observer-api-or-gsap-for-scroll-animations)
- [Masonry Grid: 1.4KB Library](https://dev.to/dangreen/masonry-grid-a-14-kb-library-that-actually-works-341n)
- [Thrive Themes: Hero Section Examples Study](https://thrivethemes.com/hero-section-examples/)
- [Prismic: Website Hero Section Best Practices](https://prismic.io/blog/website-hero-section)
- [Format: Automotive Photography Portfolios](https://www.format.com/customers/photography/automotive)
- [Pixieset: Dark Photography Websites](https://blog.pixieset.com/blog/dark-photography-websites/)

---
*Architecture research for: Single-page automotive photography portfolio*
*Researched: 2026-03-14*
