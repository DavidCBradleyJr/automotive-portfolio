# Phase 9: Blog Admin Editor - Research

**Researched:** 2026-03-25
**Domain:** Admin panel blog editor (vanilla JS), GitHub Contents API, markdown editing
**Confidence:** HIGH

## Summary

Phase 9 adds a "Blog" tab to the existing admin panel with a full markdown editor for creating, editing, and managing blog posts. The core technical challenges are: (1) a markdown editor with formatting toolbar and live preview using the already-installed `marked` library, (2) a gallery sidebar with drag-to-insert photo support, (3) Netlify Functions that use the GitHub Contents API to commit/update/delete markdown files in the repo, and (4) triggering rebuilds after changes.

The existing admin codebase provides strong patterns to follow: hash-based tab navigation (`tabs.js`), JWT auth via Netlify Identity (`auth.js`), signed Cloudinary uploads (`upload.js` + `sign-upload.mjs`), gallery image listing (`list-images.mjs`), and rebuild triggering (`trigger-rebuild.mjs`). The new Blog tab follows identical patterns -- the main novelty is the GitHub API integration and the markdown editor UI.

**Primary recommendation:** Build three new Netlify Functions (save-post, delete-post, list-posts) using the GitHub Contents API with a `GITHUB_TOKEN` personal access token. Use a `<textarea>` for the editor (not contenteditable) with toolbar buttons that insert markdown syntax at cursor position. Reuse the existing `list-images.mjs` endpoint for the gallery sidebar.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Tabs: Write | Preview** -- two tabs above the content area, switch between writing and previewing. Cleanest, most space-efficient.
- Formatting toolbar above the writing area with quick buttons for: bold, italic, headings (H2/H3), links, blockquote, lists (ordered/unordered), and image insert
- **Gallery sidebar** -- gallery images shown in a collapsible sidebar panel, drag into the editor to insert markdown image tag at cursor
- Also has an "Upload" button in the sidebar to upload a new photo directly
- New photos uploaded in the editor **auto-add to Cloudinary gallery** (user picks category) -- they appear in both the post and the gallery
- Photos use Cloudinary CDN URLs in the markdown
- New "Blog" tab in admin panel (alongside Upload, Gallery, Settings)
- **Card grid with cover thumbnails** -- shows cover image, title, date, draft/published status
- Click a card to open the editor for that post
- "New Post" button to create a fresh post
- Draft/published toggle -- drafts not visible on public site
- Delete post with confirmation
- **Save via Netlify Function + GitHub API** -- function commits the markdown file to the git repo on save/publish
- Auto-rebuild triggered after publish/edit/delete (per BDATA-05)

### Claude's Discretion
- Exact metadata field placement (above editor vs sidebar panel)
- Markdown parsing library for preview (marked already installed from Phase 8)
- GitHub API integration details (personal access token vs GitHub App)
- Gallery sidebar layout and drag implementation
- How cover image selection works (from gallery picker or URL input)
- Slug auto-generation logic
- Post deletion approach (remove file from git via GitHub API)

### Deferred Ideas (OUT OF SCOPE)
- RSS feed generation -- future enhancement
- Post scheduling (publish at a future date) -- future enhancement
- Markdown syntax highlighting in editor -- nice-to-have
- Image captions in blog posts -- could add later
- Post categories (separate from tags) -- future enhancement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDITOR-01 | New "Blog" tab in admin panel for creating and managing posts | Tab system pattern from `tabs.js` -- add 'blog' to VALID_TABS, add HTML section to `admin.html` |
| EDITOR-02 | Markdown editor with formatting toolbar (bold, italic, headings, links, blockquote, lists) | Textarea with `selectionStart`/`selectionEnd` API for inserting markdown syntax at cursor |
| EDITOR-03 | Live preview pane showing rendered markdown alongside the editor | `marked` (v17.0.5) already installed; Write/Preview tabs toggle between textarea and rendered HTML |
| EDITOR-04 | Insert photos from existing gallery images via image picker | Reuse `list-images.mjs` for gallery sidebar; drag from sidebar inserts `![alt](url)` at cursor |
| EDITOR-05 | Upload new photos directly in the editor (auto-added to Cloudinary gallery) | Reuse `sign-upload.mjs` signed upload pattern from `upload.js` |
| EDITOR-06 | Post metadata fields: title, slug (auto-generated, editable), cover image, excerpt, tags | Metadata fields above the editor; slug auto-generated from title using existing slug pattern |
| EDITOR-07 | Save as draft or publish -- drafts not visible on public site | Frontmatter `status: draft|published` field; `build-blog.js` already skips drafts |
| EDITOR-08 | Edit and delete existing posts from the Blog tab | GitHub Contents API GET for listing/reading, PUT for update, DELETE for removal |
| BDATA-05 | Auto-rebuild triggered after post publish/edit/delete | Reuse existing `trigger-rebuild.mjs` function (calls `NETLIFY_BUILD_HOOK`) |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| marked | 17.0.5 | Markdown to HTML rendering for preview | Already installed, used by build-blog.js |
| gray-matter | 4.0.3 | Frontmatter parsing (build-side only) | Already installed, used by build-blog.js |
| netlify-identity-widget | 2.0.3 | JWT auth for admin | Already the auth system |
| sortablejs | 1.15.7 | Drag reorder (already used in gallery) | Could reuse for sidebar if needed |

### Supporting (No New Installs Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Cloudinary SDK | 2.9.0 | Server-side image operations | Already in Netlify Functions |

### External API
| Service | Purpose | Auth Method |
|---------|---------|-------------|
| GitHub Contents API | Commit/read/delete markdown files in repo | Personal access token (`GITHUB_TOKEN` env var) |
| Cloudinary | Image storage and CDN | Existing signed upload flow |
| Netlify Build Hook | Trigger rebuild after changes | Existing `NETLIFY_BUILD_HOOK` env var |

**No new npm packages needed.** Everything required is already installed.

## Architecture Patterns

### New Files Structure
```
src/admin/components/
  blog-editor.js          # Main blog editor component (editor UI, toolbar, preview)
  blog-manager.js         # Post list grid, CRUD orchestration
  blog-gallery-sidebar.js # Gallery sidebar for image insertion

netlify/functions/
  save-post.mjs           # GitHub API: create or update post file
  delete-post.mjs         # GitHub API: delete post file
  list-posts.mjs          # GitHub API: list content/blog/ directory

admin.html                # Add Blog tab button + panel section
```

### Modified Files
```
src/admin/admin.js        # Import and init blog components
src/admin/components/tabs.js  # Add 'blog' to VALID_TABS
src/admin/admin.css       # Blog editor styles
```

### Pattern 1: GitHub Contents API via Netlify Function

The GitHub Contents API requires Base64-encoded content and SHA for updates/deletes.

**Create a new post:**
```javascript
// netlify/functions/save-post.mjs
// PUT /repos/{owner}/{repo}/contents/content/blog/{slug}.md
const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/contents/content/blog/${slug}.md`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `blog: ${isNew ? 'create' : 'update'} "${title}"`,
      content: btoa(unescape(encodeURIComponent(markdownContent))), // Base64 encode UTF-8
      sha: existingSha || undefined, // Required for updates, omit for creates
    }),
  }
);
```

**Key detail: SHA tracking.** To update or delete a file, you MUST provide the current blob SHA. The `list-posts` function returns each file's SHA, and `save-post` returns the new SHA after writing. Store the SHA in the editor state so updates work without an extra API call.

**Key detail: Base64 encoding.** The GitHub API requires Base64-encoded content. For UTF-8 markdown, use `btoa(unescape(encodeURIComponent(content)))` in the Netlify Function (Node.js can use `Buffer.from(content).toString('base64')`).

### Pattern 2: Textarea Markdown Editor with Toolbar

Use a plain `<textarea>` (not contenteditable) for the markdown editor. This is the standard approach because:
- `selectionStart`/`selectionEnd` give reliable cursor position
- No HTML parsing complexity
- Native undo/redo works automatically
- Paste behavior is predictable

```javascript
// Insert markdown syntax at cursor position
function insertAtCursor(textarea, before, after = '') {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const replacement = before + (selectedText || 'text') + after;

  textarea.setRangeText(replacement, start, end, 'select');
  textarea.focus();

  // Adjust selection to highlight just the inner text
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + (selectedText || 'text').length;
}

// Toolbar button handlers
const toolbarActions = {
  bold:       (ta) => insertAtCursor(ta, '**', '**'),
  italic:     (ta) => insertAtCursor(ta, '_', '_'),
  h2:         (ta) => insertAtCursor(ta, '## ', '\n'),
  h3:         (ta) => insertAtCursor(ta, '### ', '\n'),
  link:       (ta) => insertAtCursor(ta, '[', '](url)'),
  blockquote: (ta) => insertAtCursor(ta, '> ', '\n'),
  ul:         (ta) => insertAtCursor(ta, '- ', '\n'),
  ol:         (ta) => insertAtCursor(ta, '1. ', '\n'),
};
```

### Pattern 3: Gallery Sidebar with Drag-to-Insert

The gallery sidebar reuses the existing `list-images.mjs` endpoint. Images are displayed as a thumbnail grid. Dragging an image onto the textarea inserts a markdown image tag.

```javascript
// Make gallery thumbnails draggable
img.draggable = true;
img.addEventListener('dragstart', (e) => {
  const fullUrl = image.full_url; // Cloudinary CDN URL
  const alt = image.alt || image.caption || '';
  e.dataTransfer.setData('text/plain', `![${alt}](${fullUrl})`);
  e.dataTransfer.effectAllowed = 'copy';
});

// Textarea drop handler
textarea.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

textarea.addEventListener('drop', (e) => {
  e.preventDefault();
  const markdownImg = e.dataTransfer.getData('text/plain');
  // Insert at drop position
  const pos = textarea.selectionStart;
  textarea.setRangeText(markdownImg + '\n', pos, pos, 'end');
});
```

**Important:** For textarea drop, the browser may not set `selectionStart` to the drop position automatically. A fallback is to insert at the current cursor position or append.

### Pattern 4: Frontmatter Assembly

Posts are stored as YAML frontmatter + markdown body, matching the existing format:

```yaml
---
title: "Post Title"
slug: post-slug
date: 2026-03-25
cover: https://res.cloudinary.com/dl0atmtb7/image/upload/w_1600,f_auto,q_auto/v1/gallery/jdm/blue-supra
excerpt: "Short description for post cards and SEO."
tags:
  - Tag One
  - Tag Two
status: published
---

Markdown body content here...
```

The function assembles this from the editor's metadata fields and body content:

```javascript
function buildMarkdown(metadata, body) {
  const frontmatter = [
    '---',
    `title: "${metadata.title}"`,
    `slug: ${metadata.slug}`,
    `date: ${metadata.date}`,
    `cover: ${metadata.cover}`,
    `excerpt: "${metadata.excerpt}"`,
    'tags:',
    ...metadata.tags.map(t => `  - ${t}`),
    `status: ${metadata.status}`,
    '---',
    '',
    body,
  ].join('\n');
  return frontmatter;
}
```

### Pattern 5: Slug Auto-Generation

```javascript
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
```

This matches the existing `generateSlug` pattern in `upload.js`.

### Pattern 6: Cover Image Selection

**Recommendation:** Use a "Pick from Gallery" button that opens a modal/popover with gallery thumbnails (reusing `list-images.mjs` data). Clicking a thumbnail sets the cover URL. This is simpler than drag-and-drop for a single selection and avoids needing a separate URL input.

### Anti-Patterns to Avoid
- **ContentEditable for markdown editing:** Do not use contenteditable divs. They have unpredictable behavior with paste, undo, and cursor positioning. Use a plain textarea.
- **Storing posts in a database or API:** Posts are markdown files in git. The build pipeline already works with this. Don't add a database layer.
- **Client-side GitHub API calls:** Never expose the GitHub token to the browser. All GitHub API calls go through Netlify Functions.
- **Parsing frontmatter on the client:** The admin doesn't need `gray-matter`. Assemble frontmatter as a string template. Only the build script needs to parse it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom parser | `marked` (already installed) | Edge cases in spec, tables, code blocks |
| Image upload | New upload flow | Existing `sign-upload.mjs` + `upload.js` pattern | Signed upload, progress tracking, all working |
| Gallery image listing | New API endpoint | Existing `list-images.mjs` | Already returns thumbnails with metadata |
| Rebuild triggering | New webhook logic | Existing `trigger-rebuild.mjs` | Already wired to `NETLIFY_BUILD_HOOK` |
| JWT auth in functions | Custom auth | `context.clientContext.user` pattern | Netlify Identity handles JWT validation |
| Toast notifications | Custom notification system | Existing `showToast()` from `toast.js` | Already styled, animated, accessible |
| Base64 encoding | Manual implementation | `Buffer.from().toString('base64')` | Node.js built-in, handles UTF-8 correctly |

## Common Pitfalls

### Pitfall 1: GitHub API SHA Requirement for Updates
**What goes wrong:** Attempting to update a file without providing the current SHA results in a 409 Conflict error.
**Why it happens:** GitHub uses the SHA to detect concurrent edits and prevent data loss.
**How to avoid:** When listing posts, store each file's SHA. When saving, include the SHA. After a successful save, update the stored SHA with the value returned by the API. For new files, omit the SHA.
**Warning signs:** 409 errors on save, or 422 validation errors.

### Pitfall 2: Base64 Encoding UTF-8 Content
**What goes wrong:** `btoa()` fails on non-ASCII characters (emojis, accented characters in blog posts).
**Why it happens:** `btoa()` only handles Latin-1 characters.
**How to avoid:** In Netlify Functions (Node.js), use `Buffer.from(content, 'utf-8').toString('base64')`. Never use `btoa()` directly on content that may contain non-ASCII.
**Warning signs:** "InvalidCharacterError" or garbled text in committed files.

### Pitfall 3: Textarea Drag-Drop Cursor Position
**What goes wrong:** When dropping an image onto a textarea, the browser may not reliably set `selectionStart` to the mouse drop position.
**Why it happens:** Browser behavior varies -- some set it, some don't.
**How to avoid:** Use `document.caretPositionFromPoint()` or `document.caretRangeFromPoint()` to calculate the drop position from mouse coordinates. Alternatively, accept inserting at the current cursor position as the simpler fallback.
**Warning signs:** Images always inserted at the beginning or end instead of where dropped.

### Pitfall 4: Concurrent GitHub API Operations
**What goes wrong:** Parallel save and delete operations on the same repo path cause conflicts.
**Why it happens:** GitHub's Contents API requires serial operations when modifying the same branch.
**How to avoid:** Disable the save/delete buttons while an operation is in progress. Show "Saving..." state (same pattern as upload button in `upload.js`).
**Warning signs:** 409 Conflict errors, lost changes.

### Pitfall 5: VALID_TABS Array Not Updated
**What goes wrong:** Adding a Blog tab button to `admin.html` but not updating the `VALID_TABS` array in `tabs.js` causes the tab to be ignored and default to 'upload'.
**Why it happens:** `showTab()` checks `VALID_TABS.includes(id)` and falls back to DEFAULT_TAB.
**How to avoid:** Add `'blog'` to the `VALID_TABS` array in `tabs.js`.
**Warning signs:** Clicking Blog tab does nothing or shows Upload tab.

### Pitfall 6: Slug Collisions on Rename
**What goes wrong:** Editing a post title that changes the slug creates a new file and orphans the old one.
**Why it happens:** The filename is derived from the slug. Changing the slug means a different file path.
**How to avoid:** When editing, keep the original slug. Either make slug read-only after creation, or handle rename as delete-old + create-new (two GitHub API calls, done serially).
**Warning signs:** Duplicate posts appearing, old posts becoming orphaned files.

## Code Examples

### Netlify Function: List Posts via GitHub API
```javascript
// netlify/functions/list-posts.mjs
// GET /repos/{owner}/{repo}/contents/content/blog
export const handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };

  const res = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/content/blog`,
    {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!res.ok) {
    if (res.status === 404) return { statusCode: 200, body: JSON.stringify({ posts: [] }) };
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const files = await res.json();
  const mdFiles = files.filter(f => f.name.endsWith('.md'));

  // Fetch each file's content to extract frontmatter
  const posts = await Promise.all(mdFiles.map(async (f) => {
    const contentRes = await fetch(f.url, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    const data = await contentRes.json();
    const decoded = Buffer.from(data.content, 'base64').toString('utf-8');

    // Simple frontmatter extraction (no gray-matter needed server-side)
    const fmMatch = decoded.match(/^---\n([\s\S]*?)\n---/);
    const fm = {};
    if (fmMatch) {
      fmMatch[1].split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) fm[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
      });
    }

    return {
      slug: f.name.replace('.md', ''),
      sha: data.sha,
      title: fm.title || f.name,
      date: fm.date || '',
      cover: fm.cover || '',
      excerpt: fm.excerpt || '',
      status: fm.status || 'draft',
    };
  }));

  return { statusCode: 200, body: JSON.stringify({ posts }) };
};
```

**Performance note:** This fetches each file individually. For a portfolio blog with < 50 posts, this is fine. If performance becomes a concern, consider caching or using the Git Trees API.

### Admin HTML: Blog Tab Addition
```html
<!-- In admin-tabs nav -->
<button class="admin-tab" data-tab="blog">Blog</button>

<!-- In admin-content main -->
<section id="panel-blog" class="admin-panel-section">
  <!-- Post list view (shown by default) -->
  <div id="blog-list-view">
    <div class="blog-controls">
      <h2>Blog Posts</h2>
      <button id="new-post-btn" class="btn btn--primary">New Post</button>
    </div>
    <div id="blog-post-grid" class="blog-post-grid">
      <p class="admin-placeholder">Loading posts...</p>
    </div>
  </div>

  <!-- Editor view (hidden until editing) -->
  <div id="blog-editor-view" hidden>
    <!-- Metadata fields, toolbar, textarea, preview, gallery sidebar -->
  </div>
</section>
```

### Metadata Fields Recommendation
**Placement: Above the editor area.** This keeps the most important fields (title, slug, cover) visible without scrolling. Tags and excerpt can be in a collapsible "Details" section below the metadata to reduce visual noise.

```
+--------------------------------------------------+
| [< Back to Posts]                    [Save Draft] [Publish] |
+--------------------------------------------------+
| Title: [________________________]                 |
| Slug:  [________________________] (auto-gen)     |
| Cover: [thumbnail] [Pick from Gallery]           |
| Excerpt: [________________________]              |
| Tags:  [tag input with chips]                    |
+--------------------------------------------------+
| [Write] [Preview]                  | Gallery |   |
| +------------------------------+  | [img][img]| |
| | <textarea>                   |  | [img][img]| |
| |                              |  | [Upload]  | |
| |                              |  |           | |
| +------------------------------+  +-----------+ |
+--------------------------------------------------+
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GitHub API v3 (REST) | GitHub API v3 (REST) still current | Stable | REST Contents API is the correct choice for single-file operations |
| `btoa()` for Base64 | `Buffer.from().toString('base64')` | Always | Node.js approach handles UTF-8; btoa is browser-only |
| ContentEditable editors | Textarea with toolbar | Current best practice for markdown | Simpler, more predictable, native undo/redo |

## Open Questions

1. **GitHub Token Scope**
   - What we know: A Personal Access Token (classic) with `repo` scope works. Fine-grained tokens can scope to specific repos.
   - What's unclear: Whether David has already created a `GITHUB_TOKEN` or if setup instructions are needed.
   - Recommendation: Use a fine-grained PAT scoped to this repo only with "Contents: Read and write" permission. Document the setup in the plan.

2. **GitHub Repo Owner/Name**
   - What we know: The function needs `GITHUB_OWNER` and `GITHUB_REPO` env vars (or a combined `GITHUB_REPO` like "owner/repo").
   - What's unclear: The exact repo name and owner.
   - Recommendation: Use env vars `GITHUB_OWNER` and `GITHUB_REPO` so it works regardless of repo name. These get set in Netlify dashboard alongside `GITHUB_TOKEN`.

3. **Post List Performance**
   - What we know: GitHub API rate limit is 5000 req/hour for authenticated requests. Listing N posts requires N+1 API calls (directory listing + N file fetches).
   - What's unclear: Whether this will be slow for many posts.
   - Recommendation: For < 20 posts this is fine. If it becomes slow, add a simple server-side cache or switch to Git Trees API for bulk reads.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual testing (no automated test framework in project) |
| Config file | None |
| Quick run command | Manual: open `/admin#blog` in browser |
| Full suite command | Manual walkthrough of all CRUD operations |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDITOR-01 | Blog tab appears, switches correctly | manual | Open `/admin#blog`, verify tab navigation | N/A |
| EDITOR-02 | Toolbar buttons insert markdown at cursor | manual | Click each toolbar button, verify insertion | N/A |
| EDITOR-03 | Preview tab renders markdown as HTML | manual | Type markdown, switch to Preview, verify rendered HTML | N/A |
| EDITOR-04 | Gallery sidebar shows images, drag inserts markdown | manual | Drag image from sidebar to textarea, verify `![alt](url)` inserted | N/A |
| EDITOR-05 | Upload in editor adds to Cloudinary, appears in sidebar | manual | Upload photo via sidebar, verify it appears in gallery | N/A |
| EDITOR-06 | Metadata fields populate frontmatter correctly | manual | Fill fields, save, verify committed file has correct frontmatter | N/A |
| EDITOR-07 | Draft/publish toggle works, drafts skipped in build | manual | Save as draft, run build, verify post not in output | N/A |
| EDITOR-08 | Edit loads existing post, delete removes it | manual | Edit a post, verify changes saved; delete, verify file removed from repo | N/A |
| BDATA-05 | Rebuild triggers after save/delete | manual | Save post, verify Netlify build triggered | N/A |

### Sampling Rate
- **Per task commit:** Manual smoke test of affected feature
- **Per wave merge:** Full CRUD walkthrough (create, edit, publish, delete)
- **Phase gate:** All 9 requirements manually verified

### Wave 0 Gaps
None -- this project has no automated test framework. All validation is manual browser testing, consistent with previous phases.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Netlify Functions, build | Yes | 25.6.1 | -- |
| marked | Preview rendering | Yes | 17.0.5 (devDep) | -- |
| gray-matter | Build pipeline (not editor) | Yes | 4.0.3 (devDep) | -- |
| GitHub API | Post CRUD via Functions | Yes (external) | REST v3 | -- |
| GITHUB_TOKEN env var | GitHub API auth | Unknown | -- | Must be created and set in Netlify dashboard |
| GITHUB_OWNER env var | GitHub API repo reference | Unknown | -- | Must be set in Netlify dashboard |
| GITHUB_REPO env var | GitHub API repo reference | Unknown | -- | Must be set in Netlify dashboard |
| NETLIFY_BUILD_HOOK | Rebuild trigger | Yes (existing) | -- | -- |
| Cloudinary env vars | Image upload | Yes (existing) | -- | -- |

**Missing dependencies with no fallback:**
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` env vars must be created and set in Netlify dashboard before the GitHub API functions will work.

**Missing dependencies with fallback:**
- None

## Sources

### Primary (HIGH confidence)
- Project source code: `src/admin/admin.js`, `src/admin/components/tabs.js`, `src/admin/components/upload.js`, `src/admin/components/gallery-view.js`, `src/admin/components/auth.js`
- Project source code: `netlify/functions/sign-upload.mjs`, `netlify/functions/trigger-rebuild.mjs`, `netlify/functions/list-images.mjs`
- Project source code: `scripts/build-blog.js`, `content/blog/first-track-day.md`
- [GitHub REST API: Repository Contents](https://docs.github.com/en/rest/repos/contents) -- official API documentation for file CRUD
- [MDN: HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) -- drag operations reference

### Secondary (MEDIUM confidence)
- [MDN: Drag Operations](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations) -- DataTransfer usage patterns

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries needed, all existing tools verified in codebase
- Architecture: HIGH -- follows established admin patterns, GitHub API is well-documented
- Pitfalls: HIGH -- based on known API constraints (SHA requirement, Base64 encoding) and browser behavior

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- no fast-moving dependencies)
