/**
 * Blog Post Page Module
 *
 * Initializes blog post page interactivity:
 * - CSS imports (tokens, base styles, nav, footer, blog post, photoswipe)
 * - Navigation (hamburger menu with focus trapping — no scroll-spy)
 * - PhotoSwipe lightbox for inline images
 */

// -- CSS imports (order matters: tokens first, then base, components, page) --
import '../tokens.css';
import '../style.css';
import '../components/nav.css';
import '../components/footer.css';
import './blog-post.css';
import 'photoswipe/style.css';

// -- PhotoSwipe --
import PhotoSwipeLightbox from 'photoswipe/lightbox';

// ==========================================================================
// Blog Nav — simplified from nav.js (no scroll-spy, no hero observer)
// ==========================================================================

function initBlogNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay = document.querySelector('.nav__overlay');
  const overlayLinks = document.querySelectorAll('.nav__overlay-link');
  const overlayCta = document.querySelector('.nav__overlay-cta');

  // Blog pages always show frosted glass nav (no transparent hero state)
  if (nav) {
    nav.classList.add('nav--scrolled');
  }

  if (!hamburger || !overlay) return;

  let savedScrollY = 0;

  function openOverlay() {
    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('no-scroll');
    hamburger.classList.add('nav__hamburger--open');
    overlay.classList.add('nav__overlay--open');
    hamburger.setAttribute('aria-expanded', 'true');

    // Focus first overlay link after transition
    const firstLink = overlay.querySelector('a');
    if (firstLink) {
      requestAnimationFrame(() => firstLink.focus());
    }
  }

  function closeOverlay() {
    hamburger.classList.remove('nav__hamburger--open');
    overlay.classList.remove('nav__overlay--open');
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    hamburger.setAttribute('aria-expanded', 'false');

    // Return focus to hamburger
    hamburger.focus();
  }

  function isOverlayOpen() {
    return overlay.classList.contains('nav__overlay--open');
  }

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    if (isOverlayOpen()) {
      closeOverlay();
    } else {
      openOverlay();
    }
  });

  // Close overlay on link click
  overlayLinks.forEach((link) => {
    link.addEventListener('click', () => closeOverlay());
  });

  if (overlayCta) {
    overlayCta.addEventListener('click', () => closeOverlay());
  }

  // Close overlay on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOverlayOpen()) {
      closeOverlay();
    }
  });

  // Focus trapping within overlay
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = overlay.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// ==========================================================================
// Blog Lightbox — PhotoSwipe for inline images
// ==========================================================================

function initBlogLightbox() {
  const links = document.querySelectorAll('.blog-post__image-link');
  if (links.length === 0) return;

  const lightbox = new PhotoSwipeLightbox({
    gallery: '.blog-post__content',
    children: 'a.blog-post__image-link',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.95,
    loop: false,
  });

  lightbox.init();
}

// ==========================================================================
// Initialize
// ==========================================================================

initBlogNav();
initBlogLightbox();
