/* ==========================================================================
 * Navigation Component — JavaScript
 *
 * Frosted glass transition, scroll-spy, hamburger toggle,
 * keyboard accessibility, and focus trapping.
 * ========================================================================== */

/**
 * Initialize navigation behaviors.
 * Call once after DOM is ready (module script at end of body).
 */
export function initNav() {
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay = document.querySelector('.nav__overlay');
  const navLinks = document.querySelectorAll('.nav__link');
  const overlayLinks = document.querySelectorAll('.nav__overlay-link');
  const overlayCta = document.querySelector('.nav__overlay-cta');

  if (!nav || !hero) return;

  // --------------------------------------------------------------------------
  // Frosted glass transition
  // --------------------------------------------------------------------------

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        nav.classList.remove('nav--scrolled');
      } else {
        nav.classList.add('nav--scrolled');
      }
    },
    { threshold: 0.1 }
  );

  heroObserver.observe(hero);

  // --------------------------------------------------------------------------
  // Scroll-spy — highlight active section link
  // --------------------------------------------------------------------------

  const sections = document.querySelectorAll('section[id]');

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const href = '#' + id;

          // Update desktop nav links
          navLinks.forEach((link) => {
            link.classList.toggle('nav__link--active', link.getAttribute('href') === href);
          });

          // Update overlay links
          overlayLinks.forEach((link) => {
            link.classList.toggle('nav__overlay-link--active', link.getAttribute('href') === href);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -80% 0px' }
  );

  sections.forEach((section) => spyObserver.observe(section));

  // --------------------------------------------------------------------------
  // Hamburger toggle
  // --------------------------------------------------------------------------

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
    window.scrollTo(0, savedScrollY);
    hamburger.setAttribute('aria-expanded', 'false');

    // Return focus to hamburger
    hamburger.focus();
  }

  function isOverlayOpen() {
    return overlay.classList.contains('nav__overlay--open');
  }

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

  // --------------------------------------------------------------------------
  // Focus trapping within overlay
  // --------------------------------------------------------------------------

  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = overlay.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
