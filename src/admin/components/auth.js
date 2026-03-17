/* ==========================================================================
 * Auth — Netlify Identity Integration
 *
 * Handles login/logout, JWT retrieval, and session persistence.
 * No signup option — only invited users can access admin.
 * ========================================================================== */

import netlifyIdentity from 'netlify-identity-widget';

/**
 * Initialize Netlify Identity and bind login/logout callbacks.
 * @param {function} onLogin - Called with user object on successful login
 * @param {function} onLogout - Called when user logs out
 */
export function initAuth(onLogin, onLogout) {
  netlifyIdentity.init({
    // No signup — admin is invite-only
    locale: 'en',
  });

  netlifyIdentity.on('login', (user) => {
    netlifyIdentity.close();
    onLogin(user);
  });

  netlifyIdentity.on('logout', () => {
    onLogout();
  });

  // Restore existing session
  const currentUser = netlifyIdentity.currentUser();
  if (currentUser) {
    onLogin(currentUser);
  }
}

/**
 * Get a fresh JWT token for API calls.
 * @returns {Promise<string>} Fresh JWT access token
 */
export async function getToken() {
  return await netlifyIdentity.refresh();
}

/**
 * Log the current user out.
 */
export function logout() {
  netlifyIdentity.logout();
}

/**
 * Open the Netlify Identity login modal.
 */
export function openLogin() {
  netlifyIdentity.open();
}
