# Phase 11: Foundation & Pipeline Validation - Research

**Researched:** 2026-03-26
**Domain:** Next.js 15 project scaffolding, Netlify deployment, Cloudinary integration, dark theme FOUC prevention
**Confidence:** HIGH

## Summary

This phase creates a fresh Next.js 15 project alongside the existing Vite site, deploys it to a new staging Netlify site, and validates three pipelines: App Router routing with direct URL access, Cloudinary CldImage rendering with LQIP blur-up, and dark theme without FOUC. No features are built -- only the deployment skeleton is proven end-to-end.

The research confirms all locked decisions are sound. The CSS-only FOUC prevention approach using `color-scheme: dark` on the `<html>` element plus dark background in global CSS is the simplest and most reliable method for a dark-only site. The `next-cloudinary` package (v6.17.5, not v7.x as STACK.md stated -- corrected here) supports `placeholder="blur"` with custom `blurDataURL` props, which maps directly to the existing LQIP generation pipeline. Netlify auto-detects Next.js and provisions the OpenNext adapter with zero configuration required.

**Primary recommendation:** Scaffold with `npx create-next-app@15 --typescript --tailwind --eslint --app --src-dir --use-npm`, manually upgrade to Tailwind v4, configure the dark theme in `globals.css` and `layout.tsx`, add next-cloudinary with a single test CldImage, adapt the existing `build-gallery-data.js` to output JSON, and deploy to a new Netlify site. Validate all four success criteria on the deployed URL before considering the phase complete.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Create a fresh Next.js project alongside the existing Vite site (e.g., in a `next/` subdirectory or on a dedicated branch). The existing Vite site stays live and untouched until cutover.
- **D-02:** Migrate code piece by piece from existing Vite files -- do not rewrite from scratch.
- **D-03:** Keep all 11 existing Netlify Functions (.mjs) as-is for now. They continue to work alongside Next.js on Netlify. Migration to Next.js API routes happens in Phase 15 (Admin Panel).
- **D-04:** Use CSS-only approach with `color-scheme: dark` on the `<html>` tag plus dark background in global CSS. No JavaScript needed -- zero blocking scripts.
- **D-05:** Deploy to a new, separate Netlify site for staging. The existing site remains live at its current URL. DNS swap happens at launch (Phase 16).

### Claude's Discretion
- TypeScript configuration strictness level
- ESLint + Prettier configuration specifics
- Exact Tailwind v4 base configuration (tokens come in Phase 12)
- next-cloudinary configuration details
- Test image selection for CldImage validation

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| V4-FOUND-01 | User can view a Next.js 15 site deployed on Netlify with App Router | Netlify auto-detects Next.js, provisions OpenNext adapter. Deploy with `netlify sites:create` + git push. Direct URL access validated by checking all routes return 200. |
| V4-FOUND-02 | User sees images loaded via Cloudinary CDN with blur placeholders (CldImage + LQIP) | next-cloudinary 6.17.5 CldImage supports `placeholder="blur"` + `blurDataURL`. Existing build script generates LQIP base64. Adapt script to output JSON for Next.js consumption. |
| V4-FOUND-03 | Site JS bundle stays under 200KB gzipped | Next.js 15 + React 19 baseline is ~45KB gzip. With minimal page content and CldImage only, well under budget. `next build` output shows per-route JS sizes. |
</phase_requirements>

## Standard Stack

### Core (Phase 11 Only)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.14 | Framework | Latest stable 15.x. Netlify adapter mature. Locked decision from STACK.md. |
| React | 19.2.4 | UI library | Ships with Next.js 15.5.x. |
| TypeScript | 5.7+ | Type safety | Default with create-next-app. shadcn/ui requires TS. |
| Tailwind CSS | 4.2.2 | Styling | CSS-native config, @theme directive. Needed for shadcn/ui in Phase 12. |
| next-cloudinary | 6.17.5 | Cloudinary integration | CldImage wraps next/image with Cloudinary CDN. Supports blur placeholders. **Note:** STACK.md listed ^7.x but 6.17.5 is the actual latest. |
| @netlify/plugin-nextjs | 5.15.9 | Netlify adapter | OpenNext-based. Auto-detected but explicit install recommended for version pinning. |

### Supporting (Phase 11 Only)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cloudinary (Node SDK) | ^2.9.0 | Build-time gallery data | Already installed. Used by build-gallery-data script. Dev dependency only. |
| Prettier | ^3.x | Code formatting | Dev tool. prettier-plugin-tailwindcss for class sorting. |
| prettier-plugin-tailwindcss | ^0.6 | Tailwind class sorting | Dev tool. Sorts utility classes in consistent order. |

### Version Corrections from STACK.md
| STACK.md Says | Actual Latest | Action |
|---------------|--------------|--------|
| next-cloudinary ^7.x | 6.17.5 | Use ^6.17. No v7 exists. |
| Next.js ^15.3 | 15.5.14 | Use 15.5.14 for latest patches and security fixes. |
| Tailwind CSS ^4.1 | 4.2.2 | Use ^4.2 for latest. |
| @netlify/plugin-nextjs latest | 5.15.9 | Pin ^5.15 for stability. |

**Installation (Phase 11 minimal):**
```bash
# Scaffold Next.js project in next/ subdirectory
npx create-next-app@15 next --typescript --tailwind --eslint --app --src-dir --use-npm

# Inside next/ directory:
cd next

# Install Cloudinary integration
npm install next-cloudinary

# Install Netlify adapter (explicit pin)
npm install -D @netlify/plugin-nextjs

# Install Prettier + Tailwind plugin
npm install -D prettier prettier-plugin-tailwindcss

# Copy cloudinary SDK as dev dep for build script
npm install -D cloudinary
```

## Architecture Patterns

### Recommended Project Structure (Phase 11 Skeleton)
```
automotive-portfolio/
├── next/                          # New Next.js project (D-01: alongside Vite)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout: dark theme, fonts, metadata
│   │   │   ├── page.tsx           # Home page: minimal skeleton
│   │   │   └── globals.css        # Tailwind + dark theme base styles
│   │   ├── components/
│   │   │   └── CldImageWrapper.tsx # "use client" wrapper for CldImage
│   │   └── data/
│   │       └── gallery-images.json # Build-time generated gallery data
│   ├── scripts/
│   │   └── build-gallery-data.mjs  # Adapted from existing script (JSON output)
│   ├── public/
│   │   └── fonts/                  # Self-hosted fonts (if needed)
│   ├── next.config.ts              # Minimal config
│   ├── netlify.toml                # New site config
│   ├── .env.local                  # Local env vars
│   ├── .env.example                # Env var documentation
│   ├── package.json
│   └── tsconfig.json
├── src/                            # Existing Vite site (untouched)
├── netlify/functions/              # Existing 11 functions (untouched, D-03)
├── package.json                    # Existing Vite package.json
└── netlify.toml                    # Existing Vite netlify config
```

**Key structural decision:** The Next.js project lives in a `next/` subdirectory. This keeps the existing Vite site fully functional and deployable at its current Netlify site. The new `next/` directory gets its own `package.json`, `netlify.toml`, and is deployed to a separate Netlify site (D-05).

### Pattern 1: CSS-Only FOUC Prevention (D-04)

**What:** Hardcode dark theme in CSS with zero JavaScript involvement.

**Why:** For a dark-only site, JavaScript-based theme switching is unnecessary complexity. The `color-scheme: dark` CSS property tells the browser to use dark-mode defaults for native form controls, scrollbars, and system UI elements. Combined with explicit background color on `<html>`, this prevents any flash.

**Implementation:**

```css
/* globals.css */
@import "tailwindcss";

html {
  color-scheme: dark;
  background-color: #0e0e12;
}

body {
  color: #e5e5e5;
  background-color: #0e0e12;
}
```

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'David Bradley | Automotive Photography',
  description: 'Automotive photography portfolio by David Bradley',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

**Why this works without flash:** The `<html>` element receives `color-scheme: dark` via CSS that loads before any JS executes. The browser immediately applies dark-mode defaults. The `background-color` on both `html` and `body` ensures no white appears during the brief moment between HTML parse and CSS application.

**Confidence:** HIGH -- CSS `color-scheme` is well-supported (all modern browsers) and this pattern is used by dark-only sites widely.

### Pattern 2: CldImage with Pre-Generated LQIP

**What:** Use next-cloudinary's CldImage with `placeholder="blur"` and `blurDataURL` from build-time generated LQIP data.

**Implementation:**

```tsx
// components/CldImageWrapper.tsx
'use client';
import { CldImage } from 'next-cloudinary';

interface CldImageWrapperProps {
  publicId: string;
  width: number;
  height: number;
  alt: string;
  lqip: string;
  sizes?: string;
}

export function CldImageWrapper({ publicId, width, height, alt, lqip, sizes }: CldImageWrapperProps) {
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      placeholder="blur"
      blurDataURL={lqip}
    />
  );
}
```

**Environment variable required:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` -- this is the only public env var. Set in `.env.local` for development and in Netlify dashboard for production.

**Confidence:** HIGH -- verified from next-cloudinary official docs. CldImage accepts all next/image props including `placeholder` and `blurDataURL`.

### Pattern 3: Build-Time Gallery Data as JSON

**What:** Adapt the existing `build-gallery-data.js` to output JSON instead of a JS module, for clean static import in Next.js.

**Current output:** `src/data/gallery-images.js` (ES module with `export const`)
**New output:** `src/data/gallery-images.json` (standard JSON)

**Key changes to the script:**
1. Output JSON with `JSON.stringify()` instead of template literal JS
2. Include `publicId` field (Cloudinary public_id) alongside `src` URL -- CldImage needs the public_id, not the full URL
3. Keep existing LQIP generation logic (fetches tiny blurred thumbnails from Cloudinary, converts to base64)
4. Run as `prebuild` script before `next build`

```json
{
  "images": [
    {
      "id": "jdm-street-racer-01",
      "publicId": "gallery/jdm/jdm-street-racer-01",
      "width": 2000,
      "height": 1333,
      "category": "jdm",
      "caption": "JDM Street Racer",
      "alt": "Modified JDM sports car on city street",
      "lqip": "data:image/webp;base64,UklGR...",
      "sortOrder": 1
    }
  ],
  "categories": [
    { "id": "all", "label": "All" },
    { "id": "jdm", "label": "JDM" },
    { "id": "euro", "label": "Euro" },
    { "id": "supercar", "label": "Supercar" },
    { "id": "american-muscle", "label": "American Muscle" },
    { "id": "track", "label": "Track/Motorsport" }
  ]
}
```

**Confidence:** HIGH -- straightforward adaptation of existing proven script.

### Pattern 4: Netlify Deployment Configuration

**What:** Deploy Next.js to a new Netlify site with zero-config adapter.

```toml
# next/netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "prebuild": "node scripts/build-gallery-data.mjs",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Key details:**
- Netlify auto-detects Next.js and provisions the OpenNext adapter. No `[[plugins]]` block needed unless pinning a version.
- The `prebuild` script runs gallery data generation before `next build`.
- Node 20 is specified because Node 25.x (current local version) may not be supported by Netlify's build image. Netlify defaults to Node 18; setting 20 ensures modern features without compatibility issues.
- The existing Netlify functions directory is NOT referenced -- this is a separate Netlify site (D-05).

**Confidence:** HIGH -- verified from Netlify official docs.

### Anti-Patterns to Avoid

- **Adding Cloudinary to `images.remotePatterns`:** Do NOT add `res.cloudinary.com` to next.config.ts remotePatterns when using CldImage. This causes double-optimization through both Cloudinary and Netlify Image CDN.
- **Using `next-themes` for a dark-only site:** Adds unnecessary JavaScript and complexity. The site has no theme toggle. CSS-only is correct.
- **Marking pages as `"use client"`:** Keep `page.tsx` as Server Components. Only interactive wrappers (CldImageWrapper) need `"use client"`.
- **Calling Cloudinary API at request time:** Gallery data is build-time only. Never fetch from Cloudinary in page components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cloudinary image display | Custom `<img>` with Cloudinary URL transforms | `CldImage` from next-cloudinary | Handles responsive srcset, format negotiation (avif/webp), quality optimization. Avoids double-optimization with Netlify. |
| LQIP blur placeholder | Custom blur effect in CSS/JS | `placeholder="blur"` + `blurDataURL` prop on CldImage | Built into next/image, which CldImage wraps. Handles the blur-to-sharp transition natively. |
| Netlify adapter config | Manual serverless function wiring | @netlify/plugin-nextjs auto-detection | The adapter handles SSG pages, API routes, middleware, and caching automatically. |
| Tailwind dark mode | Custom CSS variable system | `color-scheme: dark` + Tailwind's `dark:` variant | Browser-native dark mode signaling plus Tailwind's utility classes. |

## Common Pitfalls

### Pitfall 1: Tailwind v4 Requires Manual Setup After create-next-app
**What goes wrong:** `create-next-app@15` may scaffold with Tailwind v3 by default. The project needs v4 for shadcn/ui CLI v4 compatibility (Phase 12).
**Why it happens:** The scaffolding tool's default Tailwind version may lag behind the latest release.
**How to avoid:** After scaffolding, check which Tailwind version was installed (`npm ls tailwindcss`). If v3, upgrade: remove `tailwind.config.ts` and `postcss.config.mjs`, install `tailwindcss@^4.2`, update `globals.css` to use `@import "tailwindcss"` instead of `@tailwind` directives. Tailwind v4 uses CSS-native configuration via `@theme` -- no JS config file needed.
**Warning signs:** Presence of `tailwind.config.ts` or `tailwind.config.js` file after scaffolding indicates v3.

### Pitfall 2: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME Missing on Netlify
**What goes wrong:** CldImage renders broken images on the deployed site but works locally.
**Why it happens:** `.env.local` is not committed to git. The env var must be set separately in the Netlify dashboard for the new staging site.
**How to avoid:** Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in Netlify site settings before the first deploy. Also set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for the prebuild script.
**Warning signs:** CldImage src URLs show `undefined` in the cloud name position.

### Pitfall 3: Direct URL Access Returns 404 on Netlify
**What goes wrong:** Navigating directly to a URL (not via client-side navigation) returns 404 or shows a blank page.
**Why it happens:** Misconfigured Netlify adapter or missing catch-all routing. The OpenNext adapter must be properly provisioned.
**How to avoid:** Test every route by pasting the URL directly into the browser (not by clicking links). This validates server-side rendering/static generation is working.
**Warning signs:** Works via `<Link>` navigation but fails on hard refresh or direct URL entry.

### Pitfall 4: Node Version Mismatch on Netlify
**What goes wrong:** Build succeeds locally but fails on Netlify with obscure errors.
**Why it happens:** Local Node.js is v25.6.1 but Netlify build image defaults to Node 18. Features used locally may not be available.
**How to avoid:** Set `NODE_VERSION = "20"` in `netlify.toml` `[build.environment]`. Use Node 20 LTS features only. Test the build with `npx netlify build` locally if Netlify CLI is available.
**Warning signs:** "SyntaxError" or "ReferenceError" in Netlify build logs for standard Node.js APIs.

### Pitfall 5: Bundle Size Includes Unused Scaffolding
**What goes wrong:** The default create-next-app template includes demo components, icons, and styles that inflate the initial bundle.
**Why it happens:** The scaffolding includes a styled landing page with images and components meant to be replaced.
**How to avoid:** Strip the generated `page.tsx` to a minimal skeleton immediately. Remove any demo images from `public/`. Clean `globals.css` to only include Tailwind import and dark theme styles.
**Warning signs:** First Load JS reported by `next build` exceeds 100KB for the home page before any real content is added.

## Code Examples

### Minimal Root Layout with Dark Theme
```tsx
// Source: Combination of Next.js App Router docs + color-scheme CSS spec
// app/layout.tsx
import type { Metadata } from 'next';
import { Orbitron, Space_Grotesk } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'David Bradley | Automotive Photography',
  description: 'Automotive photography portfolio showcasing JDM, Euro, Supercar, and American Muscle vehicles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#0e0e12] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
```

### Minimal Skeleton Page with CldImage Test
```tsx
// app/page.tsx (Server Component -- no "use client")
import { CldImageWrapper } from '@/components/CldImageWrapper';
import galleryData from '@/data/gallery-images.json';

export default function Home() {
  // Pick first image from gallery data for pipeline validation
  const testImage = galleryData.images[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold tracking-wider text-white">
        David Bradley
      </h1>
      <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-lg text-gray-400">
        Automotive Photography
      </p>

      {/* Pipeline validation: CldImage with LQIP blur-up */}
      {testImage && (
        <div className="mt-12 max-w-2xl">
          <CldImageWrapper
            publicId={testImage.publicId}
            width={testImage.width}
            height={testImage.height}
            alt={testImage.alt || 'Gallery test image'}
            lqip={testImage.lqip}
          />
        </div>
      )}
    </main>
  );
}
```

### next.config.ts (Minimal for Phase 11)
```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // No images.remotePatterns needed -- CldImage handles Cloudinary directly
  // No output: 'export' -- full Next.js server mode for future API routes
};

export default nextConfig;
```

### globals.css (Dark Theme + Tailwind v4)
```css
/* globals.css */
@import "tailwindcss";

/* Dark-only site: no theme toggle, no JavaScript needed */
html {
  color-scheme: dark;
  background-color: #0e0e12;
}

body {
  background-color: #0e0e12;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 JS config | Tailwind v4 CSS-native @theme | 2025 | No tailwind.config.ts needed. @import "tailwindcss" + @theme in CSS. |
| create-next-app scaffolds v3 | May need manual upgrade to v4 | Ongoing | Check after scaffolding, upgrade if needed. |
| next-cloudinary v6 | Still v6 (6.17.5 latest) | Current | STACK.md said v7 but it doesn't exist. Use ^6.17. |
| Next.js 15.3 | 15.5.14 latest stable | 2026 | Use latest 15.x for security patches. |
| @netlify/plugin-nextjs manual | Auto-detected by Netlify | 2025+ | Zero config needed, but explicit install allows version pinning. |

## Open Questions

1. **Tailwind v4 scaffolding default**
   - What we know: create-next-app@15 includes `--tailwind` flag but docs don't specify v3 vs v4.
   - What's unclear: Whether the latest 15.x scaffolds with v4 or still v3.
   - Recommendation: Scaffold, check `npm ls tailwindcss`, upgrade to v4 if needed. Budget 5-10 minutes for this.

2. **Subdirectory vs branch approach for coexistence**
   - What we know: D-01 says "next/ subdirectory or dedicated branch."
   - What's unclear: Whether Netlify can deploy from a subdirectory of a monorepo.
   - Recommendation: Use `next/` subdirectory with a separate Netlify site. Set the base directory in Netlify site settings to `next/`. This is well-supported by Netlify.

3. **Prebuild script env var loading in Next.js context**
   - What we know: Current script has custom .env parsing. Next.js has its own .env loading.
   - What's unclear: Whether the prebuild script runs before or after Next.js env loading.
   - Recommendation: The `prebuild` npm script runs before `build` (which is `next build`). Next.js env loading only applies during `next build`/`next dev`. The script needs its own env loading or `--env-file=.env.local` flag.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | Yes | 25.6.1 (local) | Use 20 on Netlify |
| npm | Package management | Yes | 11.10.0 | -- |
| git | Version control | Yes | 2.50.1 | -- |
| Netlify CLI | Local testing (optional) | No | -- | Deploy via git push, test on deployed URL |
| npx | Scaffolding | Yes | 11.10.0 | -- |

**Missing dependencies with no fallback:**
- None. All required tools are available.

**Missing dependencies with fallback:**
- Netlify CLI not installed. Fallback: deploy via git push to the connected Netlify site. Cannot test Netlify runtime locally, but deployed site testing suffices for this phase.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Next.js built-in build validation + manual deploy verification |
| Config file | next.config.ts |
| Quick run command | `npm run build` (in next/ directory) |
| Full suite command | `npm run build && npx next-bundle-analyzer` (bundle size check) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| V4-FOUND-01 | Next.js 15 deployed on Netlify with App Router | smoke (manual) | `curl -s -o /dev/null -w "%{http_code}" $STAGING_URL` | N/A -- deploy verification |
| V4-FOUND-01 | Direct URL access works (no 404/500) | smoke (manual) | `curl -s -o /dev/null -w "%{http_code}" $STAGING_URL/` | N/A -- deploy verification |
| V4-FOUND-02 | CldImage renders with blur placeholder | smoke (manual) | Visual inspection on deployed site + Network tab check | N/A -- visual verification |
| V4-FOUND-03 | Bundle under 200KB gzip | unit | `npm run build` output shows First Load JS per route | Wave 0: check build output |

### Sampling Rate
- **Per task commit:** `npm run build` (validates build succeeds and shows bundle sizes)
- **Per wave merge:** Deploy to Netlify staging, verify all four success criteria manually
- **Phase gate:** All four success criteria verified on deployed Netlify URL

### Wave 0 Gaps
- None -- this phase uses build output analysis and manual deploy verification rather than a test framework. Test infrastructure (Jest/Vitest) will be added in later phases when there is application logic to test.

## Sources

### Primary (HIGH confidence)
- [Next Cloudinary - Placeholders Guide](https://next.cloudinary.dev/guides/placeholders) -- CldImage blur placeholder setup
- [Next Cloudinary - CldImage Basic Usage](https://next.cloudinary.dev/cldimage/basic-usage) -- CldImage props and configuration
- [Next.js on Netlify - Official Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) -- Zero-config deployment, adapter behavior
- [Next.js create-next-app CLI](https://nextjs.org/docs/app/api-reference/cli/create-next-app) -- Scaffolding options and defaults
- [Deploy Next.js 15 on Netlify](https://www.netlify.com/blog/deploy-nextjs-15/) -- Next.js 15 specific deployment guidance

### Secondary (MEDIUM confidence)
- [Tailwind + Next.js Setup Guide 2026](https://designrevision.com/blog/tailwind-nextjs-setup) -- Tailwind v4 upgrade path
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering) -- FOUC prevention patterns
- [Understanding & Fixing FOUC in Next.js App Router](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk) -- App Router specific FOUC solutions

### Tertiary (LOW confidence)
- None -- all findings verified against official sources.

## Project Constraints (from CLAUDE.md)

- For all UI/UX and frontend design work, use the **UI UX Pro Max** skill (`.claude/skills/ui-ux-pro-max/`) exclusively.
- Do NOT use the `frontend-design:frontend-design` skill for this project.
- Note: Phase 11 is foundation/pipeline only -- no UI/UX design work is needed. The UI UX Pro Max skill becomes relevant starting in Phase 12 (Design System).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry on 2026-03-26
- Architecture: HIGH -- patterns match existing codebase patterns and official docs
- Pitfalls: HIGH -- verified across official docs, community reports, and project-specific research

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable stack, low churn risk)
