# Phase 7: Admin Image Management - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add edit, delete, and reorder capabilities to the existing Gallery tab in the admin panel. David can edit metadata on any image, soft-delete images (hide from gallery with restore), and drag-and-drop reorder images within categories. This is the final phase of v2.0.

</domain>

<decisions>
## Implementation Decisions

### Edit Workflow
- Modal overlay for editing — click "Edit" on a gallery card opens a modal with full image preview + editable fields
- Editable fields: category (dropdown), caption (text), alt text (text)
- Category change is allowed — moves image to a different Cloudinary folder
- Save button in modal persists changes to Cloudinary metadata
- Toast notification on success, modal closes after save

### Delete Behavior
- Soft delete — image gets tagged as hidden in Cloudinary, not permanently removed
- Hidden images don't appear in the public gallery (build script filters them out)
- "Trash" section in Gallery tab — toggle/filter to show hidden images
- "Restore" button on hidden images to bring them back
- No hard delete from admin panel — use Cloudinary dashboard if needed
- Rebuild triggered after delete/restore (same as upload)

### Reorder Mechanism
- Drag-and-drop reorder within the gallery grid
- Per-category scope — filter by category first, then drag to reorder within that category
- Order stored as Cloudinary metadata (sort_order field) or a config file fetched at build time
- Build script respects sort order when generating gallery-images.js

### Claude's Discretion
- Drag-and-drop library choice (or vanilla JS implementation)
- How sort order is persisted (Cloudinary metadata vs JSON config)
- Edit modal exact layout and field arrangement
- How category change is implemented (rename in Cloudinary vs delete + re-upload)
- Confirmation UX for soft delete
- How "Trash" toggle appears in the Gallery tab UI

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and REQUIREMENTS.md (MGMT-01 through MGMT-04).

</canonical_refs>

<specifics>
## Specific Ideas

- Gallery tab already shows a read-only grid with metadata via `list-images` function — enhance this, don't rebuild
- Soft delete preserves images in Cloudinary for potential future use (print shop, etc.)
- Per-category reorder matches how visitors browse the public gallery (by category filter)
- Modal edit pattern is consistent with standard CMS tools David may be familiar with

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/admin/components/gallery-view.js`: Read-only gallery grid — needs edit/delete/reorder additions
- `src/admin/components/toast.js`: Toast notifications for success/error feedback
- `src/admin/admin.css`: Gallery card styles (`.admin-gallery-card`, `.admin-gallery-grid`)
- `netlify/functions/list-images.mjs`: Cloudinary search — needs to support hidden filter
- `netlify/functions/upload-image.mjs`: Cloudinary upload with overwrite — reusable for metadata updates

### Established Patterns
- Admin components initialize via `initX()` functions called from `admin.js`
- Netlify Functions validate JWT via `context.clientContext.user`
- Cloudinary contextual metadata for caption/alt (object form)
- Toast for success/error feedback after async operations
- Dark theme with purple accents throughout admin

### Integration Points
- `gallery-view.js` is the main file to extend with edit/delete/reorder
- New Netlify Function(s) needed for update-metadata, delete (soft), restore, reorder
- `scripts/build-gallery-data.js` needs to filter out hidden images and respect sort order
- `src/data/gallery-images.js` output format may need sort_order field

</code_context>

<deferred>
## Deferred Ideas

- Hard delete option — use Cloudinary dashboard for now
- Bulk edit/delete (select multiple images) — future enhancement
- BTS image management via admin — could be a future phase
- Cloudinary watermark/logo overlay — separate phase
- Live Instagram/TikTok social feed — future phase

</deferred>

---

*Phase: 07-admin-image-management*
*Context gathered: 2026-03-17*
