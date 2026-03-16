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

// --- Section reveals (no GSAP, runs immediately) ---
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Reveal animations for non-gallery sections below the fold
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

  // Gallery stagger entrance on first scroll
  const grid = document.getElementById('gallery-grid');
  if (grid && grid.getBoundingClientRect().top >= window.innerHeight * 0.5) {
    const allItems = grid.querySelectorAll('.gallery__item');
    allItems.forEach((item) => { item.style.opacity = '0'; });

    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const items = grid.querySelectorAll('.gallery__item:not(.gallery__item--hidden)');
          items.forEach((item, i) => {
            item.style.opacity = '';
            item.style.animationDelay = `${i * 30}ms`;
            item.classList.add('gallery__item--scroll-entering');
          });

          const totalDuration = 300 + items.length * 30;
          setTimeout(() => {
            items.forEach((item) => {
              item.classList.remove('gallery__item--scroll-entering');
              item.style.animationDelay = '';
            });
            window.__galleryInitialAnimDone = true;
          }, totalDuration);

          gridObserver.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    gridObserver.observe(grid);
  } else {
    window.__galleryInitialAnimDone = true;
  }
} else {
  window.__galleryInitialAnimDone = true;
}

// Load GSAP hero parallax dynamically (failure won't break anything)
import('./components/scroll-animations.js')
  .then((m) => m.initScrollAnimations())
  .catch(() => {});
