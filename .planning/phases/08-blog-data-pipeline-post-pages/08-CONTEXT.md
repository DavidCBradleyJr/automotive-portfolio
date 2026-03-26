# Phase 8: Blog Data Pipeline & Post Pages - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the blog data format, build pipeline, and individual post page rendering. Posts stored in git as markdown files are transformed into styled static HTML pages at build time. This is the foundation — no admin editor or listing page yet (those are Phases 9 and 10).

</domain>

<decisions>
## Implementation Decisions

### Post Page Design
- Photos displayed **inline with text column** (~700px reading width) — not full-bleed
- Clicking a photo in a blog post opens it in **PhotoSwipe lightbox** (reuses existing setup)
- Post header: Claude's discretion (leaning toward full-bleed cover image with title overlay for cinematic feel)
- Dark theme matching main site — same Orbitron headings, Space Grotesk body, #0F0F0F background, purple accents
- Responsive from 320px to 1440px+ (per BLOG-07)
- Nav and footer shared from main site (per BLOG-05)

### Post Data Format
- Claude decides storage format (markdown with frontmatter vs JSON — both viable)
- Free-form tags supported on each post (e.g. "JDM", "Cars & Coffee", "Track Day")
- Post metadata: title, slug, date, cover image (Cloudinary URL), excerpt, tags, draft/published status
- Photos in posts use Cloudinary CDN URLs (per BDATA-04)
- Posts committed to git — build script generates static HTML pages

### Build Pipeline
- Build script reads post files from git, parses markdown, generates static HTML at `/blog/post-slug`
- Fully static output — no runtime API calls for visitors (per BDATA-03)
- Multi-page Vite build needs to handle dynamic blog post pages (not just index.html + admin.html)
- Sample post(s) included for testing the pipeline end-to-end

### Claude's Discretion
- Exact post data format (markdown frontmatter vs JSON)
- Post header design (full-bleed cover vs editorial)
- Markdown parser library choice
- How multi-page blog generation integrates with Vite build
- Reading column width and typography details
- Code syntax highlighting (if needed)
- How PhotoSwipe is initialized on blog post pages

</decisions>

<specifics>
## Specific Ideas

- Photography is the star — even in blog posts, photos should be prominent and high quality
- The reading experience should feel premium — generous spacing, excellent typography
- Blog posts about shoots are the primary use case (e.g. "What we captured at Cars & Coffee last weekend")
- Reusing the PhotoSwipe lightbox from the gallery creates consistency across the site

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/tokens.css`: All design tokens (colors, typography, spacing)
- `src/style.css`: Section classes, button styles, heading styles
- `src/components/nav.css` + `nav.js`: Navigation (needs to work on blog pages too)
- `src/components/footer.css`: Footer component
- PhotoSwipe already installed and configured in gallery
- `scripts/build-gallery-data.js`: Existing build-time script pattern to follow

### Established Patterns
- Vite multi-page: currently `index.html` + `admin.html` in `vite.config.js` rollupOptions
- BEM naming, three-tier CSS tokens, `prefers-reduced-motion` support
- Build-time data generation from external sources (Cloudinary)

### Integration Points
- `vite.config.js`: Needs to handle dynamic blog page generation (not just 2 fixed entry points)
- Nav links: May need a "Blog" link added to navigation
- Footer: Already present, needs to render on blog pages
- Cloudinary: Blog post photos use CDN URLs like gallery images
- `index.html`: The main page needs a "Featured Post" section added (Phase 10, not this phase)

</code_context>

<deferred>
## Deferred Ideas

- Blog listing page at /blog — Phase 10
- Featured post on homepage — Phase 10
- Blog admin editor — Phase 9
- RSS feed — future enhancement
- Post comments — future enhancement

</deferred>

---

*Phase: 08-blog-data-pipeline-post-pages*
*Context gathered: 2026-03-25*
