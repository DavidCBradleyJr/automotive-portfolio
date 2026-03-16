# Phase 5: Cloudinary Storage & Build Pipeline - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate gallery images from git to Cloudinary CDN. Write a build-time script that fetches image metadata from Cloudinary and generates `gallery-images.js` in the same format as v1. The public gallery component requires zero code changes — it continues to import a static data file. Drop all gradient placeholder images.

</domain>

<decisions>
## Implementation Decisions

### Cloudinary Account
- Create new free Cloudinary account (David doesn't have one yet)
- Account setup is a checkpoint step — David creates the account, shares the cloud name
- API key and secret stored as Netlify environment variables (never in code)

### Cloudinary Folder Structure
- Folder per category: `gallery/jdm/`, `gallery/euro/`, `gallery/supercar/`, `gallery/american-muscle/`, `gallery/track/`
- Category derived from folder path during build-time fetch
- Metadata (caption, alt text) stored as Cloudinary structured metadata on each image

### Migration Scope
- Migrate 29 real WebP images to Cloudinary (upload from `public/images/gallery/`)
- Drop all 21 gradient placeholder images — gallery shows only real photos
- After migration verified, remove `public/images/gallery/` from git repo
- BTS images stay hardcoded in HTML (rarely change, not managed by admin)
- Social wall images stay hardcoded (live social feeds deferred to future)

### Hero Image
- Claude's discretion — decide based on LCP performance tradeoff (fetchpriority=high is the key concern)

### Build Pipeline
- New script: `scripts/build-gallery-data.js` replaces `process-images.js`
- Fetches all images from Cloudinary Admin API with metadata
- Generates LQIP base64 from Cloudinary 16px thumbnail URL transforms
- Writes `src/data/gallery-images.js` in exact same format (static export)
- Runs during `npm run build` (Vite prebuild)
- Cloudinary SDK used only at build time (dev dependency), never on public site

### Image Delivery
- Images served from Cloudinary CDN URLs (not local paths)
- Auto-format via `f_auto` (WebP/AVIF based on browser)
- Auto-resize via `w_2000,c_limit` (max 2000px, no upscale)
- Quality via `q_auto` (Cloudinary picks optimal quality)
- `src` field in gallery data changes from `/images/gallery/foo.webp` to Cloudinary URL

### Claude's Discretion
- Exact Cloudinary URL transform parameters
- LQIP fetch parallelization strategy
- Whether to cache build data between builds
- Migration script approach (CLI upload vs Cloudinary dashboard)
- How to handle `process-images.js` retirement

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and REQUIREMENTS.md (STOR-01 through STOR-05, BUILD-01 through BUILD-04).

</canonical_refs>

<specifics>
## Specific Ideas

- Gallery data format must be identical to v1 — same field names, same static export, same import in gallery.js
- The 29 real images already have descriptive filenames (e.g., `jdm-street-racer-01.webp`) — preserve these as Cloudinary public IDs
- Cloudinary free tier: 25 credits/month — adequate for a portfolio of hundreds of images

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/process-images.js`: Sharp-based pipeline with category assignments, LQIP generation — logic informs the new build script
- `src/data/gallery-images.js`: 50 entries with exact field schema (id, src, lqip, width, height, category, caption, alt, isPlaceholder)
- `src/components/gallery.js`: Imports `galleryImages` and `categories` from data file — must not change

### Established Patterns
- Gallery data is a static ES module imported at build time by Vite
- Categories defined in data file: `['all', 'jdm', 'euro', 'supercar', 'american-muscle', 'track']`
- PhotoSwipe requires `data-pswp-width` and `data-pswp-height` — build script must provide dimensions

### Integration Points
- `src/data/gallery-images.js` is the sole interface between the image pipeline and the gallery component
- `package.json` `build` script runs Vite — prebuild hook or build script integration needed
- `netlify.toml` needs environment variable configuration for Cloudinary credentials
- BTS section in `index.html` references `/images/gallery/*.webp` directly — these paths will break after migration unless BTS images are kept separately or paths updated

</code_context>

<deferred>
## Deferred Ideas

- Live Instagram/TikTok feed for social wall — future phase, requires API integration
- BTS images managed via admin — could be added to Phase 7 scope if needed

</deferred>

---

*Phase: 05-cloudinary-storage-build-pipeline*
*Context gathered: 2026-03-16*
