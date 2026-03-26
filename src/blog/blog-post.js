/**
 * Blog Post Page Module
 *
 * Initializes blog post page interactivity:
 * - Navigation (hamburger menu)
 * - PhotoSwipe lightbox for inline images
 *
 * Full styling and enhanced features will be added in Plan 08-02.
 */

// -- Navigation hamburger toggle --
const hamburger = document.querySelector('.nav__hamburger');
const overlay = document.querySelector('.nav__overlay');

if (hamburger && overlay) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    overlay.classList.toggle('nav__overlay--active', !isOpen);
    document.body.classList.toggle('no-scroll', !isOpen);
  });

  // Close overlay on link click
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('nav__overlay--active');
      document.body.classList.remove('no-scroll');
    });
  });
}

// -- PhotoSwipe lightbox for blog images --
async function initLightbox() {
  const links = document.querySelectorAll('.blog-post__image-link');
  if (links.length === 0) return;

  const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox');
  await import('photoswipe/style.css');

  const lightbox = new PhotoSwipeLightbox({
    gallery: '.blog-post__content',
    children: '.blog-post__image-link',
    pswpModule: () => import('photoswipe'),
  });

  lightbox.init();
}

initLightbox();
