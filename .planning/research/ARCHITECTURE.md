# Architecture Patterns: Next.js Multi-Page Portfolio

**Domain:** Automotive photography portfolio rebuild (Vite vanilla JS -> Next.js + React)
**Researched:** 2026-03-26
**Overall Confidence:** HIGH (official docs verified for all critical claims)

## System Overview

```
                         BUILD TIME                              RUNTIME
  ┌─────────────────────────────────────────┐    ┌──────────────────────────────────┐
  │                                         │    │                                  │
  │  Cloudinary API ──> build-gallery-data  │    │    Netlify CDN (static pages)    │
  │       │                  │              │    │         │                        │
  │       │           gallery-data.json     │    │    ┌────┴────┐                   │
  │       │                  │              │    │    │  Edge   │                   │
  │       │          Next.js SSG Build      │    │    │ Middle- │                   │
  │       │          ┌───────┴───────┐      │    │    │  ware   │                   │
  │       │          │ Static Pages  │      │    │    └────┬────┘                   │
  │       │          │  /            │      │    │         │                        │
  │       │          │  /gallery     │──────│───>│    Static HTML + JS bundles      │
  │       │          │  /blog        │      │    │                                  │
  │       │          │  /blog/[slug] │      │    │    ┌─────────────────────┐       │
  │       │          │  /about       │      │    │    │  Netlify Functions  │       │
  │       │          │  /contact     │      │    │    │  (SSR + API Routes) │       │
  │       │          └───────────────┘      │    │    │                     │       │
  │       │                                 │    │    │  /api/admin/*       │       │
  │       └─────────────────────────────────│───>│    │  /admin/* (SSR)     │       │
  │                                         │    │    └─────────┬───────────┘       │
  └─────────────────────────────────────────┘    │              │                   │
                                                 │         Cloudinary               │
                                                 │         (images + uploads)       │
                                                 └──────────────────────────────────┘

  Auth: Netlify Identity JWT ──> middleware.ts validates ──> protects /admin/* routes
  Images: CldImage (next-cloudinary) ──> Cloudinary CDN transforms ──> browser
```

## Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `app/(public)/` | Public pages: Home, Gallery, Blog, About, Contact | Cloudinary (via build data), Formspree |
| `app/(admin)/admin/` | Admin panel: gallery management, blog editor, uploads | API routes, Cloudinary |
| `app/api/admin/` | Protected API routes: CRUD for images and blog posts | Cloudinary API, GitHub API (blog) |
| `middleware.ts` | JWT validation for `/admin` and `/api/admin` routes | Netlify Identity (JWT verification) |
| `scripts/build-gallery-data.mjs` | Build-time Cloudinary fetch, generates static gallery data | Cloudinary Search API |
| `lib/cloudinary.ts` | Shared Cloudinary config and helpers | Cloudinary SDK |
| `components/` | Reusable React components (gallery grid, lightbox, nav) | Props from parent pages |

## Recommended Project Structure

```
automotive-portfolio/
├── app/
│   ├── layout.tsx                    # Root layout (dark theme, fonts, metadata)
│   ├── page.tsx                      # Home page (hero, featured gallery, CTA)
│   ├── globals.css                   # Global styles + Tailwind
│   │
│   ├── (public)/                     # Route group: public pages (no URL prefix)
│   │   ├── gallery/
│   │   │   └── page.tsx              # Gallery page (SSG, reads build-time data)
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog listing (SSG)
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual blog post (SSG + ISR)
│   │   ├── about/
│   │   │   └── page.tsx              # About page (static)
│   │   └── contact/
│   │       └── page.tsx              # Contact page with Formspree form
│   │
│   ├── (admin)/                      # Route group: admin panel (no URL prefix)
│   │   └── admin/
│   │       ├── layout.tsx            # Admin layout (sidebar nav, auth gate)
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── gallery/
│   │       │   └── page.tsx          # Gallery management (upload, reorder, delete)
│   │       └── blog/
│   │           ├── page.tsx          # Blog post list
│   │           └── [slug]/
│   │               └── page.tsx      # Blog editor
│   │
│   └── api/
│       └── admin/
│           ├── images/
│           │   ├── route.ts          # GET list, POST upload
│           │   └── [id]/
│           │       └── route.ts      # PATCH update, DELETE remove
│           ├── reorder/
│           │   └── route.ts          # POST reorder images
│           ├── posts/
│           │   ├── route.ts          # GET list, POST create
│           │   └── [slug]/
│           │       └── route.ts      # GET single, PUT update, DELETE remove
│           └── rebuild/
│               └── route.ts          # POST trigger Netlify rebuild
│
├── components/
│   ├── ui/                           # Primitives (Button, Card, Input, etc.)
│   ├── gallery/
│   │   ├── GalleryGrid.tsx           # Masonry grid with category filtering
│   │   ├── GalleryImage.tsx          # Single image card (wraps CldImage)
│   │   ├── CategoryFilter.tsx        # Category pill/tab selector
│   │   └── Lightbox.tsx              # Full-screen image viewer
│   ├── blog/
│   │   ├── PostCard.tsx              # Blog post preview card
│   │   └── PostContent.tsx           # Rendered markdown content
│   ├── hero/
│   │   └── HeroSection.tsx           # 3D parallax hero showcase
│   ├── layout/
│   │   ├── Navbar.tsx                # Site navigation
│   │   ├── Footer.tsx                # Site footer
│   │   └── MobileMenu.tsx            # Mobile hamburger menu
│   ├── admin/
│   │   ├── AdminSidebar.tsx          # Admin navigation sidebar
│   │   ├── ImageUploader.tsx         # Drag-and-drop upload widget
│   │   ├── SortableGallery.tsx       # Drag-to-reorder gallery manager
│   │   └── BlogEditor.tsx            # Markdown blog editor
│   └── shared/
│       ├── CldImageWrapper.tsx       # "use client" wrapper for CldImage
│       └── ContactForm.tsx           # Formspree contact/booking form
│
├── lib/
│   ├── cloudinary.ts                 # Cloudinary SDK config + helpers
│   ├── auth.ts                       # Netlify Identity JWT verification (jose)
│   ├── gallery-data.ts              # Type-safe gallery data loader
│   └── blog.ts                       # Blog post fetching + markdown parsing
│
├── data/
│   └── gallery-images.json           # Build-time generated (replaces .js export)
│
├── scripts/
│   └── build-gallery-data.mjs        # Prebuild: Cloudinary -> JSON
│
├── public/
│   └── fonts/                        # Self-hosted fonts
│
├── middleware.ts                      # Root: JWT auth for /admin/* routes
├── next.config.ts                     # Next.js config (Cloudinary, images)
├── tailwind.config.ts                # Tailwind config (dark theme tokens)
├── netlify.toml                       # Netlify build config
└── package.json
```

### Key Structural Decisions

**Route Groups `(public)` and `(admin)`:** These create separate layout hierarchies without affecting URLs. The public group gets the site-wide Navbar/Footer layout. The admin group gets a dashboard-style sidebar layout. This prevents admin styles/scripts from bleeding into public bundles.

**Home page at `app/page.tsx` (not inside route group):** The home page uses the root layout directly. It needs unique layout treatment (full-bleed hero, no standard nav pattern) that differs from both public subpages and admin.

**API routes under `app/api/admin/`:** Consolidating all admin API endpoints under one prefix makes middleware auth simple (match `/api/admin/:path*`). Public pages need zero API calls at runtime -- they read static build-time data.

## Architectural Patterns

### Pattern 1: Build-Time Static Data for Gallery

**What:** Fetch all Cloudinary image metadata at build time, write to a JSON file, import statically in pages.

**Why:** The project constraint requires "gallery must remain static build-time data (no runtime API calls)." This preserves the current architecture's performance while moving to Next.js.

**How it works:**

```
prebuild script (build-gallery-data.mjs)
  ├── Fetches Cloudinary Search API
  ├── Generates LQIP base64 strings
  ├── Writes data/gallery-images.json
  └── Next.js build reads JSON as static import

app/(public)/gallery/page.tsx (Server Component)
  ├── import galleryData from '@/data/gallery-images.json'
  ├── Renders at build time (SSG)
  └── Zero runtime API calls
```

```typescript
// app/(public)/gallery/page.tsx — Server Component, no "use client"
import galleryData from '@/data/gallery-images.json';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export default function GalleryPage() {
  return <GalleryGrid images={galleryData.images} categories={galleryData.categories} />;
}
```

```typescript
// components/gallery/GalleryGrid.tsx — Client Component for interactivity
'use client';
import { useState } from 'react';
import { CldImageWrapper } from '@/components/shared/CldImageWrapper';

export function GalleryGrid({ images, categories }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all'
    ? images
    : images.filter(img => img.category === activeCategory);
  // ... render masonry grid with category filter tabs
}
```

**Confidence:** HIGH -- this directly mirrors the existing `prebuild` script pattern, just outputting JSON instead of a JS module.

### Pattern 2: CldImage with Pre-Generated LQIP Blurs

**What:** Use `next-cloudinary`'s `CldImage` component with the LQIP base64 strings already generated at build time as `blurDataURL`.

**Why:** The existing build pipeline already generates LQIP base64 data URLs. CldImage wraps `next/image` and supports `placeholder="blur"` + `blurDataURL`. This gives instant blur-up loading with zero extra work.

**How:**

```typescript
// components/shared/CldImageWrapper.tsx
'use client';
import { CldImage } from 'next-cloudinary';

interface Props {
  publicId: string;       // e.g., "gallery/jdm/jdm-street-racer-01"
  width: number;
  height: number;
  alt: string;
  lqip: string;           // Pre-generated base64 data URL
  sizes?: string;
}

export function CldImageWrapper({ publicId, width, height, alt, lqip, sizes }: Props) {
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      placeholder="blur"
      blurDataURL={lqip}
    />
  );
}
```

**Why CldImage over raw `next/image`:** CldImage handles Cloudinary URL construction, automatic format negotiation (avif/webp), and responsive transforms without manually constructing transformation URLs. The existing Cloudinary URLs in `gallery-images.js` include hardcoded transforms (`c_limit,f_auto,q_auto,w_2000`). CldImage generates these dynamically based on the rendered size, which is more efficient.

**Important:** CldImage requires `"use client"` because it's a client component. Wrap it to avoid marking entire pages as client components.

**Environment variable required:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env.local` (and Netlify env vars).

**Confidence:** HIGH -- verified from next-cloudinary official docs.

### Pattern 3: Middleware-Based Admin Auth with Netlify Identity

**What:** Use Next.js middleware to verify Netlify Identity JWT tokens for all `/admin` and `/api/admin` routes.

**Why:** Centralized auth at the edge. No per-route auth checks needed. Netlify Identity is already in use and free.

**Critical detail:** Next.js middleware runs in Edge Runtime, which does NOT support Node.js `crypto`. Use the `jose` library (Web Crypto API compatible) for JWT verification instead of `jsonwebtoken`.

```typescript
// middleware.ts
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NETLIFY_IDENTITY_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

export async function middleware(request: NextRequest) {
  // Skip non-admin routes
  const { pathname } = request.nextUrl;

  const token = request.headers.get('authorization')?.replace('Bearer ', '')
    || request.cookies.get('nf_jwt')?.value;

  if (!token) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect browser requests to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    // Netlify Identity uses HMAC with the JWT secret
    const secret = new TextEncoder().encode(process.env.NETLIFY_JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

**Confidence:** MEDIUM -- the JWT verification with `jose` in middleware is well-documented in Next.js. The Netlify Identity JWT secret retrieval method needs validation during implementation (verify the env var name and HMAC algorithm Netlify Identity uses). The `netlify-identity-widget` for the login UI is already a project dependency.

### Pattern 4: API Routes Replace Netlify Functions

**What:** Migrate all 11 existing Netlify Functions to Next.js Route Handlers under `app/api/admin/`.

**Why:** When deploying Next.js on Netlify, API routes are automatically deployed as Netlify Functions with zero configuration. This eliminates maintaining two separate function patterns (Netlify Functions `.mjs` files + Next.js). The middleware handles auth centrally, removing per-function JWT checks.

**Migration mapping:**

| Existing Netlify Function | New API Route | Method |
|--------------------------|---------------|--------|
| `list-images.mjs` | `app/api/admin/images/route.ts` | GET |
| `upload-image.mjs` | `app/api/admin/images/route.ts` | POST |
| `sign-upload.mjs` | `app/api/admin/images/route.ts` | POST (action=sign) |
| `update-image.mjs` | `app/api/admin/images/[id]/route.ts` | PATCH |
| `delete-image.mjs` | `app/api/admin/images/[id]/route.ts` | DELETE |
| `restore-image.mjs` | `app/api/admin/images/[id]/route.ts` | PUT |
| `reorder-images.mjs` | `app/api/admin/reorder/route.ts` | POST |
| `list-posts.mjs` | `app/api/admin/posts/route.ts` | GET |
| `save-post.mjs` | `app/api/admin/posts/route.ts` | POST |
| `delete-post.mjs` | `app/api/admin/posts/[slug]/route.ts` | DELETE |
| `trigger-rebuild.mjs` | `app/api/admin/rebuild/route.ts` | POST |

**Example migration:**

```typescript
// app/api/admin/images/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Auth already handled by middleware -- no JWT checks needed here

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showHidden = searchParams.get('show_hidden') === 'true';

  const expression = showHidden
    ? 'folder:gallery/* AND tags:hidden'
    : 'folder:gallery/* AND -tags:hidden';

  const result = await cloudinary.search
    .expression(expression)
    .with_field('context')
    .with_field('tags')
    .sort_by('created_at', 'desc')
    .max_results(200)
    .execute();

  // ... transform and return
  return NextResponse.json({ images: transformedImages });
}
```

**Confidence:** HIGH -- Netlify docs confirm API routes deploy as serverless functions automatically.

### Pattern 5: Server Components for Public Pages, Client Components for Interactivity

**What:** Default to React Server Components for all public pages. Use `"use client"` only for components requiring browser APIs (state, effects, event handlers).

**Why:** Server Components render at build time (SSG) or on-server (SSR), producing zero client JS. This keeps the public site bundle small (constraint: under 80KB gzip).

**Server Component (default):**
- Page layouts
- Blog post content rendering
- About page
- Contact page structure
- Gallery page shell

**Client Component ("use client"):**
- `GalleryGrid` (category filtering with useState)
- `CldImageWrapper` (CldImage requires client)
- `Lightbox` (overlay, keyboard handlers)
- `HeroSection` (scroll animations, 3D parallax)
- `MobileMenu` (toggle state)
- `ContactForm` (form state, submission)
- All admin components (highly interactive)

**Confidence:** HIGH -- standard Next.js App Router pattern.

## Data Flow

### Public Site (Build Time)

```
1. prebuild: scripts/build-gallery-data.mjs
   └── Cloudinary Search API -> data/gallery-images.json

2. Next.js build:
   ├── app/page.tsx (Home)
   │   └── Imports featured images from gallery-images.json
   │   └── Static HTML generated
   │
   ├── app/(public)/gallery/page.tsx
   │   └── Imports all images from gallery-images.json
   │   └── Static HTML + client JS for filtering
   │
   ├── app/(public)/blog/page.tsx
   │   └── Fetches post list from GitHub API (or local markdown)
   │   └── Static HTML generated
   │
   ├── app/(public)/blog/[slug]/page.tsx
   │   └── generateStaticParams() -> all slugs
   │   └── Fetches markdown, renders HTML
   │   └── Static HTML per post
   │
   └── app/(public)/about/page.tsx, contact/page.tsx
       └── Pure static, no data fetching

3. Output: Static HTML + JS chunks -> Netlify CDN
```

### Admin Panel (Runtime)

```
1. User navigates to /admin
2. middleware.ts checks JWT (cookie or Authorization header)
   ├── No token -> redirect to /admin/login
   └── Valid token -> allow through

3. Admin page loads (SSR or client-rendered)
4. Admin components call /api/admin/* endpoints
   ├── GET /api/admin/images -> Cloudinary search
   ├── POST /api/admin/images -> Cloudinary upload (signed)
   ├── PATCH /api/admin/images/[id] -> update metadata
   ├── DELETE /api/admin/images/[id] -> tag as hidden
   ├── POST /api/admin/reorder -> update sort_order
   ├── GET /api/admin/posts -> GitHub API list
   ├── POST /api/admin/posts -> GitHub API create/update
   ├── DELETE /api/admin/posts/[slug] -> GitHub API delete
   └── POST /api/admin/rebuild -> Netlify build hook

5. After changes: trigger rebuild -> new static gallery data
```

### Image Delivery (Runtime, Public)

```
Browser requests page
  └── Static HTML includes <img> tags with Cloudinary URLs
      └── CldImage generates responsive srcset URLs
          └── Cloudinary CDN serves optimized format (avif/webp)
              └── Browser displays with LQIP blur-up transition
```

## Integration Points: Existing -> New

### What Stays the Same

| Component | Current | Next.js | Changes Needed |
|-----------|---------|---------|----------------|
| Cloudinary image storage | `gallery/*` folders | Same | None |
| Cloudinary env vars | `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET` | Same + `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Add public var |
| Blog storage | GitHub repo `content/blog/*.md` | Same | None |
| Build-time gallery data | `prebuild` script | Same script, JSON output | Minor format change |
| Netlify hosting | Netlify CDN | Same (Next.js adapter) | `netlify.toml` update |
| Auth provider | Netlify Identity | Same | Middleware instead of per-function |
| Contact form | Formspree | Same | React component wrapper |
| Image categories | 5 categories in Cloudinary folders | Same | None |

### What Changes

| Component | Current | Next.js | Migration Effort |
|-----------|---------|---------|-----------------|
| Build tool | Vite 6 | Next.js | Full rewrite |
| Routing | Single HTML page + anchors | App Router file-based | Full rewrite |
| Components | Vanilla JS modules | React components | Full rewrite |
| Styling | CSS + tokens.css | Tailwind CSS | Full rewrite |
| Animations | GSAP (vanilla) | GSAP (React wrappers) or Framer Motion | Moderate rewrite |
| Image display | `<img>` with manual srcset | CldImage component | Moderate rewrite |
| Gallery lightbox | PhotoSwipe 5 | React lightbox (yet-another-react-lightbox or custom) | Replace library |
| Admin HTML | `admin.html` (single file) | React components in `(admin)` route group | Full rewrite |
| API functions | `netlify/functions/*.mjs` | `app/api/admin/*/route.ts` | Moderate migration |
| Gallery data format | ES module export (.js) | JSON file (.json) | Trivial |
| Blog rendering | Build script (marked + gray-matter) | Next.js MDX or build-time markdown | Moderate |

### New Components Needed

| Component | Purpose | Complexity | Dependencies |
|-----------|---------|------------|-------------|
| `app/layout.tsx` | Root layout with dark theme, fonts, metadata | Low | Tailwind |
| `Navbar` | Multi-page navigation with active states | Low | Next.js Link |
| `HeroSection` | 3D parallax scroll-triggered hero | High | GSAP or Framer Motion |
| `GalleryGrid` | Masonry grid with filtering | Medium | CSS Grid + state |
| `CldImageWrapper` | Client wrapper for CldImage | Low | next-cloudinary |
| `Lightbox` | Fullscreen image viewer | Medium | React portal |
| `CategoryFilter` | Tab/pill category selector | Low | State |
| `PostCard` | Blog post preview | Low | Next.js Link |
| `PostContent` | Markdown renderer | Low | react-markdown or MDX |
| `ContactForm` | Formspree-backed booking form | Low | Form state |
| `AdminSidebar` | Admin navigation | Low | Next.js Link |
| `ImageUploader` | Drag-and-drop Cloudinary upload | Medium | Cloudinary widget |
| `SortableGallery` | Drag-to-reorder admin grid | Medium | dnd-kit or SortableJS |
| `BlogEditor` | Markdown editor with preview | Medium | textarea + react-markdown |
| `middleware.ts` | JWT auth gate | Low | jose |

## Build Order (Considering Dependencies)

This ordering ensures each phase has the dependencies it needs from previous phases.

### Phase 1: Foundation (no dependencies)
1. Initialize Next.js project with App Router + TypeScript + Tailwind
2. Configure `next.config.ts` with Cloudinary settings
3. Set up `netlify.toml` for Next.js deployment
4. Create root layout with dark theme tokens
5. Deploy blank Next.js site to Netlify (verify pipeline works)

### Phase 2: Static Public Pages (depends on Phase 1)
1. Adapt `build-gallery-data.mjs` to output JSON
2. Create `app/page.tsx` (Home) with static content
3. Create `app/(public)/gallery/page.tsx` reading JSON data
4. Build `GalleryGrid`, `CategoryFilter`, `CldImageWrapper` components
5. Create `app/(public)/about/page.tsx` (static)
6. Create `app/(public)/contact/page.tsx` with `ContactForm`
7. Build `Navbar` and `Footer` in public layout

### Phase 3: Blog (depends on Phase 2 for layout)
1. Create `app/(public)/blog/page.tsx` with `generateStaticParams`
2. Create `app/(public)/blog/[slug]/page.tsx` with markdown rendering
3. Build `PostCard` and `PostContent` components

### Phase 4: Hero + Animations (depends on Phase 2 for page structure)
1. Build `HeroSection` with 3D parallax/scroll effects
2. Add scroll-triggered animations to gallery and sections
3. Integrate into Home page

### Phase 5: Admin Panel (depends on Phase 1 for config, Phase 2 for image patterns)
1. Set up `middleware.ts` with JWT verification
2. Create admin login page with `netlify-identity-widget`
3. Migrate Netlify Functions to API routes
4. Build admin layout with sidebar
5. Build gallery management (upload, reorder, delete)
6. Build blog editor (create, edit, delete posts)

### Phase 6: Polish + Performance
1. Lighthouse audit and bundle optimization
2. SEO metadata for all pages
3. OG image generation with Cloudinary
4. Error boundaries and 404/500 pages

## Anti-Patterns to Avoid

### Anti-Pattern 1: Marking Entire Pages as Client Components

**What:** Adding `"use client"` to page-level files like `gallery/page.tsx`.

**Why bad:** Opts the entire page out of Server Component rendering, sending all page code as client JS. Violates the 80KB bundle constraint.

**Instead:** Keep pages as Server Components. Create small client component wrappers for interactive parts. Pass data as props from server to client.

### Anti-Pattern 2: Runtime Cloudinary API Calls on Public Pages

**What:** Calling the Cloudinary Search API on every page request.

**Why bad:** Adds latency, creates Cloudinary API rate limit risk, and violates the "static build-time data" constraint. The free tier has API call limits.

**Instead:** Keep the prebuild script pattern. Fetch once at build time, generate static JSON, rebuild when admin makes changes.

### Anti-Pattern 3: Using `next/image` Directly with Cloudinary URLs

**What:** Passing full Cloudinary URLs to the standard `next/image` component.

**Why bad:** On Netlify, `next/image` uses Netlify Image CDN for optimization. This double-processes images: Cloudinary transforms -> Netlify re-optimizes -> browser. Wastes bandwidth and Netlify image transform quota.

**Instead:** Use `next-cloudinary`'s `CldImage` which bypasses Netlify Image CDN and lets Cloudinary handle all transforms directly. Or configure a custom loader in `next.config.ts` that passes through Cloudinary URLs without Netlify reprocessing.

### Anti-Pattern 4: Storing Admin State in Server Components

**What:** Trying to use server actions or server state for the admin panel's interactive UI (drag-and-drop, modals, upload progress).

**Why bad:** Admin panel is highly interactive. Server round-trips for every drag event or modal toggle creates terrible UX.

**Instead:** Admin pages should be client components that call API routes. Keep the admin as a traditional SPA-like experience within the Next.js shell.

### Anti-Pattern 5: Exposing Cloudinary API Keys in Client Code

**What:** Using `CLOUDINARY_API_SECRET` in client components or exposing it via `NEXT_PUBLIC_` prefix.

**Why bad:** API secret allows full account access. Critical security vulnerability.

**Instead:** Only use `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` on the client. All operations requiring the secret (upload signing, search, delete) go through API routes.

## Netlify Deployment Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

# The @netlify/plugin-nextjs adapter handles everything automatically.
# No need to specify functions directory -- API routes become functions.

# Environment variables needed (set in Netlify dashboard, not here):
# CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
# GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
# NETLIFY_BUILD_HOOK
# NETLIFY_JWT_SECRET (for admin auth)
```

**Key change from current config:** The `publish` directory changes from `dist` to `.next`. The `functions` directive is removed because Next.js API routes auto-deploy as Netlify Functions. No redirects needed for `/admin` since it's a proper Next.js route now.

## Scalability Considerations

| Concern | Current (27 images) | At 200 images | At 1000+ images |
|---------|---------------------|---------------|-----------------|
| Build time | Fast (<30s) | Moderate (LQIP generation scales linearly) | Consider parallel batches, skip unchanged |
| Gallery page size | ~15KB JSON | ~100KB JSON | Paginate or lazy-load JSON chunks |
| Cloudinary API calls | ~30 at build | ~200 at build + LQIP fetches | Implement caching, incremental builds |
| Bundle size | Well under 80KB | Same (data is static, not bundled) | Same |
| Admin image list | Loads all at once | Needs pagination | Needs pagination + search |

## Sources

- [Next.js on Netlify - Official Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) -- HIGH confidence (official)
- [Next Cloudinary - CldImage Basic Usage](https://next.cloudinary.dev/cldimage/basic-usage) -- HIGH confidence (official)
- [Next Cloudinary - Placeholders Guide](https://next.cloudinary.dev/guides/placeholders) -- HIGH confidence (official)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) -- HIGH confidence (official)
- [Cloudinary Custom Loader Blog Post](https://cloudinary.com/blog/optimize-images-in-a-next-js-app-using-nextimage-and-custom-loaders) -- MEDIUM confidence
- [Netlify Blog: Deploy Next.js 15](https://www.netlify.com/blog/deploy-nextjs-15/) -- HIGH confidence (official)
- [Netlify: Next.js API Routes vs Functions](https://answers.netlify.com/t/netlify-serverless-functions-vs-next-js-api-routes/76880) -- MEDIUM confidence (community forum, Netlify staff responses)
- [next-cloudinary GitHub](https://github.com/cloudinary-community/next-cloudinary) -- HIGH confidence
