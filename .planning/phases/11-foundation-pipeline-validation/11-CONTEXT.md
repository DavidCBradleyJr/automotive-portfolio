# Phase 11: Foundation & Pipeline Validation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working Next.js 15 skeleton deployed to a new staging Netlify site. The skeleton proves: App Router routing works, Cloudinary CldImage renders with LQIP blur-up, dark theme loads without FOUC, and the bundle stays under 200KB gzip. No features — just the deployment pipeline validated end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- **D-01:** Create a fresh Next.js project alongside the existing Vite site (e.g., in a `next/` subdirectory or on a dedicated branch). The existing Vite site stays live and untouched until cutover.
- **D-02:** Migrate code piece by piece from existing Vite files — do not rewrite from scratch.

### Netlify Functions
- **D-03:** Keep all 11 existing Netlify Functions (.mjs) as-is for now. They continue to work alongside Next.js on Netlify. Migration to Next.js API routes happens in Phase 15 (Admin Panel).

### Dark Theme FOUC Prevention
- **D-04:** Use CSS-only approach with `color-scheme: dark` on the `<html>` tag plus dark background in global CSS. No JavaScript needed — zero blocking scripts.

### Deployment Strategy
- **D-05:** Deploy to a new, separate Netlify site for staging. The existing site remains live at its current URL. DNS swap happens at launch (Phase 16).

### 21st.dev Magic MCP Integration
- **D-06:** 21st.dev Magic MCP server is installed (`@21st-dev/magic@latest`). Claude can search and install 21st.dev components directly into the project during Phase 12+.
- **D-07:** Free plan has limited daily fetches — be strategic, batch component research, and prioritize hero/navbar/footer components.
- **D-08:** Phase 11 does NOT use Magic MCP (infrastructure only). Phase 12 (Design System) is where component sourcing begins.

### Claude's Discretion
- TypeScript configuration strictness level
- ESLint + Prettier configuration specifics
- Exact Tailwind v4 base configuration (tokens come in Phase 12)
- next-cloudinary configuration details
- Test image selection for CldImage validation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Infrastructure
- `.planning/research/STACK.md` — Recommended stack with versions (Next.js 15, React 19, Tailwind v4, next-cloudinary)
- `.planning/research/ARCHITECTURE.md` — Project structure, App Router patterns, Cloudinary integration approach
- `.planning/research/PITFALLS.md` — FOUC prevention, Netlify deployment gotchas, bundle budget constraints

### Current Codebase
- `package.json` — Current dependencies and scripts (Vite 6, GSAP, PhotoSwipe, Cloudinary SDK)
- `netlify.toml` — Current Netlify config (redirects, headers, function directory)
- `scripts/build-gallery-data.js` — Gallery data build script (Cloudinary API integration to preserve)
- `vite.config.js` — Current build configuration (multi-page entries)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/build-gallery-data.js` — Fetches Cloudinary metadata + generates LQIP base64. Core logic reusable in Next.js prebuild.
- `scripts/build-blog.js` — Blog static page generation. Logic ports to Next.js dynamic routes.
- `netlify/functions/*.mjs` — All 11 functions stay as-is; Next.js coexists with them.
- `src/data/gallery-images.js` — Gallery data format; Next.js version should output compatible JSON.

### Established Patterns
- Build-time data generation via prebuild scripts (Cloudinary API → static data file)
- Cloudinary public IDs follow `automotive-portfolio/{category}/{slug}` convention
- LQIP generated from Cloudinary `w_20,e_blur:400` transform URLs
- Environment variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Integration Points
- Netlify deployment: `netlify.toml` needs updating for Next.js (build command, publish directory)
- Cloudinary: `CLOUDINARY_CLOUD_NAME` env var needed for next-cloudinary CldImage
- Existing functions at `netlify/functions/` must remain accessible

</code_context>

<specifics>
## Specific Ideas

- Dark cinematic aesthetic: background should be very dark (#0e0e12 range), not pure black
- The skeleton page should visually confirm the dark theme works — even a simple "David Bradley" heading on dark background proves FOUC prevention
- Test CldImage with one of the existing Cloudinary images to confirm the pipeline end-to-end

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-foundation-pipeline-validation*
*Context gathered: 2026-03-26*
