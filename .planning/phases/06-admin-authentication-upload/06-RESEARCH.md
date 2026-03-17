# Phase 6: Admin Authentication & Upload - Research

**Researched:** 2026-03-16
**Domain:** Netlify Identity auth, Netlify Functions serverless proxy, Cloudinary upload API, Vite multi-page apps
**Confidence:** HIGH

## Summary

Phase 6 builds a browser-based admin panel at `/admin` with authentication via Netlify Identity, drag-and-drop photo upload proxied through a Netlify Function to Cloudinary, hero image selection, and automatic site rebuild. The admin is a separate Vite entry point that public visitors never load.

The technical stack is well-established: Netlify Identity Widget provides drop-in auth with zero backend config, Netlify Functions (v2 modern syntax) handle the server-side Cloudinary upload with JWT validation built in, and Vite's native multi-page support via `rollupOptions.input` cleanly separates the admin bundle. The key constraint is the **6 MB request body limit** on Netlify Functions (synchronous), which means high-resolution photos must be converted to base64 on the client and sent one at a time -- batch upload is a UI-level concept, not a single API call.

**Primary recommendation:** Use the client-side base64 approach (FileReader to data URI) with sequential per-file uploads to the Netlify Function, which forwards to Cloudinary's `uploader.upload()` with the data URI string. This avoids multipart parsing complexity and stays well within Netlify's limits for typical photography JPEGs (2-5 MB each).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Netlify Identity for login -- free, JWT-based, single invited user (David)
- No public registration -- invite-only via Netlify dashboard
- Admin page at `/admin` loads Netlify Identity widget for login
- Tabbed interface: **Upload** | **Gallery** | **Settings**
- Upload tab: drag-and-drop zone, category picker, batch upload
- Gallery tab: grid of existing images with metadata (Phase 7 adds edit/delete/reorder)
- Settings tab: hero image selection (pick from gallery or upload custom)
- Dark theme matching main site (#0F0F0F background, purple accents)
- Drag-and-drop zone with file picker fallback, accepts JPEG/PNG/WebP
- Batch upload -- set category once for the whole batch
- Per-image progress bars during upload
- Auto-generated image ID/slug from category + caption, editable
- Image preview shown before upload via `URL.createObjectURL()`
- Per-image metadata: caption (text), alt text (text) -- category set at batch level
- After success: toast notification + form clears for next batch
- Upload proxied through Netlify Function -- Cloudinary API secret stays server-side
- Netlify rebuild triggered automatically after upload completes
- Hero image moves to Cloudinary (no longer local in git)
- Hero selection stored as Cloudinary metadata or a config file fetched at build time

### Claude's Discretion
- Exact admin UI layout and spacing
- Netlify Function implementation details
- How hero selection persists (Cloudinary tag vs JSON config in git)
- Upload concurrency and rate limiting
- Error handling UX for failed uploads
- Tab navigation implementation (URL hash vs JS state)
- Netlify Identity widget styling customization

### Deferred Ideas (OUT OF SCOPE)
- Cloudinary watermark/logo overlay on photos -- separate phase
- Live Instagram/TikTok feed for social wall -- future phase
- BTS image management via admin -- could extend in Phase 7
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Admin page at `/admin` protected by Netlify Identity login | Netlify Identity Widget provides drop-in auth; Vite multi-page config isolates admin entry |
| AUTH-02 | Only invited users (David) can access admin -- no public registration | Netlify Identity invite-only mode configured in Netlify dashboard; widget `init()` with no signup tab |
| UPLOAD-01 | Drag-and-drop upload zone with file picker fallback, accepts JPEG/PNG/WebP | Standard HTML5 Drag and Drop API + `<input type="file" accept>` -- no library needed |
| UPLOAD-02 | Batch upload -- multiple photos in one session | UI collects files into array, uploads sequentially via Netlify Function; per-file progress tracking |
| UPLOAD-03 | Per-image metadata form: category (dropdown), caption (text), alt text (text) | Metadata sent as JSON alongside base64 image data; Cloudinary `context` parameter stores caption/alt |
| UPLOAD-04 | Auto-generated image ID/slug from category + caption, editable | Generate `public_id` as `gallery/{category}/{slug}` before upload; pass to Cloudinary `public_id` param |
| UPLOAD-05 | Image preview shown before upload using browser URL.createObjectURL | Pure browser API -- no server interaction needed |
| UPLOAD-06 | Upload proxied through Netlify Function (Cloudinary API secret stays server-side) | Netlify Function receives base64 + metadata, calls `cloudinary.uploader.upload()` server-side |
| UPLOAD-07 | Netlify rebuild triggered automatically after upload completes | Netlify Build Hook (POST to unique URL) triggered from Function after successful upload |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| netlify-identity-widget | ^1.9.2 | Drop-in auth UI for Netlify Identity | Official Netlify widget, zero-config, framework-free |
| cloudinary (Node.js SDK) | ^2.9.0 | Server-side upload to Cloudinary | Already in devDependencies, used by build script |
| Vite | ^6.0.0 | Multi-page build with admin entry point | Already the project bundler |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| busboy | ^1.6.0 | Parse multipart form data in Functions | Only if multipart approach chosen (NOT recommended -- use base64 instead) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Base64 upload via JSON | Multipart form upload | Multipart needs busboy parsing, base64 encoding adds ~33% overhead; base64 is simpler and photos are typically 2-5 MB well within 6 MB limit |
| Netlify Identity Widget (script tag) | npm install | Script tag is simpler but npm gives bundling control; recommend npm for Vite compatibility |
| Netlify Functions v2 (modern) | v1 (Lambda compat) | v2 uses standard Request/Response API; v1 has better Identity context docs; recommend v1 syntax for proven Identity integration |

**Installation:**
```bash
npm install netlify-identity-widget
```

No additional install needed for Cloudinary (already in devDependencies). The Netlify Function will use it at runtime via Netlify's built-in dependency bundling.

## Architecture Patterns

### Recommended Project Structure
```
admin.html                    # Admin entry point (project root, alongside index.html)
src/
  admin/
    admin.js                  # Admin entry JS (imports widget, tabs, upload)
    admin.css                 # Admin-specific styles (dark theme, tabs, upload zone)
    components/
      auth.js                 # Netlify Identity init, login/logout, JWT retrieval
      tabs.js                 # Tab navigation (Upload | Gallery | Settings)
      upload.js               # Drag-and-drop, file preview, upload orchestration
      gallery-view.js         # Read-only gallery grid (Phase 7 adds CRUD)
      settings.js             # Hero image selection
      toast.js                # Toast notifications (extracted from contact.js pattern)
netlify/
  functions/
    upload-image.mjs          # Serverless upload proxy to Cloudinary
```

### Pattern 1: Vite Multi-Page Entry
**What:** Configure Vite to build both `index.html` (public site) and `admin.html` (admin panel) as separate entry points.
**When to use:** Always -- this is required to keep admin JS out of the public bundle (BUILD-04).
**Example:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
```
Source: [Vite Multi-Page App docs](https://vite.dev/guide/build.html#multi-page-app)

### Pattern 2: Netlify Identity Widget Auth Flow
**What:** Initialize widget, handle login/logout events, gate admin UI behind auth.
**When to use:** On admin page load.
**Example:**
```javascript
// src/admin/components/auth.js
import netlifyIdentity from 'netlify-identity-widget';

export function initAuth(onLogin, onLogout) {
  netlifyIdentity.init();

  netlifyIdentity.on('login', (user) => {
    netlifyIdentity.close();
    onLogin(user);
  });

  netlifyIdentity.on('logout', () => {
    onLogout();
  });

  // Check if already logged in
  const user = netlifyIdentity.currentUser();
  if (user) {
    onLogin(user);
  }
}

export async function getToken() {
  // Returns a fresh JWT string for Authorization header
  return await netlifyIdentity.refresh();
}

export function logout() {
  netlifyIdentity.logout();
}
```
Source: [netlify-identity-widget README](https://github.com/netlify/netlify-identity-widget)

### Pattern 3: Netlify Function with Identity Validation (v1 Lambda Compat)
**What:** Serverless function that validates JWT from Identity and uploads to Cloudinary.
**When to use:** For the upload proxy endpoint.
**Example:**
```javascript
// netlify/functions/upload-image.mjs
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event, context) => {
  // Identity validation -- user is auto-populated by Netlify
  // when Authorization: Bearer <token> header is present
  const { identity, user } = context.clientContext || {};

  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { image, folder, public_id, context: metadata } = JSON.parse(event.body);

  const result = await cloudinary.uploader.upload(image, {
    folder,
    public_id,
    context: metadata,  // { caption: '...', alt: '...' }
    resource_type: 'image',
    overwrite: false,
  });

  // Trigger Netlify rebuild
  await fetch(process.env.NETLIFY_BUILD_HOOK, { method: 'POST' });

  return {
    statusCode: 200,
    body: JSON.stringify({ public_id: result.public_id, url: result.secure_url }),
  };
};
```
Source: [Netlify Functions and Identity docs](https://docs.netlify.com/build/functions/functions-and-identity/)

### Pattern 4: Client-Side Base64 Upload
**What:** Read file as base64 data URI on client, send as JSON body to function.
**When to use:** For all image uploads -- avoids multipart parsing complexity.
**Example:**
```javascript
// src/admin/components/upload.js
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/jpeg;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file, metadata, token) {
  const base64 = await fileToBase64(file);

  const response = await fetch('/.netlify/functions/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      image: base64,
      folder: `gallery/${metadata.category}`,
      public_id: metadata.slug,
      context: { caption: metadata.caption, alt: metadata.alt },
    }),
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return response.json();
}
```

### Anti-Patterns to Avoid
- **Multipart form upload to Functions:** Requires busboy parsing, base64 decode/re-encode, and is error-prone. Use JSON with base64 data URI instead.
- **Unsigned Cloudinary uploads from client:** Exposes upload preset, allows anyone to upload. Always proxy through authenticated Function.
- **Loading admin JS on public pages:** Must use separate Vite entry point, never dynamic import from main bundle.
- **Storing Cloudinary credentials in client code:** API secret must only exist in environment variables accessed by Functions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth login/signup UI | Custom login form | Netlify Identity Widget | Handles JWT refresh, password reset, email confirmation, token storage |
| JWT validation | Manual JWT decode/verify | Netlify's built-in Identity context | Netlify auto-validates bearer tokens and populates `context.clientContext.user` |
| Drag-and-drop file handling | Custom drag event management | HTML5 Drag and Drop API with `dragover`/`drop` events | Browser-native, well-supported, simple |
| Image upload to CDN | Custom HTTP upload with signatures | `cloudinary.uploader.upload()` | SDK handles auth signatures, retries, response parsing |
| Site rebuild trigger | Custom webhook system | Netlify Build Hooks (POST URL) | One POST triggers a full rebuild -- already integrated |
| Toast notifications | New toast system | Extract pattern from existing `contact.js` | Same codebase, proven pattern with accessibility (`role="status"`, `aria-live`) |

**Key insight:** Every complex piece of this phase has an existing solution. The real work is wiring them together: widget handles auth, Netlify validates tokens, Cloudinary SDK handles upload, build hook handles rebuild.

## Common Pitfalls

### Pitfall 1: 6 MB Body Size Limit on Netlify Functions
**What goes wrong:** Large photos (>4.5 MB after base64 overhead) fail silently or return 413 errors.
**Why it happens:** Netlify Functions have a hard 6 MB limit for synchronous request bodies. Base64 encoding adds ~33% overhead, so the effective raw file limit is ~4.5 MB.
**How to avoid:** Validate file size on the client before upload. Reject files over 4 MB (conservative). Show clear error message. Most processed JPEGs from photography workflows are 2-4 MB.
**Warning signs:** Upload works for small test images but fails with real photography.

### Pitfall 2: Netlify Identity Widget Not Loading in Dev
**What goes wrong:** Widget fails to initialize during local `vite dev` because there's no Netlify Identity instance.
**Why it happens:** The widget needs to talk to a real Netlify Identity endpoint. Local dev doesn't have one.
**How to avoid:** Use `netlify dev` (Netlify CLI) instead of `vite dev` for admin development. Or mock the auth state for rapid UI iteration and test auth flow on deploy previews.
**Warning signs:** "Failed to load settings" error from widget init.

### Pitfall 3: JWT Token Expiration
**What goes wrong:** Batch upload of 10+ images takes several minutes; JWT expires mid-batch (tokens last 1 hour).
**Why it happens:** Token obtained once at login, never refreshed during long upload sessions.
**How to avoid:** Call `netlifyIdentity.refresh()` before each upload request to get a fresh token. The method returns a Promise resolving to the new JWT string.
**Warning signs:** First few uploads succeed, later ones return 401.

### Pitfall 4: Functions Directory Not Detected
**What goes wrong:** Functions deploy fails or returns 404 at `/.netlify/functions/upload-image`.
**Why it happens:** Netlify looks for functions in `netlify/functions/` by default, but old projects may have a different config.
**How to avoid:** Use the default `netlify/functions/` directory. Verify `netlify.toml` does NOT have a conflicting `[functions]` directory setting.
**Warning signs:** Deploy log shows "No functions detected" or endpoint returns 404.

### Pitfall 5: Cloudinary Context Metadata Format
**What goes wrong:** Caption and alt text don't appear in build script output.
**Why it happens:** Cloudinary stores context metadata differently depending on how it's uploaded (pipe-delimited string vs object form).
**How to avoid:** Use object form for context: `context: { caption: '...', alt: '...' }`. The existing build script already handles both `context.custom.X` and `context.X` paths (lines 170-171 of build-gallery-data.js).
**Warning signs:** Images appear in gallery but with blank captions.

### Pitfall 6: Build Hook Fired Too Early
**What goes wrong:** Site rebuilds before all batch uploads complete, missing some images.
**Why it happens:** Build hook triggered after each individual upload in a batch.
**How to avoid:** Only trigger the build hook once, after the entire batch completes. Track upload completion on the client side and make a final "trigger rebuild" call.
**Warning signs:** Gallery shows partial batch after rebuild.

## Code Examples

### Drag-and-Drop Upload Zone
```html
<!-- admin.html (upload tab content) -->
<div class="upload-zone" id="upload-zone">
  <p class="upload-zone__text">Drag photos here or</p>
  <label class="btn btn--primary upload-zone__btn">
    Browse Files
    <input type="file" id="file-input" multiple accept="image/jpeg,image/png,image/webp" hidden>
  </label>
</div>
```

```javascript
// Drag-and-drop handling
const zone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');

zone.addEventListener('dragover', (e) => {
  e.preventDefault();
  zone.classList.add('upload-zone--active');
});

zone.addEventListener('dragleave', () => {
  zone.classList.remove('upload-zone--active');
});

zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.classList.remove('upload-zone--active');
  const files = Array.from(e.dataTransfer.files).filter(f =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
  );
  handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(Array.from(e.target.files));
  e.target.value = ''; // Reset for re-selection
});
```

### Tab Navigation (URL Hash)
```javascript
// Simple hash-based tab navigation
function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  function showTab(id) {
    tabs.forEach(t => t.classList.toggle('admin-tab--active', t.dataset.tab === id));
    panels.forEach(p => p.classList.toggle('admin-panel--active', p.id === `panel-${id}`));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      window.location.hash = id;
      showTab(id);
    });
  });

  // Restore tab from URL hash
  const hash = window.location.hash.slice(1);
  showTab(hash || 'upload');
}
```

### Slug Generation
```javascript
function generateSlug(category, caption) {
  const base = caption
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || `${category}-${Date.now()}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Netlify Functions v1 (exports.handler, event/context) | Functions v2 (default export, Request/Response) | 2023-2024 | v2 uses web standards; however v1 Lambda compat still fully supported and has better Identity docs |
| busboy for multipart parsing | base64 data URI in JSON body | N/A (always available) | Simpler, no dependency, works within 6 MB limit for photos |
| Netlify Identity via script tag CDN | npm package import | Both still work | npm gives Vite tree-shaking and bundling control |

**Recommendation on Functions API version:** Use v1 Lambda-compatible syntax (`export const handler`) for the upload function. The Identity `context.clientContext` pattern is well-documented and proven for v1. The v2 modern syntax with `Request`/`Response` is cleaner but Identity context handling is less documented. For a single function, the v1 syntax is perfectly adequate and lower risk.

## Open Questions

1. **Hero image persistence mechanism**
   - What we know: Hero currently served from local git. Needs to move to Cloudinary. Settings tab lets David pick any gallery image or upload a custom one.
   - What's unclear: Best persistence mechanism -- Cloudinary tag on the image? A small JSON config file committed to git? A Cloudinary resource with a fixed public_id like `config/hero`?
   - Recommendation: Use a fixed Cloudinary public_id approach: upload/tag the hero image with a known public_id (e.g., `site-config/hero`). The build script can fetch this specific resource. Simple, no git commits needed, works with the existing Cloudinary pipeline.

2. **Netlify Build Hook URL storage**
   - What we know: Build hooks are unique URLs created in Netlify dashboard. The function needs this URL to trigger rebuilds.
   - Recommendation: Store as `NETLIFY_BUILD_HOOK` environment variable in Netlify dashboard (alongside Cloudinary credentials). Reference in the function via `process.env.NETLIFY_BUILD_HOOK`.

3. **Upload concurrency for batch**
   - What we know: Uploading 10-20 photos sequentially could be slow. Parallel uploads risk rate limiting.
   - Recommendation: Upload 2 files concurrently (conservative parallelism). Show per-image progress bars. Trigger rebuild only after all complete.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently configured |
| Config file | None -- see Wave 0 |
| Quick run command | `node --test tests/` |
| Full suite command | `node --test tests/` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Admin page loads Identity widget, gates content | manual-only | Deploy preview + manual login | N/A -- requires Netlify runtime |
| AUTH-02 | No signup option, invite-only | manual-only | Verify widget config hides signup | N/A -- Netlify dashboard config |
| UPLOAD-01 | Drag-and-drop zone accepts JPEG/PNG/WebP, rejects others | unit | `node --test tests/upload.test.js` | No -- Wave 0 |
| UPLOAD-02 | Batch upload sends multiple files sequentially | unit | `node --test tests/upload.test.js` | No -- Wave 0 |
| UPLOAD-03 | Metadata (category, caption, alt) sent with upload | unit | `node --test tests/upload.test.js` | No -- Wave 0 |
| UPLOAD-04 | Slug auto-generated from category + caption | unit | `node --test tests/upload.test.js` | No -- Wave 0 |
| UPLOAD-05 | File preview via URL.createObjectURL | manual-only | Visual verification in browser | N/A -- DOM API |
| UPLOAD-06 | Function validates JWT, rejects unauthenticated requests | unit | `node --test tests/upload-function.test.js` | No -- Wave 0 |
| UPLOAD-07 | Build hook triggered after batch completes | unit | `node --test tests/upload-function.test.js` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test tests/`
- **Per wave merge:** `node --test tests/`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/upload.test.js` -- covers UPLOAD-01 through UPLOAD-05 (client-side logic: file validation, slug generation, metadata assembly)
- [ ] `tests/upload-function.test.js` -- covers UPLOAD-06, UPLOAD-07 (function auth check, Cloudinary call, build hook trigger -- with mocked cloudinary/fetch)
- [ ] Node.js built-in test runner is sufficient (Node 20+ `node --test`) -- no framework install needed

## Sources

### Primary (HIGH confidence)
- [Netlify Functions and Identity docs](https://docs.netlify.com/build/functions/functions-and-identity/) -- JWT validation, clientContext.user pattern
- [Netlify Functions overview](https://docs.netlify.com/build/functions/overview/) -- 6 MB body limit, 60s timeout
- [Netlify Build Hooks docs](https://docs.netlify.com/build/configure-builds/build-hooks/) -- POST URL for triggering rebuilds
- [Cloudinary base64 upload support](https://support.cloudinary.com/hc/en-us/articles/203125741) -- data URI upload up to 60 MB
- [Cloudinary Node.js upload docs](https://cloudinary.com/documentation/node_image_and_video_upload) -- uploader.upload() with context metadata
- [netlify-identity-widget GitHub](https://github.com/netlify/netlify-identity-widget) -- API methods, events, JWT refresh
- [Vite Multi-Page App guide](https://vite.dev/guide/build.html#multi-page-app) -- rollupOptions.input for multiple HTML entries

### Secondary (MEDIUM confidence)
- [Netlify Functions v2 migration guide](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/) -- modern syntax with default export
- [Cloudinary Upload Images blog](https://cloudinary.com/blog/guest_post/upload-images-to-cloudinary-with-netlify-functions) -- end-to-end pattern

### Tertiary (LOW confidence)
- None -- all key claims verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries are official, documented, already partially in use
- Architecture: HIGH -- Vite multi-page is well-documented; Netlify Identity + Functions integration is a proven pattern
- Pitfalls: HIGH -- body size limits and Identity context patterns verified against official docs

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (30 days -- stable ecosystem, no breaking changes expected)
