# Phase 3: Content Sections and Contact - Research

**Researched:** 2026-03-15
**Domain:** Content sections (video embed, about, BTS grid, contact form, social wall) for vanilla HTML/CSS/JS portfolio
**Confidence:** HIGH

## Summary

Phase 3 builds five content sections that fill the space between the gallery (Phase 2) and the footer/animations (Phase 4). The technical surface is straightforward: one external dependency (lite-youtube-embed for the video facade), one external service (Formspree for the contact form), and three sections that are purely HTML/CSS with JS data patterns already established in Phase 2's gallery component.

The project has strong established patterns -- BEM naming, component CSS+JS files, `init{Name}()` exports, three-tier design tokens, and data-driven rendering. Phase 3 follows these patterns directly. The only new complexity is the Formspree fetch integration (AJAX submission with JSON response) and the lite-youtube-embed custom element registration.

**Primary recommendation:** Follow existing component patterns exactly. Each section gets its own CSS file and (where needed) JS file. Use `lite-youtube-embed` v0.3.4 as an npm dependency with Vite-compatible imports. Use vanilla `fetch()` for Formspree submission with a placeholder endpoint. All image content reuses existing gallery WebP files.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- About section: First-person, passionate storyteller tone with placeholder bio text
- About photo: Stylized silhouette/avatar icon on dark background with purple accent border
- About layout: Two-column desktop (photo left, text right), stacked on mobile
- About CTA: Links to contact section
- Contact form Event Type dropdown: Car Show, Track Day, Private Collection, Editorial/Magazine, Dealership, Other
- Contact success: Toast notification slides in from corner, form stays visible but fields clear
- Contact: Placeholder Formspree endpoint (user swaps later)
- Contact: Alternative contact shows email (placeholder) + Instagram and TikTok links
- Contact: Client-side validation with inline error messages, no page reload
- Video: Placeholder thumbnail with play button, user swaps real URL later
- Video: Facade pattern via lite-youtube-embed
- Video: 16:9 responsive aspect ratio with heading + description
- BTS: 4 images in 2x2 grid, reuse gallery images, process + storytelling captions
- Social wall: Instagram-style 3x3 square grid (9 images), static, clicking links to Instagram profile
- Social platforms: Instagram + TikTok (placeholder profile URLs)

### Claude's Discretion
- Exact bio placeholder text content
- Video section description text
- BTS caption writing
- Social wall image selection from existing gallery
- Form input styling details (focus states, error message positioning)
- Toast notification animation and positioning
- Silhouette/avatar design for about photo

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within Phase 3 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VID-01 | Video reel section with embedded YouTube or Vimeo player (placeholder) | lite-youtube-embed custom element with placeholder videoid |
| VID-02 | Facade pattern (lite-youtube-embed) -- no 500KB+ payload on initial load | npm install lite-youtube-embed, import CSS+JS |
| VID-03 | Heading, brief description text, muted-by-default if autoplayed | Section heading + description paragraph; params="mute=1" if needed |
| VID-04 | Responsive 16:9 aspect ratio across all screen sizes | CSS aspect-ratio: 16/9 on container |
| ABOUT-01 | About section with photographer photo (placeholder) and bio | SVG silhouette avatar + placeholder bio text |
| ABOUT-02 | Bio communicates personality, passion, automotive background | First-person storyteller tone per user decision |
| ABOUT-03 | Two-column desktop, stacked mobile | CSS grid/flexbox with media query at 768px |
| ABOUT-04 | CTA after about directing to contact/booking | Reuse .btn--primary pattern |
| BTS-01 | BTS section with grid of BTS images (placeholders) | 2x2 CSS grid, reuse gallery WebP images |
| BTS-02 | Captions/descriptions for BTS images | Storytelling captions per user decision |
| BTS-03 | Section heading and brief intro paragraph | Standard .section__heading + intro paragraph |
| CONT-01 | Booking form: Name, Email, Event Type (dropdown), Tentative Date, Brief Message | HTML form with 5 fields, all using design tokens |
| CONT-02 | Formspree integration | fetch POST to https://formspree.io/f/{id} with Accept: application/json |
| CONT-03 | Client-side validation with inline errors | HTML5 validation + JS validation on submit |
| CONT-04 | Success state, no page reload | fetch() + toast notification + form.reset() |
| CONT-05 | Error state with retry guidance | Catch fetch errors, show error toast/message |
| CONT-06 | Alternative contact method (email displayed) | Email address + social links alongside form |
| CONT-07 | Phone number field optional -- not required | No phone field in form (only 5 required fields per CONT-01) |
| SOCIAL-01 | Social media links (Instagram, TikTok) | Links in contact section; footer is Phase 4 |
| SOCIAL-02 | Social wall with static 3x3 grid | CSS grid, square-cropped images, link to Instagram |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lite-youtube-embed | 0.3.4 | YouTube facade pattern custom element | Paul Irish's official solution, 224x faster than raw iframe, <10KB |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Formspree (service) | N/A | Form backend, no server code needed | Contact form submission |

### No New Dependencies Needed For
- About section (pure HTML/CSS)
- BTS grid (pure HTML/CSS)
- Social wall (pure HTML/CSS)
- Form validation (native HTML5 + vanilla JS)
- Toast notifications (vanilla JS + CSS transitions)

**Installation:**
```bash
npm install lite-youtube-embed
```

## Architecture Patterns

### Component File Structure
```
src/
  components/
    video.css          # Video section styles
    video.js           # lite-youtube-embed import + init
    about.css          # About section styles (two-column, avatar)
    contact.css        # Contact form styles + toast
    contact.js         # Form validation + Formspree fetch + toast
    bts.css            # BTS grid styles
    social.css         # Social wall grid styles
  data/
    gallery-images.js  # (existing) -- reference for image paths
```

### Pattern 1: Component Registration (established)
**What:** Each component has a CSS file imported in main.js and optionally a JS file with an exported `init{Name}()` function.
**When:** Every new section follows this pattern.
**Example:**
```javascript
// src/main.js -- add these imports
import './components/video.css';
import './components/about.css';
import './components/bts.css';
import './components/contact.css';
import './components/social.css';
import { initVideo } from './components/video.js';
import { initContact } from './components/contact.js';

initVideo();
initContact();
```

### Pattern 2: lite-youtube-embed Integration with Vite
**What:** Import the custom element JS and CSS, then use `<lite-youtube>` in HTML.
**When:** Video section.
**Example:**
```javascript
// src/components/video.js
import 'lite-youtube-embed/src/lite-yt-embed.css';
import 'lite-youtube-embed/src/lite-yt-embed.js';

export function initVideo() {
  // Custom element auto-registers on import
  // No additional JS needed unless customizing behavior
}
```
```html
<!-- index.html #video section -->
<lite-youtube videoid="PLACEHOLDER_ID" playlabel="Play video reel">
</lite-youtube>
```

### Pattern 3: Formspree AJAX Submission
**What:** Use fetch() with Accept: application/json header to submit form data without page reload.
**When:** Contact form submission.
**Example:**
```javascript
// src/components/contact.js
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validateForm(form)) return;

    const data = new FormData(form);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        form.reset();
        showToast('success', 'Message sent! I\'ll get back to you soon.');
      } else {
        const json = await response.json();
        const errors = json.errors?.map(e => e.message).join(', ');
        showToast('error', errors || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      showToast('error', 'Network error. Please check your connection and try again.');
    }
  });
}
```

### Pattern 4: Toast Notification
**What:** Slide-in notification from bottom-right corner for form success/error feedback.
**When:** After form submission.
**Example:**
```css
.toast {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border-radius: 4px;
  color: var(--color-white);
  font-family: var(--font-body);
  transform: translateX(120%);
  transition: transform 0.3s ease;
  z-index: 1000;
}
.toast--visible {
  transform: translateX(0);
}
.toast--success { background-color: #16a34a; }
.toast--error { background-color: #dc2626; }
```

### Pattern 5: BEM Naming (established)
**What:** Block__element--modifier convention used throughout the project.
**When:** All new CSS classes.
**Examples:**
- `.video__container`, `.video__description`
- `.about__photo`, `.about__bio`, `.about__cta`
- `.bts__grid`, `.bts__item`, `.bts__caption`
- `.contact__form`, `.contact__field`, `.contact__field--error`
- `.social__grid`, `.social__item`

### Anti-Patterns to Avoid
- **Importing YouTube iframe directly:** Adds 500KB+ to initial page load. Always use lite-youtube-embed facade.
- **Using form action with page redirect:** User explicitly requires no page reload (CONT-04). Always use fetch().
- **Building a custom video player:** The requirement is a YouTube/Vimeo embed, not a custom player.
- **Live Instagram API integration:** Explicitly out of scope. Use static images only.
- **Adding phone field to form:** CONT-07 says phone is optional/not required. The 5 required fields are Name, Email, Event Type, Tentative Date, Message.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube embed performance | Custom lazy-loading iframe | lite-youtube-embed | Handles thumbnail fetching, play button, iframe injection, accessibility |
| Form backend/email delivery | Server-side form handler | Formspree service | Email delivery, spam filtering, dashboard -- no backend needed |
| Form validation UI | Custom validation framework | HTML5 constraint validation API + minimal JS | Built-in browser validation covers required, email format, pattern matching |
| Date input | Custom date picker | Native `<input type="date">` | Good enough for "tentative date" field, zero JS needed |

**Key insight:** Every section in this phase is content-focused, not interaction-heavy. The only real interactivity is the contact form and video play button, both of which have established solutions.

## Common Pitfalls

### Pitfall 1: lite-youtube-embed Custom Element Not Registering
**What goes wrong:** The `<lite-youtube>` element renders as empty/unstyled because the JS wasn't imported before the element exists in the DOM.
**Why it happens:** Custom elements need their JS definition loaded. With Vite's module loading, the element may be in the HTML before the JS runs.
**How to avoid:** Import the lite-youtube-embed JS in the component module. The custom element self-registers on import. Since the script is type="module" (deferred by default), the HTML will be parsed first but the custom element upgrade will happen automatically.
**Warning signs:** Empty space where video should be, no play button visible.

### Pitfall 2: Formspree CORS / Redirect Issues
**What goes wrong:** Form submits but redirects to Formspree's thank-you page instead of staying on the portfolio.
**Why it happens:** Missing `Accept: application/json` header causes Formspree to redirect instead of returning JSON.
**How to avoid:** Always include `headers: { 'Accept': 'application/json' }` in the fetch call.
**Warning signs:** Page navigates away after form submit.

### Pitfall 3: Aspect Ratio on Older Browsers
**What goes wrong:** The `aspect-ratio` CSS property isn't supported on very old browsers.
**Why it happens:** `aspect-ratio` has been supported since 2021 across all major browsers, but if targeting older browsers, need the padding-top hack.
**How to avoid:** Use `aspect-ratio: 16/9` -- browser support is now >95%. The project already targets modern browsers (Vite 6, ES modules).
**Warning signs:** Video container collapses or has wrong proportions.

### Pitfall 4: Form Validation UX -- Validating Too Early
**What goes wrong:** Showing error messages on page load or on first keystroke is jarring.
**Why it happens:** Connecting validation to `input` event without tracking if field was touched.
**How to avoid:** Only validate on `submit` attempt, or on `blur` after the field has been touched. Use a `touched` state per field.
**Warning signs:** Error messages visible before user interacts with form.

### Pitfall 5: Social Wall Images Not Square
**What goes wrong:** Gallery images are landscape (automotive photos), but the social wall needs square crops.
**Why it happens:** Using `<img>` without `object-fit: cover` and a square aspect ratio.
**How to avoid:** Use `aspect-ratio: 1/1` on the container with `object-fit: cover` on the image.
**Warning signs:** Distorted or letterboxed images in the social grid.

### Pitfall 6: Toast Notification Accessibility
**What goes wrong:** Screen readers don't announce the toast message.
**Why it happens:** Dynamically injected content isn't announced without ARIA attributes.
**How to avoid:** Use `role="status"` and `aria-live="polite"` on the toast container so screen readers announce it.
**Warning signs:** No screen reader feedback after form submission.

## Code Examples

### Video Section HTML Structure
```html
<section class="section video" id="video">
  <h2 class="section__heading">Video Reel</h2>
  <p class="video__description">
    See the cars come alive -- from golden hour shoots to track day action.
  </p>
  <div class="video__container">
    <lite-youtube
      videoid="dQw4w9WgXcQ"
      playlabel="Play: David Bradley automotive video reel"
    ></lite-youtube>
  </div>
</section>
```

### About Section HTML Structure
```html
<section class="section about" id="about">
  <h2 class="section__heading">About</h2>
  <div class="about__content">
    <div class="about__photo-wrap">
      <!-- SVG silhouette avatar with purple border -->
      <div class="about__photo">
        <svg><!-- silhouette icon --></svg>
      </div>
    </div>
    <div class="about__bio">
      <p>I fell in love with cars before I could drive...</p>
      <!-- More bio paragraphs -->
      <a href="#contact" class="btn btn--primary about__cta">Let's Work Together</a>
    </div>
  </div>
</section>
```

### Contact Form HTML Structure
```html
<section class="section contact" id="contact">
  <h2 class="section__heading">Contact</h2>
  <div class="contact__content">
    <form id="contact-form" class="contact__form" novalidate>
      <div class="contact__field">
        <label for="contact-name" class="contact__label">Name</label>
        <input type="text" id="contact-name" name="name" required
               class="contact__input" />
        <span class="contact__error" aria-live="polite"></span>
      </div>
      <div class="contact__field">
        <label for="contact-email" class="contact__label">Email</label>
        <input type="email" id="contact-email" name="email" required
               class="contact__input" />
        <span class="contact__error" aria-live="polite"></span>
      </div>
      <div class="contact__field">
        <label for="contact-event" class="contact__label">Event Type</label>
        <select id="contact-event" name="event-type" required
                class="contact__input contact__select">
          <option value="">Select event type...</option>
          <option value="car-show">Car Show</option>
          <option value="track-day">Track Day</option>
          <option value="private-collection">Private Collection</option>
          <option value="editorial">Editorial/Magazine</option>
          <option value="dealership">Dealership</option>
          <option value="other">Other</option>
        </select>
        <span class="contact__error" aria-live="polite"></span>
      </div>
      <div class="contact__field">
        <label for="contact-date" class="contact__label">Tentative Date</label>
        <input type="date" id="contact-date" name="date" required
               class="contact__input" />
        <span class="contact__error" aria-live="polite"></span>
      </div>
      <div class="contact__field">
        <label for="contact-message" class="contact__label">Message</label>
        <textarea id="contact-message" name="message" required rows="4"
                  class="contact__input contact__textarea"></textarea>
        <span class="contact__error" aria-live="polite"></span>
      </div>
      <button type="submit" class="btn btn--primary contact__submit">
        Send Inquiry
      </button>
    </form>
    <div class="contact__info">
      <p class="contact__alt">Or reach out directly:</p>
      <a href="mailto:hello@davidbradley.com" class="contact__email">
        hello@davidbradley.com
      </a>
      <div class="contact__socials">
        <a href="https://instagram.com/davidbradley" target="_blank" rel="noopener">Instagram</a>
        <a href="https://tiktok.com/@davidbradley" target="_blank" rel="noopener">TikTok</a>
      </div>
    </div>
  </div>
</section>
```

### Client-Side Validation Pattern
```javascript
function validateForm(form) {
  let isValid = true;
  const fields = form.querySelectorAll('.contact__input[required]');

  fields.forEach((field) => {
    const error = field.closest('.contact__field').querySelector('.contact__error');
    if (!field.validity.valid) {
      isValid = false;
      field.classList.add('contact__input--error');
      error.textContent = field.validationMessage || 'This field is required';
    } else {
      field.classList.remove('contact__input--error');
      error.textContent = '';
    }
  });

  return isValid;
}
```

### Toast Notification JS
```javascript
function showToast(type, message) {
  // Remove existing toast if any
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger slide-in
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  // Auto-dismiss after 5s
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 5000);
}
```

### Social Wall CSS Pattern
```css
.social__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.social__item {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 4px;
}

.social__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.social__item:hover .social__img {
  transform: scale(1.05);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw YouTube iframe | lite-youtube-embed facade | 2019+ (widely adopted) | Saves 500KB+ on initial load |
| padding-top: 56.25% for 16:9 | aspect-ratio: 16/9 | 2021 (all browsers) | Cleaner, semantic CSS |
| jQuery AJAX form submission | fetch() + FormData | ES2015+ | No dependency needed |
| Custom date picker widgets | Native input[type=date] | 2020+ (Safari caught up) | Zero JS, good mobile UX |

**Deprecated/outdated:**
- Formspree legacy email endpoint format (`formspree.io/email@example.com`) -- use `formspree.io/f/{form_id}` format instead

## Open Questions

1. **Formspree AJAX on Free Plan**
   - What we know: Formspree's current docs show AJAX examples, older sources say it requires paid plan
   - What's unclear: Whether the free plan currently supports AJAX/JSON responses
   - Recommendation: Use the fetch pattern with Accept header regardless. If the free plan redirects, the placeholder endpoint won't work anyway (it's a placeholder). When user swaps in a real endpoint, they'll have a paid plan or it will just work.

2. **lite-youtube-embed Vite Import Paths**
   - What we know: The package exports from `src/lite-yt-embed.js` and `src/lite-yt-embed.css`
   - What's unclear: Whether Vite resolves `lite-youtube-embed/src/lite-yt-embed.css` directly or needs a full node_modules path
   - Recommendation: Use bare specifier `import 'lite-youtube-embed/src/lite-yt-embed.css'` -- Vite resolves bare specifiers through node_modules automatically.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no automated test framework detected) |
| Config file | none -- see Wave 0 |
| Quick run command | `npm run dev` + manual browser check |
| Full suite command | `npm run build && npm run preview` + manual browser check |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VID-01 | Video section renders with embed | smoke | `npm run build` (build succeeds) | N/A |
| VID-02 | Facade pattern loads, no heavy iframe | manual-only | Visual check: no iframe until click | N/A |
| VID-03 | Heading and description visible | manual-only | Visual check | N/A |
| VID-04 | 16:9 responsive aspect ratio | manual-only | Resize browser, check ratio | N/A |
| ABOUT-01 | About section with photo + bio | manual-only | Visual check | N/A |
| ABOUT-02 | Bio tone is personal/passionate | manual-only | Read content | N/A |
| ABOUT-03 | Two-column desktop, stacked mobile | manual-only | Resize browser | N/A |
| ABOUT-04 | CTA links to #contact | manual-only | Click CTA | N/A |
| BTS-01 | BTS grid with 4 images | manual-only | Visual check | N/A |
| BTS-02 | Captions on BTS images | manual-only | Visual check | N/A |
| BTS-03 | Heading + intro paragraph | manual-only | Visual check | N/A |
| CONT-01 | Form with 5 fields | manual-only | Visual check + tab through fields | N/A |
| CONT-02 | Formspree endpoint configured | manual-only | Check network tab on submit | N/A |
| CONT-03 | Inline validation errors | manual-only | Submit empty form | N/A |
| CONT-04 | No page reload on submit | manual-only | Submit form, page stays | N/A |
| CONT-05 | Error state on failure | manual-only | Disconnect network, submit | N/A |
| CONT-06 | Email + social links visible | manual-only | Visual check | N/A |
| CONT-07 | No required phone field | manual-only | Check form fields | N/A |
| SOCIAL-01 | Social links present | manual-only | Visual check | N/A |
| SOCIAL-02 | 3x3 square grid | manual-only | Visual check | N/A |

### Sampling Rate
- **Per task commit:** `npm run dev` + visual check in browser
- **Per wave merge:** `npm run build && npm run preview` + full visual walkthrough
- **Phase gate:** Build succeeds + all sections render correctly at mobile and desktop widths

### Wave 0 Gaps
None critical -- this is a vanilla HTML/CSS/JS project without an automated test framework. Validation is through build success and manual browser testing, which matches the project's established pattern from Phases 1 and 2.

## Sources

### Primary (HIGH confidence)
- [lite-youtube-embed GitHub](https://github.com/paulirish/lite-youtube-embed) - Version 0.3.4, usage, attributes
- [lite-youtube-embed npm](https://www.npmjs.com/package/lite-youtube-embed) - Package info
- [Formspree HTML forms](https://formspree.io/html/) - Integration pattern
- Existing codebase (`src/components/gallery.js`, `src/style.css`, `src/tokens.css`) - Established patterns

### Secondary (MEDIUM confidence)
- [Formspree AJAX docs](https://help.formspree.io/hc/en-us/articles/360013470814-Submit-forms-with-JavaScript-AJAX) - fetch submission pattern
- [Pluralsight Formspree guide](https://www.pluralsight.com/resources/blog/guides/formspree-ajax-with-es6) - ES6 fetch code example

### Tertiary (LOW confidence)
- Formspree free plan AJAX support status -- conflicting sources, flagged in Open Questions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- lite-youtube-embed is the established solution, Formspree is the decided service
- Architecture: HIGH -- follows patterns directly from Phases 1 and 2
- Pitfalls: HIGH -- well-known issues with facade patterns, form validation, and CORS headers

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable domain, no fast-moving dependencies)
