/* ==========================================================================
 * Upload — Drag-and-Drop Photo Upload with Batch Processing
 *
 * Handles file selection, preview generation, metadata editing,
 * and sequential upload to Cloudinary via Netlify Function.
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB (Cloudinary limit)
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let fileQueue = [];

/**
 * Generate a URL-safe slug from category and filename.
 */
function generateSlug(category, filename) {
  const base = filename
    .replace(/\.[^.]+$/, '') // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || `${category}-${Date.now()}`;
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
 * Create a text element.
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'textContent') {
      node.textContent = val;
    } else if (key === 'className') {
      node.className = val;
    } else if (key.startsWith('data-')) {
      node.setAttribute(key, val);
    } else {
      node.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else if (child) {
      node.appendChild(child);
    }
  }
  return node;
}

/**
 * Build a single upload item card using safe DOM methods.
 */
function buildItemCard(item, index) {
  const card = el('div', { className: 'upload-item', 'data-index': index });

  // Preview image
  const img = el('img', { className: 'upload-item__preview', src: item.preview, alt: 'Preview' });
  card.appendChild(img);

  // Fields container
  const fields = el('div', { className: 'upload-item__fields' });

  // Caption field
  const captionField = el('div', { className: 'upload-item__field' }, [el('label', { textContent: 'Caption' })]);
  const captionInput = el('input', {
    type: 'text',
    className: 'upload-item__input',
    'data-field': 'caption',
    'data-index': index,
    value: item.caption,
    placeholder: 'e.g. Blue Supra at sunset',
  });
  captionField.appendChild(captionInput);
  fields.appendChild(captionField);

  // Alt text field
  const altField = el('div', { className: 'upload-item__field' }, [el('label', { textContent: 'Alt text' })]);
  const altInput = el('input', {
    type: 'text',
    className: 'upload-item__input',
    'data-field': 'alt',
    'data-index': index,
    value: item.alt,
    placeholder: 'e.g. Blue Toyota Supra parked at sunset',
  });
  altField.appendChild(altInput);
  fields.appendChild(altField);

  // Slug field
  const slugField = el('div', { className: 'upload-item__field' }, [el('label', { textContent: 'Image ID' })]);
  const slugInput = el('input', {
    type: 'text',
    className: 'upload-item__input',
    'data-field': 'slug',
    'data-index': index,
    value: item.slug,
  });
  slugField.appendChild(slugInput);
  fields.appendChild(slugField);

  // Progress bar
  const progressWrap = el('div', { className: 'upload-item__progress' });
  const progressBar = el('div', { className: 'upload-item__progress-bar' });
  progressBar.style.width = `${item.progress}%`;
  progressWrap.appendChild(progressBar);
  fields.appendChild(progressWrap);

  // Status
  const statusEl = el('div', { className: 'upload-item__status' });
  setStatusContent(statusEl, item.status);
  fields.appendChild(statusEl);

  card.appendChild(fields);

  // Remove button
  const removeBtn = el('button', {
    className: 'upload-item__remove',
    'data-index': index,
    title: 'Remove',
    textContent: '\u00D7',
  });
  card.appendChild(removeBtn);

  // Bind input events
  [captionInput, altInput, slugInput].forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.field;
      if (fileQueue[idx]) {
        fileQueue[idx][field] = e.target.value;
      }
    });
  });

  // Bind remove
  removeBtn.addEventListener('click', () => {
    URL.revokeObjectURL(item.preview);
    fileQueue.splice(index, 1);
    renderQueue();
  });

  return card;
}

/**
 * Set status element content safely.
 */
function setStatusContent(statusEl, status) {
  statusEl.textContent = '';
  switch (status) {
    case 'uploading': {
      statusEl.textContent = 'Uploading...';
      break;
    }
    case 'success': {
      const span = document.createElement('span');
      span.style.color = '#16a34a';
      span.textContent = 'Uploaded';
      statusEl.appendChild(span);
      break;
    }
    case 'error': {
      const span = document.createElement('span');
      span.style.color = '#dc2626';
      span.textContent = 'Failed';
      statusEl.appendChild(span);
      break;
    }
    default:
      break;
  }
}

/**
 * Render the file queue UI using safe DOM construction.
 */
function renderQueue() {
  const queueEl = document.getElementById('upload-queue');
  const uploadBtn = document.getElementById('upload-btn');
  const categorySelect = document.getElementById('batch-category');

  // Clear existing content
  queueEl.textContent = '';

  if (fileQueue.length === 0) {
    uploadBtn.disabled = true;
    return;
  }

  fileQueue.forEach((item, index) => {
    queueEl.appendChild(buildItemCard(item, index));
  });

  // Enable upload button when files exist and category is selected
  uploadBtn.disabled = fileQueue.length === 0 || !categorySelect.value;
}

/**
 * Add files to the queue after validation.
 */
function addFiles(fileList) {
  const category = document.getElementById('batch-category').value;

  for (const file of fileList) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast('error', `${file.name}: unsupported file type. Use JPEG, PNG, or WebP.`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast('error', `${file.name}: exceeds 4 MB limit.`);
      continue;
    }

    fileQueue.push({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      alt: '',
      slug: generateSlug(category || 'photo', file.name),
      status: 'pending',
      progress: 0,
    });
  }

  renderQueue();
}

/**
 * Upload all files in the queue sequentially.
 */
async function uploadAll() {
  const categorySelect = document.getElementById('batch-category');
  const uploadBtn = document.getElementById('upload-btn');
  const category = categorySelect.value;

  if (!category) {
    showToast('error', 'Please select a category before uploading.');
    return;
  }

  if (fileQueue.length === 0) {
    showToast('error', 'No files to upload.');
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < fileQueue.length; i++) {
    const item = fileQueue[i];
    if (item.status === 'success') continue;

    item.status = 'uploading';
    item.progress = 0;
    updateItemUI(i);

    try {
      // Refresh token before each upload to prevent JWT expiry mid-batch
      const token = await getToken();

      // Step 1: Get signed upload params from our function (lightweight, no file data)
      const signRes = await fetch('/.netlify/functions/sign-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          folder: `gallery/${category}`,
          public_id: item.slug,
          context: {
            caption: item.caption,
            alt: item.alt,
          },
        }),
      });

      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}));
        throw new Error(err.error || `Signature failed (${signRes.status})`);
      }

      const { signature, timestamp, cloud_name, api_key } = await signRes.json();

      // Step 2: Upload file directly to Cloudinary (no size limit from Netlify Functions)
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', api_key);
      formData.append('folder', `gallery/${category}`);
      formData.append('public_id', item.slug);
      formData.append('overwrite', 'false');
      if (item.caption || item.alt) {
        const ctx = [item.caption && `caption=${item.caption}`, item.alt && `alt=${item.alt}`].filter(Boolean).join('|');
        formData.append('context', ctx);
      }

      // Use XMLHttpRequest for progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            item.progress = Math.round((e.loaded / e.total) * 100);
            updateItemUI(i);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Cloudinary upload failed (${xhr.status})`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.send(formData);
      });

      item.status = 'success';
      item.progress = 100;
      successCount++;
    } catch (err) {
      console.error(`Upload failed for ${item.file.name}:`, err);
      item.status = 'error';
      errorCount++;
    }

    updateItemUI(i);
  }

  // Trigger rebuild if any uploads succeeded
  if (successCount > 0) {
    try {
      const token = await getToken();
      await fetch('/.netlify/functions/trigger-rebuild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Rebuild trigger failed:', err);
    }
  }

  // Show result toast
  if (errorCount === 0) {
    showToast('success', `${successCount} photo${successCount === 1 ? '' : 's'} uploaded! Rebuilding site...`);
  } else if (successCount > 0) {
    showToast('error', `${successCount} uploaded, ${errorCount} failed. Check and retry failed items.`);
  } else {
    showToast('error', 'All uploads failed. Please check your connection and try again.');
  }

  // Clean up successful uploads, keep failed ones for retry
  fileQueue.forEach((item) => {
    if (item.status === 'success') {
      URL.revokeObjectURL(item.preview);
    }
  });
  fileQueue = fileQueue.filter((item) => item.status !== 'success');
  renderQueue();

  uploadBtn.textContent = 'Upload All';
  uploadBtn.disabled = fileQueue.length === 0;
}

/**
 * Update a single item's progress bar and status in the DOM.
 */
function updateItemUI(index) {
  const itemEl = document.querySelector(`.upload-item[data-index="${index}"]`);
  if (!itemEl) return;

  const item = fileQueue[index];
  const progressBar = itemEl.querySelector('.upload-item__progress-bar');
  const statusEl = itemEl.querySelector('.upload-item__status');

  if (progressBar) progressBar.style.width = `${item.progress}%`;
  if (statusEl) setStatusContent(statusEl, item.status);
}

/**
 * Initialize the upload component.
 * Sets up drag-and-drop, file input, and upload button handlers.
 */
export function initUpload() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const categorySelect = document.getElementById('batch-category');

  if (!uploadZone || !fileInput || !uploadBtn || !categorySelect) return;

  // Drag-and-drop handlers
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('upload-zone--active');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('upload-zone--active');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('upload-zone--active');
    const files = Array.from(e.dataTransfer.files).filter((f) => ACCEPTED_TYPES.includes(f.type));
    addFiles(files);
  });

  // File input handler
  fileInput.addEventListener('change', () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });

  // Category change updates upload button state
  categorySelect.addEventListener('change', () => {
    const uploadBtnEl = document.getElementById('upload-btn');
    if (uploadBtnEl) {
      uploadBtnEl.disabled = fileQueue.length === 0 || !categorySelect.value;
    }
  });

  // Upload button handler
  uploadBtn.addEventListener('click', uploadAll);
}
