/* ==========================================================================
 * Admin Entry Point
 *
 * Initializes authentication, tab navigation, and UI bindings.
 * This module is the sole entry point for the admin bundle.
 * ========================================================================== */

import './admin.css';
import { initAuth, openLogin, logout } from './components/auth.js';
import { initTabs } from './components/tabs.js';
import { initUpload } from './components/upload.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const adminPanel = document.getElementById('admin-panel');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // Bind button actions
  loginBtn.addEventListener('click', openLogin);
  logoutBtn.addEventListener('click', logout);

  // Initialize auth with login/logout handlers
  initAuth(
    // onLogin
    (user) => {
      loginScreen.hidden = true;
      adminPanel.hidden = false;
      initTabs();
      initUpload();
    },
    // onLogout
    () => {
      loginScreen.hidden = false;
      adminPanel.hidden = true;
    }
  );
});
