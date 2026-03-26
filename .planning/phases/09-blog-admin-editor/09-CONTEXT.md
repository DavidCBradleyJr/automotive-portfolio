# Phase 9: Blog Admin Editor - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a "Blog" tab to the admin panel with a full markdown editor for creating, editing, and managing blog posts. Includes formatting toolbar, Write/Preview tabs, photo insertion from gallery sidebar, new photo upload (auto-added to gallery), draft/publish workflow, and post saving via Netlify Function + GitHub API. Auto-rebuild triggered after publish/edit/delete.

</domain>

<decisions>
## Implementation Decisions

### Editor Layout
- **Tabs: Write | Preview** — two tabs above the content area, switch between writing and previewing. Cleanest, most space-efficient.
- Formatting toolbar above the writing area with quick buttons for: bold, italic, headings (H2/H3), links, blockquote, lists (ordered/unordered), and image insert
- Metadata fields: Claude's discretion on placement (above editor vs sidebar)
- Dark theme matching admin panel

### Photo Insertion
- **Gallery sidebar** — gallery images shown in a collapsible sidebar panel, drag into the editor to insert markdown image tag at cursor
- Also has an "Upload" button in the sidebar to upload a new photo directly
- New photos uploaded in the editor **auto-add to Cloudinary gallery** (user picks category) — they appear in both the post and the gallery
- Photos use Cloudinary CDN URLs in the markdown

### Post Management
- New "Blog" tab in admin panel (alongside Upload, Gallery, Settings)
- **Card grid with cover thumbnails** — shows cover image, title, date, draft/published status
- Click a card to open the editor for that post
- "New Post" button to create a fresh post
- Draft/published toggle — drafts not visible on public site
- Delete post with confirmation
- **Save via Netlify Function + GitHub API** — function commits the markdown file to the git repo on save/publish
- Auto-rebuild triggered after publish/edit/delete (per BDATA-05)

### Claude's Discretion
- Exact metadata field placement (above editor vs sidebar panel)
- Markdown parsing library for preview (marked already installed from Phase 8)
- GitHub API integration details (personal access token vs GitHub App)
- Gallery sidebar layout and drag implementation
- How cover image selection works (from gallery picker or URL input)
- Slug auto-generation logic
- Post deletion approach (remove file from git via GitHub API)

</decisions>

<specifics>
## Specific Ideas

- The Write/Preview tabs keep the editor clean — no split-pane cramping on smaller screens
- Drag-from-sidebar is more visual and intuitive than a modal picker for a photographer
- Auto-adding uploaded photos to the gallery means David never has to upload the same photo twice
- Card grid for post list matches the gallery view aesthetic — consistent admin UX
- GitHub API commit means posts are version-controlled and the existing build pipeline works unchanged

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/admin/admin.js`: Tab initialization pattern — add Blog tab
- `src/admin/admin.css`: Admin styling (cards, buttons, modals, toast)
- `src/admin/components/toast.js`: Toast notifications
- `src/admin/components/auth.js`: JWT auth for Netlify Functions
- `src/admin/components/upload.js`: Direct Cloudinary upload with signed params — reuse for blog photo uploads
- `src/admin/components/gallery-view.js`: Gallery grid pattern — reuse for gallery sidebar
- `netlify/functions/sign-upload.mjs`: Cloudinary signed upload — reuse
- `netlify/functions/list-images.mjs`: Gallery image listing — reuse for sidebar
- `marked` (already installed): Markdown rendering for preview
- `gray-matter` (already installed): Frontmatter parsing

### Established Patterns
- Admin tabs: hash-based navigation via `tabs.js`
- Netlify Functions: JWT auth via `context.clientContext.user`
- Cloudinary uploads: signed params, direct browser-to-Cloudinary
- Dark theme, BEM naming, toast feedback

### Integration Points
- `admin.html`: Add Blog tab button + panel section
- `src/admin/admin.js`: Import and init blog editor component
- `content/blog/`: Post files committed here via GitHub API
- `scripts/build-blog.js`: Already reads from `content/blog/` — no changes needed
- New Netlify Function(s) needed: save-post (GitHub API commit), delete-post (GitHub API delete), list-posts (read from git or filesystem)
- `GITHUB_TOKEN` env var needed for GitHub API access (personal access token)

</code_context>

<deferred>
## Deferred Ideas

- RSS feed generation — future enhancement
- Post scheduling (publish at a future date) — future enhancement
- Markdown syntax highlighting in editor — nice-to-have
- Image captions in blog posts — could add later
- Post categories (separate from tags) — future enhancement

</deferred>

---

*Phase: 09-blog-admin-editor*
*Context gathered: 2026-03-26*
