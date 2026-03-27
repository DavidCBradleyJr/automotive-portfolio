# Technology Stack

**Project:** David Bradley Automotive Photography Portfolio v4.0 (Next.js Redesign)
**Researched:** 2026-03-26
**Overall confidence:** HIGH

## Decision: Next.js 15 + React 19 (not Next.js 16)

This is a multi-page portfolio site with gallery, blog, about, and contact pages. Next.js provides the routing, image optimization, and React component model needed for 21st.dev compatibility. The v4.0 redesign replaces the vanilla Vite stack entirely.

**Why Next.js 15 (not 16):** Next.js 16 shipped with stable Turbopack and the new Adapter API, but it introduces breaking changes around Request APIs (synchronous access fully removed) and requires auditing middleware and caching behavior. For a new project deploying to Netlify, Next.js 15 is the safer choice -- Netlify's OpenNext adapter has mature 15.x support, while 16.x adapter work is still in progress (expected stable by end of 2026). Next.js 15 with App Router and React 19 provides everything this project needs. If 16.x stabilizes on Netlify during development, upgrading is straightforward.

**Why not static export (`output: "export"`):** The admin panel needs API routes for Cloudinary uploads and blog management. Full Next.js on Netlify via OpenNext adapter supports both static pages (SSG for gallery, blog) and serverless functions (admin API routes) within free tier limits.

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | ^15.3 | Framework, routing, SSG, API routes | App Router for multi-page architecture. Static generation for public pages (gallery, blog, about). API routes for admin operations. Image optimization via next/image. Mature Netlify support via OpenNext adapter. | HIGH |
| React | ^19.1 | UI component library | Required by Next.js 15. Concurrent features, Server Components support. 21st.dev components target React 18+/19. | HIGH |
| TypeScript | ^5.7 | Type safety | shadcn/ui and 21st.dev components are TypeScript-first. Catches integration errors at build time. Non-negotiable for a React project of this scope. | HIGH |

### Styling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.1 | Utility-first CSS framework | Required by shadcn/ui and 21st.dev components. v4 uses CSS-native config (@theme directive instead of tailwind.config.js), Rust-based engine (5x faster builds), built-in container queries, 3D transform utilities. Dark mode via CSS variables -- perfect for cinematic dark theme. | HIGH |
| tailwind-merge | ^3.x | Merge Tailwind classes safely | Resolves conflicting Tailwind classes when composing shadcn/ui components. Dependency of shadcn/ui's `cn()` utility. | HIGH |
| clsx | ^2.x | Conditional class names | Lightweight conditional className builder. Used alongside tailwind-merge in shadcn/ui's `cn()` function. | HIGH |

### Component System (21st.dev Ecosystem)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| shadcn/ui (CLI v4) | latest | Base component primitives | 21st.dev is built on top of shadcn/ui. Components are copied into your project (not installed as dependency) -- full ownership and customization. Radix UI primitives underneath for accessibility. CLI v4 scaffolds dark mode by default for Next.js projects. | HIGH |
| Radix UI Primitives | (via shadcn) | Accessible headless components | Underlying primitives for shadcn/ui. Dialog, Dropdown, Tabs, Toast, etc. Unstyled and accessible by default. Installed per-component as needed. | HIGH |
| class-variance-authority | ^0.7 | Component variant management | Used by shadcn/ui for defining component variants (size, color, state). Already part of shadcn/ui's setup. | HIGH |

**21st.dev integration:** 21st.dev is a community registry of shadcn/ui-based components. You browse the registry, then install components via `npx shadcn add [component-url]`. Components land in your `components/ui/` directory as owned source code. No runtime dependency on 21st.dev -- it is a discovery and install tool, not a package you import.

### Animation
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Motion (Framer Motion) | ^12.38 | UI transitions, layout animations, page transitions | The standard React animation library. Declarative API integrates naturally with React component model. Layout animations, AnimatePresence for mount/unmount, scroll-linked animations via useScroll/useMotionValue. 32KB gzip but treeshakeable. Install as `motion`, import from `motion/react`. | HIGH |
| GSAP + @gsap/react | ^3.14 + ^2.x | Complex scroll-driven hero, parallax, timelines | Keep GSAP for the interactive 3D parallax hero and cinematic scroll sequences where timeline control and ScrollTrigger are essential. useGSAP hook handles React lifecycle cleanup automatically. All plugins free (Webflow acquisition). Use GSAP for hero/showpiece animations, Motion for everything else. | HIGH |

**Two animation libraries -- here is why:** Motion handles 90% of UI animation needs (page transitions, hover states, layout shifts, reveal animations). GSAP handles the remaining 10% where Motion falls short: frame-accurate timeline sequencing, scroll-scrubbed parallax, and the interactive 3D hero showcase. The project already has GSAP expertise from v1-v3. Both coexist cleanly -- Motion for React-idiomatic animations, GSAP for cinematic showpiece moments.

**Why not GSAP-only in React:** GSAP requires manual ref management, cleanup via useGSAP, and imperative patterns that fight React's declarative model. For standard UI animations (hover, appear, layout), Motion's declarative API is dramatically simpler and more maintainable.

**Why not Motion-only:** Motion has no true timeline system. The hero's 3D parallax, scroll-scrubbed sequences, and multi-element orchestrated timelines need GSAP's timeline and ScrollTrigger. Motion's useScroll is good for simple parallax but insufficient for the cinematic hero described in PROJECT.md.

### Image Handling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next-cloudinary | ^7.x | Cloudinary integration for Next.js | CldImage component wraps next/image with automatic Cloudinary optimizations (format, quality, resize, crop). CldUploadWidget for admin uploads. Handles responsive srcset generation. Drop-in replacement that speaks both Next.js Image API and Cloudinary transforms. | HIGH |
| next/image | (built-in) | Image optimization | Built into Next.js. Automatic lazy loading, responsive sizing, format negotiation. next-cloudinary's CldImage builds on top of this. For non-Cloudinary images (logos, icons), use next/image directly. | HIGH |

**Why next-cloudinary over custom Cloudinary loader:** A custom loader only handles URL generation. next-cloudinary provides CldImage (optimized display), CldUploadWidget (admin uploads), CldOgImage (social sharing images), and CldVideoPlayer -- all integrated with Next.js patterns. One package replaces multiple manual integrations.

### Blog / Content
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next-mdx-remote | ^6.0 | MDX rendering for blog posts | Renders MDX content in Server Components. Blog posts stored as .mdx files (or generated from admin editor). Supports custom React components in markdown. Lighter than Contentlayer (which is unmaintained and incompatible with Next.js 14+). | HIGH |
| gray-matter | ^4.0 | Frontmatter parsing | Already used in v3. Parses YAML frontmatter from MDX files for title, date, tags, cover image metadata. | HIGH |

**Why not Contentlayer:** Contentlayer is effectively abandoned -- it does not support Next.js 14+, let alone 15. It was excellent when maintained but is no longer viable.

**Why not @next/mdx:** Built-in MDX support requires file-system routing (each .mdx file must be a page file). next-mdx-remote allows loading MDX from any source (file system, admin editor output, API), which is needed for the admin-managed blog.

### Gallery / Lightbox
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| yet-another-react-lightbox | ^3.x | Full-screen image lightbox | Purpose-built for React/Next.js. Supports next/image component integration directly. Plugins for thumbnails, zoom, slideshow, captions, video. Smaller bundle than wrapping PhotoSwipe in React. TypeScript-first. | HIGH |

**Why not react-photoswipe-gallery:** PhotoSwipe v5 was designed for vanilla JS. The React wrapper (react-photoswipe-gallery) works but adds an impedance mismatch -- PhotoSwipe manages its own DOM while React wants to manage DOM. yet-another-react-lightbox is React-native, supports next/image, and has a plugin architecture for thumbnails/zoom/captions.

### Authentication (Admin Panel)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Netlify Identity | (service) | Single-user admin auth | Already in use from v2-v3. Free for up to 1,000 users/month. netlify-identity-widget provides login UI. For a single-owner admin panel, this is the simplest option -- no external auth provider, no OAuth setup, no database. JWT tokens validate admin access to API routes. | MEDIUM |

**Why keep Netlify Identity:** It works, it is free, and it is already configured. The admin is single-user (David only). Migrating to NextAuth.js or Auth0 adds complexity for zero user benefit. The only risk is Netlify deprecating Identity -- as of February 2026, it remains supported.

**If Netlify Identity is deprecated:** NextAuth.js (Auth.js) with a simple credentials provider is the fallback. Requires a session store but no external service. Cross that bridge if/when Netlify announces deprecation.

### Forms
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Formspree | (service) | Contact/booking form submissions | Platform-agnostic form backend. Already in use. 50 free submissions/month. Works with any frontend framework. In Next.js, submit via fetch to Formspree endpoint from a client component or server action. | HIGH |

### Deployment
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Netlify | (service) | Hosting, CDN, serverless functions | Existing deployment target. OpenNext adapter handles Next.js SSR/SSG/ISR on Netlify. Free tier supports serverless functions (needed for admin API routes). Global CDN, automatic HTTPS, preview deploys on branches. | HIGH |
| @netlify/plugin-nextjs | latest | Next.js build adapter for Netlify | OpenNext-based adapter that translates Next.js output to Netlify's infrastructure. Handles static pages, server-rendered pages, API routes, and middleware. Zero-config for Next.js 15. | HIGH |

### Development Tools
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^9.x | Code quality | Next.js ships with eslint-config-next. Catches React hooks violations, accessibility issues, Next.js-specific anti-patterns. | HIGH |
| Prettier | ^3.x | Code formatting | Consistent formatting across components. prettier-plugin-tailwindcss auto-sorts Tailwind classes. | HIGH |
| prettier-plugin-tailwindcss | ^0.6 | Tailwind class sorting | Automatically sorts Tailwind utility classes in a consistent order. Reduces merge conflicts and improves readability. | HIGH |

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @gsap/react | ^2.x | GSAP React integration | Hero section, cinematic scroll sequences only |
| gsap (ScrollTrigger, ScrollSmoother) | ^3.14 | Scroll-driven animation plugins | Hero parallax, scroll-scrubbed timelines |
| lucide-react | latest | Icon library | UI icons throughout the site. Tree-shakeable, only ships icons you import. |
| sharp | ^0.34 | Image processing (build-time) | Already used. Next.js uses sharp internally for image optimization. Keep as dev dependency. |
| embla-carousel-react | ^8.x | Touch-friendly carousel/slider | If gallery or hero needs horizontal swipe interaction. Lightweight (5KB gzip), headless, composable. Only add if needed. |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Tailwind CSS v3 | v4 is stable and required by shadcn/ui CLI v4. v3 uses JS config; v4 uses CSS-native @theme. Do not mix versions. |
| styled-components / Emotion | Tailwind CSS handles all styling. CSS-in-JS adds runtime overhead and conflicts with Server Components. |
| Redux / Zustand | No global state complex enough to warrant a state library. React Context + useState covers admin panel state. Add Zustand only if state management becomes painful. |
| Contentlayer | Unmaintained, incompatible with Next.js 14+. Dead project. |
| next-themes | Unnecessary. The site is always dark theme. There is no theme toggle. |
| react-query / SWR | Public pages are statically generated (no client-side data fetching). Admin panel uses simple fetch + API routes. Only add if admin panel needs caching/revalidation patterns. |
| SortableJS | Replace with @dnd-kit/core for React-native drag-and-drop in admin panel. SortableJS manipulates DOM directly, conflicts with React. |
| lite-youtube-embed | Use next-cloudinary CldVideoPlayer or a React-compatible YouTube embed (react-lite-youtube-embed). |

## Stack Patterns

### Pattern 1: Static Generation for Public Pages
**What:** All public pages (gallery, blog, about, contact) are statically generated at build time.
**Why:** Zero runtime cost, fastest possible page loads, works within Netlify free tier (no serverless function invocations for page views).
**How:** Use `generateStaticParams()` for blog post routes, import gallery data at build time from `src/data/gallery-images.js`.

### Pattern 2: API Routes for Admin Operations
**What:** Admin operations (upload images, manage blog posts, reorder gallery) go through Next.js API routes.
**Why:** Keeps Cloudinary credentials server-side. Enables file uploads without client-side SDK exposure.
**How:** `/app/api/admin/upload/route.ts`, `/app/api/admin/blog/route.ts`, etc. Protected by Netlify Identity JWT verification.

### Pattern 3: Motion for UI + GSAP for Showpiece
**What:** Use Motion (Framer Motion) as the default animation library. Use GSAP only for the hero section and cinematic scroll sequences.
**Why:** Motion's declarative API is idiomatic React. GSAP's imperative API is necessary only where Motion's capabilities fall short (timelines, scroll-scrub).
**How:** Motion components throughout the site. GSAP isolated to `components/hero/` with useGSAP hook for cleanup.

### Pattern 4: CldImage Everywhere
**What:** Use next-cloudinary's CldImage for all photography display.
**Why:** Automatic responsive sizing, format negotiation (WebP/AVIF), quality optimization, and Cloudinary transformations -- all through a single component.
**How:** `<CldImage src="public-id" width={800} height={600} alt="..." />` with Cloudinary cloud name in env vars.

### Pattern 5: Component Ownership via shadcn/ui
**What:** Install shadcn/ui components into `components/ui/`. Customize freely.
**Why:** No vendor lock-in. Full control over styling and behavior. 21st.dev components follow the same pattern -- install, own, customize.
**How:** `npx shadcn add button dialog tabs` copies components into your project. Modify Tailwind classes and variants as needed.

## Version Compatibility Matrix

| Package | Min Node | React | Next.js | Tailwind | Notes |
|---------|----------|-------|---------|----------|-------|
| Next.js 15.3 | 18.18+ | 19.x | - | Any | App Router, Server Components |
| Tailwind CSS 4.1 | - | - | - | - | CSS-native config, @theme directive |
| shadcn/ui CLI v4 | 18+ | 18+/19 | 14+/15 | v4 | Scaffolds dark mode by default |
| Motion 12.38 | - | 18+/19 | Any | - | Import from motion/react |
| GSAP 3.14 | - | Any | Any | - | Use with @gsap/react |
| next-cloudinary 7.x | - | 18+/19 | 13+/14/15 | - | CldImage, CldUploadWidget |
| next-mdx-remote 6.0 | - | 19+ | 15+ | - | Server Component support |
| yet-another-react-lightbox 3.x | - | 18+/19 | Any | - | Plugin architecture |

## Installation

```bash
# Create Next.js project
npx create-next-app@latest automotive-portfolio --typescript --tailwind --eslint --app --src-dir

# Core dependencies
npm install motion gsap @gsap/react next-cloudinary next-mdx-remote gray-matter yet-another-react-lightbox lucide-react clsx tailwind-merge class-variance-authority

# shadcn/ui initialization (interactive -- sets up components/ui/ directory)
npx shadcn@latest init

# Install specific shadcn/ui components as needed
npx shadcn@latest add button card dialog tabs dropdown-menu toast

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss

# Netlify adapter (auto-detected, but explicit install recommended)
npm install -D @netlify/plugin-nextjs

# Auth (existing, keep)
npm install netlify-identity-widget

# Form handling (no install needed -- Formspree is API-based)
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Next.js 16 | Breaking changes, Netlify adapter still maturing for 16.x. Upgrade later when stable. |
| Framework | Next.js 15 | Astro 6 | 21st.dev requires React component model. Astro islands would work but adds complexity for a React-heavy site. |
| Styling | Tailwind CSS v4 | Vanilla CSS | 21st.dev/shadcn/ui require Tailwind. Bespoke CSS no longer practical with component library integration. |
| UI Animation | Motion 12 | React Spring | Smaller community, less maintained, fewer features. Motion is the clear ecosystem leader. |
| Scroll Animation | GSAP ScrollTrigger | Motion useScroll | Motion's scroll API handles simple parallax but cannot do timeline sequencing or scroll-scrub with the control GSAP provides. |
| Lightbox | yet-another-react-lightbox | react-photoswipe-gallery | PhotoSwipe wrapper has React/DOM impedance mismatch. YARL is React-native with next/image support. |
| Blog/MDX | next-mdx-remote | Contentlayer | Contentlayer abandoned, incompatible with Next.js 14+. |
| Blog/MDX | next-mdx-remote | @next/mdx | Built-in MDX requires file-system routing. Admin-managed blog needs dynamic content loading. |
| Auth | Netlify Identity | NextAuth.js | Added complexity for a single-user admin. Netlify Identity already works and is free. |
| Auth | Netlify Identity | Auth0 | Overkill for single-user. Auth0 free tier has limits and adds external dependency. |
| Drag-and-drop | @dnd-kit/core (if needed) | SortableJS | SortableJS manipulates DOM directly, conflicts with React's virtual DOM. @dnd-kit is React-native. |
| State | React Context | Zustand/Redux | No complex cross-component state. Admin panel state is localized. Over-engineering. |

## Migration Notes (v3 to v4)

### What Carries Over
- **Cloudinary cloud name and credentials** -- same account, same public IDs
- **Gallery image data** (`src/data/gallery-images.js`) -- import into Next.js data layer
- **Blog content** (if any .md files exist) -- convert to .mdx format
- **Netlify site** -- same site, update build command to `next build`
- **Formspree endpoint** -- same form ID, update to React form submission
- **Netlify Identity** -- same identity instance, wrap widget in React component
- **GSAP knowledge** -- hero animations port to useGSAP hook pattern

### What Gets Replaced
| v3 (Vanilla) | v4 (Next.js) | Notes |
|--------------|--------------|-------|
| `index.html` single page | `/app/page.tsx` + route pages | Multi-page architecture |
| Vanilla CSS | Tailwind CSS v4 | Required by shadcn/ui |
| PhotoSwipe | yet-another-react-lightbox | React-native lightbox |
| SortableJS | @dnd-kit/core | React-native drag-and-drop |
| `<img>` tags | `<CldImage>` component | Cloudinary + Next.js optimization |
| lite-youtube-embed | react-lite-youtube-embed or CldVideoPlayer | React-compatible embed |
| Vite dev server | Next.js dev server | Built into Next.js |
| Manual CSS dark theme | Tailwind dark mode + CSS variables | @theme directive in v4 |

## Sources

- [Next.js 15 vs 16 Comparison](https://www.descope.com/blog/post/nextjs15-vs-nextjs16) - Version decision rationale
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Breaking changes documentation
- [Netlify Next.js 16 Support](https://www.netlify.com/changelog/next-js-16-deploy-on-netlify/) - Netlify adapter status
- [OpenNext Netlify Adapter](https://github.com/opennextjs/opennextjs-netlify) - Open-source Next.js adapter for Netlify
- [shadcn/ui CLI v4 Changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) - Latest CLI features
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Setup guide
- [21st.dev GitHub](https://github.com/serafimcloud/21st) - shadcn/ui-based component registry
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-native config, Rust engine
- [Motion (Framer Motion) Changelog](https://motion.dev/changelog) - v12.38.0 latest
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) - framer-motion to motion migration
- [GSAP React Guide](https://gsap.com/resources/React/) - useGSAP hook, ScrollTrigger in React
- [GSAP vs Motion Comparison](https://motion.dev/docs/gsap-vs-motion) - Official comparison
- [next-cloudinary Documentation](https://next.cloudinary.dev/) - CldImage, CldUploadWidget
- [next-cloudinary GitHub](https://github.com/cloudinary-community/next-cloudinary) - Package repository
- [next-mdx-remote npm](https://www.npmjs.com/package/next-mdx-remote) - v6.0.0 latest
- [Yet Another React Lightbox](https://yet-another-react-lightbox.com/examples/nextjs) - Next.js integration examples
- [Netlify Identity Status](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/) - Continued support confirmed
- [Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) - Ecosystem overview
