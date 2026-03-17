# Phase 6: Admin Authentication & Upload - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a browser-based admin panel at `/admin` where David can log in, upload photos with category tags, and have them appear in the gallery automatically. Includes Netlify Identity auth, drag-and-drop upload proxied through a Netlify Function, hero image selection from gallery or custom upload, and automatic site rebuild on upload. The admin is a separate Vite entry point — never loaded by public visitors.

</domain>

<decisions>
## Implementation Decisions

### Authentication
- Netlify Identity for login — free, JWT-based, single invited user (David)
- No public registration — invite-only via Netlify dashboard
- Admin page at `/admin` loads Netlify Identity widget for login

### Admin Layout
- Tabbed interface: **Upload** | **Gallery** | **Settings**
- Upload tab: drag-and-drop zone, category picker, batch upload
- Gallery tab: grid of existing images with metadata (Phase 7 adds edit/delete/reorder)
- Settings tab: hero image selection (pick from gallery or upload custom)
- Dark theme matching main site (#0F0F0F background, purple accents) — cohesive premium feel

### Upload Experience
- Drag-and-drop zone with file picker fallback, accepts JPEG/PNG/WebP
- Batch upload — set category once for the whole batch (fastest for post-shoot workflow)
- Per-image progress bars during upload
- Auto-generated image ID/slug from category + caption, editable
- Image preview shown before upload via `URL.createObjectURL()`
- Per-image metadata: caption (text), alt text (text) — category set at batch level
- After success: toast notification ("5 photos uploaded! Rebuilding site...") + form clears for next batch
- Upload proxied through Netlify Function — Cloudinary API secret stays server-side
- Netlify rebuild triggered automatically after upload completes

### Hero Image Selection
- Settings tab shows grid of all gallery images — click one to set as hero
- Also has "Upload custom hero" option for images not in the gallery
- Hero image moves to Cloudinary (no longer local in git)
- Auto-cropped to landscape for hero viewport display
- Hero selection stored as Cloudinary metadata or a config file fetched at build time

### Claude's Discretion
- Exact admin UI layout and spacing
- Netlify Function implementation details
- How hero selection persists (Cloudinary tag vs JSON config in git)
- Upload concurrency and rate limiting
- Error handling UX for failed uploads
- Tab navigation implementation (URL hash vs JS state)
- Netlify Identity widget styling customization

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and REQUIREMENTS.md (AUTH-01, AUTH-02, UPLOAD-01 through UPLOAD-07).

</canonical_refs>

<specifics>
## Specific Ideas

- Dark admin theme creates a cohesive "premium tool" feel — not a generic white CMS
- Batch category selection reflects real photographer workflow: shoot 20 JDM cars at a meet, come home, drag-and-drop all, set "JDM", add captions, upload
- Toast + clear form matches the contact form pattern already established in v1
- Tabbed layout gives room for Phase 7 gallery management without redesigning the admin

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/tokens.css`: Design tokens reusable in admin (colors, typography, spacing)
- `src/style.css`: Button styles (`.btn--primary`) reusable in admin
- `src/components/contact.js`: Toast notification pattern — reuse for upload success/error
- `scripts/build-gallery-data.js`: Build script already fetches from Cloudinary — admin extends this pipeline
- `.env` + `.env.example`: Cloudinary credentials already configured

### Established Patterns
- Component CSS + JS pairs in `src/components/`
- BEM naming throughout
- Toast notification with `role="status"` + `aria-live="polite"`
- Cloudinary SDK configured as dev dependency

### Integration Points
- `vite.config.js`: Needs multi-page entry for `/admin`
- `netlify.toml`: Needs Functions directory config + potential Identity redirect
- `package.json`: Needs Netlify Functions build tooling
- Cloudinary cloud name: `dl0atmtb7`
- Gallery data written by `scripts/build-gallery-data.js` — upload triggers rebuild which runs this

</code_context>

<deferred>
## Deferred Ideas

- Cloudinary watermark/logo overlay on photos — separate phase
- Live Instagram/TikTok feed for social wall — future phase
- BTS image management via admin — could extend in Phase 7

</deferred>

---

*Phase: 06-admin-authentication-upload*
*Context gathered: 2026-03-16*
