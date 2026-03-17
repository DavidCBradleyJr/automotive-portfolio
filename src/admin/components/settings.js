/* ==========================================================================
 * Settings — Hero Image Selection
 *
 * Allows selecting a gallery image as the hero background, or uploading
 * a custom hero image. Uses the upload-image function with overwrite
 * to replace the hero at site-config/hero.
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';

const CLOUD_NAME = 'dl0atmtb7';
const HERO_PUBLIC_ID = 'site-config/hero';
const HERO_PREVIEW_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,c_limit,f_auto,q_auto/${HERO_PUBLIC_ID}`;

/**
 * Fetch gallery images from the list-images Netlify Function.
 */
async function fetchGalleryImages() {
  const token = await getToken();
  const response = await fetch('/.netlify/functions/list-images', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load gallery (${response.status})`);
  }

  const data = await response.json();
  return data.images || [];
}

/**
 * Set hero image by uploading a Cloudinary URL or base64 data URI
 * to site-config/hero with overwrite enabled.
 */
async function setHeroImage(imageSource) {
  const token = await getToken();
  const response = await fetch('/.netlify/functions/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      image: imageSource,
      folder: 'site-config',
      public_id: 'hero',
      context: {},
      overwrite: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Hero update failed (${response.status})`);
  }

  return response.json();
}

/**
 * Convert a File to a base64 data URI.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Build a clickable gallery card for hero selection using safe DOM methods.
 */
function buildHeroCard(image, onClick) {
  const card = document.createElement('div');
  card.className = 'admin-gallery-card';

  const img = document.createElement('img');
  img.src = image.url;
  img.alt = image.alt || image.caption || 'Gallery image';
  img.loading = 'lazy';
  card.appendChild(img);

  card.addEventListener('click', () => onClick(image));
  return card;
}

/**
 * Load and display the current hero image preview.
 */
function loadCurrentHero() {
  const heroImg = document.getElementById('current-hero');
  if (!heroImg) return;

  // Add cache-buster to force fresh load
  heroImg.src = `${HERO_PREVIEW_URL}?t=${Date.now()}`;
  heroImg.onerror = () => {
    heroImg.alt = 'No hero image set yet';
    heroImg.style.display = 'none';
  };
  heroImg.onload = () => {
    heroImg.style.display = '';
  };
}

/**
 * Initialize the settings component.
 * Loads current hero, populates gallery grid for selection, and handles custom upload.
 */
export async function initSettings() {
  const heroGrid = document.getElementById('hero-gallery-grid');
  const heroFileInput = document.getElementById('hero-file-input');

  if (!heroGrid) return;

  // Show current hero
  loadCurrentHero();

  // Load gallery images for hero selection
  heroGrid.textContent = '';
  const loading = document.createElement('p');
  loading.className = 'admin-loading';
  loading.textContent = 'Loading images...';
  heroGrid.appendChild(loading);

  try {
    const images = await fetchGalleryImages();

    heroGrid.textContent = '';

    if (images.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'admin-placeholder';
      empty.textContent = 'No gallery images available. Upload some photos first.';
      heroGrid.appendChild(empty);
    } else {
      images.forEach((image) => {
        heroGrid.appendChild(
          buildHeroCard(image, async (selectedImage) => {
            try {
              showToast('info', 'Setting hero image...');
              await setHeroImage(selectedImage.full_url);
              showToast('success', 'Hero image updated! Will appear after next rebuild.');

              // Trigger rebuild
              const token = await getToken();
              await fetch('/.netlify/functions/trigger-rebuild', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              loadCurrentHero();
            } catch (err) {
              console.error('Hero update failed:', err);
              showToast('error', 'Failed to update hero image.');
            }
          })
        );
      });
    }
  } catch (err) {
    console.error('Settings load failed:', err);
    heroGrid.textContent = '';
    const errorMsg = document.createElement('p');
    errorMsg.className = 'admin-placeholder';
    errorMsg.textContent = 'Failed to load gallery images.';
    heroGrid.appendChild(errorMsg);
  }

  // Custom hero file upload
  if (heroFileInput) {
    heroFileInput.addEventListener('change', async () => {
      const file = heroFileInput.files[0];
      if (!file) return;

      try {
        showToast('info', 'Uploading custom hero image...');
        const base64 = await fileToBase64(file);
        await setHeroImage(base64);
        showToast('success', 'Hero image updated! Will appear after next rebuild.');

        // Trigger rebuild
        const token = await getToken();
        await fetch('/.netlify/functions/trigger-rebuild', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        loadCurrentHero();
      } catch (err) {
        console.error('Hero upload failed:', err);
        showToast('error', 'Failed to upload hero image.');
      }

      heroFileInput.value = '';
    });
  }
}
