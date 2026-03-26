/* ==========================================================================
 * Tabs — Hash-based Tab Navigation
 *
 * Manages Upload / Gallery / Settings tab switching with URL hash support
 * for back/forward navigation.
 * ========================================================================== */

const VALID_TABS = ['upload', 'gallery', 'settings', 'blog'];
const DEFAULT_TAB = 'upload';

/**
 * Show the specified tab and hide all others.
 * @param {string} id - Tab identifier (upload, gallery, settings)
 */
function showTab(id) {
  if (!VALID_TABS.includes(id)) {
    id = DEFAULT_TAB;
  }

  // Update tab buttons
  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.classList.toggle('admin-tab--active', btn.dataset.tab === id);
  });

  // Update panel sections
  document.querySelectorAll('.admin-panel-section').forEach((section) => {
    section.classList.toggle(
      'admin-panel-section--active',
      section.id === `panel-${id}`
    );
  });
}

/**
 * Initialize tab navigation with hash-based routing.
 */
export function initTabs() {
  // Click handlers on tab buttons
  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      window.location.hash = tabId;
      showTab(tabId);
    });
  });

  // Listen for back/forward navigation
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    showTab(hash);
  });

  // Restore from URL hash or default to upload
  const initialHash = window.location.hash.slice(1);
  showTab(initialHash || DEFAULT_TAB);
}
