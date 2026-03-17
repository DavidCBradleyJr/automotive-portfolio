/* ==========================================================================
 * Edit Modal — Image Metadata Editor
 *
 * Opens a modal overlay for editing image category, caption, and alt text.
 * Calls the update-image Netlify Function on save.
 * Uses ONLY safe DOM methods (createElement, textContent, appendChild).
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';

const categoryLabels = {
  jdm: 'JDM',
  euro: 'Euro',
  supercar: 'Supercar',
  'american-muscle': 'American Muscle',
  track: 'Track/Motorsport',
};

/**
 * Open the edit modal for an image.
 * @param {Object} image - Image object from list-images API
 * @param {Function} onSave - Callback after successful save (for gallery refresh)
 */
export function openEditModal(image, onSave) {
  // -- Overlay --
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // -- Modal container --
  const modal = document.createElement('div');
  modal.className = 'edit-modal';

  // -- Header --
  const header = document.createElement('div');
  header.className = 'edit-modal__header';

  const title = document.createElement('h2');
  title.textContent = 'Edit Image';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'edit-modal__close';
  closeBtn.textContent = '\u00D7';
  closeBtn.addEventListener('click', closeModal);
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // -- Preview image --
  const preview = document.createElement('img');
  preview.className = 'edit-modal__preview';
  preview.src = image.full_url || image.url;
  preview.alt = image.alt || image.caption || 'Image preview';
  modal.appendChild(preview);

  // -- Category field --
  const categoryField = document.createElement('div');
  categoryField.className = 'edit-modal__field';

  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Category';
  categoryField.appendChild(categoryLabel);

  const categorySelect = document.createElement('select');
  categorySelect.className = 'upload-select';
  for (const [value, label] of Object.entries(categoryLabels)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (value === image.category) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  }
  categoryField.appendChild(categorySelect);
  modal.appendChild(categoryField);

  // -- Caption field --
  const captionField = document.createElement('div');
  captionField.className = 'edit-modal__field';

  const captionLabel = document.createElement('label');
  captionLabel.textContent = 'Caption';
  captionField.appendChild(captionLabel);

  const captionInput = document.createElement('input');
  captionInput.type = 'text';
  captionInput.className = 'upload-item__input';
  captionInput.value = image.caption || '';
  captionInput.placeholder = 'e.g. Blue Supra at sunset';
  captionField.appendChild(captionInput);
  modal.appendChild(captionField);

  // -- Alt text field --
  const altField = document.createElement('div');
  altField.className = 'edit-modal__field';

  const altLabel = document.createElement('label');
  altLabel.textContent = 'Alt text';
  altField.appendChild(altLabel);

  const altInput = document.createElement('input');
  altInput.type = 'text';
  altInput.className = 'upload-item__input';
  altInput.value = image.alt || '';
  altInput.placeholder = 'e.g. Blue Toyota Supra parked at sunset';
  altField.appendChild(altInput);
  modal.appendChild(altField);

  // -- Footer with Save and Cancel --
  const footer = document.createElement('div');
  footer.className = 'edit-modal__footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn--secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', closeModal);
  footer.appendChild(cancelBtn);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn--primary';
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', handleSave);
  footer.appendChild(saveBtn);

  modal.appendChild(footer);

  // -- Overlay click closes modal (only direct overlay clicks) --
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // -- Escape key handler --
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  // -- Close modal --
  function closeModal() {
    document.removeEventListener('keydown', onKeyDown);
    if (overlay.parentNode) {
      overlay.remove();
    }
  }

  // -- Save handler --
  async function handleSave() {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const body = {
      public_id: image.public_id,
      caption: captionInput.value,
      alt: altInput.value,
    };

    // Only send category if it changed
    const newCategory = categorySelect.value;
    if (newCategory !== image.category) {
      body.category = newCategory;
    }

    try {
      const token = await getToken();
      const res = await fetch('/.netlify/functions/update-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Update failed (${res.status})`);
      }

      showToast('success', 'Image updated');
      closeModal();
      if (onSave) onSave();
    } catch (err) {
      console.error('Image update failed:', err);
      showToast('error', 'Failed to update image');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  }
}
