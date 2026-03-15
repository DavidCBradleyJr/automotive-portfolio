# Technology Stack

**Project:** David Bradley Automotive Photography Portfolio
**Researched:** 2026-03-14
**Overall confidence:** HIGH

## Decision: Vanilla HTML/CSS/JS + Vite (not Astro)

This is a single-page site with no routing, no content collections, no blog, no multi-page structure. Astro's strengths (islands architecture, content collections, multi-page routing, zero-JS static rendering) solve problems this project does not have. Vite provides the dev server, HMR, build optimization, and asset pipeline needed -- without the abstraction tax of a framework for a single `index.html`.

**Why not Astro:** Astro 6 (released 2026-03-10) is excellent for content-heavy multi-page static sites. For a single scroll page with GSAP animations and a lightbox, Astro adds a `.astro` template layer and component model that provide no benefit over vanilla HTML. The project needs JS for animations (GSAP) anyway, so Astro's "zero JS by default" selling point is moot. Astro 6 also requires Node 22+, which is an unnecessary constraint.

**Why not Next.js:** Massively over-engineered for a static single-page portfolio. React runtime overhead, server components, routing -- none of it applies here.

## Recommended Stack

### Build Tool
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vite | ^6.x | Dev server, HMR, build pipeline | Fastest dev experience for vanilla HTML/CSS/JS. Native ES modules, instant HMR, optimized production builds with Rollup under the hood. No framework lock-in. | HIGH |

### Core Frontend
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| HTML5 | - | Page structure | Single-page scroll site. Semantic sections for hero, gallery, about, video, BTS, booking, contact. No template language needed. | HIGH |
| CSS3 (vanilla) | - | Styling, layout, dark theme | CSS custom properties for theming (purple accent, dark backgrounds). CSS Grid + Flexbox for gallery layout. `@media` for responsive. No Tailwind -- this is a bespoke design, not a utility-class project. | HIGH |
| Vanilla JavaScript (ES modules) | - | Interactivity, orchestration | Scroll behavior, gallery filtering, form validation. ES modules via Vite. No React/Vue/Svelte -- zero framework overhead for a page that is fundamentally a document with animations. | HIGH |

### Animation
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| GSAP | ^3.14 | Scroll animations, transitions, motion | Industry standard for web animation. ScrollTrigger for scroll-linked reveals. SplitText for text animations. All plugins now FREE (including commercial use) since 2025 Webflow acquisition. Spring-based easing feels premium. Nothing else comes close for timeline-based animation control. | HIGH |
| GSAP ScrollTrigger | (included) | Scroll-linked animation | Trigger animations on scroll position. Scrub animations to scroll progress. Pin sections during scroll. Essential for the cinematic single-page scroll experience. | HIGH |
| GSAP ScrollSmoother | (included) | Smooth scroll behavior | Smooth, momentum-based scrolling that wraps native scroll. Creates the premium "feel" expected on high-end portfolio sites. Previously $99/yr plugin, now free. | HIGH |

**Why not AOS (Animate on Scroll):** AOS handles basic fade/slide reveals but cannot do timeline sequencing, scroll-scrubbed animations, or text splitting. For a "premium feel" portfolio, AOS produces generic results. GSAP is strictly more capable and now equally free.

**Why not Framer Motion:** React-only. Not applicable to vanilla JS stack.

**Why not CSS-only animations + Intersection Observer:** Sufficient for basic reveals, but cannot achieve scroll-scrubbed parallax, staggered timelines, or smooth scroll. Would require rebuilding what GSAP already provides, poorly.

### Gallery & Lightbox
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PhotoSwipe | ^5.4.4 | Lightbox for full-screen image viewing | Best-in-class lightbox. ES module distribution, no build step required. 15% smaller than v4. Spring-based gesture animations. Responsive image support via srcset. Respects prefers-reduced-motion. CSS-variable-based theming (easy dark/purple customization). Zero dependencies. | HIGH |

Gallery grid/masonry layout will be built with CSS Grid -- no library needed. Category filtering (JDM, Euro, Muscle, Track) is trivial vanilla JS (data attributes + CSS class toggling). PhotoSwipe handles only the lightbox overlay when an image is clicked.

**Why not lightGallery:** Heavier, jQuery legacy, commercial license required for paid products. PhotoSwipe is simpler and lighter.

**Why not nanogallery2:** Opinionated about gallery layout (forces its own grid). We want custom CSS Grid control.

**Why not GLightbox:** Good alternative but less maintained. PhotoSwipe has stronger community and documentation.

### Form Handling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Formspree | (service) | Booking/inquiry form submission | Platform-agnostic -- works regardless of hosting provider. 50 free submissions/month (sufficient for portfolio leads). Simple HTML form action attribute, zero JS required for basic usage. Does not lock deployment to Netlify. Spam protection via reCAPTCHA. | HIGH |

**Why not Netlify Forms:** Locks you into Netlify for hosting. Recent credit-based billing changes (2025-2026) mean form submissions consume shared account credits, and exceeding limits pauses ALL projects on the account. Formspree decouples form handling from hosting.

**Why not a custom serverless function:** Over-engineered. This is a contact form, not a transaction pipeline.

### Typography (Google Fonts)
| Font | Weight(s) | Role | Why | Confidence |
|------|-----------|------|-----|------------|
| Orbitron | 400, 700, 900 | Display headings, hero text | Geometric sans-serif designed for display. Futuristic, technical feel with sharp geometric edges. Reads "precision engineering" -- perfect for automotive. The go-to free futuristic display font. | HIGH |
| Space Grotesk | 300, 400, 500, 700 | Body text, UI elements, nav | Proportional sans-serif variant of Space Mono. Clean, technical, highly legible at small sizes. Pairs naturally with Orbitron's geometry. Variable font available for optimal loading. | HIGH |

**Why not Rajdhani:** Good alternative but slightly too "soft" for the gearhead aesthetic. Space Grotesk has sharper geometry.

**Why not Inter/Plus Jakarta Sans:** Too generic. Every SaaS landing page uses these. A photography portfolio needs distinctive typography.

**Why not custom/paid fonts:** Unnecessary complexity and cost. Orbitron + Space Grotesk nail the aesthetic from Google Fonts.

### Icons
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Lucide Icons (SVG) | latest | Social links, nav, UI elements | Open source, consistent stroke-based icons. Copy SVGs directly into HTML -- no JS runtime, no icon font overhead. Customizable stroke width and color via CSS. | MEDIUM |

**Alternative:** Inline SVGs hand-crafted. For a small icon set (social links, menu, close, arrow), custom SVGs may be cleaner than pulling a library. Decide during implementation.

### Deployment
| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| Netlify | Static hosting, CDN, SSL | Best DX for static sites. Git-based deploys (push to main = deploy). Free tier generous for portfolio traffic. Global CDN. Automatic HTTPS. Preview deploys for branches. CLI mirrors production locally. | HIGH |

**Why not Vercel:** Vercel is optimized for Next.js/React ecosystem. For vanilla static sites, Netlify's feature set (redirects via `_redirects` file, headers config, form handling as backup) is more natural. Both are excellent; Netlify wins slightly for non-framework static sites.

**Why not GitHub Pages:** No preview deploys, no redirect rules, no serverless functions, no form handling. Fine for docs sites, underpowered for a professional portfolio.

**Why not Cloudflare Pages:** Strong contender but less mature DX tooling compared to Netlify. Worth considering if performance benchmarks matter (Cloudflare's edge network is larger).

### Image Optimization
| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| Manual WebP/AVIF conversion | Image format optimization | For v1 with placeholder images, manual conversion is sufficient. When real photography is added, consider `sharp` in a build script or Netlify Image CDN for automatic optimization. | MEDIUM |
| `loading="lazy"` | Native lazy loading | Built into HTML. No JS library needed. Essential for a photo-heavy page. | HIGH |
| `<picture>` + `srcset` | Responsive images | Serve appropriate sizes per viewport. Critical for photography sites where images are the product. | HIGH |

### Video Embed
| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| YouTube/Vimeo embed (lite) | Video reel section | Use `lite-youtube-embed` or `lite-vimeo-embed` for facade pattern -- loads a thumbnail, only loads the full iframe on click. Saves ~500KB of initial page weight per embed. | HIGH |

## Project Structure

```
automotive-portfolio/
  index.html              # Single page, all sections
  css/
    variables.css          # Theme: colors, spacing, typography
    reset.css              # Modern CSS reset
    main.css               # Layout, components
    responsive.css         # Media queries
  js/
    main.js                # App init, scroll behavior
    gallery.js             # Filtering, PhotoSwipe init
    animations.js          # GSAP timelines, ScrollTrigger
    form.js                # Form validation, Formspree submit
  assets/
    images/                # Placeholder images (WebP)
    fonts/                 # Self-hosted if needed (or Google Fonts CDN)
    icons/                 # SVG icons
  vite.config.js           # Vite configuration
  package.json
  netlify.toml             # Netlify deploy config
```

## Color System (CSS Custom Properties)

```css
:root {
  /* Dark theme foundation */
  --color-bg-primary: #0a0a0f;       /* Near-black with blue undertone */
  --color-bg-secondary: #12121a;     /* Slightly lighter for cards/sections */
  --color-bg-tertiary: #1a1a2e;      /* Elevated surfaces */

  /* Purple accent spectrum */
  --color-accent: #7c3aed;           /* Primary purple (violet-600) */
  --color-accent-light: #a78bfa;     /* Hover/active states */
  --color-accent-glow: rgba(124, 58, 237, 0.3); /* Glow effects */

  /* Text hierarchy */
  --color-text-primary: #f0f0f5;     /* Headings, primary content */
  --color-text-secondary: #a0a0b0;   /* Body text, descriptions */
  --color-text-muted: #606070;       /* Captions, metadata */
}
```

## Installation

```bash
# Initialize project
npm create vite@latest automotive-portfolio -- --template vanilla
cd automotive-portfolio

# Core dependencies
npm install gsap photoswipe

# Dev dependencies (Vite included via create-vite)
# No additional dev deps needed for vanilla stack

# Optional: lite embed for video section
npm install @nicknisi/lite-youtube-embed
# or
npm install lite-vimeo-embed
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Vite + Vanilla | Astro 6 | Over-abstraction for single-page. Component model adds complexity without benefit. Node 22 requirement. |
| Framework | Vite + Vanilla | Next.js 15 | React runtime, server components, routing -- none applicable. Massive overhead. |
| Animation | GSAP 3.14 | AOS | Cannot do scroll-scrub, timelines, text splitting. Generic results. |
| Animation | GSAP 3.14 | Framer Motion | React-only. Incompatible with vanilla stack. |
| Lightbox | PhotoSwipe 5.4 | lightGallery | Heavier, jQuery legacy, commercial license for paid use. |
| Forms | Formspree | Netlify Forms | Vendor lock-in to Netlify. Credit-based billing risks. |
| Hosting | Netlify | Vercel | Vercel optimized for Next.js ecosystem. Netlify better for non-framework static. |
| Hosting | Netlify | GitHub Pages | No preview deploys, no redirect config, no form fallback. |
| CSS | Vanilla CSS | Tailwind CSS | Bespoke design needs bespoke CSS. Utility classes add cognitive overhead for a solo visual project. |
| Fonts | Orbitron + Space Grotesk | Inter + system fonts | Too generic. Portfolio needs distinctive, on-brand typography. |

## Performance Budget

For a photography portfolio, performance is non-negotiable. Target:

| Metric | Target | How |
|--------|--------|-----|
| First Contentful Paint | < 1.5s | Inline critical CSS, preload hero image |
| Largest Contentful Paint | < 2.5s | Optimize hero image, use WebP/AVIF |
| Total JS bundle | < 80KB gzip | GSAP (~25KB core + plugins), PhotoSwipe (~15KB), app code (~10KB) |
| Cumulative Layout Shift | < 0.1 | Set explicit dimensions on all images, reserve space for lazy content |
| Time to Interactive | < 3s | Defer non-critical JS, lazy load below-fold content |

## Sources

- [Astro 6.0 Release](https://astro.build/blog/astro-6/) - Astro 6 features and Node 22 requirement
- [GSAP Free License](https://gsap.com/community/forums/topic/44531-new-license-2025-and-wordpress-plugin/) - All GSAP plugins now free including commercial
- [GSAP npm](https://www.npmjs.com/package/gsap) - v3.14.2 latest
- [PhotoSwipe](https://photoswipe.com/) - v5.4.4, ES module architecture
- [PhotoSwipe GitHub Releases](https://github.com/dimsemenov/PhotoSwipe/releases) - Latest release details
- [Netlify Forms Pricing Concerns](https://dev.to/allenarduino/netlify-forms-is-getting-expensive-here-are-the-best-alternatives-in-2026-3a7k) - Credit-based billing issues
- [Formspree vs Netlify Forms](https://vanillawebsites.co.uk/blog/netlify-forms-vs-formspree/) - Platform comparison
- [Orbitron - Google Fonts](https://fonts.google.com/specimen/Orbitron) - Geometric futuristic display font
- [Space Grotesk - Google Fonts](https://fonts.google.com/specimen/Space+Grotesk) - Technical sans-serif body font
- [GSAP ScrollTrigger](https://gsap.com/scroll/) - Scroll animation documentation
- [Netlify vs Vercel 2025](https://www.netlify.com/guides/netlify-vs-vercel/) - Platform comparison
- [Top Static Site Generators 2025](https://cloudcannon.com/blog/the-top-five-static-site-generators-for-2025-and-when-to-use-them/) - Framework landscape
