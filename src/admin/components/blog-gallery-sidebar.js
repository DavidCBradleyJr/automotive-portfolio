/* ==========================================================================
 * Blog Gallery Sidebar — Image Browser, Drag-to-Insert, Upload, Cover Picker
 *
 * Provides a sidebar panel within the blog editor that displays existing
 * Cloudinary gallery images as draggable thumbnails. Users can drag images
 * into the markdown textarea to insert image tags, upload new photos via
 * signed Cloudinary upload, and pick cover images from the gallery.
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';

const CLOUD_NAME = 'dl0atmtb7';

/** Module-level image cache for reuse by cover picker */
let galleryImages = [];

/**
 * Build a Cloudinary transform URL from a secure_url.
 * Inserts transform params before the version segment (e.g., /v1234567/).
 * Falls back to appending if pattern not found.
 */
function cloudinaryTransform(secureUrl, transform) {
  // The secure_url typically looks like:
  // https://res.cloudinary.com/dl0atmtb7/image/upload/v1234/folder/file.jpg
  // We insert transforms after /upload/
  const uploadIdx = secureUrl.indexOf('/upload/');
  if (uploadIdx !== -1) {
    return secureUrl.slice(0, uploadIdx + 8) + transform + '/' + secureUrl.slice(uploadIdx + 8);
  }
  return secureUrl;
}

/**
 * Generate a thumbnail URL for sidebar display.
 */
function thumbUrl(image) {
  // list-images already provides a `url` field (400px thumbnail)
  // Use it if available; otherwise build from secure_url or full_url
  if (image.url) return image.url;
  const base = image.secure_url || image.full_url || '';
  return cloudinaryTransform(base, 'w_200,h_200,c_fill,f_auto,q_auto');
}

/**
 * Generate a blog-quality full URL for insertion into posts.
 */
function blogUrl(image) {
  if (image.full_url) return image.full_url;
  const base = image.secure_url || '';
  return cloudinaryTransform(base, 'w_1600,f_auto,q_auto');
}

/**
 * Get alt text from an image object.
 */
function getAlt(image) {
  return image.alt || image.caption || '';
}

/**
 * Render sidebar image grid from image data.
 */
function renderSidebarImages(images) {
  const grid = document.getElementById('sidebar-gallery-grid');
  if (!grid) return;

  grid.textContent = '';

  if (images.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'admin-placeholder';
    empty.textContent = 'No images in gallery.';
    grid.appendChild(empty);
    return;
  }

  images.forEach((image) => {
    const img = document.createElement('img');
    img.src = thumbUrl(image);
    img.alt = getAlt(image);
    img.draggable = true;
    img.className = 'blog-gallery-sidebar__img';
    img.dataset.fullUrl = blogUrl(image);
    img.dataset.alt = getAlt(image);

    img.addEventListener('dragstart', (e) => {
      const fullUrl = img.dataset.fullUrl;
      const alt = img.dataset.alt;
      e.dataTransfer.setData('text/plain', '![' + alt + '](' + fullUrl + ')');
      e.dataTransfer.effectAllowed = 'copy';
    });

    grid.appendChild(img);
  });
}

/**
 * Set up the textarea drop handler for receiving dragged images.
 */
function setupTextareaDrop() {
  const textarea = document.getElementById('post-body');
  if (!textarea) return;

  textarea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  textarea.addEventListener('drop', (e) => {
    e.preventDefault();
    const markdownImg = e.dataTransfer.getData('text/plain');
    if (!markdownImg.startsWith('![')) return; // Only handle our image drops
    const pos = textarea.selectionStart;
    const before = textarea.value.substring(0, pos);
    const after = textarea.value.substring(pos);
    const insertion = (before.endsWith('\n') || before === '' ? '' : '\n') + markdownImg + '\n';
    textarea.value = before + insertion + after;
    textarea.selectionStart = textarea.selectionEnd = pos + insertion.length;
    textarea.focus();
  });
}

/**
 * Set up the sidebar toggle (collapse/expand) button.
 */
function setupSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('gallery-sidebar');
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('blog-gallery-sidebar--collapsed');
    toggleBtn.textContent = isCollapsed ? 'Show' : 'Hide';
  });
}

/**
 * Insert markdown at the current cursor position in the post body textarea.
 */
function insertMarkdownAtCursor(markdown) {
  const textarea = document.getElementById('post-body');
  if (!textarea) return;

  const pos = textarea.selectionStart;
  const before = textarea.value.substring(0, pos);
  const after = textarea.value.substring(pos);
  const insertion = (before.endsWith('\n') || before === '' ? '' : '\n') + markdown + '\n';
  textarea.value = before + insertion + after;
  textarea.selectionStart = textarea.selectionEnd = pos + insertion.length;
  textarea.focus();
}

/**
 * Generate a URL-safe public_id from a filename.
 */
function slugFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '') // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Set up the upload button for uploading new photos from within the editor.
 */
function setupUploadButton() {
  const uploadBtn = document.getElementById('sidebar-upload-btn');
  if (!uploadBtn) return;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/webp';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    fileInput.value = '';

    const category = prompt('Category for this photo (jdm, euro, supercar, american-muscle, track):');
    if (!category) {
      showToast('error', 'Upload cancelled -- category is required.');
      return;
    }

    const publicId = slugFromFilename(file.name);
    const folder = 'gallery/' + category.trim();

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
      const token = await getToken();

      // Step 1: Get signed upload params
      const signRes = await fetch('/.netlify/functions/sign-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ folder, public_id: publicId }),
      });

      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get upload signature');
      }

      const { signature, timestamp, api_key } = await signRes.json();

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', api_key);
      formData.append('folder', folder);
      formData.append('public_id', publicId);

      const uploadRes = await fetch(
        'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload',
        { method: 'POST', body: formData }
      );

      if (!uploadRes.ok) {
        throw new Error('Cloudinary upload failed (' + uploadRes.status + ')');
      }

      const result = await uploadRes.json();

      // Add new image to sidebar
      const newImage = {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.secure_url,
        full_url: result.secure_url,
        width: result.width,
        height: result.height,
        alt: '',
        caption: '',
      };
      galleryImages.unshift(newImage);
      renderSidebarImages(galleryImages);

      // Insert markdown image tag at cursor
      const imgUrl = blogUrl(newImage);
      insertMarkdownAtCursor('![](' + imgUrl + ')');

      showToast('success', 'Photo uploaded!');
    } catch (err) {
      console.error('Sidebar upload failed:', err);
      showToast('error', 'Upload failed: ' + err.message);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload Photo';
    }
  });
}

/**
 * Set up the cover image picker overlay.
 */
function setupCoverPicker() {
  const pickBtn = document.getElementById('pick-cover-btn');
  const clearBtn = document.getElementById('clear-cover-btn');
  const coverPreview = document.getElementById('cover-preview');

  if (!pickBtn) return;

  pickBtn.addEventListener('click', () => {
    openCoverPickerOverlay();
  });

  if (clearBtn && coverPreview) {
    clearBtn.addEventListener('click', () => {
      coverPreview.src = '';
      coverPreview.hidden = true;
      clearBtn.hidden = true;
    });
  }
}

/**
 * Open a fullscreen overlay grid for selecting a cover image.
 */
function openCoverPickerOverlay() {
  const coverPreview = document.getElementById('cover-preview');
  const clearBtn = document.getElementById('clear-cover-btn');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'blog-cover-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;overflow-y:auto;padding:2rem;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;';

  const title = document.createElement('h3');
  title.textContent = 'Select Cover Image';
  title.style.cssText = 'color:#fff;margin:0;font-size:1.25rem;';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn--secondary';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  header.appendChild(closeBtn);
  overlay.appendChild(header);

  // Image grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.75rem;';

  galleryImages.forEach((image) => {
    const img = document.createElement('img');
    img.src = thumbUrl(image);
    img.alt = getAlt(image);
    img.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid transparent;transition:border-color 0.15s;';

    img.addEventListener('mouseenter', () => {
      img.style.borderColor = '#3b82f6';
    });
    img.addEventListener('mouseleave', () => {
      img.style.borderColor = 'transparent';
    });

    img.addEventListener('click', () => {
      if (coverPreview) {
        coverPreview.src = blogUrl(image);
        coverPreview.hidden = false;
      }
      if (clearBtn) {
        clearBtn.hidden = false;
      }
      document.body.removeChild(overlay);
    });

    grid.appendChild(img);
  });

  overlay.appendChild(grid);

  // Click overlay background to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  document.body.appendChild(overlay);
}

/**
 * Initialize the gallery sidebar: load images, set up drag-to-insert,
 * toggle, upload, and cover picker.
 */
export function initGallerySidebar() {
  // Load gallery images
  loadGalleryImages();

  // Set up textarea drop handler
  setupTextareaDrop();

  // Set up sidebar toggle
  setupSidebarToggle();

  // Set up upload button
  setupUploadButton();

  // Set up cover picker
  setupCoverPicker();
}

/**
 * Fetch gallery images from the list-images function and render the sidebar.
 */
async function loadGalleryImages() {
  try {
    const token = await getToken();
    const res = await fetch('/.netlify/functions/list-images', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!res.ok) {
      throw new Error('Failed to load images (' + res.status + ')');
    }

    const data = await res.json();
    galleryImages = data.images || [];
    renderSidebarImages(galleryImages);
  } catch (err) {
    console.error('Gallery sidebar: failed to load images:', err);
    const grid = document.getElementById('sidebar-gallery-grid');
    if (grid) {
      grid.textContent = '';
      const errMsg = document.createElement('p');
      errMsg.className = 'admin-placeholder';
      errMsg.textContent = 'Failed to load gallery images.';
      grid.appendChild(errMsg);
    }
  }
}
