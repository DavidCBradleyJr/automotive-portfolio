/* ==========================================================================
 * Blog Manager — Post List Grid and CRUD Orchestration
 *
 * Manages the blog post list view with card grid, handles create/edit/delete
 * workflow, and coordinates with the blog editor component for content
 * authoring. Communicates with Netlify Functions for persistence.
 * ========================================================================== */

import { getToken } from './auth.js';
import { showToast } from './toast.js';
import { initEditor, getEditorData, setEditorData, clearEditor, buildMarkdown } from './blog-editor.js';

/** Module state */
let posts = [];
let currentPost = null;
let saving = false;

/**
 * Initialize the blog manager: editor setup, post loading, event binding.
 */
export function initBlogManager() {
  initEditor();
  loadPosts();

  const newPostBtn = document.getElementById('new-post-btn');
  const backBtn = document.getElementById('back-to-posts');
  const saveDraftBtn = document.getElementById('save-draft-btn');
  const publishBtn = document.getElementById('publish-btn');

  if (newPostBtn) newPostBtn.addEventListener('click', () => openEditor(null));
  if (backBtn) backBtn.addEventListener('click', closeEditor);
  if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => savePost('draft'));
  if (publishBtn) publishBtn.addEventListener('click', () => savePost('published'));
}

/**
 * Fetch all blog posts from the list-posts function and render the grid.
 */
async function loadPosts() {
  try {
    const token = await getToken();
    const res = await fetch('/.netlify/functions/list-posts', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (!res.ok) {
      throw new Error(`Failed to load posts (${res.status})`);
    }

    const data = await res.json();
    posts = data.posts || [];
  } catch (err) {
    console.error('Failed to load posts:', err);
    showToast('error', 'Failed to load blog posts');
    posts = [];
  }

  renderPostGrid();
}

/**
 * Render the post card grid using safe DOM construction methods.
 */
function renderPostGrid() {
  const grid = document.getElementById('blog-post-grid');
  if (!grid) return;

  grid.textContent = '';

  if (posts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'blog-post-grid__empty';
    empty.textContent = "No posts yet. Click 'New Post' to create one.";
    grid.appendChild(empty);
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement('div');
    card.className = 'blog-post-card';
    card.dataset.slug = post.slug;

    // Cover image or placeholder
    if (post.cover) {
      const img = document.createElement('img');
      img.className = 'blog-post-card__cover';
      img.src = post.cover + '?w=400&f_auto&q_auto';
      img.alt = post.title || '';
      img.loading = 'lazy';
      card.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'blog-post-card__cover blog-post-card__cover--empty';
      placeholder.textContent = 'No cover';
      card.appendChild(placeholder);
    }

    // Body container
    const body = document.createElement('div');
    body.className = 'blog-post-card__body';

    // Title
    const title = document.createElement('div');
    title.className = 'blog-post-card__title';
    title.textContent = post.title || 'Untitled';
    body.appendChild(title);

    // Meta row: date + status
    const meta = document.createElement('div');
    meta.className = 'blog-post-card__meta';

    const dateSpan = document.createElement('span');
    dateSpan.textContent = post.date || '';
    meta.appendChild(dateSpan);

    const statusSpan = document.createElement('span');
    statusSpan.className = 'blog-post-card__status blog-post-card__status--' + (post.status || 'draft');
    statusSpan.textContent = post.status || 'draft';
    meta.appendChild(statusSpan);

    body.appendChild(meta);

    // Actions row with Delete button
    const actions = document.createElement('div');
    actions.className = 'blog-post-card__actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--secondary btn--small blog-post-card__delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePost(post);
    });
    actions.appendChild(deleteBtn);
    body.appendChild(actions);

    card.appendChild(body);

    // Click card to edit (excluding delete button clicks)
    card.addEventListener('click', () => openEditor(post));

    grid.appendChild(card);
  });
}

/**
 * Open the editor view, either for a new post or an existing one.
 * @param {object|null} post - Post to edit, or null for new post
 */
function openEditor(post) {
  currentPost = post;
  const slugInput = document.getElementById('post-slug');
  const publishBtn = document.getElementById('publish-btn');

  if (post === null) {
    // New post
    clearEditor();
  } else {
    // Editing existing post
    setEditorData(post);
    if (slugInput) slugInput.readOnly = true;
  }

  // Update publish button label for existing published posts
  if (publishBtn) {
    publishBtn.textContent = (post && post.status === 'published') ? 'Update' : 'Publish';
  }

  // Toggle views
  const listView = document.getElementById('blog-list-view');
  const editorView = document.getElementById('blog-editor-view');
  if (listView) listView.hidden = true;
  if (editorView) editorView.hidden = false;
}

/**
 * Close the editor and return to the post list view.
 */
function closeEditor() {
  currentPost = null;

  const slugInput = document.getElementById('post-slug');
  if (slugInput) slugInput.readOnly = false;

  const listView = document.getElementById('blog-list-view');
  const editorView = document.getElementById('blog-editor-view');
  if (listView) listView.hidden = false;
  if (editorView) editorView.hidden = true;

  loadPosts();
}

/**
 * Save or publish the current post.
 * @param {'draft'|'published'} status - Target status for the post
 */
async function savePost(status) {
  if (saving) return;

  const saveDraftBtn = document.getElementById('save-draft-btn');
  const publishBtn = document.getElementById('publish-btn');

  saving = true;
  const origDraftText = saveDraftBtn?.textContent;
  const origPubText = publishBtn?.textContent;
  if (saveDraftBtn) { saveDraftBtn.disabled = true; saveDraftBtn.textContent = 'Saving...'; }
  if (publishBtn) { publishBtn.disabled = true; publishBtn.textContent = 'Saving...'; }

  try {
    const data = getEditorData();

    // Validate required fields
    if (!data.title || !data.slug) {
      showToast('error', 'Title and slug are required');
      return;
    }

    data.status = status;
    data.date = data.date || new Date().toISOString().split('T')[0];

    const content = buildMarkdown(data, data.body);
    const token = await getToken();

    const res = await fetch('/.netlify/functions/save-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        slug: data.slug,
        content,
        sha: currentPost?.sha || undefined,
        title: data.title,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Save failed (${res.status})`);
    }

    const result = await res.json();

    // Update SHA for subsequent saves without closing editor
    if (currentPost) {
      currentPost.sha = result.sha;
    }

    showToast('success', status === 'published' ? 'Post published!' : 'Draft saved!');
    closeEditor();
  } catch (err) {
    console.error('Save failed:', err);
    showToast('error', 'Failed to save post: ' + err.message);
  } finally {
    saving = false;
    if (saveDraftBtn) { saveDraftBtn.disabled = false; saveDraftBtn.textContent = origDraftText; }
    if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = origPubText; }
  }
}

/**
 * Delete a post after user confirmation.
 * @param {object} post - Post to delete
 */
async function deletePost(post) {
  if (!confirm('Delete "' + post.title + '"? This cannot be undone.')) {
    return;
  }

  saving = true;

  try {
    const token = await getToken();

    const res = await fetch('/.netlify/functions/delete-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        slug: post.slug,
        sha: post.sha,
        title: post.title,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Delete failed (${res.status})`);
    }

    showToast('success', 'Post deleted');
    loadPosts();
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('error', 'Failed to delete post: ' + err.message);
  } finally {
    saving = false;
  }
}
