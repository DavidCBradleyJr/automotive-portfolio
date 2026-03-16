# Phase 4: Animations, Polish, and Launch - Research

**Researched:** 2026-03-16
**Domain:** Scroll animations (GSAP), performance optimization, Netlify deployment
**Confidence:** HIGH

## Summary

This phase layers scroll animations onto a fully-built vanilla HTML/CSS/JS portfolio, adds a footer, fixes a hamburger menu bug, audits for SEO/performance, and deploys to Netlify. The existing codebase is well-structured with BEM CSS, component JS modules, and consistent `prefers-reduced-motion` handling.

The critical budget constraint is **<80KB total JS gzip**. Current JS bundle is 15.6KB gzip (main) + 17.4KB (PhotoSwipe, lazy-loaded). Adding GSAP core (~28KB gzip) + ScrollTrigger (~18KB gzip) would bring estimated total to ~61KB gzip -- safely under 80KB. However, GSAP should only be used for hero parallax per ANIM-02; section reveals should use lightweight IntersectionObserver + CSS transitions per ANIM-01 to keep the bundle lean.

**Primary recommendation:** Use GSAP ScrollTrigger exclusively for hero parallax (scrub-based). Use IntersectionObserver + CSS transitions for all section reveals and gallery stagger entrance. This matches the requirements (ANIM-01 vs ANIM-02) and minimizes bundle size.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Footer: Three-column layout -- Left (DB name + tagline + copyright), Center (nav links), Right (social links + Book a Shoot CTA)
- Include tagline "Where Speed Meets Art" below the name
- Copyright: "© 2026 David Bradley"
- Subtle purple border-top as separator from last section
- Social links: Instagram (@itz.dat.david) + TikTok (@itzdatdavid)
- Nav links mirror the header nav (Gallery, Video, About, BTS, Contact)
- "Book a Shoot" CTA button linking to #contact
- Section reveals: subtle and smooth -- small translateY (20-30px) with gentle fade. Content glides in, barely noticeable but polished.
- Hero parallax: medium intensity (20-30%) via GSAP ScrollTrigger -- noticeable depth separation, cinematic
- Gallery items: stagger on first scroll into view (in addition to existing filter stagger)
- Max 3-4 distinct animation types site-wide (per ANIM-03): 1. Section fade+translateY reveals, 2. Hero parallax, 3. Gallery item stagger entrance, 4. (existing) Gallery filter fade/rearrange
- All animations disabled when prefers-reduced-motion is enabled (per ANIM-04)
- Netlify with git-based CI/CD, Netlify subdomain for now (no custom domain yet)
- Create GitHub repo and push code as part of deployment
- Configure netlify.toml from scratch
- User creates Netlify account and connects during deployment
- Hamburger mobile menu overlay bug needs investigation and fix

### Claude's Discretion
- Exact GSAP ScrollTrigger configuration (start/end triggers, scrub settings)
- Section reveal trigger thresholds (how far into viewport before animation fires)
- Gallery stagger timing on initial scroll
- netlify.toml build configuration details
- Lighthouse optimization tactics (code splitting, asset hints, etc.)
- Open Graph image choice
- Heading hierarchy audit and fixes

### Deferred Ideas (OUT OF SCOPE)
- Live Instagram/TikTok API feed -- v2 feature (V2-06), explicitly out of scope per requirements
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Scroll-triggered section reveals using IntersectionObserver + CSS transitions (opacity + translateY) | IO pattern with `.section--visible` class toggle; CSS handles animation |
| ANIM-02 | GSAP ScrollTrigger used for hero parallax effect and text animations only | GSAP 3.14.2 + ScrollTrigger plugin; `scrub: true` on hero image yPercent |
| ANIM-03 | Maximum 3-4 distinct animation types site-wide | 4 types defined: section reveals, hero parallax, gallery stagger, existing filter animation |
| ANIM-04 | prefers-reduced-motion respected -- all animations disabled | `gsap.matchMedia()` for GSAP animations; existing CSS `@media (prefers-reduced-motion)` patterns |
| ANIM-05 | Staggered gallery item entrance animations on filter change | Already implemented in gallery.js; extend with IO-based initial scroll entrance |
| FOOT-01 | Footer with name/copyright, social links, nav links | HTML + CSS in footer component pair; three-column layout |
| FOOT-02 | "Book a Shoot" CTA in footer | Anchor button to #contact in right column |
| PERF-01 | Lighthouse performance >= 90 on mobile | Bundle budget analysis, asset optimization, preload hints |
| PERF-02 | LCP < 2.5 seconds | Hero image already has fetchpriority="high"; verify no render-blocking |
| PERF-03 | Total JavaScript bundle < 80KB gzip | Current ~33KB + GSAP ~26KB = ~59KB estimated |
| PERF-04 | All images have descriptive alt text | Audit existing index.html and gallery data |
| PERF-05 | Descriptive image filenames | Already enforced via process-images.js naming convention |
| PERF-06 | Proper heading hierarchy (one H1, logical H2/H3) | Audit: H1=hero name, H2=section headings; verify no gaps |
| PERF-07 | Open Graph and Twitter Card meta tags | OG tags partially exist; add og:image, twitter:card, twitter:image |
| PERF-08 | Netlify deployment with git-based CI/CD and global CDN | netlify.toml config + GitHub repo creation |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | 3.14.2 | Animation engine for hero parallax | Industry standard for scroll-linked animations; only library needed per ANIM-02 |
| gsap/ScrollTrigger | (included) | Scroll-to-animation linking | Scrub mode for parallax; `gsap.matchMedia()` for reduced-motion |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| IntersectionObserver (native) | Browser API | Section reveal triggers, gallery scroll stagger | All non-parallax scroll animations (ANIM-01, ANIM-05 extension) |

### Already Installed (no changes)
| Library | Version | Purpose |
|---------|---------|---------|
| vite | ^6.0.0 | Build tool |
| photoswipe | ^5.4.4 | Lightbox (lazy-loaded) |
| lite-youtube-embed | ^0.3.4 | Video facade |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GSAP for section reveals | IntersectionObserver + CSS | IO is zero-cost, already used in project; GSAP would waste bundle budget |
| AOS (Animate on Scroll) | GSAP | AOS is lighter but requirements specify GSAP ScrollTrigger for hero parallax |
| Lenis/LocomotiveScroll | Nothing | Scroll hijacking is explicitly out of scope per requirements |

**Installation:**
```bash
npm install gsap
```
(Already installed during research -- in package.json)

## Architecture Patterns

### New Files to Create
```
src/
├── components/
│   ├── footer.css         # Footer styles (BEM: .footer__*)
│   ├── scroll-animations.js  # All scroll animation logic (IO reveals + GSAP parallax)
│   └── scroll-animations.css # Section reveal initial/animated states
└── (existing files modified)
    ├── main.js             # Add footer CSS import, initScrollAnimations()
    └── index.html          # Add <footer>, OG/Twitter meta, heading fixes
```

### Pattern 1: Section Reveal via IntersectionObserver + CSS
**What:** Lightweight scroll-triggered reveals using the same IO pattern already in the codebase
**When to use:** All `.section` elements (gallery, video, about, bts, social, contact)
**Example:**
```javascript
// scroll-animations.js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSectionReveals() {
  if (prefersReducedMotion) return; // Skip entirely

  const sections = document.querySelectorAll('.section');
  sections.forEach(s => s.classList.add('section--hidden'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }  // Fire when 15% visible
  );

  sections.forEach(s => revealObserver.observe(s));
}
```
```css
/* scroll-animations.css */
.section--hidden {
  opacity: 0;
  transform: translateY(25px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.section--visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Pattern 2: Hero Parallax via GSAP ScrollTrigger
**What:** Scrub-linked parallax on hero image creating depth as user scrolls
**When to use:** Hero section only
**Example:**
```javascript
// scroll-animations.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initHeroParallax() {
  // Use gsap.matchMedia for clean reduced-motion handling
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to('.hero__image', {
      yPercent: -25,         // 25% parallax intensity (within 20-30% range)
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,          // Direct scroll linkage, no smoothing delay
      },
    });
  });
}
```

### Pattern 3: Gallery Stagger on First Scroll
**What:** One-time staggered entrance when gallery section first scrolls into view
**When to use:** Gallery items on initial page load (supplements existing filter stagger)
**Example:**
```javascript
function initGalleryScrollStagger() {
  if (prefersReducedMotion) return;

  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const items = grid.querySelectorAll('.gallery__item:not(.gallery__item--hidden)');
        items.forEach((item, i) => {
          item.style.animationDelay = `${i * 30}ms`;
          item.classList.add('gallery__item--entering');
        });
        // Cleanup after animation
        const total = 300 + items.length * 30;
        setTimeout(() => {
          items.forEach(item => {
            item.classList.remove('gallery__item--entering');
            item.style.animationDelay = '';
          });
        }, total);
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(grid);
}
```

### Pattern 4: Footer Component (BEM)
**What:** Three-column responsive footer matching nav structure
**When to use:** Single footer element after last section
**Example structure:**
```html
<footer class="footer" id="footer">
  <div class="footer__container">
    <div class="footer__brand">
      <span class="footer__name">David Bradley</span>
      <span class="footer__tagline">Where Speed Meets Art</span>
      <span class="footer__copyright">&copy; 2026 David Bradley</span>
    </div>
    <nav class="footer__nav">
      <a href="#gallery" class="footer__link">Gallery</a>
      <a href="#video" class="footer__link">Video</a>
      <a href="#about" class="footer__link">About</a>
      <a href="#bts" class="footer__link">BTS</a>
      <a href="#contact" class="footer__link">Contact</a>
    </nav>
    <div class="footer__actions">
      <div class="footer__social">
        <a href="https://instagram.com/itz.dat.david" target="_blank" rel="noopener" class="footer__social-link">Instagram</a>
        <a href="https://tiktok.com/@itzdatdavid" target="_blank" rel="noopener" class="footer__social-link">TikTok</a>
      </div>
      <a href="#contact" class="btn btn--primary footer__cta">Book a Shoot</a>
    </div>
  </div>
</footer>
```

### Anti-Patterns to Avoid
- **Animating all gallery items simultaneously:** Use stagger (30ms per item) to create a wave effect, not a block flash
- **Using GSAP for simple fade-ins:** IO + CSS is zero bundle cost and already the project pattern; reserve GSAP for scroll-linked parallax only
- **Pinning sections:** No scroll hijacking per out-of-scope requirements
- **will-change on many elements:** Only use on hero image (already has it); removes GPU memory for everything else
- **Animating layout properties:** Only animate transform + opacity (composited properties) for 60fps

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-linked parallax | Manual scroll event + requestAnimationFrame | GSAP ScrollTrigger scrub | Handles resize, refresh, iOS bounce, performance automatically |
| Reduced motion detection for GSAP | Manual matchMedia listener + cleanup | `gsap.matchMedia()` | Auto-reverts animations when conditions change, handles cleanup |
| Netlify caching headers | Manual cache-control per asset | Netlify auto-hashed asset caching | Vite hashes filenames; Netlify CDN caches immutable assets automatically |
| SPA-style routing | Custom redirect logic | netlify.toml `[[redirects]]` | Not needed -- this is a single HTML file, not an SPA with routing |

**Key insight:** GSAP ScrollTrigger handles edge cases (iOS rubber-banding, resize recalculation, pin spacing) that would take hundreds of lines to handle manually. For everything else, native browser APIs suffice.

## Common Pitfalls

### Pitfall 1: GSAP ScrollTrigger + CSS scroll-behavior: smooth Conflict
**What goes wrong:** `scroll-behavior: smooth` on `html` can interfere with ScrollTrigger's scroll position calculations
**Why it happens:** Smooth scrolling delays the scroll position updates that ScrollTrigger relies on
**How to avoid:** This project already has `scroll-behavior: smooth` on `html`. It works fine with basic `scrub: true` parallax. Only becomes an issue with ScrollTrigger pins and snapping (which we're not using).
**Warning signs:** Parallax jitter or delayed response

### Pitfall 2: Gallery Initial Stagger Conflicts with Filter Stagger
**What goes wrong:** If user clicks a filter before the initial scroll stagger completes, both animations collide
**Why it happens:** Two animation systems targeting the same elements simultaneously
**How to avoid:** Set a flag (`galleryInitialAnimDone`) after the first scroll stagger completes. The existing `filterGallery()` function already has its own stagger logic -- just ensure the initial scroll entrance has completed or been cancelled before filter animations can run.
**Warning signs:** Gallery items flickering or stuck at opacity 0

### Pitfall 3: Hamburger Menu Bug (iOS Scroll Lock)
**What goes wrong:** The overlay "acts weird" after scrolling past the first section
**Why it happens:** Likely the `position: fixed` + `top: -${savedScrollY}px` scroll lock pattern has an edge case. The `savedScrollY` may be captured incorrectly, or the `window.scrollTo(0, savedScrollY)` restore on close jumps incorrectly after the hero exits the viewport.
**How to avoid:** Debug by logging `savedScrollY` values. Check if the `no-scroll` class body styling interacts with the fixed nav. The iOS scroll lock pattern (`position: fixed; top: -Npx`) is correct but the restore scroll may need `{ behavior: 'instant' }` to avoid smooth-scrolling during restoration.
**Warning signs:** Page jumps to wrong position on overlay close; overlay doesn't cover full viewport

### Pitfall 4: GSAP Bundle Bloat via Unnecessary Imports
**What goes wrong:** Importing `gsap` pulls in CSSPlugin, core timeline, and other features that inflate the bundle
**Why it happens:** GSAP core includes CSSPlugin automatically; tree-shaking can't remove it because it's registered internally
**How to avoid:** Accept the core cost (~28KB gzip) as unavoidable. Do NOT import additional plugins (MotionPathPlugin, TextPlugin, etc.). Only import `gsap` and `gsap/ScrollTrigger`.
**Warning signs:** JS bundle exceeding 70KB gzip

### Pitfall 5: Open Graph Image Path
**What goes wrong:** OG image tag uses relative path or localhost URL
**Why it happens:** OG crawlers (Facebook, Twitter) need absolute URLs
**How to avoid:** Use a full absolute URL for `og:image`. Since we're deploying to Netlify subdomain and don't know the URL yet, use a relative path `/images/og-image.webp` and add `og:url` meta tag. Netlify's deploy URL will be known post-deploy. Alternatively, create the image and use a placeholder URL to update later.
**Warning signs:** Social previews show no image or broken image

### Pitfall 6: Lighthouse Mobile Score Killers
**What goes wrong:** Score drops below 90 due to common oversights
**Why it happens:** Google Fonts render-blocking, uncompressed assets, missing meta tags
**How to avoid:**
- Google Fonts already uses `display=swap` (good)
- Add `<meta name="description">` if missing
- Verify hero image is under 200KB (already enforced)
- Ensure GSAP is not loaded as render-blocking (Vite module scripts are deferred by default -- safe)
- Run `npx vite build` and verify total JS gzip < 80KB
**Warning signs:** Lighthouse flags "render-blocking resources" or "reduce unused JavaScript"

## Code Examples

### GSAP ScrollTrigger Setup (Hero Parallax)
```javascript
// Source: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  initSectionReveals();
  initHeroParallax();
  initGalleryScrollStagger();
}

function initHeroParallax() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to('.hero__image', {
      yPercent: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}
```

### netlify.toml Configuration
```toml
# Source: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Twitter Card Meta Tags
```html
<!-- Add alongside existing OG tags in index.html -->
<meta property="og:image" content="/images/og-image.webp" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="David Bradley | Automotive Photography" />
<meta name="twitter:description" content="Where Speed Meets Art — premium automotive photography portfolio" />
<meta name="twitter:image" content="/images/og-image.webp" />
<meta name="description" content="David Bradley — premium automotive photography portfolio. Where Speed Meets Art." />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AOS library for scroll reveals | IntersectionObserver + CSS | 2020+ | Zero dependency, same effect |
| Scroll event listeners + rAF | GSAP ScrollTrigger / IO | 2020+ | Better performance, less code |
| jQuery animate | GSAP 3 | 2019 | 80% smaller, 10x faster |
| Manual deploy via FTP | Netlify git-based CI/CD | 2018+ | Auto-deploy on push, CDN, HTTPS free |

**Deprecated/outdated:**
- `ScrollTrigger.matchMedia()` (static method): Use `gsap.matchMedia()` instead (GSAP 3.11+). The old API still works but the new one is cleaner.
- GSAP 2.x syntax (`TweenMax`, `TimelineMax`): Use `gsap.to()`, `gsap.timeline()` instead.

## Open Questions

1. **Hamburger menu bug root cause**
   - What we know: Overlay "acts weird" after scrolling past the first section. The scroll lock uses `position: fixed; top: -${savedScrollY}px` pattern.
   - What's unclear: Exact reproduction steps and whether it's iOS-specific or cross-browser
   - Recommendation: First task should include bug investigation. Most likely fix: ensuring `savedScrollY` captures correctly and `scrollTo` restore uses `behavior: 'instant'`

2. **OG image source**
   - What we know: No og:image tag exists yet. Need a representative image for social sharing.
   - What's unclear: Which image to use (hero placeholder? gallery image?)
   - Recommendation: Use the hero placeholder image or create a branded OG image (1200x630). A gallery image of a real car would be ideal since it represents the work.

3. **Netlify subdomain URL for absolute OG URLs**
   - What we know: Final Netlify URL won't be known until first deploy
   - What's unclear: Whether relative OG image paths work for all social crawlers
   - Recommendation: Use relative path initially, update to absolute after first deploy. Or use `og:url` meta tag which helps crawlers resolve relative paths.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing + Lighthouse CLI |
| Config file | None -- no automated test framework in project |
| Quick run command | `npm run build && npx vite preview` |
| Full suite command | `npx lighthouse http://localhost:4173 --output=json --chrome-flags="--headless"` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Sections fade+translateY on scroll | manual | Visual inspection in browser | N/A |
| ANIM-02 | Hero parallax on scroll | manual | Visual inspection in browser | N/A |
| ANIM-03 | Max 3-4 animation types | manual | Code review -- count distinct animation types | N/A |
| ANIM-04 | Reduced motion disables animations | manual | Toggle in OS settings, verify no motion | N/A |
| ANIM-05 | Gallery stagger on scroll | manual | Visual inspection on first scroll to gallery | N/A |
| FOOT-01 | Footer with name, social, nav | manual | Visual inspection | N/A |
| FOOT-02 | Book a Shoot CTA in footer | manual | Click CTA, verify scrolls to #contact | N/A |
| PERF-01 | Lighthouse >= 90 mobile | smoke | `npx lighthouse URL --preset=perf --output=json` | No -- Wave 0 |
| PERF-02 | LCP < 2.5s | smoke | Lighthouse audit (included in PERF-01) | No -- Wave 0 |
| PERF-03 | JS < 80KB gzip | unit | `npm run build` -- check output sizes | No -- Wave 0 |
| PERF-04 | All images have alt text | smoke | grep for `<img` without `alt=` in index.html and gallery data | No -- Wave 0 |
| PERF-05 | Descriptive filenames | smoke | Check /images/ directory for IMG_*.* patterns | No -- Wave 0 |
| PERF-06 | Heading hierarchy | smoke | Parse index.html for H1/H2/H3 order | No -- Wave 0 |
| PERF-07 | OG + Twitter meta tags | smoke | grep for og:image, twitter:card in index.html | No -- Wave 0 |
| PERF-08 | Netlify deployment | manual | Visit deployed URL | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` -- verify bundle sizes
- **Per wave merge:** Visual browser check + Lighthouse run
- **Phase gate:** Lighthouse mobile >= 90 on deployed Netlify URL

### Wave 0 Gaps
- [ ] No automated test framework exists -- all validation is manual or build-output based
- [ ] Lighthouse CLI check can be scripted as a simple shell command post-deploy
- [ ] Alt text and heading hierarchy audits can be done via grep during implementation

*(No test framework to install -- project is vanilla HTML/CSS/JS with manual QA. Lighthouse CLI serves as the automated performance gate.)*

## JS Bundle Budget Analysis

**Current state (pre-GSAP):**
| Chunk | Raw | Gzip | Notes |
|-------|-----|------|-------|
| index.js (main) | 51.17 KB | 15.60 KB | App code + gallery data + lite-youtube |
| photoswipe.esm.js | 60.45 KB | 17.43 KB | Lazy-loaded on lightbox open |
| **Total loaded eagerly** | 51.17 KB | **15.60 KB** | |
| **Total incl. lazy** | 111.62 KB | **33.03 KB** | |

**Projected state (with GSAP):**
| Chunk | Estimated Gzip | Notes |
|-------|---------------|-------|
| index.js (main + GSAP core + ScrollTrigger) | ~42 KB | GSAP core ~28KB + ST ~18KB, but Vite tree-shakes; estimate ~26KB added |
| photoswipe.esm.js (lazy) | ~17.4 KB | Unchanged, lazy-loaded |
| **Total loaded eagerly** | **~42 KB** | Well under 80KB |
| **Total incl. lazy** | **~59 KB** | Comfortable margin |

**Risk:** LOW. Even worst case (no tree-shaking on GSAP) = 15.6 + 28 + 18 = 61.6KB gzip eagerly loaded. Still under 80KB. PhotoSwipe is lazy-loaded and only fetched on lightbox open.

**Mitigation if needed:** Dynamically import GSAP after hero image loads (already deferred by module script).

## Sources

### Primary (HIGH confidence)
- GSAP 3.14.2 installed locally -- verified file sizes from node_modules/gsap/dist/
- Existing codebase -- read all component JS/CSS files directly
- Vite build output -- ran `npm run build` to measure actual bundle sizes

### Secondary (MEDIUM confidence)
- [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) -- scrub, start/end configuration
- [gsap.matchMedia() docs](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) -- reduced motion pattern
- [Netlify Vite deployment guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) -- netlify.toml configuration
- [Netlify file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/) -- headers, redirects
- [GSAP Bundlephobia](https://bundlephobia.com/package/gsap) -- bundle size reference

### Tertiary (LOW confidence)
- [GSAP forum on ScrollTrigger + matchMedia](https://gsap.com/community/forums/topic/27141-scrolltriggermatchmedia-and-prefers-reduced-motion/) -- community patterns for reduced motion

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- GSAP 3.14.2 installed and verified; IO is native browser API
- Architecture: HIGH -- follows established project patterns (BEM, component pairs, IO usage)
- Pitfalls: HIGH -- hamburger bug is the main unknown; all other pitfalls are well-documented
- Bundle budget: HIGH -- measured actual sizes from build output and GSAP dist files
- Netlify deployment: MEDIUM -- standard Vite config but user-dependent account setup

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable domain -- GSAP 3.x, Netlify, vanilla JS)
