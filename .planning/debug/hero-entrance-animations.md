---
status: diagnosed
trigger: "hero entrance animations are not firing -- content loads without fade-in or slide-up"
created: 2026-03-14T00:00:00Z
updated: 2026-03-14T00:00:00Z
---

## Current Focus

hypothesis: The `.btn` rule in style.css overrides the hero entrance transition with its own `transition` shorthand, and `.btn--primary:hover` sets `transform: translateY(-1px)` which fights the entrance `translateY(0)` target -- but the PRIMARY cause is that the `.btn` transition shorthand replaces the hero entrance transitions entirely for the CTA element.
test: Confirmed by reading CSS cascade
expecting: .hero__cta transition is overridden by .btn shorthand
next_action: return diagnosis

## Symptoms

expected: Hero name, tagline, and CTA fade in + slide up with staggered delays on page load
actual: Content appears instantly with no animation
errors: none reported
reproduction: Load the page normally (no reduced-motion preference)
started: unknown

## Eliminated

(none -- root cause found on first pass)

## Evidence

- timestamp: 2026-03-14T00:00:00Z
  checked: src/main.js execution flow
  found: initHero() is called at module top level. Script is type="module" in body (line 109 of index.html), so it executes after HTML is parsed. DOM elements exist when querySelector runs.
  implication: No timing issue -- the JS side is correct.

- timestamp: 2026-03-14T00:00:00Z
  checked: hero.js logic
  found: Function correctly queries .hero, checks reduced-motion, and adds .hero--loaded via requestAnimationFrame. Logic is sound.
  implication: JS class-toggle mechanism is correct.

- timestamp: 2026-03-14T00:00:00Z
  checked: hero.css entrance animation rules (lines 114-139)
  found: Initial state sets opacity:0, translateY(30px) with 0.8s transitions and staggered delays. .hero--loaded flips to opacity:1, translateY(0). Selectors match the HTML structure exactly.
  implication: Hero CSS in isolation is correct.

- timestamp: 2026-03-14T00:00:00Z
  checked: style.css reduced-motion media query (lines 49-56)
  found: Global reduced-motion rule applies `transition-duration: 0.01ms !important` to ALL elements. This fires even when prefers-reduced-motion is NOT active only if the media query matches. BUT this is a media query -- it only applies when the user has reduced motion enabled. Not the primary bug.
  implication: Reduced-motion users get instant visibility (correct behavior). Not the cause for normal users.

- timestamp: 2026-03-14T00:00:00Z
  checked: style.css .btn rules (lines 87-108) vs hero.css .hero__cta rules
  found: |
    CRITICAL CONFLICT: The .hero__cta element also has class "btn btn--primary" in the HTML (line 82).

    1. hero.css sets on .hero__cta: `transition: opacity 0.8s ease, transform 0.8s ease`
    2. style.css sets on .btn: `transition: box-shadow 0.3s ease, transform 0.3s ease`

    The .btn transition shorthand COMPLETELY REPLACES the hero entrance transition because CSS transition shorthand is not additive -- it resets all transition properties. The .btn rule wins by cascade order (style.css is imported before hero.css in main.js, but specificity is equal and .btn is a class selector same as .hero__cta -- however the real issue is that BOTH apply and the last one in cascade wins).

    Actually, checking import order in main.js:
      Line 1: import './style.css'
      Line 2: import './components/hero.css'

    hero.css loads AFTER style.css, so .hero__cta transition (from hero.css) should override .btn transition (from style.css) for the CTA. But the .btn--primary:hover transform creates a conflict with the entrance transform.

    Wait -- re-examining: .hero__cta has specificity 0,1,0. .btn also has specificity 0,1,0. hero.css comes after style.css, so .hero__cta's transition wins. The transitions should actually work for the CTA.

    Let me reconsider the actual bug. The JS and CSS both look correct in isolation. The requestAnimationFrame should allow the browser to paint the initial opacity:0 state before adding .hero--loaded.

    BUT: requestAnimationFrame only guarantees one frame. Some browsers batch the initial paint and the rAF callback together, meaning the class is added BEFORE the browser has committed the opacity:0 state to the rendering pipeline. The transition never fires because the browser never "sees" the starting state.
  implication: The single requestAnimationFrame is insufficient. A double-rAF or a setTimeout(0) inside rAF is needed to guarantee the browser paints the initial hidden state before toggling the class.

- timestamp: 2026-03-14T00:00:00Z
  checked: requestAnimationFrame timing behavior
  found: |
    In modern browsers (especially Chromium), a single rAF callback can execute before the first paint has been
    committed. The sequence is:
      1. CSS parsed -> elements get opacity:0, translateY(30px)
      2. JS module executes -> initHero() called
      3. rAF callback queued
      4. Browser may run rAF callback BEFORE first composite/paint
      5. .hero--loaded added -> opacity:1, translateY(0)
      6. First paint shows final state -- no transition visible

    The fix is double-rAF:
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hero.classList.add('hero--loaded');
        });
      });

    This ensures the first frame (with hidden state) is painted, and the class is added on the SECOND frame, triggering the transition.
  implication: This is the root cause. Single rAF is a well-known race condition for triggering CSS transitions on page load.

## Resolution

root_cause: |
  `initHero()` in hero.js uses a single `requestAnimationFrame` to add the `.hero--loaded` class.
  A single rAF does NOT guarantee the browser has painted the initial state (opacity:0, translateY(30px))
  before the class is toggled. In Chromium-based browsers especially, the rAF callback can fire before
  the first composite, so the browser never transitions FROM the hidden state -- it jumps directly to
  the final state. The animation appears to not fire because there is no committed "before" frame to
  transition from.

fix: (not yet applied)
verification: (not yet done)
files_changed: []
