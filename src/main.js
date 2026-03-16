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

  // Gallery: mark grid as pending, CSS hides items.
  // When grid scrolls into view, remove pending → CSS animation plays.
  const grid = document.getElementById('gallery-grid');
  if (grid) {
    grid.classList.add('gallery__grid--pending');

    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          grid.classList.remove('gallery__grid--pending');
          grid.classList.add('gallery__grid--animate');
          gridObserver.disconnect();

          // Mark done after animations finish
          setTimeout(() => {
            grid.classList.remove('gallery__grid--animate');
            window.__galleryInitialAnimDone = true;
          }, 2000);
        }
      },
      { threshold: 0.05 }
    );
    gridObserver.observe(grid);
  }
}

// Load GSAP hero parallax dynamically (failure won't break anything)
import('./components/scroll-animations.js')
  .then((m) => m.initScrollAnimations())
  .catch(() => {});
