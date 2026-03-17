/* ==========================================================================
 * Toast — Notification System for Admin Panel
 *
 * Slide-in toast notifications with success, error, and info variants.
 * Adapted from the public site's contact.js toast pattern.
 * ========================================================================== */

/**
 * Show a toast notification that slides in from the right.
 * @param {'success'|'error'|'info'} type - Toast variant
 * @param {string} message - Notification message
 */
export function showToast(type, message) {
  // Remove any existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger slide-in on next frame
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), {
      once: true,
    });
    // Fallback removal if reduced motion disables transition
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 400);
  }, 5000);
}
