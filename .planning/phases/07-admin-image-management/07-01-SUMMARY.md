---
phase: 07-admin-image-management
plan: 01
subsystem: api
tags: [cloudinary, netlify-functions, image-management, sortablejs]

# Dependency graph
requires:
  - phase: 06-admin-auth-upload
    provides: "JWT auth pattern, upload-image function, list-images function, build-gallery-data script"
provides:
  - "update-image function for metadata and category changes"
  - "delete-image function for soft delete via hidden tag"
  - "restore-image function to un-hide images"
  - "reorder-images function for batch sort_order updates"
  - "list-images hidden filter and sort_order support"
  - "build script hidden exclusion and sort_order sorting"
affects: [07-02-admin-image-management]

# Tech tracking
tech-stack:
  added: [sortablejs]
  patterns: [cloudinary-context-merge, soft-delete-via-tags, pipe-delimited-metadata]

key-files:
  created:
    - netlify/functions/update-image.mjs
    - netlify/functions/delete-image.mjs
    - netlify/functions/restore-image.mjs
    - netlify/functions/reorder-images.mjs
  modified:
    - netlify/functions/list-images.mjs
    - scripts/build-gallery-data.js
    - package.json

key-decisions:
  - "Cloudinary context merge pattern: fetch existing context before update to prevent data loss"
  - "Sequential processing in reorder-images to avoid Cloudinary rate limits"
  - "Partial success response pattern for batch reorder operations"

patterns-established:
  - "Context merge: always fetch resource before cloudinary.api.update to preserve existing metadata"
  - "Soft delete: use hidden tag instead of permanent deletion for recoverability"
  - "Pipe-delimited context: caption=X|alt=Y|sort_order=Z format for Cloudinary metadata"

requirements-completed: [MGMT-01, MGMT-02, MGMT-03, MGMT-04]

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 7 Plan 1: Backend Image Management Summary

**Four Netlify Functions for image CRUD (update, soft-delete, restore, reorder) with hidden-tag filtering and sort_order in list-images and build script**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-17T18:15:25Z
- **Completed:** 2026-03-17T18:17:16Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created 4 new Netlify Functions (update-image, delete-image, restore-image, reorder-images) following established JWT + CORS pattern
- Updated list-images to support show_hidden query param, return sort_order and tags per image
- Updated build-gallery-data.js to exclude hidden images and sort by sort_order within categories
- Installed SortableJS for upcoming frontend drag-and-drop reorder

## Task Commits

Each task was committed atomically:

1. **Task 1: Create four new Netlify Functions and install SortableJS** - `8fa6feb` (feat)
2. **Task 2: Update list-images and build script for hidden filter and sort order** - `6698192` (feat)

## Files Created/Modified
- `netlify/functions/update-image.mjs` - Metadata update with context merge and category rename
- `netlify/functions/delete-image.mjs` - Soft delete via Cloudinary hidden tag
- `netlify/functions/restore-image.mjs` - Restore by removing hidden tag
- `netlify/functions/reorder-images.mjs` - Batch sort_order update with partial failure handling
- `netlify/functions/list-images.mjs` - Added hidden filter, sort_order, tags to response
- `scripts/build-gallery-data.js` - Excludes hidden images, sorts by sort_order
- `package.json` - Added sortablejs dependency

## Decisions Made
- Cloudinary context merge pattern: always fetch existing resource context before calling api.update, since update replaces entire context
- Sequential processing in reorder-images to respect Cloudinary API rate limits (no Promise.all)
- Partial success response pattern for batch reorder -- continues on individual failures, reports errors

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All backend APIs ready for the frontend admin image management UI (07-02)
- SortableJS installed for drag-and-drop reorder functionality
- list-images returns sort_order and tags needed by the admin gallery view

---
*Phase: 07-admin-image-management*
*Completed: 2026-03-17*
