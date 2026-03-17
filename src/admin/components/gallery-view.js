/* ==========================================================================
 * Gallery View — Image Management Grid
 *
 * Fetches gallery images from the list-images Netlify Function and renders
 * a grid with edit, delete, trash/restore, category filter, and
 * drag-and-drop reorder capabilities.
 *
 * Uses ONLY safe DOM methods (createElement, textContent, appendChild).
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';
import { openEditModal } from './edit-modal.js';
import Sortable from 'sortablejs';

const categoryLabels = {
  jdm: 'JDM',
  euro: 'Euro',
  supercar: 'Supercar',
  'american-muscle': 'American Muscle',
  track: 'Track/Motorsport',
  uncategorized: 'Uncategorized',
};

// Module-level state
let allImages = [];
let currentFilter = 'all';
let showingTrash = false;
let sortableInstance = null;

/**
 * Fetch gallery images from the list-images Netlify Function.
 * @param {boolean} showHidden - If true, fetch only hidden (trashed) images
 */
async function fetchGalleryImages(showHidden) {
  const token = await getToken();
  let url = '/.netlify/functions/list-images';
  if (showHidden) {
    url += '?show_hidden=true';
  }
  const response = await fetch(url, {
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
 * Trigger a Netlify site rebuild after image changes.
 */
async function triggerRebuild() {
  try {
    const token = await getToken();
    await fetch('/.netlify/functions/trigger-rebuild', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Rebuild trigger failed:', err);
  }
}

/**
 * Build a gallery card element using safe DOM methods.
 */
function buildGalleryCard(image) {
  const card = document.createElement('div');
  card.className = 'admin-gallery-card';
  card.dataset.publicId = image.public_id;
  card.dataset.category = image.category;
  card.dataset.sortOrder = image.sort_order;

  if (showingTrash) {
    card.classList.add('admin-gallery-card--hidden');
  }

  const img = document.createElement('img');
  img.src = image.url;
  img.alt = image.alt || image.caption || 'Gallery image';
  img.loading = 'lazy';
  card.appendChild(img);

  // Action buttons overlay
  const actions = document.createElement('div');
  actions.className = 'admin-gallery-card__actions';

  if (!showingTrash) {
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'admin-gallery-card__action-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(image, () => refreshGallery());
    });
    actions.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'admin-gallery-card__action-btn admin-gallery-card__action-btn--danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(image);
    });
    actions.appendChild(deleteBtn);
  } else {
    // Restore button (trash mode)
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'admin-gallery-card__action-btn';
    restoreBtn.textContent = 'Restore';
    restoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRestore(image);
    });
    actions.appendChild(restoreBtn);
  }

  card.appendChild(actions);

  // Meta section
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
 * Handle soft-delete of an image (adds hidden tag).
 */
async function handleDelete(image) {
  const confirmed = window.confirm(
    'Delete this image? It will be hidden from the gallery but can be restored from Trash.'
  );
  if (!confirmed) return;

  try {
    const token = await getToken();
    const res = await fetch('/.netlify/functions/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_id: image.public_id }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Delete failed (${res.status})`);
    }

    showToast('success', 'Image hidden from gallery');
    await triggerRebuild();
    await refreshGallery();
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('error', 'Failed to delete image');
  }
}

/**
 * Handle restoring a hidden image.
 */
async function handleRestore(image) {
  try {
    const token = await getToken();
    const res = await fetch('/.netlify/functions/restore-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_id: image.public_id }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Restore failed (${res.status})`);
    }

    showToast('success', 'Image restored');
    await triggerRebuild();
    await refreshGallery();
  } catch (err) {
    console.error('Restore failed:', err);
    showToast('error', 'Failed to restore image');
  }
}

/**
 * Refresh gallery by re-fetching images from the API.
 */
async function refreshGallery() {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl) return;

  try {
    allImages = await fetchGalleryImages(showingTrash);
    renderGallery();
  } catch (err) {
    console.error('Gallery refresh failed:', err);
    gridEl.textContent = '';
    const errorMsg = document.createElement('p');
    errorMsg.className = 'admin-placeholder';
    errorMsg.textContent = 'Failed to load gallery. Please try refreshing.';
    gridEl.appendChild(errorMsg);
    showToast('error', 'Failed to load gallery images.');
  }
}

/**
 * Render the gallery grid based on current filter and state.
 */
function renderGallery() {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl) return;

  // Destroy existing sortable before clearing
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

  gridEl.textContent = '';

  // Filter images by category
  let filtered = allImages;
  if (currentFilter !== 'all') {
    filtered = allImages.filter((img) => img.category === currentFilter);
  }

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'admin-placeholder';
    if (showingTrash) {
      empty.textContent = 'Trash is empty.';
    } else if (currentFilter !== 'all') {
      empty.textContent = 'No images in this category.';
    } else {
      empty.textContent = 'No images yet. Upload some photos to get started.';
    }
    gridEl.appendChild(empty);
    return;
  }

  filtered.forEach((image) => {
    gridEl.appendChild(buildGalleryCard(image));
  });

  // Enable drag-and-drop reorder only when a specific category is selected (not 'all') and not in trash
  if (!showingTrash && currentFilter !== 'all') {
    initSortable();
  }

  // Hide save-order button when re-rendering
  const saveOrderBtn = document.getElementById('save-order-btn');
  if (saveOrderBtn) {
    saveOrderBtn.hidden = true;
  }
}

/**
 * Initialize SortableJS for drag-and-drop reorder.
 */
function initSortable() {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl) return;

  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

  sortableInstance = Sortable.create(gridEl, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd(evt) {
      if (evt.oldIndex !== evt.newIndex) {
        document.getElementById('save-order-btn').hidden = false;
      }
    },
  });

  showToast('info', 'Drag cards to reorder. Click Save Order when done.');
}

/**
 * Save the current card order to the backend.
 */
async function handleSaveOrder() {
  const gridEl = document.getElementById('gallery-grid');
  const saveOrderBtn = document.getElementById('save-order-btn');
  if (!gridEl || !saveOrderBtn) return;

  const cards = Array.from(gridEl.querySelectorAll('.admin-gallery-card'));
  const images = cards.map((card, i) => ({
    public_id: card.dataset.publicId,
    sort_order: i,
  }));

  saveOrderBtn.disabled = true;
  saveOrderBtn.textContent = 'Saving...';

  try {
    const token = await getToken();
    const res = await fetch('/.netlify/functions/reorder-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ images }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Reorder failed (${res.status})`);
    }

    showToast('success', 'Order saved');
    saveOrderBtn.hidden = true;
    await triggerRebuild();
  } catch (err) {
    console.error('Reorder failed:', err);
    showToast('error', 'Failed to save order');
  } finally {
    saveOrderBtn.disabled = false;
    saveOrderBtn.textContent = 'Save Order';
  }
}

/**
 * Initialize the gallery view component.
 * Wires up controls and performs initial image load.
 */
export async function initGalleryView() {
  // Wire up category filter
  const filterSelect = document.getElementById('gallery-category-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      currentFilter = filterSelect.value;
      renderGallery();
    });
  }

  // Wire up trash toggle
  const trashToggle = document.getElementById('trash-toggle');
  if (trashToggle) {
    trashToggle.addEventListener('click', () => {
      showingTrash = !showingTrash;
      trashToggle.textContent = showingTrash ? 'Show Gallery' : 'Show Trash';
      refreshGallery();
    });
  }

  // Wire up save order button
  const saveOrderBtn = document.getElementById('save-order-btn');
  if (saveOrderBtn) {
    saveOrderBtn.addEventListener('click', handleSaveOrder);
  }

  // Initial load
  await refreshGallery();
}
