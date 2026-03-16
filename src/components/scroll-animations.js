/* ==========================================================================
 * Scroll Animations
 *
 * Three animation systems:
 * 1. Section reveals — IntersectionObserver + CSS transitions
 * 2. Hero parallax — GSAP ScrollTrigger (scrub)
 * 3. Gallery scroll stagger — IntersectionObserver + CSS animation
 *
 * All animations respect prefers-reduced-motion.
 * ========================================================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/**
 * Initialize all scroll animations. Call once after DOM is ready.
 */
export function initScrollAnimations() {
  initSectionReveals();
  initHeroParallax();
  initGalleryScrollStagger();
}

/* --------------------------------------------------------------------------
 * 1. Section Reveals
 *
 * Adds .section--hidden to all .section elements, then reveals them
 * with .section--visible when 15% visible via IntersectionObserver.
 * One-time: unobserves after reveal.
 * -------------------------------------------------------------------------- */

function initSectionReveals() {
  if (prefersReducedMotion) return;

  const sections = document.querySelectorAll('.section');
  sections.forEach((s) => s.classList.add('section--hidden'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((s) => revealObserver.observe(s));
}

/* --------------------------------------------------------------------------
 * 2. Hero Parallax
 *
 * GSAP ScrollTrigger scrub on .hero__image creating depth as user scrolls.
 * Layers on top of existing Ken Burns CSS animation — GSAP handles
 * transform concatenation automatically.
 * -------------------------------------------------------------------------- */

function initHeroParallax() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to('.hero__image', {
      yPercent: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* --------------------------------------------------------------------------
 * 3. Gallery Scroll Stagger Entrance
 *
 * One-time staggered entrance when gallery grid first scrolls into view.
 * Uses .gallery__item--scroll-entering CSS class with staggered
 * animation-delay per item.
 *
 * Sets window.__galleryInitialAnimDone flag after completion to prevent
 * collision with filter stagger animations in gallery.js.
 * -------------------------------------------------------------------------- */

function initGalleryScrollStagger() {
  if (prefersReducedMotion) {
    window.__galleryInitialAnimDone = true;
    return;
  }

  const grid = document.getElementById('gallery-grid');
  if (!grid) {
    window.__galleryInitialAnimDone = true;
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const items = grid.querySelectorAll(
          '.gallery__item:not(.gallery__item--hidden)'
        );

        items.forEach((item, i) => {
          item.style.animationDelay = `${i * 30}ms`;
          item.classList.add('gallery__item--scroll-entering');
        });

        // Cleanup after animation completes
        const totalDuration = 300 + items.length * 30;
        setTimeout(() => {
          items.forEach((item) => {
            item.classList.remove('gallery__item--scroll-entering');
            item.style.animationDelay = '';
          });
          window.__galleryInitialAnimDone = true;
        }, totalDuration);

        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(grid);
}
