/* ==========================================================================
 * Scroll Animations — GSAP-dependent
 *
 * Only hero parallax lives here (requires GSAP ScrollTrigger).
 * Section reveals and gallery stagger are in main.js (no GSAP needed).
 * ========================================================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize GSAP-based scroll animations.
 */
export function initScrollAnimations() {
  initHeroParallax();
}

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
