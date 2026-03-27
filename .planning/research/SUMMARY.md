# Project Research Summary

**Project:** David Bradley Automotive Photography Portfolio v4.0
**Domain:** Premium automotive photography portfolio — dark cinematic luxury aesthetic
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

This is a full-stack rewrite of an existing vanilla JS + Vite portfolio into a Next.js 15 + React 19 multi-page site. The current single-page scroll architecture becomes a proper multi-page app (Home, Gallery, Blog, About, Contact) with a React admin panel. The recommended stack is unambiguous: Next.js 15 (not 16) on Netlify via the OpenNext adapter, Tailwind CSS v4, shadcn/ui + 21st.dev for component sourcing, Motion (Framer Motion) for UI animations, and GSAP for the cinematic hero. All existing infrastructure — Cloudinary, Netlify Identity, Formspree, and the build-time gallery data pipeline — carries over without modification.

The design target is McLaren/Porsche-caliber luxury: dark backgrounds (#0e0e12 range), full-bleed photography, purposeful motion (Porsche principle: "swift, subtle, purposeful"), and minimal UI chrome. The photography does the visual work; the site gets out of its way. Competitor research confirms dark-only is the industry standard at this tier and that custom-built sites are themselves a differentiator. The 21st.dev ecosystem provides 284 hero components, 79 card variants, 40+ shader/background components, and 15 testimonial layouts — all installable as owned source code via `npx shadcn`. This removes the need to build most UI components from scratch.

The primary risks are architectural, not visual. Four decisions made in Phase 1 determine everything else: (1) update the JS bundle budget from 80KB to 150-200KB gzip — the old budget was set for vanilla JS and is impossible with React; (2) hardcode dark styles in CSS at the HTML element level to prevent a white flash on first load; (3) validate the Netlify deployment pipeline with a hello-world Next.js app before writing any features; and (4) configure CldImage (not `next/image`) for all Cloudinary images from the first phase. These decisions front-loaded into Phase 1 prevent the four most critical production failures identified in research.

## Key Findings

### Recommended Stack

Next.js 15.3+ with React 19 is the correct framework choice. Next.js 16 is excluded because it introduces breaking changes around Request APIs and Netlify's OpenNext adapter has not reached stable 16.x support as of March 2026. The App Router with static generation (SSG) for all public pages and serverless API routes for admin operations is the right split: public pages have zero runtime cost, admin operations stay behind auth. Full details in `.planning/research/STACK.md`.

**Core technologies:**
- **Next.js 15.3**: App Router, SSG for public pages, API routes for admin — mature Netlify support via OpenNext adapter
- **React 19**: Server Components for page shells, Client Components for interactive widgets (gallery filter, lightbox, hero)
- **TypeScript 5.7**: Non-negotiable — shadcn/ui and 21st.dev are TypeScript-first; catches integration errors at build time
- **Tailwind CSS v4.1**: CSS-native `@theme` config (no `tailwind.config.js`), Rust engine, required by shadcn/ui and 21st.dev
- **shadcn/ui + 21st.dev**: Components install as owned source code via `npx shadcn add [url]` — no vendor lock-in, full customization
- **Motion v12.38**: Declarative React animations for page transitions, hover states, scroll-linked reveals; import from `motion/react`
- **GSAP 3.14 + @gsap/react**: Reserved for the cinematic hero and scroll-scrubbed parallax sequences where Motion lacks timeline control
- **next-cloudinary v7**: CldImage for all photography display, CldUploadWidget for admin uploads — bypasses Netlify Image CDN double-processing trap
- **next-mdx-remote v6**: Blog post rendering (Contentlayer is abandoned and incompatible with Next.js 14+)
- **yet-another-react-lightbox v3**: React-native lightbox with next/image integration and plugin architecture (thumbnails, zoom, captions)
- **Netlify Identity**: Keep existing single-user auth — migration to NextAuth adds complexity for zero benefit

**Updated budget constraint:** 80KB gzip is impossible with React. Realistic target is 150-200KB gzip. React + React DOM alone is ~40KB; GSAP core adds ~25KB, ScrollTrigger ~8KB. Track with `@next/bundle-analyzer` per-page from day one.

### Expected Features

Full feature research with competitor analysis in `.planning/research/FEATURES.md`. McLaren, Porsche, and DW Burnett analysis validates dark-only aesthetic, purposeful motion, and full-bleed photography as non-negotiable table stakes at this tier.

**Must have at v4.0 launch (P0):**
- Multi-page Next.js architecture (Home, Gallery, About, Contact) — single-page scroll reads as hobby-level at this tier; each page gets its own SEO
- Dark cinematic design system with luxury typography — the aesthetic IS the brand, must be correct from the first commit
- Cinematic scroll-triggered hero — first 2 seconds determine if visitor stays; 21st.dev hero + GSAP for this "wow" moment
- Gallery page with category filtering + lightbox — core portfolio function, Cloudinary-backed, build-time static data
- Image optimization with blur-up placeholders — LCP under 2.5s; CldImage + LQIP base64 from build pipeline
- About page as a standalone page — not a scroll section; builds trust and personal brand
- Contact/booking page with Formspree form — the revenue conversion point; minimal friction
- Mobile-first responsive design — 60%+ portfolio traffic is mobile
- Per-page SEO + Open Graph — every shared link must look premium

**Should have for launch or immediately after (P1):**
- Scroll-linked image reveal animations — clipPath tied to scrollYProgress, GPU-accelerated transforms only
- Animated page transitions — Motion AnimatePresence in root layout, 200-300ms max
- Video reel with scroll-triggered autoplay — muted autoplay on intersection, shows motion capability
- Subtle ambient background effects — 21st.dev shader/background components for atmospheric depth

**Defer to post-launch (P2/P3):**
- Project/series showcase pages — requires content creation (shoot narratives); high brand value but time-intensive
- Client testimonials section — requires collecting actual testimonials; 21st.dev has 15 ready components
- Service/pricing page — strong conversion differentiator; Ted7 research confirms this converts well
- Category landing pages with dedicated heroes — SEO and depth value; extend gallery routes
- Before/after retouching slider — powerful differentiator per GFWilliams; needs raw + finished image pairs
- Blog migration and admin React rewrite — existing vanilla JS admin works; defer until public site is stable

**Anti-features to explicitly exclude:**
- 3D WebGL/Three.js (150KB+ gzip — breaks budget; high-quality photography IS the 3D experience)
- Live social API feeds (rate limits, performance impact; use static curated section with links to profiles)
- E-commerce/print sales (premature; dilutes "hire me" messaging)
- Excessive parallax/animation everywhere (Porsche principle: motion serves content, never competes with it)

### Architecture Approach

The architecture splits cleanly into build-time (static public site) and runtime (admin panel). All public pages are statically generated at build time and served from Netlify CDN with zero serverless invocations. The build-time Cloudinary data pipeline (`scripts/build-gallery-data.mjs`) is preserved from v3, outputting JSON instead of a JS module. Admin operations run through Next.js API routes (which auto-deploy as Netlify Functions via the OpenNext adapter), all protected by JWT middleware at the edge using the `jose` library (required because Next.js middleware runs in Edge Runtime, which lacks Node.js `crypto`). Full structure and code patterns in `.planning/research/ARCHITECTURE.md`.

**Major components:**
1. **`app/(public)/`** — Static pages served from CDN; Server Component shells pass build-time data as props to Client Component interactive islands (gallery filter, lightbox, hero animations)
2. **`app/(admin)/admin/`** — Admin panel as client-heavy SPA within Next.js shell; gallery management, blog editor, Cloudinary uploads; all 11 existing Netlify Functions consolidated into Route Handlers
3. **`app/api/admin/`** — Typed Route Handlers protected by `middleware.ts`; Cloudinary SDK runs server-side only
4. **`scripts/build-gallery-data.mjs`** — Prebuild: Cloudinary Search API → `data/gallery-images.json` with LQIP base64 strings baked in
5. **`components/hero/`** — GSAP-powered cinematic section; isolated as `dynamic()` import with `ssr: false`
6. **`components/gallery/`** — GalleryGrid (Client Component for filter state), CldImageWrapper, CategoryFilter, Lightbox
7. **`middleware.ts`** — Edge-runtime JWT verification via `jose`; protects `/admin/*` and `/api/admin/*`

**Key patterns:**
- Server Components default; `"use client"` only for interactive widgets (never mark entire pages as client)
- CldImage everywhere photography appears — never `next/image` directly for Cloudinary URLs
- Build-time static gallery data — zero runtime Cloudinary API calls on public pages
- Route groups `(public)` and `(admin)` create separate layout hierarchies without URL prefixes
- GSAP isolated to `components/hero/` with `useGSAP()` hook; Motion handles all other UI animations

### Critical Pitfalls

Full pitfall research with recovery strategies in `.planning/research/PITFALLS.md`.

1. **GSAP hydration mismatches** — GSAP manipulates DOM directly, conflicts with React's virtual DOM during SSR hydration (ScrollTrigger specifically causes Next.js 15 hydration warnings by injecting styles into `<body>`). Prevention: mark all animation components `"use client"`, use `@gsap/react`'s `useGSAP()` hook (handles cleanup and scoping automatically), wrap hero with `dynamic(() => import(...), { ssr: false })`. Establish this pattern once in Phase 4 and reuse everywhere.

2. **Cloudinary double-optimization trap** — Using `next/image` with Cloudinary URLs routes images through Netlify Image CDN AND Cloudinary, double-processing every image and potentially hitting free tier limits. Symptoms: 400 errors on images, slower loads, cache invalidation issues. Prevention: use `CldImage` from next-cloudinary from day one; do NOT add Cloudinary to `images.remotePatterns` in next.config.

3. **Netlify + Next.js deployment runtime gaps** — Features that work locally may silently fail on Netlify (deployment skew, Edge Functions bundling failures, direct URL access 500s). Prevention: deploy a hello-world Next.js app to Netlify in Phase 1 before writing any features; test direct URL access (not just client navigation) after every deploy.

4. **Flash of wrong theme (FOWT)** — Site briefly renders white background before dark CSS loads. On a cinematic luxury brand, this is brand-destroying. Prevention: set `background-color: #0e0e12` on `<html>` in a blocking `<style>` tag in `layout.tsx`'s `<head>` — hardcoded in CSS, not applied via JS. Since dark-only, no `next-themes` required.

5. **80KB bundle budget is a zombie constraint** — The old budget was set for vanilla JS. React + React DOM alone is ~40KB gzip before any application code. Enforcing 80KB forces impossible tradeoffs. Prevention: formally update the budget to 150-200KB gzip before development begins; track with `@next/bundle-analyzer` per-page; use `dynamic()` imports for heavy components.

## Implications for Roadmap

Based on the dependency graph from FEATURES.md, the build order from ARCHITECTURE.md, and the phase mapping from PITFALLS.md, research strongly suggests a 6-phase structure. The ordering is driven by two constraints: (1) the design system must precede all visual components, and (2) the deployment pipeline must be validated before any features are built.

### Phase 1: Foundation and Pipeline Validation

**Rationale:** Three critical architectural decisions must be locked in before anything else: updated bundle budget (150-200KB), dark-only CSS theme hardcoded at the HTML level, and a working Next.js deploy on Netlify. These are not features — they are preconditions. Building features on an unvalidated Netlify pipeline wastes work.

**Delivers:** Working Next.js 15 skeleton deployed to Netlify; dark theme root layout with zero FOWT; configured Cloudinary environment variables; `netlify.toml` updated for Next.js (publish: `.next`, remove functions directive); shadcn/ui initialized; `build-gallery-data.mjs` adapted to JSON output; TypeScript, Tailwind v4, ESLint, Prettier, prettier-plugin-tailwindcss configured.

**Addresses:** Multi-page architecture foundation, performance budget decision, deployment risk.

**Avoids:** Pitfall 3 (Netlify deployment gaps — validate before features), Pitfall 4 (FOWT — CSS-first dark theme), Pitfall 5 (80KB budget zombie — update before writing code).

**Research flag:** SKIP — well-documented patterns; all official docs verified.

### Phase 2: Design System

**Rationale:** Every visual component inherits from the design system. Typography scale, color tokens, spacing, and Tailwind CSS variables must be locked in before installing any 21st.dev components. Retrofitting a design system after components are built is a major rework.

**Delivers:** Complete dark theme CSS token set (`@theme` in `globals.css`); custom font loading (self-hosted); Tailwind dark mode class setup; base shadcn/ui component set (Button, Card, Input, Dialog, Tabs); Navbar and Footer components (sourced from 21st.dev navigation category); mobile-first responsive breakpoints.

**Addresses:** Dark cinematic design system (P0), mobile-first responsive design foundation.

**Uses:** Tailwind CSS v4 `@theme` directive, shadcn/ui CLI v4, 21st.dev navigation components (browse first, install 2-3 candidates).

**Avoids:** Pitfall 4 (FOWT prevention baked into CSS tokens), design drift from working without a system.

**Research flag:** SKIP — standard Tailwind v4 + shadcn/ui CLI v4 patterns; well-documented.

### Phase 3: Public Pages (Gallery, About, Contact, Home Shell)

**Rationale:** Gallery is the core value proposition and must work before animations are layered on. Build all pages as functional, un-animated versions first. This validates the CldImage pipeline under real page conditions. Home page gets a placeholder hero at this stage.

**Delivers:** Gallery page with category filtering, CldImage with LQIP blur-up, yet-another-react-lightbox (with back-button history support); About page (standalone, not a scroll section); Contact page with Formspree form; Home page shell (hero placeholder); static blog listing and individual post pages; per-page SEO metadata and Open Graph via Next.js Metadata API.

**Addresses:** All P0 table stakes features — gallery, about, contact, image optimization, SEO/OG.

**Uses:** next-cloudinary CldImage (Pitfall 2 fix from day one), build-time gallery JSON, yet-another-react-lightbox, gray-matter + next-mdx-remote.

**Implements:** Architecture Patterns 1 (build-time static data) and 2 (CldImage with pre-generated LQIP).

**Avoids:** Pitfall 2 (Cloudinary double-optimization — CldImage from day one, never retrofit), Trap 1 (masonry CLS — dimensions in build data), Gotcha 3 (runtime Cloudinary API calls), UX Pitfall 2 (lightbox back button — enable YARL history option from the start).

**Research flag:** SKIP — next-cloudinary, YARL, and next-mdx-remote all have thorough official documentation.

### Phase 4: Cinematic Hero and Animations

**Rationale:** Animations layer onto working pages. Building animations before page structure is stable means rebuilding them when structure changes. The hero is isolated to `components/hero/` as a GSAP showpiece; all other animations use Motion. Establish the GSAP + React pattern once here and it propagates to all subsequent animation work.

**Delivers:** Cinematic scroll-triggered hero (3D parallax, GSAP ScrollTrigger, sourced from 21st.dev hero components — browse first, install candidates); scroll-linked image reveal animations (Motion `useScroll` + `useTransform`, clipPath); animated page transitions (Motion `AnimatePresence` with `mode="wait"` in root layout); video reel with scroll-triggered autoplay (Intersection Observer + muted autoplay); optional ambient background effects (21st.dev shader/background components).

**Addresses:** P0 cinematic hero, P1 scroll reveals, P1 page transitions, P1 video reel, P1 ambient effects.

**Uses:** GSAP 3.14 + @gsap/react (hero only), Motion v12.38 (everything else), 21st.dev hero and background components.

**Implements:** Architecture Pattern 3 (Motion for UI, GSAP for showpiece); hero isolated with `dynamic()` + `ssr: false`.

**Avoids:** Pitfall 1 (GSAP hydration — `useGSAP()` hook, `"use client"`, dynamic import), Trap 3 (ScrollTrigger memory leaks — `gsap.context()` with cleanup), Trap 2 (route transition complexity — entrance animations only via Motion, not cross-page GSAP transitions), anti-feature of excessive animation everywhere.

**Research flag:** NEEDS RESEARCH — GSAP ScrollTrigger behavior in Next.js 15 App Router on Netlify (not just local) should be validated with a proof-of-concept before full implementation. A quick test of `useGSAP()` + `ScrollTrigger` in a `dynamic()` wrapper on a deployed Netlify preview is the right first task in this phase.

### Phase 5: Admin Panel React Rewrite

**Rationale:** The existing vanilla JS admin panel works. Defer its rewrite until the public site is stable and deployed. This is a pure rewrite, not a migration — transliterating vanilla JS DOM manipulation into React produces unmaintainable code. Budget extra time: this is a rewrite in React idioms from scratch.

**Delivers:** Admin layout with sidebar (`(admin)` route group); gallery management (CldUploadWidget upload, @dnd-kit/core drag-to-reorder replacing SortableJS, delete/restore); blog editor (markdown with preview); `middleware.ts` JWT verification via `jose` for all `/admin/*` and `/api/admin/*` routes; 11 existing Netlify Functions consolidated into Next.js Route Handlers.

**Addresses:** Admin panel (P3 in FEATURES.md — defer until public site is stable).

**Uses:** @dnd-kit/core (React-native, replaces SortableJS which conflicts with React's virtual DOM), netlify-identity-widget wrapped in React `useEffect`/context, Cloudinary SDK in API routes only (never client).

**Implements:** Architecture Pattern 4 (API routes replace Netlify Functions — centralized auth via middleware removes per-route JWT checks).

**Avoids:** Gotcha 1 (Netlify Identity widget lifecycle — wrap in `useEffect`, use `gotrue-js` for programmatic control), Security Mistake 2 (admin routes accessible without auth — `middleware.ts` from day one of this phase), Security Mistake 1 (Cloudinary API secret exposure — `NEXT_PUBLIC_` prefix never on secrets), Debt 2 (pick one: API routes only, not hybrid with Netlify Functions), Debt 3 (React idioms, not vanilla JS transliteration).

**Research flag:** NEEDS RESEARCH — Netlify Identity JWT secret configuration (exact environment variable name, HMAC algorithm used) is MEDIUM confidence from research. Validate this before writing middleware. Consider `gotrue-js` documentation for programmatic React integration patterns.

### Phase 6: Polish, Performance, and Launch

**Rationale:** Performance work done before the site is feature-complete is premature optimization. Lighthouse audits and bundle analysis only reflect final reality after all features are present.

**Delivers:** Lighthouse audit and bundle optimization to 150-200KB gzip target; `@next/bundle-analyzer` report with actionable fixes; WCAG AA color contrast verification (4.5:1 minimum for all text/background pairs); cross-browser testing (Safari desktop, Safari iOS, Chrome, Firefox); 404 and error boundary pages; `size-limit` CI check to catch future regressions; build-time gallery data freshness verification.

**Addresses:** Fast page loads (LCP under 2.5s), all items in the PITFALLS.md "Looks Done But Isn't" checklist.

**Avoids:** Mobile images served at desktop sizes (correct `sizes` prop on CldImage), Safari scroll animation bugs (test on real device), dark theme overridden by system light mode (verify CSS specificity), ad blocker conflicts with Netlify Identity widget (test with uBlock Origin).

**Research flag:** SKIP — standard performance tooling; well-established Lighthouse + bundle analyzer patterns.

### Phase Ordering Rationale

- **Foundation before design system** because Netlify pipeline failures are catastrophic and cheap to find with a hello-world deploy; theme decisions propagate to every subsequent commit.
- **Design system before all components** because 21st.dev component installation and customization requires Tailwind tokens and CSS variables to already exist.
- **Public pages before animations** because animations layered onto unstable structure require rebuilding; gallery must prove the Cloudinary pipeline is correct before hero animation work begins.
- **Animations as their own phase** because the GSAP + React integration pattern (useGSAP, dynamic import with ssr:false, gsap.context scoping) must be established once and reused — mixing into the page phase creates inconsistency and technical debt.
- **Admin after public launch** because the existing admin works and blocking the public launch on a non-user-facing rewrite has no business justification.
- **Polish last** because Lighthouse audits and bundle analysis only reflect final reality after all features are present.

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:

- **Phase 4 (Animations):** Validate GSAP ScrollTrigger + `useGSAP()` in Next.js 15 App Router on Netlify (deployed, not just local) before full implementation. First task: deploy a proof-of-concept animation component and confirm no hydration errors or production-only issues.
- **Phase 5 (Admin Panel):** Netlify Identity JWT secret — exact environment variable name and HMAC algorithm need confirmed before writing `middleware.ts`. Research `gotrue-js` React integration patterns (sparse documentation).

Phases with standard patterns (skip research-phase):

- **Phase 1 (Foundation):** Next.js init + Netlify deployment is exhaustively documented via official guides; straightforward execution.
- **Phase 2 (Design System):** Tailwind v4 + shadcn/ui CLI v4 setup is well-documented with official installation guides.
- **Phase 3 (Public Pages):** next-cloudinary, YARL, and next-mdx-remote all have thorough official documentation with Next.js examples.
- **Phase 6 (Polish):** Standard Lighthouse + bundle analyzer tooling; no novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technology choices verified against official docs; version compatibility matrix confirmed; 17 sources cited; alternatives explicitly ruled out with rationale |
| Features | MEDIUM-HIGH | Competitor analysis from live sites (McLaren, Porsche, DW Burnett, GFWilliams, Ted7); 21st.dev component counts from live registry; feature prioritization is judgment-based but well-grounded |
| Architecture | HIGH | All critical claims verified against official docs (Next.js on Netlify, next-cloudinary, Next.js Auth guide); code patterns are exact, not illustrative; build order validated against dependency graph |
| Pitfalls | HIGH | Each pitfall verified across official docs, community forums, and multiple developer reports; recovery strategies included for each; phase mapping provided |

**Overall confidence:** HIGH

### Gaps to Address

- **Netlify Identity JWT configuration:** The `jose`-based `middleware.ts` pattern is solid, but the specific environment variable name (`NETLIFY_JWT_SECRET`) and the HMAC algorithm Netlify Identity uses requires confirmation during Phase 5 setup. Risk is low — auth is admin-only, not public-facing. The admin panel continues working in the interim if this needs iteration.

- **21st.dev component selection:** Research confirms component categories and counts but not which specific components best match the brand aesthetic. Recommendation: browse 21st.dev hero and background categories as the first task in Phase 4 — select 2-3 candidates, install, evaluate against brand before committing. Do not design around a specific component before seeing it in context.

- **Tailwind v4 CSS-native config:** The `@theme` directive replacing `tailwind.config.js` is a real mental model shift. Flag for Phase 2: read the v4 migration guide before writing a single utility class to avoid fighting with the new config system.

- **Next.js 16 timeline:** Research recommends Next.js 15 specifically because Netlify's OpenNext adapter for 16.x is still maturing as of March 2026. If 16.x Netlify support stabilizes during development, upgrading is straightforward — App Router patterns and API routes are compatible — but requires auditing middleware and caching behavior for the Request API breaking changes.

## Sources

### Primary (HIGH confidence)
- [Next.js Official Docs — App Router, Images, Auth](https://nextjs.org/docs) — Framework patterns, static generation, middleware
- [Netlify Next.js Deployment Guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) — OpenNext adapter behavior, deployment configuration
- [next-cloudinary Official Docs](https://next.cloudinary.dev/) — CldImage configuration, LQIP patterns, upload widget
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-native `@theme` config, Rust engine
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) — CLI v4 setup and dark mode scaffolding
- [Motion (Framer Motion) Changelog](https://motion.dev/changelog) — v12.38.0, import path from `motion/react`
- [GSAP React Guide](https://gsap.com/resources/React/) — useGSAP hook, ScrollTrigger cleanup patterns
- [Yet Another React Lightbox — Next.js Examples](https://yet-another-react-lightbox.com/examples/nextjs) — Integration patterns
- [Netlify Identity Documentation](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/) — Current support status confirmed Feb 2026
- [Netlify Blog: Deploy Next.js 15](https://www.netlify.com/blog/deploy-nextjs-15/) — OpenNext adapter official guide

### Secondary (MEDIUM confidence)
- [McLaren Automotive](https://cars.mclaren.com/gl_en) — Hero carousel pattern, dark aesthetic, progressive disclosure UX
- [Porsche Design System — Motion](https://designsystem.porsche.com/v3/styles/motion/) — "Swift, subtle, purposeful" motion philosophy, cubic-bezier specs
- [DW Burnett Photography](https://dwburnett.com/) — Premium automotive photographer portfolio, minimalist design, project-based organization
- [GFWilliams](https://gfwilliams.net/) — Before/after slider reference, dark theme execution
- [Ted7](https://ted7.com/) — Pricing page and conversion pattern reference
- [21st.dev Component Registry](https://21st.dev) — Component counts and categories verified live
- [GSAP Hydration Error in Next.js 15 — Community Forum](https://gsap.com/community/forums/topic/43281-hydration-error-in-nextjs-15/) — ScrollTrigger-specific hydration issue documented
- [Netlify: How We Run Next.js](https://www.netlify.com/blog/how-we-run-nextjs/) — Deployment skew, runtime translation challenges
- [Optimizing GSAP in Next.js 15 — Medium](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232) — useGSAP patterns
- [Next.js Image Optimization Error on Netlify](https://www.meje.dev/blog/image-optimization-error-in-nextjs) — 400 error diagnosis and fix for double-optimization

### Tertiary (MEDIUM-LOW confidence — verify during implementation)
- [Netlify Next.js 16 Support](https://www.netlify.com/changelog/next-js-16-deploy-on-netlify/) — Adapter maturity status as of March 2026; may have changed by time of implementation
- [Netlify: API Routes vs Functions — Community Forum](https://answers.netlify.com/t/netlify-serverless-functions-vs-next-js-api-routes/76880) — Netlify staff responses confirm API routes auto-deploy as functions; confirm at time of admin phase
- [CVE-2025-55182 — React/Next.js DoS Vulnerability](https://www.netlify.com/changelog/2026-01-26-react-nextjs-dos-vulnerability/) — Requires patched Next.js 15.x; verify pin is to a patched version

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
