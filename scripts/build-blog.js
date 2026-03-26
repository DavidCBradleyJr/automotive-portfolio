/**
 * Build Blog Pages from Markdown
 *
 * Reads markdown files from content/blog/, parses frontmatter with gray-matter,
 * converts markdown to HTML with marked, and generates complete static HTML pages.
 *
 * Only published posts are built; drafts are skipped.
 * Also generates blog/posts.json with metadata for all published posts.
 *
 * Usage: node scripts/build-blog.js
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';

const CONTENT_DIR = resolve('content/blog');
const OUTPUT_DIR = resolve('blog');

/**
 * Escape HTML special characters in user-provided strings.
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Create a custom marked renderer that wraps images in PhotoSwipe-compatible links.
 */
function createBlogRenderer() {
  const renderer = new Renderer();

  renderer.image = function ({ href, title, text }) {
    const caption = text || '';
    return `<a href="${href}" class="blog-post__image-link" data-pswp-width="1600" data-pswp-height="1067" data-caption="${caption}" target="_blank">` +
      `<img src="${href}" alt="${caption}" class="blog-post__image" loading="lazy"` +
      (title ? ` title="${title}"` : '') +
      ` />` +
      `</a>`;
  };

  return renderer;
}

/**
 * Format a date object into a readable string like "March 15, 2026".
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Build the complete HTML page for a blog post.
 */
function buildPageHTML(frontmatter, bodyHTML) {
  const { title, date, cover, excerpt, tags = [] } = frontmatter;
  const safeTitle = escapeHTML(title);
  const safeExcerpt = escapeHTML(excerpt);
  const formattedDate = formatDate(date);
  const isoDate = new Date(date).toISOString().split('T')[0];

  const tagsHTML = tags
    .map(tag => `<span class="blog-post__tag">${escapeHTML(tag)}</span>`)
    .join('\n              ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle} | David Bradley Photography</title>

    <!-- SEO -->
    <meta name="description" content="${safeExcerpt}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${safeTitle} | David Bradley Photography" />
    <meta property="og:description" content="${safeExcerpt}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="${cover}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle} | David Bradley Photography" />
    <meta name="twitter:description" content="${safeExcerpt}" />
    <meta name="twitter:image" content="${cover}" />

    <!-- Google Fonts: Orbitron (display) + Space Grotesk (body) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <header class="nav" id="nav">
      <div class="nav__container">
        <a href="/" class="nav__logo">
          <span class="nav__monogram">DB</span>
          <span class="nav__wordmark">David Bradley</span>
        </a>

        <ul class="nav__links">
          <li><a href="/#gallery" class="nav__link">Gallery</a></li>
          <li><a href="/#video" class="nav__link">Video</a></li>
          <li><a href="/#about" class="nav__link">About</a></li>
          <li><a href="/#bts" class="nav__link">BTS</a></li>
          <li><a href="/blog" class="nav__link">Blog</a></li>
          <li><a href="/#contact" class="nav__link">Contact</a></li>
        </ul>

        <a href="/#contact" class="nav__cta btn btn--primary">Book a Shoot</a>

        <button
          class="nav__hamburger"
          aria-label="Menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile overlay -->
      <div class="nav__overlay">
        <ul>
          <li><a href="/#gallery" class="nav__overlay-link">Gallery</a></li>
          <li><a href="/#video" class="nav__overlay-link">Video</a></li>
          <li><a href="/#about" class="nav__overlay-link">About</a></li>
          <li><a href="/#bts" class="nav__overlay-link">BTS</a></li>
          <li><a href="/blog" class="nav__overlay-link">Blog</a></li>
          <li><a href="/#contact" class="nav__overlay-link">Contact</a></li>
        </ul>
        <a href="/#contact" class="nav__overlay-cta btn btn--primary">Book a Shoot</a>
      </div>
    </header>

    <main>
      <article class="blog-post">
        <div class="blog-post__hero" style="background-image: url('${cover}')">
          <div class="blog-post__hero-overlay">
            <h1 class="blog-post__title">${safeTitle}</h1>
            <time class="blog-post__date" datetime="${isoDate}">${formattedDate}</time>
            <div class="blog-post__tags">
              ${tagsHTML}
            </div>
          </div>
        </div>

        <div class="blog-post__content">
          ${bodyHTML}
        </div>
      </article>
    </main>

    <footer class="footer" id="footer">
      <div class="footer__container">
        <div class="footer__brand">
          <span class="footer__name">David Bradley</span>
          <span class="footer__tagline">Where Speed Meets Art</span>
          <span class="footer__copyright">&copy; 2026 David Bradley</span>
        </div>
        <nav class="footer__nav">
          <a href="/#gallery" class="footer__link">Gallery</a>
          <a href="/#video" class="footer__link">Video</a>
          <a href="/#about" class="footer__link">About</a>
          <a href="/#bts" class="footer__link">BTS</a>
          <a href="/blog" class="footer__link">Blog</a>
          <a href="/#contact" class="footer__link">Contact</a>
        </nav>
        <div class="footer__actions">
          <div class="footer__social">
            <a href="https://instagram.com/itz.dat.david" target="_blank" rel="noopener" class="footer__social-link">Instagram</a>
            <a href="https://tiktok.com/@itzdatdavid" target="_blank" rel="noopener" class="footer__social-link">TikTok</a>
          </div>
          <a href="/#contact" class="btn btn--primary footer__cta">Book a Shoot</a>
        </div>
      </div>
    </footer>

    <script type="module" src="/src/blog/blog-post.js"></script>
  </body>
</html>`;
}

/**
 * Main build function -- exported for use in other scripts.
 */
export async function buildBlog() {
  // Read all markdown files from content/blog/
  let files;
  try {
    files = (await readdir(CONTENT_DIR)).filter(f => f.endsWith('.md'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No content/blog/ directory found -- skipping blog build.');
      return;
    }
    throw err;
  }

  if (files.length === 0) {
    console.log('No blog posts found in content/blog/ -- skipping.');
    return;
  }

  // Configure marked with custom renderer
  const renderer = createBlogRenderer();
  marked.use({ renderer });

  const publishedPosts = [];

  for (const file of files) {
    const filePath = join(CONTENT_DIR, file);
    const raw = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    // Skip drafts
    if (frontmatter.status !== 'published') {
      console.log(`Skipped draft: ${frontmatter.slug || file}`);
      continue;
    }

    // Convert markdown body to HTML
    const bodyHTML = marked(content);

    // Generate complete page HTML
    const pageHTML = buildPageHTML(frontmatter, bodyHTML);

    // Write to blog/{slug}/index.html
    const slug = frontmatter.slug;
    const outputPath = join(OUTPUT_DIR, slug, 'index.html');
    await mkdir(join(OUTPUT_DIR, slug), { recursive: true });
    await writeFile(outputPath, pageHTML, 'utf-8');
    console.log(`Built blog: ${slug}`);

    // Collect metadata for posts.json
    publishedPosts.push({
      title: frontmatter.title,
      slug: frontmatter.slug,
      date: new Date(frontmatter.date).toISOString().split('T')[0],
      cover: frontmatter.cover,
      excerpt: frontmatter.excerpt,
      tags: frontmatter.tags || [],
    });
  }

  // Sort published posts in reverse-chronological order
  publishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write posts.json
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    join(OUTPUT_DIR, 'posts.json'),
    JSON.stringify(publishedPosts, null, 2),
    'utf-8'
  );
  console.log(`Generated posts.json with ${publishedPosts.length} published post(s).`);
}

// Run if called directly
buildBlog().catch(err => {
  console.error('Blog build failed:', err);
  process.exit(1);
});
