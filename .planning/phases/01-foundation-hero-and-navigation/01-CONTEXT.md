# Phase 1: Foundation, Hero, and Navigation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the complete design token system, project scaffold, cinematic full-bleed hero section, and sticky navigation. This phase delivers a visually complete, navigable single-page skeleton — no gallery, no content sections, no animations beyond the hero entrance. Everything in Phase 2+ inherits the patterns set here.

</domain>

<decisions>
## Implementation Decisions

### Color System

- **Primary background:** #0F0F0F (near-black) — maximum cinematic depth
- **Accent color:** #7C3AED (deep violet) — rich, luxurious, premium feel
- **Hover glow:** rgba(124, 58, 237, 0.3) on interactive elements
- **Border/dividers:** rgba(124, 58, 237, 0.4) — subtle violet borders on cards and section dividers
- **Primary text:** #E0E0E0 (off-white) — warm, easier on eyes than pure white against near-black
- **Purple accent usage:** CTA buttons (filled violet), borders & dividers, hover glows on gallery/nav/social, and text highlights used sparingly for key emphasis

### Hero Layout & Feel

- **Text position:** Bottom-left — editorial, magazine-like. Name, tagline, and CTA anchored to the bottom-left over the image.
- **Hero image motion:** Subtle Ken Burns effect — slow zoom or pan on the hero image for cinematic feel
- **Dark overlay:** Gradient bottom-up — dark gradient fades from bottom (where text is) to transparent at top. Protects text readability while keeping image visible.
- **CTA button style:** Solid deep violet fill (#7C3AED) with white text — strong, immediately readable
- **Hero image:** Placeholder for v1, treated as LCP element (fetchpriority="high", never lazy-loaded, under 200KB)

### Navigation

- **Scroll behavior:** Transparent on hero, transitions to frosted glass dark bar (backdrop-filter: blur) when scrolling past hero — premium, modern feel
- **Logo:** "DB" monogram in Orbitron as small logo mark + "David Bradley" text beside it. On mobile, can collapse to monogram only.
- **Nav links:** Gallery, Video, About, BTS, Contact — all five sections directly linked
- **Scroll-spy:** Active section highlighted in nav via Intersection Observer
- **Nav CTA:** "Book a Shoot" solid violet button at the right end of the nav, always visible
- **Mobile:** Hamburger menu with full-screen overlay showing all nav links + CTA

### Typography

- **Orbitron usage:** Hero name display + H2 section headings only — strong impact without overwhelm
- **Body/supporting text:** Space Grotesk throughout
- **Letter case:** Section headings (H2) in ALL CAPS for impact, nav links in mixed case for readability
- **Hero name size:** Massive — 80-100px+ on desktop, scales down responsively on mobile
- **Tagline:** "Where Speed Meets Art" — sits below the name in Space Grotesk, smaller scale, mixed case
- **Font loading:** Google Fonts with performance-safe loading (preconnect, display=swap)

### Claude's Discretion

- Exact spacing between hero name, tagline, and CTA button
- Precise Ken Burns animation duration and direction (zoom in vs zoom out, pan direction)
- Frosted glass nav exact blur radius and background opacity
- Mobile breakpoint behavior details (font scaling, nav collapse point)
- Letter spacing (tracking) on Orbitron headings
- Exact transition timing on nav scroll behavior

</decisions>

<specifics>
## Specific Ideas

- Premium reference aesthetic: high-end watch brand meets supercar — luxurious, not flashy
- The photography should be the star — design recedes to let images breathe
- Purple is distinctive in the automotive space (most competitors use red, orange, or white/black)
- "DB" monogram should feel engineered/precise — geometric, not decorative

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. Phase 1 establishes all foundational patterns.

### Established Patterns
- None yet — Phase 1 creates the patterns all subsequent phases inherit:
  - CSS custom properties for all design tokens
  - Section module structure (each section = its own CSS + JS file)
  - Image conventions (max 2000px, under 400KB, WebP, descriptive filenames)

### Integration Points
- Vite 6.x project scaffold is the entry point — Phase 1 creates `index.html`, `src/main.js`, `src/style.css`
- Section anchor IDs must be consistent across phases (e.g., `#gallery`, `#video`, `#about`, `#bts`, `#contact`)
- CSS custom properties established here are consumed by every Phase 2+ component

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-foundation-hero-and-navigation*
*Context gathered: 2026-03-14*
