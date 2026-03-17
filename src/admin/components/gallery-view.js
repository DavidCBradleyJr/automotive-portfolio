/* ==========================================================================
 * Gallery View — Read-Only Image Grid
 *
 * Fetches gallery images from the list-images Netlify Function
 * and renders a grid of image cards with category badges and metadata.
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';

const categoryLabels = {
  jdm: 'JDM',
  euro: 'Euro',
  supercar: 'Supercar',
  'american-muscle': 'American Muscle',
  track: 'Track/Motorsport',
  uncategorized: 'Uncategorized',
};

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
 * Build a gallery card element using safe DOM methods.
 */
function buildGalleryCard(image) {
  const card = document.createElement('div');
  card.className = 'admin-gallery-card';

  const img = document.createElement('img');
  img.src = image.url;
  img.alt = image.alt || image.caption || 'Gallery image';
  img.loading = 'lazy';
  card.appendChild(img);

  const meta = document.createElement('div');
  meta.className = 'admin-gallery-card__meta';

  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'admin-gallery-card__category';
  categoryBadge.textContent = categoryLabels[image.category] || image.category;
  meta.appendChild(categoryBadge);

  if (image.caption) {
    const caption = document.createElement('p');
    caption.textContent = image.caption;
    meta.appendChild(caption);
  }

  card.appendChild(meta);
  return card;
}

/**
 * Initialize the gallery view component.
 * Fetches images and renders a read-only grid.
 */
export async function initGalleryView() {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl) return;

  // Show loading state
  gridEl.textContent = '';
  const loading = document.createElement('p');
  loading.className = 'admin-loading';
  loading.textContent = 'Loading gallery...';
  gridEl.appendChild(loading);

  try {
    const images = await fetchGalleryImages();

    gridEl.textContent = '';

    if (images.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'admin-placeholder';
      empty.textContent = 'No images yet. Upload some photos to get started.';
      gridEl.appendChild(empty);
      return;
    }

    images.forEach((image) => {
      gridEl.appendChild(buildGalleryCard(image));
    });
  } catch (err) {
    console.error('Gallery load failed:', err);
    gridEl.textContent = '';
    const errorMsg = document.createElement('p');
    errorMsg.className = 'admin-placeholder';
    errorMsg.textContent = 'Failed to load gallery. Please try refreshing.';
    gridEl.appendChild(errorMsg);
    showToast('error', 'Failed to load gallery images.');
  }
}
