# Phase 3: Content Sections and Contact - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the storytelling arc: video reel, about, behind-the-scenes, contact/booking form, and social wall. Visitors can watch video content, learn about David, see BTS work, find social links, and submit a booking inquiry. This phase fills out all remaining content sections between the gallery (Phase 2) and the footer/animations (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### About Section
- First-person, passionate storyteller tone — "I fell in love with cars..." Personal, relatable, shows the human behind the lens
- Placeholder bio text (Claude writes compelling placeholder, user swaps later)
- Photographer photo: stylized silhouette/avatar icon on dark background
- Purple accent border around the photographer photo — ties to brand accent
- Two-column desktop layout (photo left, text right), stacked on mobile (per ABOUT-03)
- CTA after about section linking to contact (per ABOUT-04)

### Contact Form
- Event Type dropdown options: Car Show, Track Day, Private Collection, Editorial/Magazine, Dealership, Other
- Success state: toast notification slides in from corner, form stays visible but fields clear
- Placeholder Formspree endpoint (user swaps in real endpoint later)
- Alternative contact: email address (placeholder) + Instagram and TikTok social links displayed alongside form
- Client-side validation with inline error messages (per CONT-03)
- No page reload on submit (per CONT-04)

### Video Reel
- Placeholder video thumbnail with play button — user swaps in real YouTube/Vimeo URL later
- Facade pattern (lite-youtube-embed) for performance (per VID-02)
- 16:9 responsive aspect ratio (per VID-04)
- Heading + brief description text (per VID-03)

### Behind the Scenes
- 4 images in a 2x2 grid
- Reuse existing car photos from `public/images/gallery/` as stand-in BTS content
- Process + storytelling captions — e.g. "Chasing golden hour at the track" (narrative, emotional)
- Heading + brief intro paragraph (per BTS-03)

### Social Wall
- Instagram-style 3x3 square grid (9 images, square-cropped)
- Static images reused from gallery (no live API per requirements)
- Clicking any image links to Instagram profile (new tab)
- Social platforms: Instagram + TikTok (placeholder profile URLs)

### Claude's Discretion
- Exact bio placeholder text content
- Video section description text
- BTS caption writing
- Social wall image selection from existing gallery
- Form input styling details (focus states, error message positioning)
- Toast notification animation and positioning
- Silhouette/avatar design for about photo

</decisions>

<specifics>
## Specific Ideas

- Passionate storyteller bio tone matches the premium but personal brand — not corporate
- Process + storytelling BTS captions (not just gear specs) — show the craft and passion
- Toast notification for form success feels modern and non-disruptive
- Instagram + TikTok are the social platforms (not YouTube)
- Purple accent border on about photo creates visual consistency with filter pills and CTA buttons

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/tokens.css`: Full design token system (colors, typography, spacing)
- `src/style.css`: `.section` class, `.section__heading` (Orbitron, ALL CAPS), `.btn--primary` button
- `src/components/gallery.js`: `galleryImages` data pattern — same approach can inform BTS/social data
- `public/images/gallery/`: 29 WebP images available for BTS and social wall reuse

### Established Patterns
- Component structure: `src/components/{name}.css` + `{name}.js` with `init{Name}()` function
- All CSS/JS imports go through `src/main.js`
- BEM naming: `.block__element--modifier`
- `prefers-reduced-motion` respected in all animation CSS
- Three-tier CSS custom properties (primitives → semantic → component)

### Integration Points
- Section stubs in `index.html`: `#video`, `#about`, `#bts`, `#contact` all exist with heading only
- Nav scroll-spy already watches all section anchors via IntersectionObserver
- Nav links already point to `#video`, `#about`, `#bts`, `#contact`
- `src/main.js` is the entry point — each section's CSS/JS imports and init calls go here
- Social links needed in nav and/or footer (SOCIAL-01) — Phase 4 handles footer

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

</deferred>

---

*Phase: 03-content-sections-and-contact*
*Context gathered: 2026-03-15*
