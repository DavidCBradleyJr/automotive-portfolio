---
phase: 11-foundation-pipeline-validation
plan: 02
subsystem: infra
tags: [cloudinary, next-cloudinary, cldimage, lqip, netlify, build-pipeline]

# Dependency graph
requires:
  - phase: 11-01
    provides: Next.js 15 skeleton with Tailwind v4, dark theme, fonts
provides:
  - Build-time gallery data script outputting JSON with publicId and lqip
  - CldImageWrapper client component with blur-up LQIP placeholders
  - Netlify deployment config for Next.js staging site
  - Committed gallery-images.json as fallback for credential-less builds
affects: [12-design-system, 13-gallery, 14-animations, 16-deployment]

# Tech tracking
tech-stack:
  added: [next-cloudinary CldImage, build-gallery-data.mjs]
  patterns: [prebuild JSON generation, client wrapper for CldImage, committed build artifacts as fallback]

key-files:
  created:
    - next/scripts/build-gallery-data.mjs
    - next/src/components/CldImageWrapper.tsx
    - next/src/data/gallery-images.json
    - next/src/data/hero-config.json
    - next/netlify.toml
  modified:
    - next/src/app/page.tsx
    - next/package.json

key-decisions:
  - "JSON output instead of ES module for gallery data -- cleaner static import in Next.js"
  - "Commit gallery-images.json to git as fallback for builds without Cloudinary credentials"
  - "First Load JS at 145KB gzip -- 27.5% under 200KB budget with CldImage included"

patterns-established:
  - "Prebuild script pattern: npm prebuild generates JSON before next build"
  - "Client wrapper pattern: CldImageWrapper isolates 'use client' boundary for CldImage"
  - "Build artifact fallback: generated JSON committed to git, regenerated when credentials available"

requirements-completed: [V4-FOUND-02, V4-FOUND-03]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 11 Plan 02: Cloudinary Pipeline Validation Summary

**CldImage rendering with LQIP blur-up via build-time JSON gallery data (27 images, 6 categories) at 145KB First Load JS**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T01:53:10Z
- **Completed:** 2026-03-27T01:55:31Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Adapted existing Vite gallery data script to output JSON with publicId and lqip fields for Next.js
- Created CldImageWrapper client component with blur-up LQIP placeholder support
- Wired test CldImage into skeleton page validating full Cloudinary pipeline end-to-end
- Full build pipeline (prebuild + next build) succeeds at 145KB First Load JS (under 200KB budget)
- Netlify deployment config ready with Node 20 and correct build command

## Task Commits

Each task was committed atomically:

1. **Task 1: Adapt gallery data script for JSON output and create CldImage wrapper** - `e8c3cf5` (feat)
2. **Task 2: Wire test CldImage into skeleton page and create Netlify config** - `33f292e` (feat)

## Files Created/Modified
- `next/scripts/build-gallery-data.mjs` - Build-time gallery data generation outputting JSON with env var guards
- `next/src/components/CldImageWrapper.tsx` - Client component wrapping CldImage with LQIP blur-up support
- `next/src/data/gallery-images.json` - Generated gallery data (27 images, 6 categories) committed as fallback
- `next/src/data/hero-config.json` - Generated hero image config from Cloudinary
- `next/netlify.toml` - Netlify deployment config for Next.js staging site
- `next/src/app/page.tsx` - Updated to render test CldImage with gallery data
- `next/package.json` - Added prebuild script for gallery data generation

## Decisions Made
- Used JSON output instead of ES module for gallery data -- cleaner static import in Next.js Server Components
- Committed gallery-images.json to git as fallback for builds without Cloudinary credentials (local dev, CI)
- Kept hero-config generation but adapted to JSON output format
- Removed --turbopack from build script (dev-only feature, not for production builds)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Cloudinary credentials already configured in next/.env.local from Plan 01.

## Next Phase Readiness
- Cloudinary CldImage pipeline validated end-to-end with blur-up LQIP
- Gallery data script generates 27 images across 6 categories
- Bundle at 145KB -- 55KB headroom remaining under 200KB budget
- Ready for Plan 03 (deployment validation) or Phase 12 (design system)

---
*Phase: 11-foundation-pipeline-validation*
*Completed: 2026-03-27*
