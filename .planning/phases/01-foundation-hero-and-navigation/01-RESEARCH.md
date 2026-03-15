# Phase 1: Foundation, Hero, and Navigation - Research

**Researched:** 2026-03-14
**Domain:** Static site scaffold (Vite + vanilla HTML/CSS/JS), design tokens, hero section, sticky navigation
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield scaffold of a single-page automotive photography portfolio using Vite and vanilla HTML/CSS/JS (no frameworks). The core deliverables are: a CSS custom property design token system, a cinematic full-bleed hero section with Ken Burns animation, and a sticky frosted-glass navigation bar with scroll-spy. All decisions are locked by the user (colors, fonts, layout, interaction patterns) -- research focuses on correct implementation, accessibility verification, and performance patterns.

The primary technical risk is WCAG contrast compliance: the chosen purple accent (#7C3AED) on the dark background (#0F0F0F) only achieves 3.36:1 contrast ratio, which FAILS WCAG AA for normal-sized text (requires 4.5:1). It passes for large text (3:1 threshold). This means purple must only be used as text color on headings/large text, or on filled buttons with white text (white on purple = 5.70:1, passes AA). The off-white body text (#E0E0E0) on dark background passes easily at 14.52:1.

**Primary recommendation:** Scaffold with Vite 6.x + vanilla template, establish a three-tier CSS custom property system (primitives, semantic, component), and treat the hero as the LCP element from day one with fetchpriority="high" and a placeholder image under 200KB.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Primary background:** #0F0F0F (near-black)
- **Accent color:** #7C3AED (deep violet) -- CTA buttons (filled), borders/dividers, hover glows, sparingly for text highlights
- **Hover glow:** rgba(124, 58, 237, 0.3) on interactive elements
- **Border/dividers:** rgba(124, 58, 237, 0.4) -- subtle violet
- **Primary text:** #E0E0E0 (off-white)
- **Hero text position:** Bottom-left, editorial/magazine layout
- **Hero image motion:** Subtle Ken Burns effect (slow zoom/pan)
- **Dark overlay:** Gradient bottom-up on hero for text protection
- **CTA button:** Solid #7C3AED fill with white text
- **Nav scroll behavior:** Transparent on hero, frosted glass dark bar (backdrop-filter: blur) after scrolling past hero
- **Logo:** "DB" monogram in Orbitron + "David Bradley" text; mobile collapses to monogram only
- **Nav links:** Gallery, Video, About, BTS, Contact
- **Scroll-spy:** Intersection Observer for active section highlighting
- **Nav CTA:** "Book a Shoot" solid violet button, always visible
- **Mobile:** Hamburger menu with full-screen overlay
- **Orbitron:** Hero name display + H2 section headings only, ALL CAPS for H2s
- **Space Grotesk:** Body/supporting text throughout
- **Hero name size:** 80-100px+ desktop, responsive scaling
- **Tagline:** "Where Speed Meets Art" in Space Grotesk, mixed case
- **Font loading:** Google Fonts with preconnect + display=swap

### Claude's Discretion
- Exact spacing between hero name, tagline, and CTA button
- Precise Ken Burns animation duration and direction (zoom in vs zoom out, pan direction)
- Frosted glass nav exact blur radius and background opacity
- Mobile breakpoint behavior details (font scaling, nav collapse point)
- Letter spacing (tracking) on Orbitron headings
- Exact transition timing on nav scroll behavior

### Deferred Ideas (OUT OF SCOPE)
- None -- discussion stayed within Phase 1 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Vite 6.x scaffold, vanilla HTML/CSS/JS, optimized build | Vite 6.x installation via `npm create vite@latest -- --template vanilla` then pin vite@6 in package.json |
| FOUND-02 | CSS custom properties define full design token system | Three-tier token architecture (primitives, semantic, component) documented below |
| FOUND-03 | Dark theme with off-black bg and purple accent, WCAG AA | Contrast ratios verified: #E0E0E0 on #0F0F0F = 14.52:1 PASS; #7C3AED on #0F0F0F = 3.36:1 FAIL normal text (use only as large text or on buttons) |
| FOUND-04 | Orbitron + Space Grotesk via Google Fonts, performance-safe | Preconnect + display=swap pattern documented |
| FOUND-05 | Responsive breakpoints 320px-1440px+, mobile-first | Standard breakpoints documented (480/768/1024/1440) |
| FOUND-06 | Image sizing conventions documented | Max 2000px, under 400KB, WebP, hero under 200KB as LCP |
| FOUND-07 | Smooth scroll with section anchor IDs | CSS scroll-behavior: smooth + anchor IDs pattern |
| NAV-01 | Sticky nav visible at all scroll positions | position: sticky with backdrop-filter frosted glass |
| NAV-02 | Nav links scroll smoothly to sections | Anchor links + scroll-behavior: smooth |
| NAV-03 | Active section via Intersection Observer scroll-spy | IntersectionObserver with rootMargin pattern documented |
| NAV-04 | Mobile hamburger with full-screen overlay | Toggle class pattern with CSS transitions |
| NAV-05 | "David Bradley" wordmark/logo in nav | Orbitron "DB" monogram + text, responsive collapse |
| HERO-01 | Full-viewport hero with cinematic full-bleed image | 100vh/100dvh with object-fit: cover, Ken Burns CSS animation |
| HERO-02 | Name in Orbitron with entrance animation | CSS animation on load (opacity + translateY), prefers-reduced-motion respected |
| HERO-03 | Tagline below name | Space Grotesk, positioned in bottom-left cluster |
| HERO-04 | CTA button scrolling to Gallery | Anchor link to #gallery, solid violet button |
| HERO-05 | Hero image as LCP element | fetchpriority="high", no loading="lazy", under 200KB |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 6.x | Build tool, dev server, production bundling | Required by FOUND-01; fast HMR, zero-config for vanilla JS |
| Vanilla HTML/CSS/JS | N/A | No framework | Project decision: single-page site doesn't need framework abstraction |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts (CDN) | N/A | Orbitron + Space Grotesk | Font loading via link tags, not npm packages |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite 6.x | Vite 8 (current latest) | Vite 8 uses Rolldown instead of Rollup; project requirements specify 6.x -- stick with it for stability |
| Google Fonts CDN | Self-hosted fonts | Self-hosting gives more control but adds build complexity; CDN with preconnect is fast enough and simpler |

**Installation:**
```bash
npm create vite@latest automotive-portfolio -- --template vanilla
cd automotive-portfolio
# Pin Vite 6.x in package.json: "vite": "^6.0.0"
npm install
```

**Note on Vite versioning:** `create-vite@latest` may scaffold with Vite 8. After scaffolding, edit `package.json` to set `"vite": "^6.0.0"` and re-run `npm install` to pin to 6.x as required. Alternatively, scaffold then immediately run `npm install vite@6`.

## Architecture Patterns

### Recommended Project Structure
```
/
├── index.html              # Single page entry point
├── package.json
├── vite.config.js          # Minimal Vite config (if needed)
├── public/
│   └── images/
│       └── hero-placeholder.webp  # Hero image (under 200KB)
├── src/
│   ├── main.js             # Entry point: imports CSS, initializes nav + scroll-spy
│   ├── style.css           # Global styles: reset, tokens, typography, layout
│   ├── components/
│   │   ├── nav.css         # Navigation-specific styles
│   │   ├── nav.js          # Hamburger toggle, scroll-spy, frosted glass transition
│   │   ├── hero.css        # Hero section styles + Ken Burns animation
│   │   └── hero.js         # Hero entrance animation (if JS-driven)
│   └── tokens.css          # Design token custom properties (imported first)
```

### Pattern 1: Three-Tier CSS Custom Properties
**What:** Separate raw values, semantic meanings, and component-level tokens.
**When to use:** Always -- this is the foundation every subsequent phase inherits.
**Example:**
```css
/* tokens.css - Tier 1: Primitives */
:root {
  --color-black-950: #0F0F0F;
  --color-violet-500: #7C3AED;
  --color-violet-500-30: rgba(124, 58, 237, 0.3);
  --color-violet-500-40: rgba(124, 58, 237, 0.4);
  --color-gray-200: #E0E0E0;
  --color-gray-400: #9CA3AF;
  --color-white: #FFFFFF;

  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;

  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 3rem;
  --text-hero: clamp(3rem, 8vw, 6.25rem); /* 48px -> 100px */

  /* Tier 2: Semantic */
  --color-bg: var(--color-black-950);
  --color-text: var(--color-gray-200);
  --color-text-muted: var(--color-gray-400);
  --color-accent: var(--color-violet-500);
  --color-accent-glow: var(--color-violet-500-30);
  --color-border: var(--color-violet-500-40);

  /* Tier 3: Component */
  --nav-bg: rgba(15, 15, 15, 0.85);
  --nav-blur: 12px;
  --nav-height: 4rem;
  --hero-overlay: linear-gradient(to top, rgba(15, 15, 15, 0.85) 0%, transparent 60%);
  --btn-primary-bg: var(--color-accent);
  --btn-primary-text: var(--color-white);
}
```

### Pattern 2: Ken Burns CSS Animation
**What:** Slow zoom/pan on hero background image for cinematic feel.
**When to use:** Hero section only. Respects prefers-reduced-motion.
**Example:**
```css
.hero__image {
  animation: kenburns 25s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes kenburns {
  0% {
    transform: scale(1) translate3d(0, 0, 0);
  }
  100% {
    transform: scale(1.08) translate3d(-2%, -1%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__image {
    animation: none;
  }
}
```

### Pattern 3: Scroll-Spy with Intersection Observer
**What:** Highlight the active nav link based on which section is in the viewport.
**When to use:** Navigation component.
**Example:**
```javascript
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'nav__link--active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  {
    rootMargin: '-20% 0px -80% 0px', // Trigger when section is in top 20% of viewport
    threshold: 0,
  }
);

sections.forEach((section) => observer.observe(section));
```

### Pattern 4: Frosted Glass Nav Transition
**What:** Nav starts transparent over hero, transitions to frosted glass on scroll.
**When to use:** Navigation header.
**Example:**
```javascript
const nav = document.querySelector('.nav');
const hero = document.querySelector('.hero');

const navObserver = new IntersectionObserver(
  ([entry]) => {
    nav.classList.toggle('nav--scrolled', !entry.isIntersecting);
  },
  { threshold: 0.1 }
);

navObserver.observe(hero);
```
```css
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
  background-color: transparent;
}

.nav--scrolled {
  background-color: var(--nav-bg);
  backdrop-filter: blur(var(--nav-blur));
  -webkit-backdrop-filter: blur(var(--nav-blur));
}
```

### Pattern 5: Mobile Hamburger Full-Screen Overlay
**What:** Toggle a full-screen nav overlay on mobile via hamburger button.
**When to use:** Below tablet breakpoint (768px).
**Example:**
```javascript
const hamburger = document.querySelector('.nav__hamburger');
const overlay = document.querySelector('.nav__overlay');
const overlayLinks = document.querySelectorAll('.nav__overlay-link');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('nav__hamburger--open');
  overlay.classList.toggle('nav__overlay--open');
  document.body.classList.toggle('no-scroll', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close overlay when a link is clicked
overlayLinks.forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('nav__hamburger--open');
    overlay.classList.remove('nav__overlay--open');
    document.body.classList.remove('no-scroll');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});
```

### Anti-Patterns to Avoid
- **Scroll event listener for scroll-spy:** Use IntersectionObserver instead -- it's async and doesn't block the main thread on every scroll tick.
- **100vh for hero on mobile:** iOS Safari's address bar causes 100vh to overflow. Use `100dvh` with `100vh` fallback: `height: 100vh; height: 100dvh;`.
- **Loading="lazy" on hero image:** The hero is the LCP element. Lazy loading delays it. Use `fetchpriority="high"` and no loading attribute (or `loading="eager"`).
- **backdrop-filter without -webkit- prefix:** Older Safari versions need `-webkit-backdrop-filter`. Always include both.
- **Massive hero image:** Keep under 200KB. Use WebP format. Serve a 1920px-wide image max (not 4K).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scrolling | Custom scroll animation JS | CSS `scroll-behavior: smooth` | Native, performant, respects prefers-reduced-motion |
| Scroll-spy | Scroll event + getBoundingClientRect | IntersectionObserver API | Non-blocking, performant, handles edge cases |
| Font loading optimization | Custom font loader | Google Fonts CDN preconnect + display=swap | Handles caching, subsetting, format negotiation |
| CSS reset | Custom reset from scratch | Modern CSS reset (Josh Comeau's or Andy Bell's) | Handles cross-browser quirks, accessible defaults |
| Responsive typography | Fixed font sizes per breakpoint | `clamp()` with viewport units | Fluid scaling, fewer breakpoints needed |

**Key insight:** This phase is all standard web platform features. No npm dependencies beyond Vite are needed. IntersectionObserver, CSS custom properties, backdrop-filter, CSS animations, and scroll-behavior are all well-supported natively.

## Common Pitfalls

### Pitfall 1: Purple Accent Text Fails WCAG AA
**What goes wrong:** Using #7C3AED as text color on #0F0F0F background for normal-sized body text.
**Why it happens:** The contrast ratio is only 3.36:1 (AA requires 4.5:1 for normal text).
**How to avoid:**
- Use purple ONLY for: filled buttons (white text on purple = 5.70:1, passes AA), borders, hover glows, and large text (headings -- 3:1 threshold, passes)
- NEVER use purple as body text color on the dark background
- Body text must use #E0E0E0 (14.52:1 ratio, passes easily)
- For purple text that must be small, lighten to ~#A78BFA (violet-400) which achieves ~5.5:1 on #0F0F0F
**Warning signs:** Any `color: var(--color-accent)` on text smaller than 18pt/24px or 14pt/19px bold

### Pitfall 2: Mobile Viewport Height (100vh)
**What goes wrong:** Hero section overflows on iOS Safari because 100vh includes the area behind the browser chrome.
**Why it happens:** Mobile browsers have a dynamic toolbar that changes viewport height.
**How to avoid:** Use `height: 100dvh` with `100vh` fallback.
```css
.hero { height: 100vh; height: 100dvh; }
```
**Warning signs:** Hero content cut off on mobile, or scrollbar appears on hero section.

### Pitfall 3: Font Flash (FOUT/FOIT)
**What goes wrong:** Visible flash when web fonts load, or invisible text until fonts arrive.
**Why it happens:** Google Fonts are external resources that take time to download.
**How to avoid:**
1. Preconnect to Google Fonts domains
2. Use `display=swap` (shows fallback immediately, swaps when ready)
3. Choose a system font fallback with similar metrics
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet">
```
**Warning signs:** Text disappears or visibly shifts on page load.

### Pitfall 4: Ken Burns Performance
**What goes wrong:** Janky animation on lower-end devices or mobile.
**Why it happens:** Animating without GPU acceleration, or animating too many properties.
**How to avoid:**
- Animate only `transform` (not `background-size` or `background-position`)
- Use `will-change: transform` on the animated element
- Use `translate3d()` to force GPU layer
- Keep the image as an `<img>` or pseudo-element, not a background-image (allows `will-change` to work properly)
**Warning signs:** Stuttering animation, high paint counts in DevTools.

### Pitfall 5: Hamburger Menu Accessibility
**What goes wrong:** Screen readers can't operate the mobile menu.
**Why it happens:** Missing ARIA attributes, focus management, and keyboard support.
**How to avoid:**
- `aria-expanded="false/true"` on hamburger button
- `aria-label="Menu"` on hamburger button
- Trap focus inside overlay when open
- Close on `Escape` key
- Return focus to hamburger button on close
**Warning signs:** Cannot tab through mobile menu, no screen reader announcement.

### Pitfall 6: Scroll-Spy Edge Cases
**What goes wrong:** Active state flickers or highlights wrong section at page extremes.
**Why it happens:** Last section may be too short to trigger the observer, or multiple sections intersect.
**How to avoid:** Use asymmetric `rootMargin` (e.g., `-20% 0px -80% 0px`) to create a narrow detection band near the top of the viewport. Only one section should be "active" at a time.
**Warning signs:** Two nav links highlighted simultaneously, or last section never becomes active.

## Code Examples

### Google Fonts Loading (index.html head)
```html
<!-- Preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load Orbitron (display) and Space Grotesk (body) -->
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet">
```

### Hero Section HTML
```html
<section class="hero" id="hero">
  <img
    class="hero__image"
    src="/images/hero-placeholder.webp"
    alt="High-performance sports car photographed at golden hour"
    fetchpriority="high"
    width="1920"
    height="1080"
  >
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <h1 class="hero__name">David Bradley</h1>
    <p class="hero__tagline">Where Speed Meets Art</p>
    <a href="#gallery" class="hero__cta btn btn--primary">View Gallery</a>
  </div>
</section>
```

### CSS Reset (Minimal Modern Reset)
```css
/* Modern CSS Reset - based on Josh Comeau's */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Responsive Breakpoints
```css
/* Mobile-first breakpoints */
/* Default: 320px+ (mobile) */
/* Tablet: 768px+ */
/* Desktop: 1024px+ */
/* Wide: 1440px+ */

@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Wide */ }
```

### Section Stub Template (for all five sections)
```html
<!-- Placeholder sections for nav link targets -->
<section class="section" id="gallery">
  <h2 class="section__heading">Gallery</h2>
</section>
<section class="section" id="video">
  <h2 class="section__heading">Video</h2>
</section>
<section class="section" id="about">
  <h2 class="section__heading">About</h2>
</section>
<section class="section" id="bts">
  <h2 class="section__heading">Behind the Scenes</h2>
</section>
<section class="section" id="contact">
  <h2 class="section__heading">Contact</h2>
</section>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 100vh for full-viewport | 100dvh (dynamic viewport height) | 2023 (Safari 15.4+) | Fixes mobile toolbar issues |
| scroll event + getBoundingClientRect | IntersectionObserver | 2019+ (universal support) | Non-blocking scroll detection |
| -webkit-backdrop-filter only | backdrop-filter (unprefixed) | 2023 (Firefox 103+, Safari 17+) | Still include -webkit- prefix for older Safari |
| Font loading JS (Web Font Loader) | preconnect + display=swap | 2020+ | No JS dependency needed |
| px-based responsive font sizes | clamp() with vw units | 2020+ (universal support) | Fluid typography without breakpoints |
| Vite 6.x | Vite 8 (Rolldown-based) | Dec 2025 | Project uses 6.x per requirements; 6.x uses Rollup, still fully supported |

**Deprecated/outdated:**
- **Web Font Loader (webfontloader npm):** Unnecessary with modern `display=swap` and preconnect
- **jQuery for DOM manipulation:** All patterns here use vanilla JS APIs with full browser support
- **Prefixed transforms (-webkit-transform):** Unprefixed transforms have universal support since 2015+

## Open Questions

1. **Hero placeholder image source**
   - What we know: Need a WebP image under 200KB, 1920px wide, automotive subject
   - What's unclear: Will David provide a real photo for v1, or do we need a stock/generated placeholder?
   - Recommendation: Create a solid dark gradient placeholder with text "Hero Image" for initial development; swap later. Alternatively, use a free automotive photo from Unsplash at correct dimensions.

2. **Vite 6.x exact minor version**
   - What we know: Vite 6 is available on npm. Latest Vite is 8.0.
   - What's unclear: Whether `create-vite@latest` still scaffolds cleanly with Vite 6 dependencies
   - Recommendation: Scaffold with `create-vite@latest`, then immediately pin `"vite": "^6.0.0"` in package.json and re-run `npm install`

3. **Section minimum heights**
   - What we know: Five stub sections needed for nav links to target
   - What's unclear: How tall should stub sections be for scroll-spy to work properly in Phase 1?
   - Recommendation: Give each stub section `min-height: 50vh` so scroll-spy triggers correctly even without content

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (greenfield) -- recommend Playwright for e2e |
| Config file | none -- see Wave 0 |
| Quick run command | `npx playwright test --grep @smoke` |
| Full suite command | `npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Vite builds without errors | smoke | `npm run build` | N/A (build script) |
| FOUND-02 | CSS custom properties defined | manual inspection | Visual review in DevTools | manual-only |
| FOUND-03 | WCAG AA contrast on dark theme | unit | `node tests/contrast-check.js` | Wave 0 |
| FOUND-04 | Fonts loaded (Orbitron + Space Grotesk) | e2e | `npx playwright test --grep @fonts` | Wave 0 |
| FOUND-05 | Responsive 320px-1440px | e2e | `npx playwright test --grep @responsive` | Wave 0 |
| FOUND-06 | Hero image under 200KB | unit | `node tests/image-budget.js` | Wave 0 |
| FOUND-07 | Smooth scroll to anchors | e2e | `npx playwright test --grep @scroll` | Wave 0 |
| NAV-01 | Sticky nav visible at all scroll positions | e2e | `npx playwright test --grep @nav-sticky` | Wave 0 |
| NAV-02 | Nav links scroll to sections | e2e | `npx playwright test --grep @nav-scroll` | Wave 0 |
| NAV-03 | Scroll-spy highlights active section | e2e | `npx playwright test --grep @scrollspy` | Wave 0 |
| NAV-04 | Mobile hamburger opens/closes overlay | e2e | `npx playwright test --grep @hamburger` | Wave 0 |
| NAV-05 | Wordmark visible in nav | e2e | `npx playwright test --grep @wordmark` | Wave 0 |
| HERO-01 | Full-viewport hero with background image | e2e | `npx playwright test --grep @hero` | Wave 0 |
| HERO-02 | Name in Orbitron with animation | e2e | `npx playwright test --grep @hero-name` | Wave 0 |
| HERO-03 | Tagline below name | e2e | `npx playwright test --grep @hero-tagline` | Wave 0 |
| HERO-04 | CTA scrolls to gallery | e2e | `npx playwright test --grep @hero-cta` | Wave 0 |
| HERO-05 | Hero image fetchpriority="high", no lazy | unit | `node tests/hero-lcp.js` (parse HTML) | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (ensures no build breakage)
- **Per wave merge:** `npx playwright test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `playwright.config.js` -- Playwright configuration for Vite dev server
- [ ] `tests/foundation.spec.js` -- covers FOUND-01 through FOUND-07
- [ ] `tests/navigation.spec.js` -- covers NAV-01 through NAV-05
- [ ] `tests/hero.spec.js` -- covers HERO-01 through HERO-05
- [ ] `tests/contrast-check.js` -- Node script to verify contrast ratios
- [ ] `tests/image-budget.js` -- Node script to check image file sizes
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install chromium`

## Sources

### Primary (HIGH confidence)
- WCAG contrast ratios: Calculated directly using the WCAG 2.1 relative luminance formula for all color pairs
- [Vite official docs](https://vite.dev/guide/) -- scaffold command, vanilla template, version info
- [MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) -- scroll-spy implementation
- [Google Fonts - Orbitron](https://fonts.google.com/specimen/Orbitron) -- font availability and weights
- [Google Fonts - Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) -- font availability and weights

### Secondary (MEDIUM confidence)
- [CSS Wizardry - Speed Up Google Fonts](https://csswizardry.com/2020/05/the-fastest-google-fonts/) -- preconnect + display=swap pattern (verified pattern, older article)
- [Josh W. Comeau - backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) -- frosted glass implementation details
- [Glassmorphism Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) -- browser support at 95%+ confirmed
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8) -- confirms Vite 8 shipped Dec 2025, Vite 6.x still available on npm

### Tertiary (LOW confidence)
- Ken Burns CSS patterns from multiple CodePen examples -- consistent approach (transform: scale + translate3d with keyframes)
- Mobile hamburger overlay patterns from tutorial sites -- standard toggle class approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Vite + vanilla JS is simple, well-documented, no ambiguity
- Architecture: HIGH -- all patterns use native web platform APIs with universal browser support
- Pitfalls: HIGH -- WCAG contrast verified mathematically; viewport/performance issues well-documented
- Validation: MEDIUM -- Playwright is recommended but not yet configured; test plan is theoretical

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable technologies, no fast-moving dependencies)
