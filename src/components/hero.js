/**
 * Hero Section — Entrance Animation Trigger
 *
 * Adds .hero--loaded class to trigger CSS entrance animations.
 * Ken Burns and CTA scroll are pure CSS/HTML — no JS needed.
 */

export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Make content visible immediately without animation
    hero.classList.add('hero--loaded');
  } else {
    // Short delay so the browser paints the initial state first,
    // then triggers the CSS transition
    requestAnimationFrame(() => {
      hero.classList.add('hero--loaded');
    });
  }
}
