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
import { initGalleryView } from './components/gallery-view.js';
import { initSettings } from './components/settings.js';

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
    // onLogin — show panel first, then init components (errors won't hide panel)
    (user) => {
      loginScreen.hidden = true;
      adminPanel.hidden = false;

      try { initTabs(); } catch (e) { console.error('Tabs init failed:', e); }
      try { initUpload(); } catch (e) { console.error('Upload init failed:', e); }
      try { initGalleryView(); } catch (e) { console.error('Gallery view init failed:', e); }
      try { initSettings(); } catch (e) { console.error('Settings init failed:', e); }
    },
    // onLogout
    () => {
      loginScreen.hidden = false;
      adminPanel.hidden = true;
    }
  );
});
