---
phase: 11-foundation-pipeline-validation
plan: 01
subsystem: infra
tags: [nextjs, tailwind-v4, typescript, cloudinary, netlify, dark-theme]

# Dependency graph
requires: []
provides:
  - "Next.js 15.5.14 project scaffold in next/ subdirectory"
  - "Tailwind v4.2.2 with CSS-native config (no JS config file)"
  - "Dark theme with color-scheme: dark FOUC prevention"
  - "Orbitron + Space Grotesk fonts via next/font/google"
  - "next-cloudinary 6.17.5 installed for CldImage"
  - "@netlify/plugin-nextjs 5.15.9 for Netlify deployment"
  - ".env.example documenting required Cloudinary env vars"
affects: [11-02, 11-03, 12-design-system]

# Tech tracking
tech-stack:
  added: [next@15.5.14, react@19, tailwindcss@4.2.2, next-cloudinary@6.17.5, "@netlify/plugin-nextjs@5.15.9", cloudinary@2, prettier, prettier-plugin-tailwindcss]
  patterns: [css-only-fouc-prevention, next-font-google-css-variables, server-component-pages, subdirectory-project-coexistence]

key-files:
  created: [next/package.json, next/tsconfig.json, next/next.config.ts, next/.env.example, next/.gitignore, next/src/app/globals.css, next/src/app/layout.tsx, next/src/app/page.tsx, next/eslint.config.mjs, next/postcss.config.mjs]
  modified: []

key-decisions:
  - "Tailwind v4 scaffolded natively by create-next-app@15 -- no manual upgrade needed"
  - "Turbopack enabled for dev and build (default with --turbopack flag)"
  - "First Load JS at 113KB gzip -- well under 200KB budget"

patterns-established:
  - "CSS-only dark theme: color-scheme: dark + bg #0e0e12 on html and body"
  - "Font loading: next/font/google with CSS custom properties (--font-orbitron, --font-space-grotesk)"
  - "Server Components by default: page.tsx has no 'use client' directive"
  - "Subdirectory coexistence: next/ has own package.json, does not touch root Vite project"

requirements-completed: [V4-FOUND-01, V4-FOUND-03]

# Metrics
duration: 5min
completed: 2026-03-27
---

# Phase 11 Plan 01: Next.js 15 Scaffold Summary

**Next.js 15.5.14 project with Tailwind v4, Orbitron/Space Grotesk fonts, dark theme FOUC prevention, and 113KB First Load JS**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-27T01:44:40Z
- **Completed:** 2026-03-27T01:50:00Z
- **Tasks:** 3 (2 auto + 1 human-action checkpoint)
- **Files created:** 10

## Accomplishments
- Next.js 15.5.14 project scaffolded in next/ subdirectory alongside existing Vite site (D-01)
- Tailwind v4.2.2 active with CSS-native @import (no tailwind.config.ts)
- Dark theme with color-scheme: dark for FOUC prevention (D-04)
- Orbitron + Space Grotesk fonts loaded via next/font/google with CSS variables
- Build succeeds with First Load JS at 113KB (43% under 200KB budget)
- next-cloudinary and Netlify adapter installed for upcoming pipeline validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 15 project and upgrade to Tailwind v4** - `128f595` (feat), `f7d0a5f` (fix: .env.example gitignore)
2. **Task 2: User creates .env.local with Cloudinary credentials** - checkpoint (human-action, no commit)
3. **Task 3: Configure dark theme, custom fonts, and skeleton page** - `f18a628` (feat)

## Files Created/Modified
- `next/package.json` - Next.js 15 project with all dependencies
- `next/tsconfig.json` - TypeScript config with path aliases
- `next/next.config.ts` - Minimal config (no remotePatterns for CldImage)
- `next/.env.example` - Documents required Cloudinary env vars
- `next/.gitignore` - Standard Next.js ignores + .env.example exception
- `next/src/app/globals.css` - Tailwind v4 import + dark theme base (color-scheme: dark)
- `next/src/app/layout.tsx` - Root layout with Orbitron, Space Grotesk, dark class, metadata
- `next/src/app/page.tsx` - Minimal skeleton Server Component ("David Bradley" heading)
- `next/eslint.config.mjs` - ESLint config from create-next-app
- `next/postcss.config.mjs` - PostCSS config with @tailwindcss/postcss

## Decisions Made
- Tailwind v4 was scaffolded natively by create-next-app@15.5.14 -- no manual upgrade was needed (the plan anticipated a possible v3 scaffold)
- Turbopack enabled by default via --turbopack flag during scaffolding
- Build output shows 113KB First Load JS, well under the 200KB gzip budget

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .env.example excluded by .gitignore .env* pattern**
- **Found during:** Task 1 (after initial commit)
- **Issue:** The .gitignore `.env*` wildcard excluded `.env.example` from git tracking
- **Fix:** Added `!.env.example` exception to `.gitignore`
- **Files modified:** next/.gitignore
- **Verification:** .env.example appears in git status and was committed
- **Committed in:** f7d0a5f

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor fix to ensure .env.example is tracked. No scope creep.

## Issues Encountered
- Turbopack build warning about multiple lockfiles (root + next/) -- informational only, build succeeds. Can be silenced with `turbopack.root` in next.config.ts if needed in future.

## Known Stubs
None -- this is a foundation scaffold with intentionally minimal content. The skeleton page text is not a stub; it is the expected output for pipeline validation.

## User Setup Required
User created `next/.env.local` with real Cloudinary credentials during Task 2 checkpoint. No further setup required for this plan.

## Next Phase Readiness
- Next.js project builds successfully, ready for Cloudinary CldImage integration (Plan 02)
- .env.local with Cloudinary credentials in place for build-time gallery data script
- Dark theme and fonts established for all future pages

## Self-Check: PASSED

All 6 key files verified present. All 3 commit hashes (128f595, f7d0a5f, f18a628) confirmed in git log.

---
*Phase: 11-foundation-pipeline-validation*
*Completed: 2026-03-27*
