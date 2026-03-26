---
phase: 08-blog-data-pipeline-post-pages
plan: 01
subsystem: blog
tags: [gray-matter, marked, markdown, static-generation, photoswipe, vite]

requires:
  - phase: 04-polish
    provides: Nav/footer HTML structure, Google Fonts, PhotoSwipe lightbox
provides:
  - Blog markdown-to-HTML build pipeline (scripts/build-blog.js)
  - Sample blog posts in content/blog/ with YAML frontmatter
  - Dynamic Vite input discovery for blog pages (getBlogEntries)
  - Published post metadata in blog/posts.json
  - Blog post page JS module with nav toggle and PhotoSwipe
affects: [08-02-blog-styling, 09-blog-listing, 10-blog-features]

tech-stack:
  added: [gray-matter, marked]
  patterns: [markdown-to-static-html prebuild, dynamic vite input discovery, YAML frontmatter schema]

key-files:
  created:
    - content/blog/cars-and-coffee-march-2026.md
    - content/blog/first-track-day.md
    - scripts/build-blog.js
    - src/blog/blog-post.js
  modified:
    - package.json
    - vite.config.js
    - .gitignore

key-decisions:
  - "HTML-escape frontmatter values (title, excerpt, tags) in generated pages for correctness"
  - "Root-anchor /blog/ in .gitignore to avoid matching src/blog/"
  - "Create blog-post.js with nav toggle and PhotoSwipe init to unblock Vite build"

patterns-established:
  - "Blog frontmatter schema: title, slug, date, cover, excerpt, tags, status (published|draft)"
  - "Prebuild chain: gallery-data then blog-build via && in package.json prebuild"
  - "Dynamic Vite input: getBlogEntries() discovers blog/*/index.html at config time"

requirements-completed: [BDATA-01, BDATA-02, BDATA-03, BDATA-04, BLOG-02, BLOG-03]

duration: 5min
completed: 2026-03-25
---

# Phase 8 Plan 1: Blog Data Pipeline Summary

**Markdown-to-static-HTML build pipeline with gray-matter/marked, PhotoSwipe image wrapping, dynamic Vite discovery, and draft filtering**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-26T01:04:18Z
- **Completed:** 2026-03-26T01:09:41Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Build script converts markdown blog posts to complete static HTML pages with nav, footer, OG meta tags
- Images in markdown automatically wrapped in PhotoSwipe-compatible links with data-pswp attributes
- Draft posts (status: draft) are filtered out -- only published posts generate HTML
- Vite dynamically discovers blog pages via getBlogEntries(), full npm run build succeeds
- posts.json generated with published post metadata for future listing page

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, create sample posts, and build script** - `ed716fb` (feat)
2. **Task 2: Update Vite config and gitignore for blog pages** - `af5421e` (feat)

## Files Created/Modified
- `content/blog/cars-and-coffee-march-2026.md` - Sample published blog post with Cloudinary images
- `content/blog/first-track-day.md` - Sample draft post (skipped during build)
- `scripts/build-blog.js` - Prebuild script: parses frontmatter, renders markdown, generates static HTML
- `src/blog/blog-post.js` - Blog post page JS: nav hamburger toggle and PhotoSwipe lightbox init
- `package.json` - Added gray-matter/marked devDeps, chained blog build in prebuild
- `vite.config.js` - Added getBlogEntries() for dynamic blog page input discovery
- `.gitignore` - Added /blog/ (generated output directory)

## Decisions Made
- HTML-escape frontmatter values in generated HTML for correctness (& becomes &amp; etc.)
- Root-anchored /blog/ in .gitignore to prevent matching src/blog/ source directory
- Created src/blog/blog-post.js with functional nav and PhotoSwipe init to satisfy Vite build (plan referenced this file but did not specify creating it -- Rule 3 auto-fix)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] HTML-escaped frontmatter values in generated pages**
- **Found during:** Task 1 (build script verification)
- **Issue:** Title "Cars & Coffee" rendered as raw `&` in HTML -- invalid and failed verification grep
- **Fix:** Added escapeHTML() utility, applied to title, excerpt, and tags in template
- **Files modified:** scripts/build-blog.js
- **Verification:** Grep for `Cars &amp; Coffee March 2026` passes
- **Committed in:** ed716fb (Task 1 commit)

**2. [Rule 3 - Blocking] Created src/blog/blog-post.js to unblock Vite build**
- **Found during:** Task 2 (full build verification)
- **Issue:** Generated HTML references `/src/blog/blog-post.js` but file did not exist, causing Vite build failure
- **Fix:** Created blog-post.js with nav hamburger toggle and PhotoSwipe lightbox initialization
- **Files modified:** src/blog/blog-post.js (new)
- **Verification:** npm run build succeeds, dist/blog/cars-and-coffee-march-2026/index.html exists
- **Committed in:** af5421e (Task 2 commit)

**3. [Rule 3 - Blocking] Root-anchored /blog/ in .gitignore**
- **Found during:** Task 2 (git add)
- **Issue:** `blog/` pattern in .gitignore matched `src/blog/`, preventing staging of blog-post.js
- **Fix:** Changed to `/blog/` (root-anchored) so only the generated output directory is ignored
- **Files modified:** .gitignore
- **Verification:** git add src/blog/blog-post.js succeeds
- **Committed in:** af5421e (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and build success. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Blog build pipeline is complete and working end-to-end
- Plan 08-02 can add blog post CSS styling and enhanced features
- posts.json ready for Phase 10 blog listing page consumption

---
*Phase: 08-blog-data-pipeline-post-pages*
*Completed: 2026-03-25*
