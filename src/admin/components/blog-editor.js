/* ==========================================================================
 * Blog Editor — Markdown Editor with Toolbar, Preview, and Metadata
 *
 * Provides Write/Preview tab switching, formatting toolbar with markdown
 * syntax insertion, slug auto-generation from title, and frontmatter
 * assembly for blog post creation and editing.
 * ========================================================================== */

import { marked } from 'marked';

/** Track whether the slug field has been manually edited */
let slugManuallyEdited = false;

/**
 * Insert markdown syntax around the current selection in a textarea.
 */
function insertAtCursor(textarea, before, after = '') {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + (selected || 'text') + after;
  textarea.setRangeText(replacement, start, end, 'select');
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + (selected || 'text').length;
}

/** Toolbar action map: data-action -> insertion parameters */
const TOOLBAR_ACTIONS = {
  bold:       (ta) => insertAtCursor(ta, '**', '**'),
  italic:     (ta) => insertAtCursor(ta, '_', '_'),
  h2:         (ta) => insertAtCursor(ta, '## ', '\n'),
  h3:         (ta) => insertAtCursor(ta, '### ', '\n'),
  link:       (ta) => insertAtCursor(ta, '[', '](url)'),
  blockquote: (ta) => insertAtCursor(ta, '> ', '\n'),
  ul:         (ta) => insertAtCursor(ta, '- ', '\n'),
  ol:         (ta) => insertAtCursor(ta, '1. ', '\n'),
};

/**
 * Generate a URL-safe slug from a title string.
 */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/**
 * Render markdown to the preview element.
 * Security note: This is an admin-only panel behind Netlify Identity auth.
 * The markdown is authored exclusively by David (the site owner). The marked
 * library renders his own content for preview purposes only — it is never
 * served to public visitors (blog pages are built at deploy time from source).
 */
function renderPreview(previewEl, markdownText) {
  const html = marked.parse(markdownText || '');
  previewEl.innerHTML = html; // eslint-disable-line no-unsanitized/property -- admin-only, self-authored content
}

/**
 * Initialize the blog editor: toolbar, Write/Preview tabs, slug generation.
 */
export function initEditor() {
  const textarea = document.getElementById('post-body');
  const preview = document.getElementById('post-preview');
  const toolbar = document.getElementById('blog-toolbar');
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');

  if (!textarea || !preview) return;

  // --- Write/Preview tab switching ---
  const tabs = document.querySelectorAll('.blog-editor-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('blog-editor-tab--active'));
      tab.classList.add('blog-editor-tab--active');

      const mode = tab.dataset.editorTab;
      if (mode === 'write') {
        textarea.hidden = false;
        preview.hidden = true;
        if (toolbar) toolbar.hidden = false;
      } else if (mode === 'preview') {
        textarea.hidden = true;
        preview.hidden = false;
        if (toolbar) toolbar.hidden = true;
        renderPreview(preview, textarea.value);
      }
    });
  });

  // --- Formatting toolbar ---
  if (toolbar) {
    const buttons = toolbar.querySelectorAll('.blog-toolbar__btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (TOOLBAR_ACTIONS[action]) {
          TOOLBAR_ACTIONS[action](textarea);
        }
      });
    });
  }

  // --- Slug auto-generation from title ---
  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (!slugManuallyEdited) {
        slugInput.value = slugify(titleInput.value);
      }
    });

    slugInput.addEventListener('input', () => {
      slugManuallyEdited = true;
    });
  }
}

/**
 * Get the current editor state as a data object.
 * @returns {{ title: string, slug: string, date: string, cover: string, excerpt: string, tags: string[], status: string, body: string }}
 */
export function getEditorData() {
  const title = document.getElementById('post-title')?.value || '';
  const slug = document.getElementById('post-slug')?.value || '';
  const excerpt = document.getElementById('post-excerpt')?.value || '';
  const tagsRaw = document.getElementById('post-tags')?.value || '';
  const body = document.getElementById('post-body')?.value || '';
  const coverImg = document.getElementById('cover-preview');
  const cover = (coverImg && !coverImg.hidden) ? coverImg.src : '';
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return { title, slug, date: '', cover, excerpt, tags, status: '', body };
}

/**
 * Populate editor fields from a post object.
 * @param {object} post - Post data with title, slug, excerpt, tags, body, cover, etc.
 */
export function setEditorData(post) {
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const excerptInput = document.getElementById('post-excerpt');
  const tagsInput = document.getElementById('post-tags');
  const bodyInput = document.getElementById('post-body');
  const coverImg = document.getElementById('cover-preview');
  const clearCoverBtn = document.getElementById('clear-cover-btn');

  if (titleInput) titleInput.value = post.title || '';
  if (slugInput) slugInput.value = post.slug || '';
  if (excerptInput) excerptInput.value = post.excerpt || '';
  if (tagsInput) tagsInput.value = (post.tags || []).join(', ');
  if (bodyInput) bodyInput.value = post.body || '';

  if (post.cover && coverImg) {
    coverImg.src = post.cover;
    coverImg.hidden = false;
    if (clearCoverBtn) clearCoverBtn.hidden = false;
  }

  // Prevent overwriting existing slug
  slugManuallyEdited = true;
}

/**
 * Reset all editor fields to empty defaults.
 */
export function clearEditor() {
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const excerptInput = document.getElementById('post-excerpt');
  const tagsInput = document.getElementById('post-tags');
  const bodyInput = document.getElementById('post-body');
  const coverImg = document.getElementById('cover-preview');
  const clearCoverBtn = document.getElementById('clear-cover-btn');
  const preview = document.getElementById('post-preview');
  const textarea = document.getElementById('post-body');
  const toolbar = document.getElementById('blog-toolbar');

  if (titleInput) titleInput.value = '';
  if (slugInput) slugInput.value = '';
  if (excerptInput) excerptInput.value = '';
  if (tagsInput) tagsInput.value = '';
  if (bodyInput) bodyInput.value = '';

  if (coverImg) {
    coverImg.src = '';
    coverImg.hidden = true;
  }
  if (clearCoverBtn) clearCoverBtn.hidden = true;

  // Reset slug tracking
  slugManuallyEdited = false;

  // Switch to Write tab
  const tabs = document.querySelectorAll('.blog-editor-tab');
  tabs.forEach((t) => t.classList.remove('blog-editor-tab--active'));
  const writeTab = document.querySelector('[data-editor-tab="write"]');
  if (writeTab) writeTab.classList.add('blog-editor-tab--active');
  if (textarea) textarea.hidden = false;
  if (preview) {
    preview.hidden = true;
    preview.textContent = '';
  }
  if (toolbar) toolbar.hidden = false;
}

/**
 * Assemble YAML frontmatter and body into a complete markdown string.
 * @param {object} metadata - Post metadata (title, slug, date, cover, excerpt, tags, status)
 * @param {string} body - Post body markdown content
 * @returns {string} Complete markdown file content
 */
export function buildMarkdown(metadata, body) {
  const escTitle = (metadata.title || '').replace(/"/g, '\\"');
  const escExcerpt = (metadata.excerpt || '').replace(/"/g, '\\"');

  let fm = '---\n';
  fm += `title: "${escTitle}"\n`;
  fm += `slug: ${metadata.slug || ''}\n`;
  fm += `date: ${metadata.date || new Date().toISOString().split('T')[0]}\n`;
  if (metadata.cover) {
    fm += `cover: ${metadata.cover}\n`;
  }
  fm += `excerpt: "${escExcerpt}"\n`;
  if (metadata.tags && metadata.tags.length > 0) {
    fm += 'tags:\n';
    metadata.tags.forEach((tag) => {
      fm += `  - ${tag}\n`;
    });
  }
  fm += `status: ${metadata.status || 'draft'}\n`;
  fm += '---\n\n';

  return fm + (body || '');
}
