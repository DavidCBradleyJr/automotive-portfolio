# Milestones

## v1.0 — Portfolio Launch (Complete)

**Completed:** 2026-03-16
**Phases:** 1–4 (12 plans, 56 requirements)
**Deployed:** https://legendary-choux-e15998.netlify.app/

**What shipped:**
- Cinematic hero with Ken Burns animation + GSAP parallax
- Category-filtered masonry gallery (50 images) with PhotoSwipe lightbox
- Sticky frosted-glass nav with scroll-spy + mobile hamburger
- Video reel (lite-youtube-embed), about section, BTS grid, social wall
- Contact form (Formspree, validation, toast notifications)
- Footer, scroll animations, SEO meta tags
- Netlify deployment with git-based CI/CD

## v2.0 — Admin Panel & Image Pipeline (Complete)

**Completed:** 2026-03-25
**Phases:** 5–7 (8 plans, 22 requirements)

**What shipped:**
- Cloudinary image storage replacing git-committed images
- Build-time gallery data generation from Cloudinary API
- Admin panel at /admin with Netlify Identity auth (invite-only)
- Drag-and-drop photo upload with direct Cloudinary upload (no size limit)
- Edit modal for category/caption/alt text with category change support
- Soft delete with trash/restore
- Drag-and-drop reorder per category via SortableJS
- Hero image selection from gallery or custom upload
- Auto site rebuild after changes

## v3.0 — Blog (In Progress)

**Started:** 2026-03-25
**Phases:** 8–10 (20 requirements)

**Target:**
- Blog data pipeline: posts stored as JSON/markdown in git, generated to static HTML at build time
- Individual post pages at /blog/post-slug with rendered markdown, cover images, embedded photos
- Markdown editor in admin panel with formatting toolbar, live preview, and photo insertion
- Draft/publish workflow with auto-rebuild on publish
- Blog listing page at /blog with post cards
- Featured/recent post preview section on the main homepage
