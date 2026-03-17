# Phase 7: Admin Image Management - Research

**Researched:** 2026-03-17
**Domain:** Cloudinary Admin API, drag-and-drop reorder, vanilla JS modal UI
**Confidence:** HIGH

## Summary

This phase adds edit, soft-delete (with trash/restore), and drag-and-drop reorder to the existing read-only Gallery tab in the admin panel. The core backend work revolves around Cloudinary's Admin and Upload APIs -- `cloudinary.api.update()` for metadata edits, `cloudinary.uploader.add_tag()`/`remove_tag()` for soft-delete flagging, and `cloudinary.uploader.rename()` for category changes (folder moves). The frontend work involves a modal edit form, a trash toggle/filter, and a drag-and-drop reorder grid.

The existing `list-images.mjs` function, `gallery-view.js` component, and `build-gallery-data.js` script all need modifications. Three to four new Netlify Functions are needed: `update-image.mjs`, `delete-image.mjs` (soft-delete via tag), `restore-image.mjs`, and `reorder-images.mjs`. The build script needs to filter out hidden images and respect sort order.

**Primary recommendation:** Use Cloudinary tags for soft-delete (`hidden` tag), Cloudinary contextual metadata for sort order (`sort_order` field), and SortableJS (1.15.x) for drag-and-drop. Use `cloudinary.uploader.rename()` to move images between category folders when category changes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Modal overlay for editing -- click "Edit" on a gallery card opens a modal with full image preview + editable fields
- Editable fields: category (dropdown), caption (text), alt text (text)
- Category change is allowed -- moves image to a different Cloudinary folder
- Save button in modal persists changes to Cloudinary metadata
- Toast notification on success, modal closes after save
- Soft delete -- image gets tagged as hidden in Cloudinary, not permanently removed
- Hidden images don't appear in the public gallery (build script filters them out)
- "Trash" section in Gallery tab -- toggle/filter to show hidden images
- "Restore" button on hidden images to bring them back
- No hard delete from admin panel -- use Cloudinary dashboard if needed
- Rebuild triggered after delete/restore (same as upload)
- Drag-and-drop reorder within the gallery grid
- Per-category scope -- filter by category first, then drag to reorder within that category
- Order stored as Cloudinary metadata (sort_order field) or a config file fetched at build time
- Build script respects sort order when generating gallery-images.js

### Claude's Discretion
- Drag-and-drop library choice (or vanilla JS implementation)
- How sort order is persisted (Cloudinary metadata vs JSON config)
- Edit modal exact layout and field arrangement
- How category change is implemented (rename in Cloudinary vs delete + re-upload)
- Confirmation UX for soft delete
- How "Trash" toggle appears in the Gallery tab UI

### Deferred Ideas (OUT OF SCOPE)
- Hard delete option -- use Cloudinary dashboard for now
- Bulk edit/delete (select multiple images) -- future enhancement
- BTS image management via admin -- could be a future phase
- Cloudinary watermark/logo overlay -- separate phase
- Live Instagram/TikTok social feed -- future phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MGMT-01 | View all uploaded gallery images in a grid with metadata | Existing `gallery-view.js` + `list-images.mjs` already provide this; needs category filter and trash toggle additions |
| MGMT-02 | Edit category, caption, and alt text on existing images | New `update-image.mjs` function using `cloudinary.api.update()` for metadata + `cloudinary.uploader.rename()` for category change; modal UI on frontend |
| MGMT-03 | Delete images from gallery (removes from Cloudinary + metadata) | Soft-delete via `cloudinary.uploader.add_tag('hidden', [public_id])`; new `delete-image.mjs` and `restore-image.mjs` functions; build script filters `hidden` tag |
| MGMT-04 | Reorder images within categories via drag or sort controls | SortableJS for drag-and-drop UI; sort_order stored as Cloudinary contextual metadata; new `reorder-images.mjs` function; build script respects sort_order |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cloudinary | ^2.9.0 | Server-side Cloudinary API (update, rename, tag, search) | Already in devDependencies, proven pattern in existing functions |
| sortablejs | 1.15.7 | Drag-and-drop grid reorder | Most popular vanilla JS DnD library, 29K GitHub stars, touch support, no framework dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| netlify-identity-widget | ^2.0.3 | JWT auth for admin | Already installed, used by all Netlify Functions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SortableJS | Vanilla HTML5 DnD API | HTML5 DnD has no touch support, poor grid support, and significant boilerplate for reorder state management. SortableJS at ~10KB gzip is worth the dependency. |
| SortableJS | html5sortable (2KB) | Smaller but less maintained, fewer features, less grid support |
| Cloudinary metadata for sort_order | JSON config file | Config file requires separate storage/management; Cloudinary metadata keeps everything in one place and is already the established pattern |

**Installation:**
```bash
npm install sortablejs
```

**Version verification:** SortableJS 1.15.7 is the latest stable release (verified via npm registry).

## Architecture Patterns

### Recommended Project Structure
```
netlify/functions/
  list-images.mjs          # MODIFY: add hidden filter param, return sort_order
  update-image.mjs         # NEW: update metadata + rename for category change
  delete-image.mjs         # NEW: add 'hidden' tag (soft delete)
  restore-image.mjs        # NEW: remove 'hidden' tag
  reorder-images.mjs       # NEW: batch update sort_order metadata

src/admin/
  components/
    gallery-view.js        # MODIFY: add edit/delete buttons, category filter, trash toggle, DnD
    edit-modal.js           # NEW: modal overlay for editing image metadata
  admin.css                # MODIFY: add modal, trash, DnD, and filter styles

scripts/
  build-gallery-data.js    # MODIFY: filter hidden, sort by sort_order

admin.html                 # MODIFY: add modal markup, category filter, trash toggle
```

### Pattern 1: Cloudinary Admin API Update
**What:** Use `cloudinary.api.update()` for metadata changes (caption, alt, sort_order) and `cloudinary.uploader.rename()` for category changes (folder move).
**When to use:** When editing image metadata or changing an image's category.
**Example:**
```javascript
// Source: Cloudinary Node.js SDK docs
// Update contextual metadata (caption, alt text, sort_order)
await cloudinary.api.update(public_id, {
  context: `caption=${caption}|alt=${alt}|sort_order=${sortOrder}`,
});

// Move image to new category folder (rename changes public_id path)
await cloudinary.uploader.rename(
  'gallery/jdm/blue-supra',       // from_public_id
  'gallery/euro/blue-supra',       // to_public_id
  { overwrite: false }
);
```

### Pattern 2: Tag-Based Soft Delete
**What:** Use Cloudinary tags to mark images as hidden without removing them.
**When to use:** Soft-delete and restore operations.
**Example:**
```javascript
// Source: Cloudinary Upload API docs
// Soft delete -- add 'hidden' tag
await cloudinary.uploader.add_tag('hidden', [public_id]);

// Restore -- remove 'hidden' tag
await cloudinary.uploader.remove_tag('hidden', [public_id]);

// Search excluding hidden (in list-images)
cloudinary.search
  .expression('folder:gallery/* AND -tags:hidden')
  .with_field('context')
  .with_field('tags')
  .max_results(200)
  .execute();

// Search only hidden (for trash view)
cloudinary.search
  .expression('folder:gallery/* AND tags:hidden')
  .with_field('context')
  .with_field('tags')
  .max_results(200)
  .execute();
```

### Pattern 3: SortableJS Grid Reorder
**What:** Wrap the gallery grid with SortableJS for drag-and-drop reorder.
**When to use:** When user filters to a specific category and wants to reorder.
**Example:**
```javascript
// Source: SortableJS GitHub README
import Sortable from 'sortablejs';

const grid = document.getElementById('gallery-grid');
const sortable = Sortable.create(grid, {
  animation: 150,
  ghostClass: 'sortable-ghost',
  onEnd(evt) {
    // evt.oldIndex, evt.newIndex -- compute new sort_order values
    const items = Array.from(grid.children);
    const newOrder = items.map((el, i) => ({
      public_id: el.dataset.publicId,
      sort_order: i,
    }));
    saveSortOrder(newOrder);
  },
});
```

### Pattern 4: Netlify Function Boilerplate (Established)
**What:** All new functions follow the same JWT auth + CORS + error handling pattern.
**When to use:** Every new function.
**Example:**
```javascript
// Source: existing upload-image.mjs / list-images.mjs
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  // ... function logic
};
```

### Pattern 5: Modal Overlay (Vanilla JS)
**What:** A full-screen overlay with centered modal card, built with safe DOM methods.
**When to use:** Edit image form.
**Example:**
```javascript
// Follows the project's safe DOM construction pattern (no innerHTML)
function openEditModal(image) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEditModal();
  });

  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  // ... build form fields using safe DOM methods
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
```

### Anti-Patterns to Avoid
- **innerHTML for modal construction:** The project uses safe DOM methods throughout (createElement, textContent). Never use innerHTML -- follow the existing pattern in upload.js and gallery-view.js.
- **Single monolithic function for all operations:** Split edit/delete/restore/reorder into separate Netlify Functions. The project already separates upload, sign-upload, list-images, and trigger-rebuild.
- **Storing sort order in a separate JSON file:** Cloudinary contextual metadata keeps sort order co-located with the image. A separate file adds deployment complexity and sync risks.
- **Hard-coding category lists in multiple places:** The categoryLabels map exists in gallery-view.js, build-gallery-data.js, and admin.html. Add categories to admin.html select elements but reference the existing maps in JS.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop grid reorder | Custom HTML5 DnD with position tracking | SortableJS | Touch support, animation, grid awareness, edge-case handling (scroll, nested) |
| Modal focus trap | Custom tab-key handler | Simple overlay click-to-close + Escape key | Full focus trap is complex; for a single-user admin panel, click-outside and Escape key are sufficient |
| Cloudinary API calls | Raw fetch to Cloudinary REST API | cloudinary Node.js SDK (v2) | Already installed, handles auth signing, provides typed methods |

**Key insight:** The Cloudinary Node.js SDK handles all the API complexity (signing, pagination, error mapping). Every server-side operation should go through the SDK, never raw HTTP.

## Common Pitfalls

### Pitfall 1: Rename Breaks Delivery URLs
**What goes wrong:** Using `cloudinary.uploader.rename()` changes the public_id, which means all existing delivery URLs (thumbnails, full-size) become invalid.
**Why it happens:** The public_id is part of the Cloudinary CDN URL. Changing the folder path in the public_id changes the URL.
**How to avoid:** This is expected behavior. After a rename (category change), the build script regenerates gallery-images.js with new URLs, and the next deploy serves correct URLs. The admin panel should refresh the gallery view after a category change. Trigger a rebuild after category changes.
**Warning signs:** Broken images on the public site between rename and rebuild.

### Pitfall 2: Context Metadata Format Inconsistency
**What goes wrong:** Cloudinary stores context metadata differently depending on how it was set. The pipe-delimited string format (`caption=value|alt=value`) and the object format (`{ caption: 'value' }`) result in different retrieval paths.
**Why it happens:** The Upload API uses pipe-delimited format for the context parameter, while the Admin API update accepts it too. But retrieval may be at `resource.context.custom.caption` or `resource.context.caption`.
**How to avoid:** The existing code already handles both paths (see list-images.mjs lines 54-55 and build-gallery-data.js lines 170-171). Continue this pattern. Always use pipe-delimited format when setting context via API calls to maintain consistency.
**Warning signs:** Empty captions/alt text after editing.

### Pitfall 3: SortableJS and CSS Grid Conflicts
**What goes wrong:** SortableJS may have issues with CSS Grid layouts when items have gaps or varying sizes.
**Why it happens:** SortableJS calculates positions based on element positions; CSS Grid gaps can cause offset miscalculations.
**How to avoid:** The existing `.admin-gallery-grid` uses `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` with consistent card sizes (3:2 aspect ratio). This uniform grid works well with SortableJS. Ensure the `forceFallback: true` option is set if touch devices have issues.
**Warning signs:** Items jumping to wrong positions during drag.

### Pitfall 4: Race Condition on Batch Sort Order Update
**What goes wrong:** Updating sort_order for many images sequentially is slow (one API call per image), and parallel calls may hit rate limits.
**Why it happens:** Cloudinary's Admin API has rate limits (500 calls/hour on free plan). Updating 20+ images in parallel could hit limits.
**How to avoid:** Batch the sort order into a single Netlify Function call that updates images sequentially server-side with small delays. Or, use `cloudinary.api.update()` in a loop with rate-limiting. The free plan allows 500 API calls/hour which is plenty for sequential single-category reorder.
**Warning signs:** 429 Too Many Requests errors from Cloudinary.

### Pitfall 5: Search API Tag Filtering Syntax
**What goes wrong:** Using incorrect search expression syntax to filter by tags.
**Why it happens:** Cloudinary search expressions have specific syntax: `tags:hidden` (not `tag:hidden`).
**How to avoid:** Use `AND -tags:hidden` to exclude hidden images, `AND tags:hidden` to show only hidden images. Test the search expression in Cloudinary console first.
**Warning signs:** Hidden images still showing in gallery, or trash view showing all images.

## Code Examples

### Update Image Metadata (Netlify Function)
```javascript
// Source: Cloudinary Admin API docs + existing project patterns
// netlify/functions/update-image.mjs

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ /* same as other functions */ });

export const handler = async (event, context) => {
  // ... standard CORS + JWT validation ...

  const { public_id, caption, alt, category, sort_order } = JSON.parse(event.body);

  // Build context string (pipe-delimited format)
  const contextParts = [];
  if (caption !== undefined) contextParts.push(`caption=${caption}`);
  if (alt !== undefined) contextParts.push(`alt=${alt}`);
  if (sort_order !== undefined) contextParts.push(`sort_order=${sort_order}`);

  // Update metadata
  if (contextParts.length > 0) {
    await cloudinary.api.update(public_id, {
      context: contextParts.join('|'),
    });
  }

  // Handle category change (folder move via rename)
  if (category) {
    const parts = public_id.split('/');
    const filename = parts[parts.length - 1];
    const newPublicId = `gallery/${category}/${filename}`;

    if (newPublicId !== public_id) {
      await cloudinary.uploader.rename(public_id, newPublicId, {
        overwrite: false,
      });
      return { /* return new public_id so frontend can update */ };
    }
  }

  return { /* success response */ };
};
```

### Soft Delete / Restore (Netlify Functions)
```javascript
// netlify/functions/delete-image.mjs
const { public_id } = JSON.parse(event.body);
await cloudinary.uploader.add_tag('hidden', [public_id]);
// Trigger rebuild to remove from public gallery

// netlify/functions/restore-image.mjs
const { public_id } = JSON.parse(event.body);
await cloudinary.uploader.remove_tag('hidden', [public_id]);
// Trigger rebuild to restore to public gallery
```

### Build Script Filter + Sort Order
```javascript
// In build-gallery-data.js, modify the search expression:
const result = await cloudinary.search
  .expression('folder:gallery/* AND -tags:hidden')
  .with_field('context')
  .with_field('tags')
  .sort_by('public_id', 'asc')
  .max_results(500)
  .execute();

// After building galleryImages array, sort by sort_order then fallback:
galleryImages.sort((a, b) => {
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  // Within same category, sort by sort_order (lower first), fallback to id
  const orderA = a.sort_order ?? 999;
  const orderB = b.sort_order ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return a.id.localeCompare(b.id);
});
```

### Edit Modal CSS Pattern
```css
/* Modal overlay -- consistent with dark theme */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
}

.edit-modal {
  background: #1a1a1a;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-lg);
  max-width: 700px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cloudinary fixed folder mode | Dynamic folder mode | 2023 | `asset_folder` decoupled from `public_id`; but this project uses fixed-style paths in public_id, so `rename()` is the correct approach for folder moves |
| Custom DnD with mousedown/mousemove | SortableJS / native HTML5 DnD | Stable since 2020 | SortableJS remains the standard; HTML5 DnD improved but still lacks touch and grid support |
| `context` as pipe-delimited string only | `context` supports both pipe-delimited and object form | Cloudinary SDK v2 | The project already handles both formats; continue using pipe-delimited for API calls |

**Deprecated/outdated:**
- `cloudinary.v2.uploader.upload()` callback style: Use promise-based (async/await) style, which the project already does.

## Open Questions

1. **Cloudinary folder mode for this account**
   - What we know: The existing code uses `gallery/{category}/{slug}` as public_id and checks both `asset_folder` and `public_id` for category extraction, suggesting dynamic folder mode may be enabled.
   - What's unclear: Whether `rename()` will work as expected with the account's folder mode settings.
   - Recommendation: Test `rename()` with a single image first during implementation. If dynamic folder mode causes issues, fall back to `cloudinary.api.update()` with `asset_folder` parameter.

2. **Sort order for existing images**
   - What we know: Existing images have no `sort_order` metadata.
   - What's unclear: What the initial sort order should be for existing images.
   - Recommendation: Treat missing `sort_order` as a high number (999) so existing images appear in their current alphabetical order. New sort orders assigned via drag-and-drop will take precedence.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework in project |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MGMT-01 | Gallery grid shows images with metadata + category filter + trash toggle | manual-only | Manual: open admin, switch to Gallery tab, verify grid loads with filter/toggle | N/A |
| MGMT-02 | Edit modal saves caption/alt/category changes to Cloudinary | manual-only | Manual: click Edit, change fields, save, verify toast + Cloudinary dashboard | N/A |
| MGMT-03 | Soft delete hides image, trash shows it, restore brings it back | manual-only | Manual: delete image, toggle trash, restore, verify build script filters | N/A |
| MGMT-04 | Drag-and-drop reorder persists sort_order to Cloudinary metadata | manual-only | Manual: filter to category, drag cards, verify order persists on reload | N/A |

**Justification for manual-only:** This is a single-user admin panel with vanilla JS (no component testing framework), Netlify Functions (require deployed environment for JWT auth), and Cloudinary API calls (require live credentials). The effort to set up integration testing infrastructure exceeds the value for a single-admin portfolio site. Verification is most efficiently done by manual testing against the deployed preview.

### Sampling Rate
- **Per task commit:** Manual smoke test -- open admin panel, verify feature works
- **Per wave merge:** Full manual walkthrough of all MGMT requirements
- **Phase gate:** All four MGMT requirements verified manually before `/gsd:verify-work`

### Wave 0 Gaps
None -- manual testing is appropriate for this project scope. No test infrastructure to create.

## Sources

### Primary (HIGH confidence)
- Cloudinary Upload API Reference (https://cloudinary.com/documentation/image_upload_api_reference) -- rename, add_tag, remove_tag methods
- Cloudinary Admin API Reference (https://cloudinary.com/documentation/admin_api) -- update method for metadata
- Cloudinary Contextual Metadata docs (https://cloudinary.com/documentation/contextual_metadata) -- context format
- SortableJS GitHub (https://github.com/SortableJS/Sortable) -- API, grid support, touch support
- Existing project code (list-images.mjs, upload.js, gallery-view.js, build-gallery-data.js) -- established patterns

### Secondary (MEDIUM confidence)
- Cloudinary support article on moving assets between folders (https://support.cloudinary.com/hc/en-us/articles/202521002) -- rename for folder moves
- Cloudinary tags documentation (https://cloudinary.com/documentation/tags) -- tag management API
- npm registry (sortablejs@1.15.7) -- version verification

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or existing code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Cloudinary SDK already in use, SortableJS is the clear ecosystem choice
- Architecture: HIGH -- follows exact patterns established in Phase 6 (Netlify Functions + vanilla JS components)
- Pitfalls: HIGH -- derived from actual Cloudinary API behavior and existing code analysis

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable domain, Cloudinary APIs are mature)
