---
phase: 04
slug: animations-polish-and-launch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks (no test framework — static site) |
| **Config file** | none |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && du -sh dist/ && echo "BUILD OK"` |
| **Estimated runtime** | ~5 seconds |

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
| 04-01-01 | 01 | 1 | ANIM-01..05 | build + grep | `npx vite build && grep "gsap" src/components/animations.js` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | FOOT-01, FOOT-02 | build + grep | `npx vite build && grep "footer" index.html` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | PERF-01..08 | build + size | `npx vite build && du -sh dist/` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] GSAP + ScrollTrigger npm packages installed
- [ ] Footer element created in index.html

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Section reveal animations on scroll | ANIM-01 | Visual timing | Scroll through page, verify fade+translateY reveals |
| Hero parallax depth | ANIM-02 | Visual effect | Scroll past hero, verify image moves slower than content |
| Gallery stagger on first scroll | ANIM-05 | Visual timing | Scroll to gallery, verify staggered entrance |
| Reduced motion disables all | ANIM-04 | OS setting | Enable reduce motion, reload, verify no animations |
| Lighthouse mobile 90+ | PERF-01 | External tool | Run Lighthouse audit on deployed site |
| LCP < 2.5s | PERF-02 | External tool | Check LCP in Lighthouse report |
| Hamburger menu fix | Bug fix | Interactive | Open hamburger at various scroll positions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
