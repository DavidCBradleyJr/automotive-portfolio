# Phase 8: Blog Data Pipeline & Post Pages - Research

**Researched:** 2026-03-25
**Domain:** Static blog generation with Markdown, Vite multi-page builds, PhotoSwipe integration
**Confidence:** HIGH

## Summary

This phase establishes the blog foundation: a build-time pipeline that reads markdown files with YAML frontmatter from git, parses them into styled static HTML pages, and integrates them into the existing Vite multi-page build. The approach mirrors the existing `prebuild` pattern used for gallery data -- a Node.js script runs before `vite build`, generating complete HTML files that Vite then processes as additional entry points.

The key technical challenge is that Vite's `rollupOptions.input` currently lists two fixed entry points (`index.html` and `admin.html`). Blog posts are dynamic -- their count and slugs are determined at build time. The solution is to have the prebuild script generate HTML files into a `blog/` directory at the project root, then update `vite.config.js` to glob-discover all blog HTML files and add them as additional Rollup inputs. This is a well-established Vite pattern for multi-page apps.

The markdown pipeline uses `gray-matter` for frontmatter parsing and `marked` for HTML conversion -- both are the industry standard for this exact use case, battle-tested in Gatsby, Next.js, Eleventy, and VitePress. The generated HTML pages reuse the site's existing design tokens, typography, nav structure, and footer, ensuring visual consistency.

**Primary recommendation:** Use a prebuild script that generates complete blog HTML files, with `gray-matter` + `marked` for markdown processing, and glob-based Vite input discovery for dynamic page inclusion.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Photos displayed **inline with text column** (~700px reading width) -- not full-bleed
- Clicking a photo in a blog post opens it in **PhotoSwipe lightbox** (reuses existing setup)
- Dark theme matching main site -- same Orbitron headings, Space Grotesk body, #0F0F0F background, purple accents
- Responsive from 320px to 1440px+ (per BLOG-07)
- Nav and footer shared from main site (per BLOG-05)
- Free-form tags supported on each post
- Post metadata: title, slug, date, cover image (Cloudinary URL), excerpt, tags, draft/published status
- Photos in posts use Cloudinary CDN URLs (per BDATA-04)
- Posts committed to git -- build script generates static HTML pages
- Fully static output -- no runtime API calls for visitors (per BDATA-03)
- Sample post(s) included for testing the pipeline end-to-end

### Claude's Discretion
- Exact post data format (markdown frontmatter vs JSON) -- **Recommendation: markdown with YAML frontmatter**
- Post header design (full-bleed cover vs editorial) -- **Recommendation: full-bleed cover with title overlay**
- Markdown parser library choice -- **Recommendation: marked + gray-matter**
- How multi-page blog generation integrates with Vite build -- **Recommendation: prebuild script + glob input discovery**
- Reading column width and typography details
- Code syntax highlighting (if needed)
- How PhotoSwipe is initialized on blog post pages

### Deferred Ideas (OUT OF SCOPE)
- Blog listing page at /blog -- Phase 10
- Featured post on homepage -- Phase 10
- Blog admin editor -- Phase 9
- RSS feed -- future enhancement
- Post comments -- future enhancement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BDATA-01 | Blog posts stored as JSON/markdown files in git | Markdown with YAML frontmatter in `content/blog/` directory; gray-matter parses frontmatter |
| BDATA-02 | Build script generates static blog pages from post data at build time | Prebuild script (`scripts/build-blog.js`) reads markdown, generates HTML into `blog/` directory |
| BDATA-03 | Blog pages are fully static HTML -- no runtime API calls for visitors | All content baked into HTML at build time; JS only for PhotoSwipe lightbox + nav |
| BDATA-04 | Photos referenced in posts use Cloudinary CDN URLs | Markdown image syntax with Cloudinary URLs; build script wraps in PhotoSwipe-compatible markup |
| BLOG-02 | Individual post pages at `/blog/post-slug` with full rendered markdown content | Generated as `blog/post-slug/index.html` for clean URLs; Vite processes as entry point |
| BLOG-03 | Each post displays: title, date, cover image, rendered markdown body with embedded photos | HTML template includes structured header (cover, title, date, tags) + rendered markdown body |
| BLOG-05 | Blog pages share dark theme, typography, and nav/footer from main site | Same tokens.css, Google Fonts, nav HTML structure, footer HTML; blog-specific CSS for post content |
| BLOG-07 | Responsive layout -- post content readable from 320px to 1440px+ | ~700px max-width reading column, responsive images, mobile-first CSS |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.0.3 | Parse YAML frontmatter from markdown files | Industry standard; used by Gatsby, VitePress, Eleventy, TinaCMS |
| marked | 17.0.5 | Convert markdown to HTML | Fast, lightweight, extensible; no unnecessary dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| photoswipe | 5.4.4 (already installed) | Lightbox for blog post images | Reuse existing gallery setup for blog image clicks |
| photoswipe-dynamic-caption-plugin | 1.2.7 (already installed) | Captions in lightbox | Photo captions in blog posts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| marked | markdown-it (14.1.1) | markdown-it has plugin ecosystem but heavier; marked is simpler and sufficient for blog posts |
| gray-matter | front-matter (4.0.2) | front-matter is lighter but gray-matter handles more edge cases and is far more widely used |
| Custom prebuild | VitePress/Eleventy | Full SSG frameworks are massive overkill for adding blog to an existing vanilla site |

**Installation:**
```bash
npm install --save-dev gray-matter marked
```

**Version verification:** gray-matter 4.0.3 and marked 17.0.5 confirmed via npm registry on 2026-03-25.

## Architecture Patterns

### Recommended Project Structure
```
content/
  blog/
    cars-and-coffee-march-2026.md    # Blog post source files
    first-track-day.md
scripts/
  build-blog.js                       # Prebuild: markdown -> HTML
  build-gallery-data.js               # Existing gallery prebuild
blog/                                  # Generated at build time (gitignored)
  cars-and-coffee-march-2026/
    index.html
  first-track-day/
    index.html
src/
  blog/
    blog-post.css                     # Blog post page styles
    blog-post.js                      # PhotoSwipe init + nav for blog pages
```

### Pattern 1: Prebuild Script Generates Complete HTML
**What:** A Node.js script runs before `vite build`, reads all markdown files from `content/blog/`, and writes complete HTML files into `blog/{slug}/index.html`. Each generated HTML file includes the full page structure: `<head>`, nav, post content, footer, and a `<script type="module">` tag pointing to the blog JS entry point.

**When to use:** Always -- this is the core of the pipeline.

**Why this approach:** The existing project already uses this pattern for gallery data (`scripts/build-gallery-data.js` runs as `prebuild`). Blog generation is the same concept at a larger scale -- instead of generating a JS data file, it generates HTML pages.

**Example:**
```javascript
// scripts/build-blog.js
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = 'content/blog';
const OUTPUT_DIR = 'blog';

async function buildBlog() {
  const files = await readdir(CONTENT_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  for (const file of mdFiles) {
    const raw = await readFile(join(CONTENT_DIR, file), 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    // Skip drafts
    if (frontmatter.draft) continue;

    const slug = frontmatter.slug || parse(file).name;
    const html = marked(content);
    const page = buildPageHTML(frontmatter, html);

    const outDir = join(OUTPUT_DIR, slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), page, 'utf-8');
  }
}
```

### Pattern 2: Dynamic Vite Input Discovery via Glob
**What:** `vite.config.js` uses `glob.sync()` (or `fs.readdirSync`) to discover all HTML files in `blog/` and adds them to `rollupOptions.input` alongside the existing `index.html` and `admin.html`.

**When to use:** Always -- enables Vite to process generated blog pages through its asset pipeline.

**Example:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';

function getBlogEntries() {
  const blogDir = resolve(__dirname, 'blog');
  if (!existsSync(blogDir)) return {};

  const entries = {};
  const slugs = readdirSync(blogDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const slug of slugs) {
    const htmlPath = resolve(blogDir, slug, 'index.html');
    if (existsSync(htmlPath)) {
      entries[`blog/${slug}`] = htmlPath;
    }
  }
  return entries;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        ...getBlogEntries(),
      },
    },
  },
});
```

### Pattern 3: Markdown Frontmatter Schema
**What:** Each blog post is a markdown file with YAML frontmatter defining metadata.

**Example:**
```markdown
---
title: "Cars & Coffee March 2026"
slug: cars-and-coffee-march-2026
date: 2026-03-15
cover: https://res.cloudinary.com/dl0atmtb7/image/upload/v1234/blog/cover-cars-coffee.jpg
excerpt: "What we captured at last weekend's Cars & Coffee meetup in downtown."
tags:
  - Cars & Coffee
  - JDM
  - Events
status: published
---

The morning started early at 6 AM with fog still hanging over the lot...

![A lineup of JDM legends](https://res.cloudinary.com/dl0atmtb7/image/upload/v1234/blog/jdm-lineup.jpg)

The star of the show was a pristine R34 Skyline GT-R...
```

### Pattern 4: PhotoSwipe Integration on Blog Pages
**What:** The blog JS entry point initializes PhotoSwipe on all images within the post body. The build script wraps markdown images in `<a>` tags with the data attributes PhotoSwipe expects.

**When to use:** For every blog post page.

**Example (custom marked renderer):**
```javascript
const renderer = new marked.Renderer();
renderer.image = function({ href, title, text }) {
  // Wrap images in PhotoSwipe-compatible links
  return `
    <a href="${href}"
       data-pswp-width="1600"
       data-pswp-height="1067"
       data-caption="${text || ''}"
       class="blog-post__image-link">
      <img src="${href}" alt="${text || ''}" loading="lazy"
           class="blog-post__image" />
    </a>`;
};
```

Note: Image dimensions can be estimated or set to reasonable defaults. Cloudinary URLs support `w_` and `h_` transforms, so the build script can use standard dimensions. PhotoSwipe will read actual dimensions at runtime.

### Pattern 5: Shared Nav/Footer via HTML Template
**What:** The build script uses a template string containing the same nav and footer HTML from `index.html`. Blog pages link to `src/blog/blog-post.js` which imports shared CSS (tokens, nav, footer) plus blog-specific styles, and initializes nav + PhotoSwipe.

**Key detail:** Nav links on blog pages should point to absolute paths (`/` for home, `/#gallery` for gallery) since they are on different URL paths.

### Anti-Patterns to Avoid
- **Generating HTML with a Vite plugin at build time:** Vite plugins run during the build, but `rollupOptions.input` is read before plugins execute. Generate HTML in prebuild, not during build.
- **Importing markdown files via Vite:** This works for data but not for generating separate HTML pages. The prebuild approach is cleaner.
- **Duplicating nav/footer HTML by hand:** Use a shared template function in the build script to keep nav/footer in sync with index.html.
- **Loading blog post content via JS fetch:** Defeats the purpose of static generation. All content must be in the HTML.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter parsing | Custom YAML delimiter regex | gray-matter | Handles edge cases (multi-line values, special chars, nested objects) |
| Markdown to HTML | Custom regex-based converter | marked | Handles full CommonMark spec, extensible renderer, battle-tested |
| Image lightbox | Custom modal overlay | PhotoSwipe (already installed) | Keyboard nav, swipe, pinch-zoom, accessibility |
| Clean URL routing | Custom server middleware | Directory-based index.html files + Netlify redirects | `blog/slug/index.html` gives clean `/blog/slug` URLs automatically |

**Key insight:** The entire blog pipeline is glue code between proven libraries. The build script is ~150 lines that read files, parse them, apply a template, and write output. No custom markdown parser, no custom lightbox, no custom router.

## Common Pitfalls

### Pitfall 1: Blog Directory Not in Git, Breaking Netlify Builds
**What goes wrong:** The `blog/` output directory is gitignored (correctly) but the prebuild script must run on Netlify before Vite build.
**Why it happens:** Forgetting to update the `prebuild` npm script to also run blog generation.
**How to avoid:** Update `package.json` scripts: `"prebuild": "node scripts/build-gallery-data.js && node scripts/build-blog.js"`
**Warning signs:** Local builds work but Netlify deploys have no blog pages.

### Pitfall 2: Nav Links Broken on Blog Pages
**What goes wrong:** Nav links like `#gallery` don't work on `/blog/post-slug` because there's no `#gallery` section on that page.
**Why it happens:** Nav HTML is copied from index.html which uses anchor links.
**How to avoid:** Blog page nav links must use absolute paths: `/#gallery`, `/#video`, `/#about`, `/#bts`, `/#contact`. The logo link should go to `/`.
**Warning signs:** Clicking nav links on a blog post page does nothing or shows 404.

### Pitfall 3: CSS/JS Asset Paths Wrong in Generated HTML
**What goes wrong:** Blog pages at `/blog/slug/index.html` can't find CSS/JS if paths are relative.
**Why it happens:** The HTML references `src/blog/blog-post.js` but relative path resolution differs at `/blog/slug/`.
**How to avoid:** Use absolute paths in generated HTML: `<script type="module" src="/src/blog/blog-post.js">`. Vite handles rewriting these to hashed asset paths during build.
**Warning signs:** Blog pages load with no styles or broken JS in production.

### Pitfall 4: Vite Dev Server Doesn't Serve Generated Blog Pages
**What goes wrong:** During `npm run dev`, blog pages don't exist because prebuild hasn't run.
**Why it happens:** `prebuild` only runs before `build`, not before `dev`.
**How to avoid:** Either (a) run `node scripts/build-blog.js` manually before dev, or (b) add a `predev` script, or (c) document that blog pages require a build step. Option (a) is simplest for now.
**Warning signs:** 404 when navigating to `/blog/slug` during development.

### Pitfall 5: PhotoSwipe Needs Image Dimensions
**What goes wrong:** PhotoSwipe opens with wrong sizing or shows loading spinner.
**Why it happens:** PhotoSwipe needs `data-pswp-width` and `data-pswp-height` to size the lightbox before the full image loads.
**How to avoid:** Use reasonable default dimensions (e.g., 1600x1067 for landscape automotive photos) or fetch dimensions from Cloudinary URL metadata at build time. PhotoSwipe also supports `data-pswp-src` for loading a higher-res version.
**Warning signs:** Lightbox appears tiny or shows a jump when opening.

### Pitfall 6: Markdown Content Not Properly Sanitized
**What goes wrong:** Raw HTML in markdown could break page layout.
**Why it happens:** `marked` allows raw HTML in markdown by default.
**How to avoid:** Since posts are authored by the site owner (David), this is low risk. However, the build script should not strip HTML -- David may intentionally include custom HTML in posts.
**Warning signs:** Broken layout in a specific post.

## Code Examples

### Complete Frontmatter Schema
```yaml
---
title: "Post Title Here"
slug: post-title-here           # URL slug (auto-derived from filename if omitted)
date: 2026-03-15                # Publication date (ISO format)
cover: https://res.cloudinary.com/dl0atmtb7/image/upload/v.../blog/cover.jpg
excerpt: "A brief description for listing pages and SEO."
tags:
  - JDM
  - Cars & Coffee
status: published               # "published" or "draft"
---
```

### Blog Post HTML Template (generated by build script)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | David Bradley Photography</title>
  <meta name="description" content="${excerpt}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${excerpt}" />
  <meta property="og:image" content="${cover}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&display=swap"
    rel="stylesheet"
  />
</head>
<body>
  <!-- Nav (same structure as index.html, absolute links) -->
  <header class="nav" id="nav">...</header>

  <article class="blog-post">
    <div class="blog-post__hero" style="background-image: url('${cover}')">
      <div class="blog-post__hero-overlay">
        <h1 class="blog-post__title">${title}</h1>
        <time class="blog-post__date">${formattedDate}</time>
        <div class="blog-post__tags">${tagsHTML}</div>
      </div>
    </div>
    <div class="blog-post__content">
      ${renderedMarkdown}
    </div>
  </article>

  <!-- Footer (same structure as index.html, absolute links) -->
  <footer class="footer" id="footer">...</footer>

  <script type="module" src="/src/blog/blog-post.js"></script>
</body>
</html>
```

### Blog Post JS Entry Point
```javascript
// src/blog/blog-post.js
import '../tokens.css';
import '../style.css';
import '../components/nav.css';
import '../components/footer.css';
import './blog-post.css';

import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

// Initialize nav (simplified for blog -- no scroll-spy, just hamburger)
function initBlogNav() {
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay = document.querySelector('.nav__overlay');
  if (!hamburger || !overlay) return;
  // ... hamburger toggle logic (reuse from nav.js or extract shared function)
}

// Initialize PhotoSwipe for blog post images
function initBlogLightbox() {
  const lightbox = new PhotoSwipeLightbox({
    gallery: '.blog-post__content',
    children: 'a.blog-post__image-link',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.95,
    loop: false,
  });
  lightbox.init();
}

initBlogNav();
initBlogLightbox();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full SSG frameworks (Jekyll, Hugo) | Lightweight prebuild scripts for vanilla sites | 2023+ | No framework lock-in; build script is ~150 lines |
| gray-matter 3.x | gray-matter 4.0.3 | 2018 | Stable; no breaking changes expected |
| marked < 5.0 (callback-based) | marked 17.x (promise/sync, new Renderer API) | 2023 | New `marked.use()` API for extensions; `Renderer` method signatures changed |
| Vite multi-page with fixed inputs | Glob-based dynamic input discovery | Vite 3.1.3+ (2022) | Enables dynamic page counts without config changes |

**Important marked API note:** In marked 17.x, the `Renderer` method for images receives an object `{ href, title, text }` instead of positional arguments. Use the object destructuring form.

## Open Questions

1. **PhotoSwipe image dimensions at build time**
   - What we know: PhotoSwipe needs width/height for optimal display. Cloudinary images have known dimensions.
   - What's unclear: Whether to hardcode reasonable defaults (1600x1067) or fetch from Cloudinary API at build time.
   - Recommendation: Use reasonable defaults (1600x1067 for landscape, 1067x1600 for portrait). This avoids API calls at build time and works well enough. PhotoSwipe adjusts to actual image size once loaded.

2. **Blog page during Vite dev server**
   - What we know: Blog HTML is generated by prebuild script, which doesn't auto-run during `npm run dev`.
   - What's unclear: Best DX for developing blog styles.
   - Recommendation: Add a `predev` script or document running `node scripts/build-blog.js` before dev. This is a minor DX friction that Phase 9 (admin editor) may improve.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build scripts | Yes | (runtime) | -- |
| Vite | Build pipeline | Yes | 6.x | -- |
| gray-matter | Frontmatter parsing | Needs install | 4.0.3 | -- |
| marked | Markdown to HTML | Needs install | 17.0.5 | -- |
| Cloudinary | Blog cover images | Yes (configured) | -- | -- |
| PhotoSwipe | Image lightbox | Yes (installed) | 5.4.4 | -- |

**Missing dependencies with no fallback:** None -- gray-matter and marked are simple npm installs.

**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | `node scripts/build-blog.js && ls blog/` |
| Full suite command | `npm run prebuild && npx vite build` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BDATA-01 | Markdown files with frontmatter in git | smoke | `ls content/blog/*.md` | No -- Wave 0 |
| BDATA-02 | Build script generates HTML from markdown | smoke | `node scripts/build-blog.js && ls blog/*/index.html` | No -- Wave 0 |
| BDATA-03 | No runtime API calls in output HTML | manual | Inspect generated HTML for fetch/XHR calls | manual-only |
| BDATA-04 | Cloudinary URLs in post images | smoke | `grep -r "cloudinary" blog/*/index.html` | No -- Wave 0 |
| BLOG-02 | Individual pages at /blog/post-slug | smoke | `test -f blog/cars-and-coffee-march-2026/index.html` | No -- Wave 0 |
| BLOG-03 | Title, date, cover, body rendered | smoke | `grep -l "<h1" blog/*/index.html` | No -- Wave 0 |
| BLOG-05 | Dark theme, shared nav/footer | manual | Visual inspection of built pages | manual-only |
| BLOG-07 | Responsive 320px to 1440px+ | manual | Browser responsive testing | manual-only |

### Sampling Rate
- **Per task commit:** `node scripts/build-blog.js && ls blog/`
- **Per wave merge:** `npm run prebuild && npx vite build && ls dist/blog/`
- **Phase gate:** Full build green, sample blog post renders correctly in browser

### Wave 0 Gaps
- [ ] `content/blog/` directory with at least one sample post
- [ ] `scripts/build-blog.js` -- the build script itself (core deliverable)
- [ ] Verify `npm run build` succeeds end-to-end with blog pages

*(No test framework install needed -- validation is build-output verification for this phase)*

## Sources

### Primary (HIGH confidence)
- Vite Build Options docs: https://vite.dev/config/build-options -- rollupOptions.input for multi-page apps
- Vite Building for Production guide: https://vite.dev/guide/build -- multi-page app configuration
- npm registry -- verified gray-matter 4.0.3, marked 17.0.5 current versions

### Secondary (MEDIUM confidence)
- GitHub vitejs/vite#777 and #5611 -- community patterns for dynamic multi-page HTML generation
- gray-matter GitHub: https://github.com/jonschlinkert/gray-matter -- usage by VitePress, Gatsby, Eleventy
- marked npm: https://www.npmjs.com/package/marked -- API documentation

### Tertiary (LOW confidence)
- None -- all findings verified against official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- gray-matter + marked is the most common pairing for this use case, versions verified
- Architecture: HIGH -- prebuild + glob input is an established Vite pattern, and the project already uses prebuild
- Pitfalls: HIGH -- based on direct analysis of project code (nav links, asset paths, Netlify config)

**Research date:** 2026-03-25
**Valid until:** 2026-05-25 (stable domain, slow-moving libraries)
