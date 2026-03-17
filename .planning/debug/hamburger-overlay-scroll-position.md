---
status: diagnosed
trigger: "Investigate why the hamburger mobile menu behaves differently when opened while scrolled lower on the page"
created: 2026-03-14T00:00:00Z
updated: 2026-03-14T00:00:00Z
---

## Current Focus

hypothesis: No CSS or JS bug found that would cause scroll-position-dependent overlay behavior. The overlay uses position:fixed with inset:0, z-index is correct, and no styles change based on nav--scrolled that would affect the overlay. The reported issue likely stems from a missing style rule for nav__overlay-link--active (cosmetic difference, not layout) or from the no-scroll utility not preventing scroll-jump on iOS/Safari.
test: Verified all CSS and JS paths
expecting: n/a
next_action: Return diagnosis

## Symptoms

expected: Hamburger overlay looks and behaves identically regardless of scroll position
actual: Overlay behaves differently when opened while scrolled to About section vs top of page
errors: none reported
reproduction: Open hamburger at top of page vs scrolled to About section
started: unknown

## Eliminated

- hypothesis: Overlay uses position:absolute instead of position:fixed
  evidence: nav__overlay uses `position: fixed; inset: 0;` (nav.css line 171-172). This correctly covers the full viewport regardless of scroll position.
  timestamp: 2026-03-14

- hypothesis: z-index conflict between nav--scrolled state and overlay
  evidence: nav z-index is 100, overlay z-index is 150, hamburger z-index is 200. These are correctly layered and do not change based on nav--scrolled. No z-index conflict exists.
  timestamp: 2026-03-14

- hypothesis: nav--scrolled class applies styles that affect the overlay layout
  evidence: nav--scrolled only changes background-color, backdrop-filter, and border-bottom on the .nav element itself. No styles target .nav--scrolled .nav__overlay or similar compound selectors. The overlay is unaffected by the scrolled state.
  timestamp: 2026-03-14

- hypothesis: nav height changes affect overlay positioning
  evidence: --nav-height is a fixed 4rem value. The overlay uses inset:0 independent of nav height. No dynamic height changes occur.
  timestamp: 2026-03-14

## Evidence

- timestamp: 2026-03-14
  checked: nav__overlay CSS positioning
  found: Uses `position: fixed; inset: 0; z-index: 150` -- correctly viewport-anchored
  implication: Overlay positioning is scroll-independent, which is correct

- timestamp: 2026-03-14
  checked: nav--scrolled CSS rules
  found: Only modifies background-color, backdrop-filter, and border-bottom on .nav element
  implication: No compound selectors affect overlay when scrolled

- timestamp: 2026-03-14
  checked: no-scroll utility class
  found: Only sets `overflow: hidden` on body. Does NOT set `position: fixed` or save/restore scroll position.
  implication: On iOS Safari, `overflow: hidden` alone does NOT prevent background scrolling. The page can still scroll behind the overlay, and when the overlay closes, the scroll position may jump. This is a well-known iOS issue.

- timestamp: 2026-03-14
  checked: nav__overlay-link--active class
  found: JS toggles this class (nav.js line 60) but NO CSS rule defines its appearance
  implication: Active link highlighting in overlay is a no-op; minor cosmetic gap but not the layout bug

- timestamp: 2026-03-14
  checked: openOverlay / closeOverlay JS functions
  found: No scroll position save/restore logic. No scrollTo(0,0) call. No iOS scroll-lock workaround.
  implication: When overlay opens while scrolled, background may visually shift on some browsers

## Resolution

root_cause: The `no-scroll` body class only applies `overflow: hidden`, which is insufficient on iOS/Safari to prevent background content from scrolling behind the fixed overlay. When the menu is opened while scrolled down, the background page can still be scrolled (or jumps) on mobile WebKit browsers, creating a different visual experience compared to opening at the top. Additionally, there is no scroll-position save/restore mechanism, so closing the overlay after background scroll drift loses the user's position.
fix: n/a (diagnosis only)
verification: n/a
files_changed: []
