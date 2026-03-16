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

**Key decisions:**
- Vite 6.x, vanilla HTML/CSS/JS (no framework)
- Dark theme (#0F0F0F) with purple accent (#7C3AED)
- CSS columns for masonry, IntersectionObserver for lazy loading
- GSAP only for hero parallax, IO + CSS for all other animations
- Images committed to git repo as WebP
