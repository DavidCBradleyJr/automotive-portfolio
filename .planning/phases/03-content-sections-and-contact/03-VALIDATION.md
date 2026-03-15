---
phase: 03
slug: content-sections-and-contact
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks (no test framework — static site) |
| **Config file** | none |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && echo "BUILD OK"` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vite build && echo "BUILD OK"`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | VID-01..04 | build + grep | `npx vite build && grep "lite-youtube" index.html` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | ABOUT-01..04 | build + grep | `npx vite build && grep "about__" src/components/about.css` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | BTS-01..03 | build + grep | `npx vite build && grep "bts__" src/components/bts.css` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | SOCIAL-01..02 | build + grep | `npx vite build && grep "social__" src/components/social.css` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | CONT-01..07 | build + grep | `npx vite build && grep "contact__" src/components/contact.css` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lite-youtube-embed` npm package installed
- [ ] Component CSS/JS files created for each section

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Video facade loads without heavy payload | VID-02 | Network tab check | Open DevTools Network, verify no YouTube iframe until click |
| Two-column about layout on desktop | ABOUT-03 | Visual layout | View at 1440px+, verify photo left / text right |
| Form Formspree submission | CONT-02 | External service | Submit form, check network for POST to Formspree |
| Toast notification on form success | CONT-04 | Visual/interaction | Submit form, observe toast slide in |
| Inline validation errors | CONT-03 | Visual/interaction | Submit empty form, check inline error messages |
| Social wall square crops | SOCIAL-02 | Visual check | Verify 3x3 grid with square images |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
