---
phase: 09-blog-admin-editor
plan: 01
subsystem: api, ui
tags: [netlify-functions, github-api, admin, blog, crud, markdown]

# Dependency graph
requires:
  - phase: 08-blog-data-pages
    provides: Blog post markdown schema and content/blog/ directory structure
provides:
  - Three Netlify Functions for blog CRUD (list-posts, save-post, delete-post)
  - Blog tab in admin panel with full editor HTML structure
  - Blog section CSS styles
  - blog-manager.js placeholder for Plan 02
affects: [09-02-blog-editor-ui, 09-03-gallery-sidebar]

# Tech tracking
tech-stack:
  added: []
  patterns: [GitHub Contents API for git-based CMS, Buffer.from for Base64 encoding, inline rebuild trigger]

key-files:
  created:
    - netlify/functions/list-posts.mjs
    - netlify/functions/save-post.mjs
    - netlify/functions/delete-post.mjs
    - src/admin/components/blog-manager.js
  modified:
    - admin.html
    - src/admin/components/tabs.js
    - src/admin/admin.js
    - src/admin/admin.css

key-decisions:
  - "Inline rebuild trigger in save-post and delete-post rather than function-to-function calls"
  - "Fetch all post bodies in list-posts to avoid separate fetch per edit (trades bandwidth for simplicity)"
  - "Simple regex frontmatter parsing server-side (no gray-matter dependency needed)"

patterns-established:
  - "GitHub Contents API pattern: fetch directory listing, then individual file content"
  - "Blog CRUD functions follow same CORS/JWT/error pattern as existing Netlify Functions"

requirements-completed: [EDITOR-01, BDATA-05]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 9 Plan 1: Blog CRUD Functions and Admin Tab Summary

**Three Netlify Functions for blog CRUD via GitHub Contents API, plus full Blog tab HTML/CSS wired into admin panel**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-26T01:59:33Z
- **Completed:** 2026-03-26T02:02:11Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created list-posts.mjs that fetches blog directory from GitHub, decodes Base64 content, parses frontmatter and body
- Created save-post.mjs that creates/updates markdown files in GitHub with proper SHA handling and rebuild trigger
- Created delete-post.mjs that removes posts from GitHub with rebuild trigger
- Added Blog tab to admin panel with full editor structure (metadata fields, Write/Preview tabs, toolbar, textarea, gallery sidebar)
- All functions follow existing JWT auth and CORS patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Netlify Functions for blog post CRUD** - `7022b63` (feat)
2. **Task 2: Add Blog tab to admin panel HTML and wire navigation** - `424b685` (feat)

## Files Created/Modified
- `netlify/functions/list-posts.mjs` - GET endpoint returning blog post metadata + body from GitHub Contents API
- `netlify/functions/save-post.mjs` - POST endpoint to create/update posts via GitHub Contents API with rebuild trigger
- `netlify/functions/delete-post.mjs` - POST endpoint to delete posts via GitHub Contents API with rebuild trigger
- `src/admin/components/blog-manager.js` - Placeholder export for Plan 02 implementation
- `admin.html` - Blog tab button and panel-blog section with full editor HTML structure
- `src/admin/components/tabs.js` - Added 'blog' to VALID_TABS array
- `src/admin/admin.js` - Import and init of blog-manager.js
- `src/admin/admin.css` - Blog editor styles (grid, toolbar, sidebar, post cards, responsive)

## Decisions Made
- Inline rebuild trigger (fetch to NETLIFY_BUILD_HOOK directly) rather than calling trigger-rebuild function, avoiding function-to-function overhead
- list-posts returns full body content alongside metadata so the editor can load without a separate fetch
- Simple regex-based frontmatter parsing on server side avoids adding gray-matter as a dependency

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- `src/admin/components/blog-manager.js` - Exports no-op `initBlogManager()`. Intentional placeholder; Plan 02 will implement the full blog manager UI logic.

## User Setup Required

**External services require manual configuration.** The following environment variables must be set in the Netlify dashboard:
- `GITHUB_TOKEN` - Fine-grained personal access token with Contents: Read and write permission, scoped to this repo
- `GITHUB_OWNER` - GitHub username (repo owner)
- `GITHUB_REPO` - Repository name (e.g. automotive-portfolio)

## Issues Encountered
None

## Next Phase Readiness
- Blog CRUD backend is complete and ready for Plan 02 (editor UI logic)
- admin.html has all HTML structure the editor JS will bind to
- Blog tab navigable at /admin#blog
- blog-manager.js placeholder ready to be filled with editor logic

---
*Phase: 09-blog-admin-editor*
*Completed: 2026-03-26*
