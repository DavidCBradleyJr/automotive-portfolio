# Roadmap: David Bradley Automotive Photography Portfolio

## Milestones

- v1.0 Portfolio Launch - Phases 1-4 (shipped 2026-03-16)
- v2.0 Admin Panel & Image Pipeline - Phases 5-7 (shipped 2026-03-25)
- v3.0 Blog - Phases 8-10 (in progress)
- v4.0 Complete Redesign - Phases 11-16 (planned)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 Portfolio Launch (Phases 1-4) - SHIPPED 2026-03-16</summary>

- [x] **Phase 1: Foundation, Hero, and Navigation** - Theme system, visual identity, cinematic hero opener, and sticky navigation with scroll-spy (completed 2026-03-14)
- [x] **Phase 2: Gallery and Image Pipeline** - Category-filtered photo grid with progressive loading and lightbox viewer (completed 2026-03-15)
- [x] **Phase 3: Content Sections and Contact** - Video reel, about, behind-the-scenes, social wall, and booking inquiry form (completed 2026-03-16)
- [x] **Phase 4: Animations, Polish, and Launch** - Scroll animations, footer, SEO, performance audit, and Netlify deployment (completed 2026-03-16)

### Phase 1: Foundation, Hero, and Navigation
**Goal**: Visitors land on a polished, navigable dark-themed page with a cinematic full-bleed hero that establishes David Bradley's brand
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, HERO-01, HERO-02, HERO-03, HERO-04, HERO-05
**Success Criteria** (what must be TRUE):
  1. Opening the site in a browser shows a full-viewport cinematic hero image with David Bradley's name in Orbitron font, a tagline, and a CTA button -- all on a dark theme with purple accents
  2. A sticky navigation bar is visible at all scroll positions with section links, a wordmark, and active-section highlighting that updates as the user scrolls
  3. Clicking nav links smoothly scrolls to the corresponding section anchor; on mobile, a hamburger menu opens a full-screen overlay with the same links
  4. The site is responsive from 320px to 1440px+ and the hero image loads fast (fetchpriority high, under 200KB, never lazy-loaded)
  5. CSS custom properties define all design tokens (colors, typography, spacing) and the dark theme passes WCAG AA contrast requirements
**Plans:** 5/5 complete

Plans:
- [x] 01-01: Scaffold Vite project, design tokens, global styles, HTML skeleton
- [x] 01-02: Hero section styling with Ken Burns animation and entrance effects
- [x] 01-03: Sticky frosted-glass navigation with scroll-spy and mobile hamburger
- [x] 01-04: Fix hero image visibility and entrance animation timing
- [x] 01-05: Fix mobile overlay scroll lock and active link styling

### Phase 2: Gallery and Image Pipeline
**Goal**: Visitors can browse David's portfolio by automotive category with smooth filtering and a full-featured lightbox viewer
**Depends on**: Phase 1
**Requirements**: GAL-01, GAL-02, GAL-03, GAL-04, GAL-05, GAL-06, GAL-07, GAL-08
**Success Criteria** (what must be TRUE):
  1. A photo gallery section displays images in a responsive CSS Grid layout with 8-12 placeholder images per category
  2. Clicking category filter buttons smoothly animates the gallery to show only images from that category without page reload
  3. Clicking any gallery image opens a PhotoSwipe lightbox with keyboard navigation, mobile swipe, and pinch-to-zoom
  4. Gallery images lazy-load with LQIP blur-up effect, and on mobile the layout uses full-width single-column
  5. A "Book a Shoot" CTA button appears after the gallery, scrolling to the contact section
**Plans:** 3/3 complete

Plans:
- [x] 02-01: Image processing pipeline with sharp and gallery data file
- [x] 02-02: Gallery masonry grid, category filter pills, and LQIP lazy loading
- [x] 02-03: PhotoSwipe lightbox integration with category-scoped navigation

### Phase 3: Content Sections and Contact
**Goal**: The full storytelling arc is complete -- visitors can watch video content, learn about David, see behind-the-scenes work, find social links, and submit a booking inquiry
**Depends on**: Phase 2
**Requirements**: VID-01, VID-02, VID-03, VID-04, ABOUT-01, ABOUT-02, ABOUT-03, ABOUT-04, BTS-01, BTS-02, BTS-03, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, SOCIAL-01, SOCIAL-02
**Success Criteria** (what must be TRUE):
  1. A video reel section displays an embedded video player using the facade pattern, responsive at 16:9 aspect ratio
  2. An about section presents a photographer photo and personal bio in a two-column desktop layout (stacked on mobile), with a CTA linking to contact
  3. A behind-the-scenes section shows a grid of BTS images with captions describing gear, locations, or process
  4. Submitting the booking form delivers an email via Formspree, with client-side validation, success/error states, and no page reload
  5. Social media links are accessible, and a social wall section displays a curated static grid of social-style images
**Plans:** 2/2 complete

Plans:
- [x] 03-01: Video reel, about section, and behind-the-scenes grid
- [x] 03-02: Contact form with Formspree integration and social wall grid

### Phase 4: Animations, Polish, and Launch
**Goal**: The site feels alive with tasteful scroll animations, has proper SEO and performance, and is deployed on the public internet
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, FOOT-01, FOOT-02, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08
**Success Criteria** (what must be TRUE):
  1. Sections reveal with scroll-triggered animations, hero has parallax, gallery items stagger -- no more than 3-4 distinct animation types
  2. Users with prefers-reduced-motion see no animations
  3. Footer displays name/copyright, social links, nav links, and a "Book a Shoot" CTA
  4. Lighthouse mobile 90+, LCP under 2.5s, JS under 80KB gzip, all images have alt text
  5. Deployed on Netlify with OG/Twitter meta tags and proper heading hierarchy
**Plans:** 2/2 complete

Plans:
- [x] 04-01: Footer component, scroll animations, and hamburger bug fix
- [x] 04-02: SEO audit, meta tags, performance verification, and Netlify deployment

</details>

<details>
<summary>v2.0 Admin Panel & Image Pipeline (Phases 5-7) - SHIPPED 2026-03-25</summary>

- [x] **Phase 5: Cloudinary Storage & Build Pipeline** - Migrate images to Cloudinary CDN and generate gallery data at build time (completed 2026-03-16)
- [x] **Phase 6: Admin Authentication & Upload** - Protected admin panel with drag-and-drop photo upload and metadata tagging (completed 2026-03-17)
- [x] **Phase 7: Admin Image Management** - View, edit, delete, and reorder existing gallery images from the admin panel (completed 2026-03-25)

### Phase 5: Cloudinary Storage & Build Pipeline
**Goal**: The public gallery loads all images from Cloudinary CDN with automatic format optimization, and the build pipeline generates gallery data without any manual steps
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, BUILD-01, BUILD-02, BUILD-03, BUILD-04
**Success Criteria** (what must be TRUE):
  1. All 29 existing gallery images are served from Cloudinary CDN URLs instead of the git repo, with metadata (category, caption, alt text) preserved
  2. Gallery images are automatically delivered as WebP with responsive sizing via Cloudinary URL transforms -- no local image processing needed
  3. Running the build generates a gallery data file in the same format as v1, and the public gallery renders identically with zero code changes to the frontend
  4. LQIP base64 placeholders are generated at build time from Cloudinary thumbnail URLs, preserving the blur-up loading effect
  5. The public site JS bundle remains under 80KB gzip with no Cloudinary SDK or admin code loaded by visitors
**Plans:** 3/3 plans complete

Plans:
- [x] 05-01-PLAN.md -- Install Cloudinary SDK, create migration script, upload 29 images
- [x] 05-02-PLAN.md -- Create build-gallery-data.js script and wire into npm prebuild
- [x] 05-03-PLAN.md -- Update BTS/social image paths, verify bundle size, visual check

### Phase 6: Admin Authentication & Upload
**Goal**: David can log into a browser-based admin panel and upload new photos with categories and captions that appear in the gallery after a short rebuild
**Depends on**: Phase 5
**Requirements**: AUTH-01, AUTH-02, UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin shows a Netlify Identity login gate -- only invited users (David) can access the panel, with no public registration option
  2. After login, David can drag-and-drop (or file-pick) one or more JPEG/PNG/WebP images, see previews, and fill in category, caption, and alt text per image
  3. Uploading images sends them through a Netlify Function proxy to Cloudinary (API secret never exposed to browser), and David sees success/error feedback
  4. After upload completes, a Netlify rebuild is triggered automatically, and within 2-3 minutes the new photos appear in the public gallery
**Plans:** 3/3 plans complete

Plans:
- [x] 06-01-PLAN.md -- Admin HTML shell, Netlify Identity auth, tab navigation, Vite multi-page build
- [x] 06-02-PLAN.md -- Netlify Functions for upload proxy and rebuild trigger
- [x] 06-03-PLAN.md -- Upload UI, gallery view, settings tab, wiring to functions

### Phase 7: Admin Image Management
**Goal**: David can view, edit, and organize his entire gallery from the admin panel without touching code or the Cloudinary dashboard
**Depends on**: Phase 6
**Requirements**: MGMT-01, MGMT-02, MGMT-03, MGMT-04
**Success Criteria** (what must be TRUE):
  1. The admin panel shows a grid of all uploaded gallery images with their current category, caption, and alt text visible
  2. David can edit the category, caption, or alt text on any existing image and the changes persist after the next build
  3. David can delete an image from the gallery, which removes it from both Cloudinary and the gallery metadata
  4. David can reorder images within a category using drag or sort controls, and the new order is reflected on the public site after rebuild
**Plans:** 2/2 complete

Plans:
- [x] 07-01-PLAN.md -- Backend Netlify Functions (update, delete, restore, reorder) + build script updates
- [x] 07-02-PLAN.md -- Frontend edit modal, gallery management UI, drag-and-drop reorder

</details>

<details>
<summary>v3.0 Blog (Phases 8-10) - IN PROGRESS</summary>

- [x] **Phase 8: Blog Data Pipeline & Post Pages** - Post storage in git, build-time HTML generation, and individual post page rendering (completed 2026-03-26)
- [ ] **Phase 9: Blog Admin Editor** - Markdown editor in admin with formatting toolbar, photo insertion, and publish workflow
- [ ] **Phase 10: Blog Listing & Homepage Integration** - Blog index page with post cards and featured/recent preview on the main page

### Phase 8: Blog Data Pipeline & Post Pages
**Goal**: Blog posts stored as data files in git are transformed into fully styled static HTML pages at build time, viewable at /blog/post-slug
**Depends on**: Phase 7 (v2.0 complete)
**Requirements**: BDATA-01, BDATA-02, BDATA-03, BDATA-04, BLOG-02, BLOG-03, BLOG-05, BLOG-07
**Success Criteria** (what must be TRUE):
  1. A sample blog post committed as a JSON/markdown file in git is picked up by the build script and generates a static HTML page at /blog/post-slug
  2. The generated post page displays the title, formatted date, cover image (from Cloudinary), and fully rendered markdown body with embedded photos
  3. The post page shares the dark theme, Orbitron/Space Grotesk typography, and nav/footer from the main site -- it looks like it belongs
  4. The post page is responsive and readable from 320px to 1440px+, with no runtime API calls (fully static)
**Plans:** 2/2 plans complete

Plans:
- [x] 08-01-PLAN.md -- Sample blog posts, build-blog.js prebuild script, Vite dynamic entry discovery
- [x] 08-02-PLAN.md -- Blog post CSS/JS (dark theme styling, PhotoSwipe lightbox, responsive layout)
**UI hint**: yes

### Phase 9: Blog Admin Editor
**Goal**: David can create, edit, and manage blog posts entirely from the admin panel -- writing in markdown with a live preview, inserting photos, and publishing with one click
**Depends on**: Phase 8
**Requirements**: EDITOR-01, EDITOR-02, EDITOR-03, EDITOR-04, EDITOR-05, EDITOR-06, EDITOR-07, EDITOR-08, BDATA-05
**Success Criteria** (what must be TRUE):
  1. A "Blog" tab in the admin panel lists all existing posts (drafts and published) with options to edit or delete each one
  2. The blog editor provides a markdown editing area with a formatting toolbar (bold, italic, headings, links, blockquote, lists) and a live preview pane showing rendered output
  3. David can insert photos into a post by picking from existing gallery images or uploading a new image (which is auto-added to Cloudinary)
  4. David can fill in post metadata (title, slug, cover image, excerpt, tags), save as draft, or publish -- drafts are not visible on the public site
  5. After publishing or editing a post, a site rebuild is triggered automatically and the changes appear on the public blog within 2-3 minutes
**Plans:** 3/3 plans complete

Plans:
- [x] 09-01-PLAN.md -- Backend Netlify Functions (list-posts, save-post, delete-post via GitHub API) + Blog tab HTML and navigation
- [x] 09-02-PLAN.md -- Blog editor component (markdown toolbar, Write/Preview tabs, metadata) + blog manager (post card grid, CRUD workflow)
- [x] 09-03-PLAN.md -- Gallery sidebar (drag-to-insert photos, in-editor upload, cover image picker) + visual verification
**UI hint**: yes

### Phase 10: Blog Listing & Homepage Integration
**Goal**: Visitors can discover blog content through a dedicated listing page and a preview section on the main homepage
**Depends on**: Phase 9
**Requirements**: BLOG-01, BLOG-04, BLOG-06
**Success Criteria** (what must be TRUE):
  1. Navigating to /blog shows a listing page with all published posts in reverse-chronological order, each displayed as a card with cover image, title, excerpt, and date
  2. The main homepage includes a featured/recent post preview section (between existing sections) that links through to the full post
  3. The blog listing page matches the site's dark theme and is responsive from 320px to 1440px+
**Plans**: TBD
**UI hint**: yes

</details>

## v4.0 Complete Redesign (Phases 11-16)

**Milestone Goal:** Rebuild the entire portfolio as a multi-page Next.js site with a dark cinematic luxury automotive aesthetic (Porsche/McLaren caliber), premium polish, better conversion flow, and redesigned admin panel -- using UI UX Pro Max for design system, 21st.dev for React components, and Gemini for visual asset generation.

- [ ] **Phase 11: Foundation & Pipeline Validation** - Next.js 15 project scaffolded and deployed to Netlify with Cloudinary pipeline adapted for React
- [ ] **Phase 12: Design System & Asset Generation** - Dark cinematic design tokens, component library, navbar/footer, and collaborative visual asset workflow
- [ ] **Phase 13: Public Pages** - Gallery, blog, about/contact, and home page shell with all content pages functional (no hero animation yet)
- [ ] **Phase 14: Cinematic Hero & Animations** - Interactive 3D parallax hero, GSAP scroll effects, Motion page transitions and scroll reveals
- [ ] **Phase 15: Admin Panel** - React rewrite of gallery management, blog editor, and site settings with JWT-protected API routes
- [ ] **Phase 16: Polish, Performance & Launch** - Lighthouse optimization, cross-browser testing, accessibility audit, and production launch

## Phase Details

### Phase 11: Foundation & Pipeline Validation
**Goal**: A working Next.js 15 skeleton is deployed to Netlify with dark theme, Cloudinary integration, and zero flash of wrong theme -- proving the deployment pipeline before any features are built
**Depends on**: Phase 10 (v3.0 complete)
**Requirements**: V4-FOUND-01, V4-FOUND-02, V4-FOUND-03
**Success Criteria** (what must be TRUE):
  1. Visiting the deployed Netlify URL shows a Next.js 15 App Router page with dark background (#0e0e12) and no flash of white on initial load
  2. A test image renders via CldImage with a blur-up LQIP placeholder, confirming the Cloudinary pipeline works in the Next.js environment
  3. The build-time gallery data script outputs JSON that Next.js can consume as static props, and the deployed bundle is under 200KB gzipped
  4. Direct URL access (not just client-side navigation) works correctly on the deployed Netlify site -- no 404s or 500s on any route
**Plans**: TBD

### Phase 12: Design System & Asset Generation
**Goal**: The complete visual identity is defined -- dark cinematic luxury tokens, reusable components, responsive navbar/footer, and visual assets generated through the collaborative Claude/Gemini workflow -- so all subsequent pages build from a consistent foundation
**Depends on**: Phase 11
**Requirements**: V4-DESIGN-01, V4-DESIGN-02, V4-DESIGN-03, V4-DESIGN-04, V4-DESIGN-05
**Success Criteria** (what must be TRUE):
  1. Tailwind v4 theme tokens define a complete dark cinematic color palette, custom typography scale, and spacing system via the CSS-native @theme directive
  2. A set of base shadcn/ui components (Button, Card, Input, Dialog, Tabs) and 21st.dev components are installed, customized to the dark theme, and render consistently
  3. A responsive frosted-glass navbar with page links (Home, Gallery, Blog, About) collapses to a mobile menu, and a branded footer with social links and copyright is visible on all pages
  4. Claude has provided 21st.dev component URLs for review and Gemini prompts for mockup generation, and David has generated and provided visual assets (color palette mockups, layout references) that inform the design direction
**Plans**: TBD
**UI hint**: yes

### Phase 13: Public Pages
**Goal**: All content pages are functional and styled -- visitors can browse the gallery with filtering and lightbox, read blog posts, learn about David, submit a booking inquiry, and navigate a home page with featured work, video reel, and CTAs (hero section uses a placeholder pending Phase 14)
**Depends on**: Phase 12
**Requirements**: V4-HOME-02, V4-HOME-03, V4-HOME-04, V4-HOME-05, V4-GAL-01, V4-GAL-02, V4-GAL-03, V4-BLOG-01, V4-BLOG-02, V4-BLOG-03, V4-ABOUT-01, V4-ABOUT-02, V4-ABOUT-03
**Success Criteria** (what must be TRUE):
  1. The gallery page displays photos from Cloudinary in a responsive grid with category filter buttons, and clicking any photo opens a React lightbox with navigation and smooth staggered loading animations
  2. Blog listing at /blog shows published post cards, and individual posts at /blog/[slug] render full markdown content with cover images -- blog data is static at build time
  3. The About page tells David's photographer story, the Contact section has a working Formspree booking form, and social media links are accessible
  4. The Home page displays a featured work section, embedded video reel, about preview with link to full About page, and clear CTAs driving to booking/contact (hero area has a static placeholder image)
  5. A featured/recent blog post appears on the home page linking through to the full post
**Plans**: TBD
**UI hint**: yes

### Phase 14: Cinematic Hero & Animations
**Goal**: The site comes alive -- visitors experience an interactive 3D parallax hero on the home page, smooth page transitions between routes, and scroll-triggered reveal animations throughout all pages
**Depends on**: Phase 13
**Requirements**: V4-HOME-01, V4-ANIM-01, V4-ANIM-02, V4-ANIM-03
**Success Criteria** (what must be TRUE):
  1. The home page hero is an interactive 3D parallax showcase (sourced from 21st.dev hero components, powered by GSAP ScrollTrigger) that creates a cinematic first impression with scroll-triggered effects
  2. Navigating between pages triggers smooth Motion-powered transitions (AnimatePresence with mode="wait") that feel premium and fast (under 300ms)
  3. Page sections across all routes reveal with Motion scroll-triggered animations as the user scrolls, adding depth without competing with the photography
  4. All animations respect prefers-reduced-motion and the GSAP hero loads via dynamic import with ssr:false (no hydration mismatches)
**Plans**: TBD
**UI hint**: yes

### Phase 15: Admin Panel
**Goal**: David can manage his entire portfolio from a React-based admin panel -- uploading and organizing gallery photos, writing and publishing blog posts, and configuring hero images and site settings -- all protected by authentication
**Depends on**: Phase 14
**Requirements**: V4-ADMIN-01, V4-ADMIN-02, V4-ADMIN-03, V4-ADMIN-04
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin requires Netlify Identity login -- unauthenticated users cannot access any admin page or API route (JWT verification via jose middleware)
  2. David can upload new photos (CldUploadWidget), edit metadata, delete images, and drag-to-reorder gallery items within categories -- changes reflect on the public site after rebuild
  3. David can create, edit, and publish blog posts with the markdown editor (formatting toolbar, live preview, photo insertion from gallery) -- drafts stay hidden from the public site
  4. David can select hero images and manage site settings from a dedicated settings area in the admin panel
**Plans**: TBD
**UI hint**: yes

### Phase 16: Polish, Performance & Launch
**Goal**: The site is production-ready -- fast, accessible, cross-browser tested, and SEO-optimized with no rough edges
**Depends on**: Phase 15
**Requirements**: V4-PERF-01, V4-PERF-02, V4-PERF-03, V4-PERF-04
**Success Criteria** (what must be TRUE):
  1. All public pages score 90+ on Lighthouse across Performance, Accessibility, SEO, and Best Practices categories
  2. Every page has unique SEO metadata, an Open Graph image, and is included in the sitemap -- shared links render rich previews on social platforms
  3. The site meets WCAG AA accessibility standards: 4.5:1 contrast ratios, visible focus states, keyboard navigation, and animations disabled when prefers-reduced-motion is set
  4. The site works correctly across Safari (desktop and iOS), Firefox, Chrome, and mobile browsers with no layout breaks or JavaScript errors
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13 -> 14 -> 15 -> 16

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation, Hero, and Navigation | v1.0 | 5/5 | Complete | 2026-03-14 |
| 2. Gallery and Image Pipeline | v1.0 | 3/3 | Complete | 2026-03-15 |
| 3. Content Sections and Contact | v1.0 | 2/2 | Complete | 2026-03-16 |
| 4. Animations, Polish, and Launch | v1.0 | 2/2 | Complete | 2026-03-16 |
| 5. Cloudinary Storage & Build Pipeline | v2.0 | 3/3 | Complete | 2026-03-16 |
| 6. Admin Authentication & Upload | v2.0 | 3/3 | Complete | 2026-03-17 |
| 7. Admin Image Management | v2.0 | 2/2 | Complete | 2026-03-25 |
| 8. Blog Data Pipeline & Post Pages | v3.0 | 2/2 | Complete | 2026-03-26 |
| 9. Blog Admin Editor | v3.0 | 3/3 | Complete | - |
| 10. Blog Listing & Homepage Integration | v3.0 | 0/? | Not started | - |
| 11. Foundation & Pipeline Validation | v4.0 | 0/? | Not started | - |
| 12. Design System & Asset Generation | v4.0 | 0/? | Not started | - |
| 13. Public Pages | v4.0 | 0/? | Not started | - |
| 14. Cinematic Hero & Animations | v4.0 | 0/? | Not started | - |
| 15. Admin Panel | v4.0 | 0/? | Not started | - |
| 16. Polish, Performance & Launch | v4.0 | 0/? | Not started | - |
