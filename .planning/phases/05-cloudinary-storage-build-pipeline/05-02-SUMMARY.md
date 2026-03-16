---
phase: 05-cloudinary-storage-build-pipeline
plan: 02
subsystem: infra
tags: [cloudinary, build-pipeline, lqip, cdn, gallery-data]

# Dependency graph
requires:
  - phase: 05-cloudinary-storage-build-pipeline
    provides: "29 images uploaded to Cloudinary CDN with folder-per-category structure and context metadata"
provides:
  - "Build-time script that generates gallery-images.js from Cloudinary Search API"
  - "LQIP base64 placeholders generated from Cloudinary blur transforms"
  - "npm prebuild hook for automatic gallery data generation before vite build"
affects: [05-03, 06-admin-authentication-upload]

# Tech tracking
tech-stack:
  added: []
  patterns: [prebuild-hook-data-generation, cloudinary-search-api-fetch, lqip-from-cdn-transforms]

key-files:
  created:
    - scripts/build-gallery-data.js
  modified:
    - package.json
    - src/data/gallery-images.js

key-decisions:
  - "Auto-load .env in build script for seamless local and Netlify builds (no --env-file needed in prebuild)"
  - "Support both context.custom.X and context.X paths for Cloudinary metadata (object-form upload compatibility)"
  - "Hardcoded categories array to preserve exact v1 order and labels"

patterns-established:
  - "Build-time data generation: prebuild hook fetches from API, writes static JS data file"
  - "LQIP from Cloudinary: 16px blur:1000 thumbnail fetched and base64-encoded at build time"

requirements-completed: [STOR-02, STOR-03, STOR-04, BUILD-01, BUILD-02]

# Metrics
duration: ~2min
completed: 2026-03-16
---

# Phase 5 Plan 02: Build Gallery Data Script Summary

**Build-time script fetches 29 images from Cloudinary Search API, generates LQIP base64 placeholders, and writes gallery-images.js with CDN URLs in v1 format**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T23:32:44Z
- **Completed:** 2026-03-16T23:35:13Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created build-gallery-data.js that fetches all gallery images from Cloudinary Search API with context metadata
- Generated LQIP base64 strings by fetching 16px blurred thumbnails from Cloudinary CDN (batches of 5)
- Wired prebuild npm hook so `npm run build` auto-generates gallery data before Vite build
- Full pipeline verified: prebuild + vite build succeeds, 29 images with Cloudinary CDN URLs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create build-gallery-data.js script** - `530a983` (feat)
2. **Task 2: Wire build script into npm prebuild and test generation** - `f6a6a69` (feat)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified
- `scripts/build-gallery-data.js` - ESM build script: Cloudinary Search API fetch, LQIP generation, gallery-images.js output
- `package.json` - Added prebuild and generate-gallery npm scripts
- `src/data/gallery-images.js` - Regenerated with 29 Cloudinary CDN URLs, LQIP base64, caption/alt metadata

## Decisions Made
- Auto-load .env file in script itself (not via --env-file flag) so prebuild works locally without flag and on Netlify without .env file
- Support both `context.custom.caption` and `context.caption` paths since our migration used object-form upload which puts metadata directly on context
- Hardcoded categories array (not derived from Cloudinary data) to preserve exact v1 order and labels

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed context metadata path for caption/alt**
- **Found during:** Task 2 (testing generation)
- **Issue:** Script used `resource.context.custom.caption` but migration uploaded with object-form context, which puts values directly at `resource.context.caption`
- **Fix:** Added fallback: `resource.context?.custom?.caption || resource.context?.caption || ''`
- **Files modified:** scripts/build-gallery-data.js
- **Verification:** Regenerated data shows all 29 entries with captions and alt text populated
- **Committed in:** f6a6a69 (Task 2 commit)

**2. [Rule 3 - Blocking] Added .env auto-loading for local prebuild**
- **Found during:** Task 2 (testing npm run build)
- **Issue:** `npm run build` triggers prebuild without `--env-file` flag, so env vars are missing locally
- **Fix:** Added .env file auto-loading at script startup when env vars not present and .env exists
- **Files modified:** scripts/build-gallery-data.js
- **Verification:** `npm run build` succeeds locally, would also work on Netlify where env vars are injected
- **Committed in:** f6a6a69 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correct operation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - Cloudinary credentials already configured in .env (from Plan 05-01).

## Next Phase Readiness
- Gallery data generation pipeline complete and verified
- `npm run build` runs full pipeline: fetch from Cloudinary, generate gallery data, Vite build
- Ready for Plan 05-03 (cleanup and Netlify deployment config)
- No blockers

## Self-Check: PASSED

- FOUND: scripts/build-gallery-data.js
- FOUND: src/data/gallery-images.js
- FOUND: 530a983 (Task 1 commit)
- FOUND: f6a6a69 (Task 2 commit)

---
*Phase: 05-cloudinary-storage-build-pipeline*
*Completed: 2026-03-16*
