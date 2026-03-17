---
phase: 06-admin-authentication-upload
plan: 03
subsystem: ui
tags: [drag-and-drop, cloudinary, upload, gallery, admin, vanilla-js, netlify-functions]

# Dependency graph
requires:
  - phase: 06-admin-authentication-upload (plan 01)
    provides: Admin HTML shell, Netlify Identity auth, tab navigation, Vite multi-page build
  - phase: 06-admin-authentication-upload (plan 02)
    provides: upload-image and trigger-rebuild Netlify Functions
provides:
  - Drag-and-drop upload component with file previews, batch metadata, and progress bars
  - Gallery view component fetching images from Cloudinary via list-images function
  - Settings tab with hero image selection from gallery
  - list-images Netlify Function for Cloudinary search API proxy
affects: [07-admin-image-management]

# Tech tracking
tech-stack:
  added: [cloudinary (search API via list-images function)]
  patterns: [direct Cloudinary upload with signed params, sequential batch upload with per-file JWT refresh]

key-files:
  created:
    - src/admin/components/upload.js
    - src/admin/components/gallery-view.js
    - src/admin/components/settings.js
    - netlify/functions/list-images.mjs
    - netlify/functions/sign-upload.mjs
  modified:
    - admin.html
    - src/admin/admin.js
    - src/admin/admin.css
    - netlify/functions/upload-image.mjs
    - scripts/build-gallery-data.js
    - netlify.toml
    - index.html

key-decisions:
  - "Direct Cloudinary upload with signed params removes 4MB serverless body limit"
  - "Sequential batch upload with JWT refresh before each file prevents token expiry"
  - "list-images function proxies Cloudinary search API to keep secrets server-side"
  - "Hero image stored as site-config/hero public_id with overwrite support"

patterns-established:
  - "Signed upload pattern: browser gets signature from sign-upload function, uploads directly to Cloudinary"
  - "Admin component init pattern: each tab exports initX() called from onLogin callback"

requirements-completed: [UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05]

# Metrics
duration: ~45min (across sessions with checkpoint)
completed: 2026-03-17
---

# Phase 6 Plan 3: Upload UI, Gallery View, Settings Summary

**Drag-and-drop upload with previews and batch metadata, read-only gallery grid via Cloudinary search, and hero image selector -- all wired to Netlify Functions with signed direct upload**

## Performance

- **Duration:** ~45min (across sessions with human-verify checkpoint)
- **Started:** 2026-03-17
- **Completed:** 2026-03-17
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 12

## Accomplishments
- Upload tab with drag-and-drop zone, file previews via createObjectURL, per-image caption/alt/slug fields, category selector, and progress bars
- Batch upload sends files directly to Cloudinary using signed params (no size limit), with sequential processing and JWT refresh per file
- Gallery tab shows read-only grid of all Cloudinary images fetched via authenticated list-images function
- Settings tab allows hero image selection from gallery or custom upload, stored as site-config/hero
- Automatic site rebuild trigger after successful upload batch

## Task Commits

Each task was committed atomically:

1. **Task 1: Build upload component with drag-and-drop, previews, metadata, and batch upload** - `9e6d93f` (feat)
2. **Task 2: Build gallery view and settings tab components** - `3133875` (feat)
3. **Task 3: Verify admin panel on deploy preview** - checkpoint:human-verify (approved)

## Files Created/Modified
- `src/admin/components/upload.js` - Drag-and-drop upload zone, file queue, preview rendering, batch upload orchestration
- `src/admin/components/gallery-view.js` - Read-only gallery grid fetched from Cloudinary via list-images function
- `src/admin/components/settings.js` - Hero image selection from gallery or custom upload
- `netlify/functions/list-images.mjs` - Cloudinary search API proxy with JWT auth
- `netlify/functions/sign-upload.mjs` - Generates signed Cloudinary upload params for direct browser upload
- `admin.html` - Upload zone HTML, gallery grid, settings panel markup
- `src/admin/admin.js` - Imports and initializes upload, gallery-view, and settings components
- `src/admin/admin.css` - Upload zone, gallery grid, settings, and progress bar styles
- `netlify/functions/upload-image.mjs` - Added overwrite parameter support for hero replacement
- `scripts/build-gallery-data.js` - Hero config output for build-time hero image URL
- `netlify.toml` - Admin redirect and Identity configuration
- `index.html` - Hero image replaced with real photo

## Decisions Made
- Switched from base64 body upload to direct Cloudinary upload with signed params -- removes the 4MB Netlify Function body size limit entirely
- Added sign-upload.mjs function to generate Cloudinary signatures server-side for direct browser upload
- Sequential (not parallel) batch upload to avoid Cloudinary rate limiting
- JWT refreshed before each individual file upload to prevent expiry during large batches

## Deviations from Plan

### Post-Plan Bug Fixes (applied after Task 2, before checkpoint approval)

**1. [Rule 1 - Bug] Fixed hidden attribute CSS override on login/panel elements**
- **Found during:** Deploy preview testing
- **Issue:** CSS was overriding the HTML hidden attribute, causing the login screen to remain visible
- **Fix:** Added CSS rule to respect the hidden attribute
- **Commit:** `8d15d96`

**2. [Rule 1 - Bug] Fixed /admin redirect for Netlify**
- **Found during:** Deploy preview testing
- **Issue:** Navigating to /admin was not redirecting to admin.html
- **Fix:** Added redirect rule in netlify.toml
- **Commit:** `3e31a36`

**3. [Rule 1 - Bug] Fixed Identity confirmation token redirect**
- **Found during:** Deploy preview testing
- **Issue:** Netlify Identity confirmation tokens were not redirecting to /admin
- **Fix:** Added confirmation redirect handling
- **Commit:** `d52230d`

**4. [Rule 1 - Bug] Fixed admin panel visibility when component init fails**
- **Found during:** Deploy preview testing
- **Issue:** Admin panel would not show if any component initialization threw an error
- **Fix:** Added error handling around component init
- **Commit:** `70615e1`

**5. [Rule 2 - Missing Critical] Upgraded to direct Cloudinary upload with signed params**
- **Found during:** Deploy preview testing
- **Issue:** Base64 upload through Netlify Function hit 4MB body size limit
- **Fix:** Created sign-upload.mjs function, browser uploads directly to Cloudinary with signed params
- **Commit:** `1f5efce`

---

**Total deviations:** 5 post-plan fixes (4 bugs, 1 missing critical functionality)
**Impact on plan:** All fixes were necessary for the admin panel to function correctly in production. The signed upload upgrade was essential since the original approach had an unacceptable size limit.

## Issues Encountered
- Netlify Function body size limit (4MB) made the original base64 upload approach impractical for high-res photos -- resolved by switching to direct Cloudinary upload with signed params
- Netlify Identity confirmation flow required explicit redirect configuration that was not in the original plan

## User Setup Required
None additional beyond what was configured in plans 06-01 and 06-02 (Netlify Identity, Cloudinary env vars, build hook).

## Next Phase Readiness
- All upload and gallery view infrastructure is in place for Phase 7 (Admin Image Management)
- list-images function can be extended to support edit/delete operations
- Gallery view component is ready to evolve from read-only to editable grid
- Direct Cloudinary upload pattern established can be reused for image replacement

## Self-Check: PASSED

All 5 created files verified on disk. All 7 commits (2 task + 5 post-plan fix) verified in git log.

---
*Phase: 06-admin-authentication-upload*
*Completed: 2026-03-17*
