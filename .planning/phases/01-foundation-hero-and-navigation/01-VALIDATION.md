---
phase: 1
slug: foundation-hero-and-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (e2e) + Node scripts (unit checks) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx playwright test --grep @smoke` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | FOUND-01 | smoke | `npm run build` | N/A | ⬜ pending |
| 01-01-02 | 01 | 0 | FOUND-03 | unit | `node tests/contrast-check.js` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 0 | FOUND-06, HERO-05 | unit | `node tests/image-budget.js` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 0 | FOUND-04 | e2e | `npx playwright test --grep @fonts` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 0 | FOUND-05 | e2e | `npx playwright test --grep @responsive` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 0 | FOUND-07 | e2e | `npx playwright test --grep @scroll` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUND-02 | manual | Visual review in DevTools | manual-only | ⬜ pending |
| 01-02-02 | 02 | 1 | HERO-01 | e2e | `npx playwright test --grep @hero` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | HERO-02 | e2e | `npx playwright test --grep @hero-name` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | HERO-03 | e2e | `npx playwright test --grep @hero-tagline` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 1 | HERO-04 | e2e | `npx playwright test --grep @hero-cta` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | NAV-01 | e2e | `npx playwright test --grep @nav-sticky` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | NAV-02 | e2e | `npx playwright test --grep @nav-scroll` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 1 | NAV-03 | e2e | `npx playwright test --grep @scrollspy` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 | 1 | NAV-04 | e2e | `npx playwright test --grep @hamburger` | ❌ W0 | ⬜ pending |
| 01-03-05 | 03 | 1 | NAV-05 | e2e | `npx playwright test --grep @wordmark` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.js` — Playwright configuration for Vite dev server
- [ ] `tests/foundation.spec.js` — stubs for FOUND-01 through FOUND-07
- [ ] `tests/navigation.spec.js` — stubs for NAV-01 through NAV-05
- [ ] `tests/hero.spec.js` — stubs for HERO-01 through HERO-05
- [ ] `tests/contrast-check.js` — Node script to verify WCAG AA contrast ratios
- [ ] `tests/image-budget.js` — Node script to check hero image file size
- [ ] `@playwright/test` + `chromium` — framework install

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSS custom properties define full design token system | FOUND-02 | Token naming/organization is a design decision | Open DevTools, inspect `:root`, verify three-tier token structure (primitives, semantic, component) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
