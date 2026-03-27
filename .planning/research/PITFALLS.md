# Domain Pitfalls: Vanilla JS to Next.js Migration

**Domain:** Automotive photography portfolio rebuild (Vite + vanilla JS to Next.js + React)
**Researched:** 2026-03-26
**Overall Confidence:** HIGH (verified across official docs, community reports, and multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, major delays, or broken production deployments.

### Pitfall 1: Hydration Mismatches from GSAP Animations

**What goes wrong:** GSAP manipulates the DOM directly. When Next.js server-renders HTML and then hydrates on the client, any DOM changes GSAP makes before or during hydration create mismatches. The server-rendered HTML says one thing, GSAP on the client says another. React throws hydration errors, elements flash or disappear, and ScrollTrigger positions are wrong.

**Why it happens:** Next.js App Router defaults to Server Components. GSAP requires a browser DOM (window, document). The fundamental mismatch is that GSAP was designed for direct DOM manipulation while React owns the virtual DOM. In Next.js 15+, ScrollTrigger specifically causes hydration warnings due to styles being injected into the `<body>` tag.

**Consequences:** Broken animations on first load, console floods with hydration errors, animations that "work on refresh but not on navigation," memory leaks from ScrollTrigger instances not being cleaned up on route changes.

**Prevention:**
1. Mark ALL animation components with `"use client"` directive -- GSAP cannot run in Server Components
2. Use the `@gsap/react` package and its `useGSAP()` hook instead of raw `useEffect` -- it handles cleanup and context scoping automatically
3. Always register plugins explicitly with `gsap.registerPlugin(ScrollTrigger)` -- build tools will tree-shake them otherwise
4. Scope animations to a container ref, never animate `document.body` or `window` directly
5. Use `dynamic(() => import('./AnimatedComponent'), { ssr: false })` for heavy animation sections like the 3D parallax hero

**Detection:** Hydration error warnings in console, animations that work on hard refresh but break on client-side navigation, growing memory consumption during navigation.

**Phase mapping:** Must be addressed in the FIRST phase that introduces any animation. Establish the GSAP + React pattern once, reuse everywhere.

**Confidence:** HIGH -- verified via GSAP community forums, Next.js docs, and multiple developer reports.

---

### Pitfall 2: Cloudinary Image Double-Optimization Trap

**What goes wrong:** Using `next/image` with Cloudinary images without a proper loader means Next.js runs its own image optimization (via Netlify Image CDN) ON TOP of Cloudinary's already-optimized images. You pay for optimization twice, get worse results, and may hit Netlify's image transformation limits on the free tier.

**Why it happens:** The default `next/image` loader routes images through `/_next/image` which triggers server-side optimization. When images already live on Cloudinary's CDN with `f_auto,q_auto` transforms, this second pass is wasteful and can degrade quality. Many developers add Cloudinary as a "remote pattern" in `next.config.js` and think they're done -- but they're now bypassing Cloudinary's CDN and routing through Netlify's optimizer instead.

**Consequences:** Slower image loads (double processing), hitting Netlify free tier image optimization limits, 400 errors on optimized images ("The requested resource isn't a valid image"), cache invalidation issues where Cloudinary updates don't propagate because Next.js caches the old version for 30 days.

**Prevention:**
1. Use the `next-cloudinary` package and its `CldImage` component -- it wraps `next/image` but routes optimization through Cloudinary's CDN directly
2. CldImage automatically applies `f_auto,q_auto` for format/quality optimization
3. Do NOT add Cloudinary domains to `images.remotePatterns` in next.config.js when using CldImage -- this triggers the wrong optimization path
4. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` env var -- CldImage requires it
5. For the gallery (50+ images), use the `sizes` prop correctly to avoid downloading desktop-sized images on mobile

**Detection:** Check Network tab -- if image URLs contain `/_next/image?url=` wrapping a Cloudinary URL, you're double-optimizing. Images should load directly from `res.cloudinary.com`.

**Phase mapping:** Must be correct from the first phase that displays images. Retrofitting is painful because CldImage and next/image have different prop APIs.

**Confidence:** HIGH -- verified via Cloudinary official docs, Next Cloudinary package docs, and GitHub issues.

---

### Pitfall 3: Netlify + Next.js Deployment Runtime Gaps

**What goes wrong:** Next.js features that work on Vercel may silently fail or behave differently on Netlify. The Netlify Next.js runtime (`@netlify/plugin-nextjs`) translates Next.js's Vercel-native output into Netlify primitives (Edge Functions, serverless functions, CDN). This translation is not always 1:1.

**Why it happens:** Next.js is built by Vercel, optimized for Vercel. Netlify reverse-engineers compatibility through their runtime adapter. Specific known issues:
- **Deployment skew:** when a new deploy goes live while users are browsing, static asset URLs 404 because old bundles are gone
- **Edge Functions bundling** can fail with certain Next.js 16 configurations
- **App Router direct URL access** (not via client navigation) has historically caused 500 errors
- **ISR behavior** differs from Vercel's implementation
- **CVE-2025-55182:** Critical vulnerability in React Server Functions affecting Next.js 15 and 16 -- requires patched versions

**Consequences:** Production 500 errors on direct page access, broken images/JS after deploys for active users, build failures that only appear in Netlify CI (not local).

**Prevention:**
1. Pin to a well-tested Next.js version (15.x is safer than 16.x on Netlify as of March 2026)
2. Use `output: 'export'` for the public site if possible -- eliminates the runtime entirely, deploys as pure static files. Admin API routes would need Netlify Functions separately
3. If using full Next.js server mode, add `output: 'standalone'` in next.config.js
4. Test every deploy with direct URL access to each route, not just client-side navigation
5. Use `netlify dev` locally to test the full Netlify runtime, not just `next dev`
6. Monitor the [Netlify Next.js changelog](https://www.netlify.com/changelog/tag/next-js/) for breaking changes

**Detection:** Works locally but breaks on Netlify. 500 errors on direct page loads. Build succeeds but deploy fails during "Edge Functions bundling."

**Phase mapping:** Address in the FIRST phase (project setup). Get a minimal Next.js app deployed to Netlify before writing any features. Validate the deployment pipeline early.

**Confidence:** HIGH -- verified via Netlify docs, support forums, and their engineering blog.

---

### Pitfall 4: Flash of Wrong Theme (FOWT) on Dark-Only Site

**What goes wrong:** On first load, the site briefly flashes white/light background before the dark theme kicks in. For a "dark cinematic luxury" portfolio, this is devastating -- it breaks the mood instantly and looks amateurish.

**Why it happens:** Next.js server-renders HTML without knowing the client's theme preference. If dark mode is applied via JavaScript (className toggle, CSS variables set in useEffect), there's a gap between HTML paint and JS execution where the browser's default white background shows. This is a variant of FOUC specific to themed sites.

**Consequences:** Unprofessional first impression. On slow connections, the flash can last 500ms+. Repeated on every hard navigation/page refresh.

**Prevention:**
1. Since this is a dark-ONLY site (no light mode toggle needed), hardcode dark styles in CSS -- no JS theme switching required
2. Set `background-color` on `<html>` and `<body>` in a `<style>` tag inside `layout.tsx`'s `<head>` -- this paints before any JS loads
3. If using Tailwind's `darkMode: 'class'`, set the `dark` class in a blocking `<script>` in `layout.tsx`, not in useEffect
4. Use `next-themes` with `forcedTheme="dark"` and `defaultTheme="dark"` if you want infrastructure for future light mode
5. Add `suppressHydrationWarning` to the `<html>` element when using next-themes (it modifies the element before hydration)
6. In Tailwind config: set `darkMode: 'class'` and ensure all color values use dark-appropriate defaults

**Detection:** Load the site on a throttled (Slow 3G) connection. Any white flash = broken.

**Phase mapping:** Must be correct in phase 1 (layout/design system setup). Every subsequent phase inherits the theme structure.

**Confidence:** HIGH -- well-documented issue with established solutions.

---

### Pitfall 5: 80KB Bundle Budget is Impossible with React

**What goes wrong:** The PROJECT.md constraint says "Public site JS must stay under 80KB gzip." React + React DOM alone is ~40KB gzipped. Add Next.js runtime, GSAP core (~25KB), ScrollTrigger (~8KB), and any UI components -- you're at 120KB+ minimum before writing a single line of application code.

**Why it happens:** The 80KB budget was set for the vanilla JS + Vite site, where the entire app (GSAP, PhotoSwipe, custom JS) fit comfortably. React fundamentally changes the baseline.

**Consequences:** If enforced strictly, the budget forces impossible tradeoffs -- either no animations (drop GSAP), no React (defeats the purpose), or broken functionality. If ignored without updating, it becomes a zombie constraint that nobody trusts.

**Prevention:**
1. **Update the budget** to 150-200KB gzipped for a Next.js site -- this is realistic for React + GSAP + application code
2. Use modular GSAP imports: `import { gsap } from "gsap"` and `import { ScrollTrigger } from "gsap/ScrollTrigger"` -- only import what you use
3. Lazy-load heavy animation components with `dynamic()` import
4. Consider CSS animations + Intersection Observer for simple scroll reveals instead of GSAP ScrollTrigger for basic fade-ins
5. Install `@next/bundle-analyzer` from day one and track budget per-page, not globally
6. Use `size-limit` in CI to catch regressions

**Detection:** Run `next build` and check the output size report. Each route shows its JS size.

**Phase mapping:** Budget decision must be revisited in phase 1 before any development begins.

**Confidence:** HIGH -- React/Next.js bundle sizes are well-documented and verifiable.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create compounding problems.

### Debt 1: Over-Engineering Server Components for a Static Portfolio

**What goes wrong:** Developers maximize Server Component usage because "it's best practice." For a portfolio with build-time static data, this adds complexity without benefit. You end up with complex server/client component boundaries, prop drilling across the boundary, and confusion about where code runs.

**Why it matters:** This site has ~50 gallery images loaded at build time, a blog with a handful of posts, and a single-user admin panel. There are no dynamic data requirements for the public site. Server Components add value for data-heavy apps -- for a static portfolio, they add unnecessary cognitive overhead.

**Prevention:**
1. Strongly consider `output: 'export'` for the public site -- pure static HTML, no server runtime needed
2. If using Server Components, keep the boundary simple: page-level layouts are Server Components, interactive widgets (animations, filters, lightbox) are Client Components
3. Don't fetch Cloudinary data in Server Components at runtime -- generate it at build time like the current `build-gallery-data.js` approach
4. The admin panel WILL need server-side logic (API routes) but keep it isolated from the public site architecture

**Phase mapping:** Architecture decision in phase 1. Extremely hard to change later.

---

### Debt 2: Netlify Functions vs API Routes -- Pick One

**What goes wrong:** The existing 11 Netlify Functions (sign-upload, list-images, delete-image, save-post, etc.) each handle one operation. Developers either: (a) copy them as-is alongside Next.js, creating a hybrid routing mess, or (b) convert them all to Next.js API routes without considering that API routes require the Next.js server runtime on Netlify (incompatible with `output: 'export'`).

**Why it matters:** The current functions use Cloudinary SDK server-side and are authenticated via Netlify Identity JWT tokens. Migration requires deciding the routing AND rethinking the auth mechanism.

**Prevention:**
1. If using `output: 'export'` (recommended for public site), keep admin functions as Netlify Functions in `netlify/functions/` -- they run independently of the static site
2. If using full Next.js server mode, convert functions to Route Handlers in `app/api/`
3. Don't try to do both -- pick one approach for the admin API layer
4. Group related operations: one `app/api/images/route.ts` handles GET (list), POST (upload), DELETE (delete) instead of 11 separate files

**Phase mapping:** Decide the approach in phase 1, implement during the admin panel phase.

---

### Debt 3: Porting Vanilla JS DOM Manipulation Patterns Into React

**What goes wrong:** The current admin panel (`admin.js`) uses direct DOM manipulation: `document.getElementById()`, `innerHTML`, event delegation. Developers "port" this to React by using refs for everything and unsafe HTML injection instead of learning proper React patterns. The code works but is unmaintainable and fragile.

**Prevention:**
1. Rewrite admin components from scratch in React idioms -- don't transliterate vanilla JS line by line
2. Use state for UI, not DOM queries
3. Replace innerHTML with JSX and proper component composition
4. SortableJS (used for image reordering) has a React wrapper (`react-sortablejs`) -- use it instead of raw SortableJS with refs

**Phase mapping:** Admin panel phase. Budget extra time -- this is a rewrite, not a port.

---

## Integration Gotchas

### Gotcha 1: Netlify Identity Widget in React

**What goes wrong:** The `netlify-identity-widget` package (currently used) is a vanilla JS widget that injects itself into the DOM. In React, it conflicts with React's DOM ownership. The widget's modal, event listeners, and DOM nodes exist outside React's component tree.

**Current status:** Netlify Identity is still supported as of February 2026 despite earlier deprecation signals. The Auth0 extension is the new recommended path but adds complexity and potential cost.

**Prevention:**
1. For the rebuild, keep Netlify Identity but wrap it properly: initialize in a `useEffect`, listen for `login`/`logout` events, store user state in React context
2. Use `netlify-identity-widget` only for login/logout modal -- don't let it manage UI beyond that
3. Alternatively, use `gotrue-js` (the underlying library) for programmatic control without the widget's DOM injection
4. Verify JWT tokens server-side in Netlify Functions using the `jsonwebtoken` package -- don't trust client-side auth state alone

**Phase mapping:** Admin panel phase. Don't migrate auth until the admin UI is being rebuilt.

---

### Gotcha 2: PhotoSwipe Lightbox Lifecycle in React

**What goes wrong:** PhotoSwipe 5.x manages its own DOM, event listeners, and animation loop. In React, mounting/unmounting PhotoSwipe without proper cleanup causes memory leaks, duplicate lightboxes stacking up, and broken swipe gestures.

**Prevention:**
1. Initialize PhotoSwipe in `useEffect` with `return () => lightbox.destroy()` for cleanup
2. Use a ref for the gallery container, pass it to PhotoSwipe's `gallery` option
3. Consider `react-photoswipe-gallery` wrapper which handles React lifecycle correctly
4. Re-initialize when gallery filter changes -- stale references cause ghost clicks

**Phase mapping:** Gallery phase. Test on mobile devices -- gesture conflicts are common.

---

### Gotcha 3: Build-Time Data Generation Pipeline

**What goes wrong:** The current site runs `scripts/build-gallery-data.js` in the `prebuild` npm script to fetch Cloudinary metadata and generate a static data file. In Next.js, developers are tempted to replace this with `getStaticProps` or Server Component data fetching, adding runtime Cloudinary API calls. This works but violates the "gallery must remain static build-time data" constraint, is slower, and counts against Cloudinary API rate limits.

**Prevention:**
1. Keep the `prebuild` script approach -- run it before `next build`
2. Output data as a `.ts` or `.json` file that components import directly
3. Do NOT call the Cloudinary API at request time for the public gallery
4. The admin panel can call Cloudinary at runtime (it's behind auth, low-traffic)
5. Update the script to output TypeScript types alongside the data for type safety

**Phase mapping:** Early phase, before building gallery components. The data shape determines component props.

---

### Gotcha 4: lite-youtube-embed in React/Next.js

**What goes wrong:** The current site uses `lite-youtube-embed` which is a Web Component (custom element). Custom elements work differently in React -- they don't get React's synthetic events, and Next.js SSR doesn't know how to render them.

**Prevention:**
1. Use `@next/third-parties` for YouTube embeds (official Next.js package) or a React-native lite embed solution
2. If keeping `lite-youtube-embed`, wrap it in a `"use client"` component with `dynamic(() => ..., { ssr: false })`
3. Register the custom element in `useEffect` on the client side only

**Phase mapping:** Video reel section. Low risk but easy to overlook.

---

## Performance Traps

### Trap 1: Gallery Masonry Layout Causing Layout Shifts (CLS)

**What goes wrong:** Masonry layouts require knowing image dimensions before render. If dimensions aren't available from the data pipeline, the layout shifts as images load, destroying CLS scores and creating a janky user experience.

**Prevention:**
1. Store image dimensions (width, height) in the build-time gallery data
2. Use `CldImage` with explicit `width` and `height` props -- they reserve space before load
3. Use CSS `aspect-ratio` as a fallback for consistent placeholders
4. For masonry specifically, CSS Grid with `grid-auto-rows` and known aspect ratios avoids JS-based layout calculations

**Phase mapping:** Gallery phase. Get dimensions into the data pipeline first.

---

### Trap 2: Route Transition Animation Complexity

**What goes wrong:** Page transitions with GSAP between Next.js routes are notoriously difficult. The outgoing page needs to animate out before the incoming page loads, but Next.js's router unmounts the old page immediately.

**Prevention:**
1. Use Framer Motion's `AnimatePresence` with `mode="wait"` for page transitions if needed -- it's designed for React's component lifecycle
2. Better option: skip full page transitions. Use entrance animations only. Premium automotive sites (Porsche, McLaren, BMW) use subtle entrance animations, not complex cross-page transitions
3. If GSAP page transitions are essential, you need a custom router wrapper that delays unmounting -- this is complex, fragile, and not worth the engineering cost for a portfolio site

**Phase mapping:** Final polish phase. Get pages working first, add transitions last. Never build page transitions before the pages themselves are stable.

---

### Trap 3: ScrollTrigger Memory Leaks on Route Change

**What goes wrong:** ScrollTrigger instances persist after navigating away from a page. Each revisit creates new instances without killing old ones. Memory grows linearly with navigation, animations stack and conflict, and eventually the browser tab becomes sluggish.

**Prevention:**
1. The `useGSAP()` hook from `@gsap/react` handles cleanup automatically -- use it instead of manual `useEffect`
2. If using `useEffect` manually, always call `ScrollTrigger.getAll().forEach(t => t.kill())` in the cleanup function
3. Use `gsap.context()` to scope all animations -- calling `context.revert()` in cleanup kills everything in scope
4. Test by rapidly navigating between pages 20+ times and checking memory in DevTools

**Phase mapping:** Any phase with scroll animations. Establish the pattern once in the first animation phase.

---

## Security Mistakes

### Mistake 1: Exposing Cloudinary API Secret in Client Bundle

**What goes wrong:** The Cloudinary upload signature requires the API secret. If this leaks into client-side code, anyone can upload, delete, or modify images in the Cloudinary account.

**Prevention:**
1. ALL Cloudinary operations requiring the API secret (upload, delete, reorder) must happen in API routes or Netlify Functions -- NEVER in client components
2. Use `CLOUDINARY_API_SECRET` (without `NEXT_PUBLIC_` prefix) -- Next.js only exposes `NEXT_PUBLIC_*` env vars to the client
3. The existing `sign-upload.mjs` function pattern is correct -- keep server-side signing
4. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is safe to expose (it's public information anyway)

**Detection:** Search the client bundle output for the API secret string. Check Network tab for any client-side requests containing the secret.

**Phase mapping:** Set up env var conventions in phase 1. Enforce in admin panel phase.

---

### Mistake 2: Admin Routes Accessible Without Auth

**What goes wrong:** In the current vanilla JS site, the admin is a separate HTML page with Netlify Identity gating access. In Next.js, `/admin` is just another route. Without middleware or server-side auth checks, anyone can access admin page HTML and see the admin UI (even if API calls fail without auth).

**Prevention:**
1. If using full Next.js server mode: use `middleware.ts` to check auth on `/admin/*` routes before serving any HTML
2. Verify Netlify Identity JWT tokens server-side in API routes / Netlify Functions
3. Don't rely on client-side auth checks alone -- the page HTML still gets served even if you redirect in `useEffect`
4. For `output: 'export'`: middleware doesn't exist. Use Netlify's `_redirects` rules with role-based access control, or accept that admin HTML is publicly accessible but all mutating API routes are protected server-side (the admin UI is useless without working API calls)

**Phase mapping:** Admin panel phase. Establish auth middleware early in that phase.

---

## UX Pitfalls

### Pitfall 1: Gallery Filter Animation vs React Re-render

**What goes wrong:** The current site filters gallery images with GSAP animations (fade out filtered items, rearrange remaining). In React, filtering changes state, which triggers a re-render, which unmounts filtered-out DOM elements BEFORE the exit animation can play. Items just vanish instead of animating out.

**Prevention:**
1. Don't remove filtered items from the DOM -- keep all items rendered, hide them with opacity/transform
2. Use GSAP's `autoAlpha` (visibility + opacity combined) instead of conditional rendering
3. Alternative: use Framer Motion's `AnimatePresence` which delays unmount until exit animation completes
4. Set `layout` prop on items to animate the masonry rearrangement smoothly

**Phase mapping:** Gallery phase. Plan the animation strategy BEFORE implementing the filter logic.

---

### Pitfall 2: Lightbox Breaking Browser Back Button

**What goes wrong:** Opening a lightbox (PhotoSwipe) doesn't push to browser history. Users press Back expecting to close the lightbox, but instead navigate away from the gallery entirely. On mobile this is especially frustrating.

**Prevention:**
1. Push a hash or query param when lightbox opens (`/gallery?image=5`)
2. Listen for `popstate` to close lightbox when Back is pressed
3. PhotoSwipe 5 has a `history` option -- enable it
4. Test the full sequence: open lightbox, press Back, verify lightbox closes and gallery is still visible

**Phase mapping:** Gallery phase. Easy to add during lightbox implementation, painful to retrofit.

---

## "Looks Done But Isn't" Checklist

Items that appear complete during development but fail in production or on real devices.

| Item | Why It Fails | How to Verify |
|------|-------------|---------------|
| Gallery images on mobile | CldImage serves desktop-sized images without correct `sizes` prop | Test on real phone, check Network tab for actual image file sizes downloaded |
| Scroll animations in Safari | Safari handles IntersectionObserver and scroll events differently; ScrollTrigger pin behavior is buggy | Test in desktop Safari AND Safari on iOS -- they have different rendering engines |
| Admin uploads on slow connection | No progress indicator, request timeouts on large files, no retry | Upload a 10MB image on throttled (Slow 3G) connection |
| Dark theme with system light mode | Some browsers/extensions inject light mode overrides | Test with OS set to light mode, verify dark styles still apply |
| Admin panel with ad blocker | Netlify Identity widget may be blocked by uBlock Origin or similar | Test login flow with uBlock Origin and Privacy Badger enabled |
| SEO meta tags per page | Server-rendered meta tags may have dynamic content causing hydration mismatches | Check with `curl` or View Source, not browser DevTools (which shows post-hydration DOM) |
| 3D parallax hero on low-end mobile | GPU-intensive animations drop to <30fps, drain battery | Test on a budget Android phone -- if it stutters, add `prefers-reduced-motion` fallback |
| Contact form after client navigation | Formspree or form handlers may need re-initialization after SPA navigation | Navigate to Contact page via a link from Gallery, don't just hard-load the URL |
| Blog post rendering | Markdown rendering on client may differ from expected output | Test with markdown that includes code blocks, images, links, and edge-case formatting |
| Build-time gallery data freshness | If prebuild script fails silently, stale data is bundled | Verify build output includes recently added images after each deploy |

---

## Recovery Strategies

When pitfalls are hit despite prevention, here's how to recover without starting over.

### Recovery 1: Hydration Errors Flooding Production

**Symptom:** Console full of hydration warnings, animations broken on first load but work on refresh.
**Immediate fix:** Wrap problematic components in `dynamic(() => import('./Component'), { ssr: false })` to suppress SSR entirely.
**Proper fix:** Audit all `"use client"` components -- ensure they produce identical HTML on server and client. Move all DOM-dependent code into `useGSAP()` or `useEffect`. Remove any `window`/`document` access outside of effects.

### Recovery 2: Cloudinary Images 404 or 400 on Netlify

**Symptom:** Images work locally but return 400/404 on Netlify deploys.
**Immediate fix:** Check if `next/image` is wrapping Cloudinary URLs through Netlify's image optimizer. Switch to `CldImage`.
**Proper fix:** Remove Cloudinary from `images.remotePatterns`, use `CldImage` exclusively, set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in Netlify environment variables (not just `.env.local`).

### Recovery 3: Build Succeeds but Deploy Fails on Netlify

**Symptom:** `next build` works locally, Netlify build log shows success, but deploy fails at "Edge Functions bundling."
**Immediate fix:** Check Next.js version compatibility with current Netlify runtime. Try downgrading to latest Next.js 15.x.
**Proper fix:** Pin `@netlify/plugin-nextjs` version explicitly in `package.json`. Use `netlify.toml` to configure the build. Consider `output: 'export'` to eliminate the server runtime entirely.

### Recovery 4: Bundle Size Blows Past Budget

**Symptom:** First-load JS exceeds budget, Lighthouse performance drops.
**Immediate fix:** Run `@next/bundle-analyzer`, identify the largest dependencies and which pages pull them in.
**Proper fix:** Dynamic-import heavy components (GSAP animations, PhotoSwipe lightbox, admin panel). Replace simple GSAP animations with CSS animations. Move static data from JS bundles into JSON files imported at build time.

### Recovery 5: Admin Auth Completely Broken After Migration

**Symptom:** Netlify Identity widget doesn't load, JWT verification fails, admin panel is inaccessible.
**Immediate fix:** Deploy the admin as a separate static HTML page (like current approach) while fixing the React integration.
**Proper fix:** Switch to `gotrue-js` for programmatic auth control. Initialize in a React context provider. Verify JWTs in server-side functions using the Netlify Identity JWT secret.

---

## Pitfall-to-Phase Mapping

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|-------------|---------------|----------|------------|
| Project Setup / Netlify Deploy | Deployment runtime gaps (Pitfall 3) | CRITICAL | Deploy hello-world Next.js app to Netlify first, validate full pipeline |
| Project Setup / Architecture | Over-engineering Server Components (Debt 1) | HIGH | Decide `output: 'export'` vs full server mode up front |
| Project Setup / Budget | 80KB budget impossible (Pitfall 5) | HIGH | Update budget to 150-200KB before development starts |
| Design System / Theme | Flash of wrong theme (Pitfall 4) | CRITICAL | Hardcode dark styles in CSS, blocking inline styles in layout |
| Design System / Colors | Dark theme contrast failures | MEDIUM | Verify all color pairings pass WCAG AA (4.5:1 ratio) |
| Gallery / Images | Cloudinary double-optimization (Pitfall 2) | CRITICAL | Use CldImage from day one, never next/image for Cloudinary URLs |
| Gallery / Layout | Masonry CLS shifts (Trap 1) | HIGH | Include dimensions in build-time gallery data |
| Gallery / Filters | Filter animation vs React re-render (UX 1) | MEDIUM | Hide filtered items with CSS, don't unmount them |
| Gallery / Lightbox | PhotoSwipe lifecycle in React (Gotcha 2) | MEDIUM | Proper useEffect cleanup, destroy on unmount |
| Gallery / Lightbox | Back button breaks (UX 2) | LOW | Enable PhotoSwipe history option |
| Hero / Animations | GSAP hydration mismatches (Pitfall 1) | CRITICAL | useGSAP hook, "use client", dynamic import with ssr:false |
| Hero / Animations | ScrollTrigger memory leaks (Trap 3) | HIGH | gsap.context() scoping with cleanup |
| Hero / Animations | Route transition complexity (Trap 2) | MEDIUM | Skip page transitions, use entrance animations only |
| Video Section | lite-youtube-embed in React (Gotcha 4) | LOW | Client-only dynamic import or @next/third-parties |
| Admin Panel / Auth | Netlify Identity widget in React (Gotcha 1) | MEDIUM | Wrap in useEffect, use gotrue-js for programmatic control |
| Admin Panel / Auth | Admin routes accessible without auth (Security 2) | HIGH | Middleware or Netlify redirect rules, server-side JWT verification |
| Admin Panel / API | Cloudinary secret exposure (Security 1) | CRITICAL | Server-only env vars, no NEXT_PUBLIC_ prefix for secrets |
| Admin Panel / API | Function migration confusion (Debt 2) | MEDIUM | Pick one approach: Netlify Functions OR Next.js API routes, not both |
| Admin Panel / UI | Porting vanilla JS DOM patterns (Debt 3) | MEDIUM | Rewrite from scratch in React idioms, don't transliterate |
| Data Pipeline | Gallery data fetch confusion (Gotcha 3) | MEDIUM | Keep prebuild script, import static data, no runtime API calls |
| Blog | Markdown rendering differences | LOW | Test edge-case markdown, use consistent rendering library |

---

## Sources

### Official Documentation
- [Next.js on Netlify -- Overview](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) -- Netlify official setup guide
- [Next.js Hydration Error Reference](https://nextjs.org/docs/messages/react-hydration-error) -- official error documentation
- [Next Cloudinary -- CldImage Basic Usage](https://next.cloudinary.dev/cldimage/basic-usage) -- official CldImage component docs
- [Next Cloudinary -- CldImage Configuration](https://next.cloudinary.dev/cldimage/configuration) -- configuration options
- [Cloudinary Next.js Integration Guide](https://cloudinary.com/guides/front-end-development/integrating-cloudinary-with-next-js) -- official integration guide
- [Cloudinary: Custom Loaders for next/image](https://cloudinary.com/blog/optimize-images-in-a-next-js-app-using-nextimage-and-custom-loaders) -- loader approach comparison
- [Netlify Identity Documentation](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/) -- current status and usage
- [Netlify + Auth0 Platform Changes](https://www.netlify.com/blog/auth0-extension-identity-changes/) -- Identity future roadmap
- [GSAP Installation & Import Guide](https://gsap.com/docs/v3/Installation/) -- official tree-shaking and registration guidance
- [Next.js Package Bundling Guide](https://nextjs.org/docs/app/guides/package-bundling) -- official bundle optimization docs

### Community / Verified Sources
- [Netlify: How We Run Next.js](https://www.netlify.com/blog/how-we-run-nextjs/) -- deployment skew, runtime translation challenges
- [GSAP Hydration Error in Next.js 15](https://gsap.com/community/forums/topic/43281-hydration-error-in-nextjs-15/) -- ScrollTrigger-specific hydration issue
- [Optimizing GSAP in Next.js 15: Best Practices](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232) -- useGSAP patterns, memory leak prevention
- [Setting Up GSAP with Next.js: 2025 Edition](https://javascript.plainenglish.io/setting-up-gsap-with-next-js-2025-edition-bcb86e48eab6) -- current best practices
- [GSAP & Next.js Setup: The BSMNT Way](https://basement.studio/post/gsap-and-nextjs-setup-the-bsmnt-way) -- production-grade animation patterns
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering) -- comprehensive FOUC analysis
- [Understanding & Fixing FOUC in Next.js App Router (2025 Guide)](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk) -- App Router specific solutions
- [Next.js Dark Mode Implementation: Complete next-themes Guide](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-dark-mode-guide/) -- next-themes setup
- [Next.js Image Optimization Error on Netlify](https://www.meje.dev/blog/image-optimization-error-in-nextjs) -- 400 error diagnosis and fix
- [GSAP Tree Shaking Discussion](https://gsap.com/community/forums/topic/28599-gsap-imports-tree-shaking-reduce-bundle-size/) -- bundle optimization strategies
- [Next.js Server Components Broke Our App Twice](https://medium.com/lets-code-future/next-js-server-components-broke-our-app-twice-worth-it-e511335eed22) -- over-engineering cautionary tale
- [Next.js App Router: Common Mistakes](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/) -- routing and data fetching anti-patterns
- [React/Next.js DoS Vulnerability (CVE-2025-55182)](https://www.netlify.com/changelog/2026-01-26-react-nextjs-dos-vulnerability/) -- security advisory, patch required

---
*Pitfalls research for: Automotive Portfolio v4.0 -- Vanilla JS to Next.js Migration*
*Researched: 2026-03-26*
