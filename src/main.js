import './style.css';
import './components/hero.css';
import './components/nav.css';
import './components/gallery.css';
import './components/video.css';
import './components/about.css';
import './components/bts.css';
import './components/social.css';
import './components/contact.css';
import './components/footer.css';
import './components/scroll-animations.css';
import { initHero } from './components/hero.js';
import { initNav } from './components/nav.js';
import { initGallery } from './components/gallery.js';
import { initVideo } from './components/video.js';
import { initContact } from './components/contact.js';

initHero();
initNav();
initGallery();
initVideo();
initContact();

// --- Scroll animations (no GSAP) ---
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Always mark done immediately if reduced motion is preferred.
// The filter code in gallery.js reads this flag before running filter animations.
window.__galleryInitialAnimDone = prefersReducedMotion;

if (!prefersReducedMotion) {
  // Section reveals for non-gallery sections below the fold
  const sections = document.querySelectorAll('.section:not(.gallery):not(.hero)');
  sections.forEach((s) => {
    if (s.getBoundingClientRect().top >= window.innerHeight) {
      s.classList.add('section--hidden');
    }
  });
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.classList.contains('section--hidden')) {
          entry.target.classList.add('section--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach((s) => {
    if (s.classList.contains('section--hidden')) revealObserver.observe(s);
  });

  // Gallery stagger entrance.
  //
  // Safety-first design: items are NEVER hidden by default.
  // Animation is purely additive — if anything goes wrong, items stay visible.
  //
  // Strategy: observe the grid. When it enters the viewport for the first time,
  // apply a staggered fadeInUp animation per-item using inline styles.
  // Clean up inline styles after animations finish so filter animations work cleanly.
  const grid = document.getElementById('gallery-grid');
  if (grid) {
    let animationTriggered = false;

    function runGalleryEntrance() {
      if (animationTriggered) return;
      animationTriggered = true;

      const items = grid.querySelectorAll('.gallery__item');
      if (items.length === 0) {
        // No items yet — nothing to animate, mark done.
        window.__galleryInitialAnimDone = true;
        return;
      }

      let maxDelay = 0;

      items.forEach((item, i) => {
        // Cap stagger at 10 items (400ms) so the last items don't wait forever.
        const delay = Math.min(i, 10) * 40;
        maxDelay = Math.max(maxDelay, delay);

        item.style.animationName = 'galleryScrollFadeInUp';
        item.style.animationDuration = '0.4s';
        item.style.animationTimingFunction = 'ease';
        item.style.animationFillMode = 'both';
        item.style.animationDelay = `${delay}ms`;
      });

      // Clean up inline animation styles after all animations have finished.
      // 'both' fill-mode keeps items visible during cleanup.
      const totalDuration = maxDelay + 400 + 50; // last delay + duration + buffer
      setTimeout(() => {
        items.forEach((item) => {
          item.style.animationName = '';
          item.style.animationDuration = '';
          item.style.animationTimingFunction = '';
          item.style.animationFillMode = '';
          item.style.animationDelay = '';
        });
        window.__galleryInitialAnimDone = true;
      }, totalDuration);
    }

    // Check if grid is already in or near the viewport on page load.
    // Uses a generous rootMargin so the animation starts just before the grid
    // scrolls into view rather than after it's already half-visible.
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gridObserver.disconnect();
          runGalleryEntrance();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -50px 0px' }
    );
    gridObserver.observe(grid);
  }
}

// Load GSAP hero parallax dynamically (failure won't break anything)
import('./components/scroll-animations.js')
  .then((m) => m.initScrollAnimations())
  .catch(() => {});
