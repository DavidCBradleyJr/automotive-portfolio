---
phase: 02
slug: gallery-and-image-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks (no test framework — static site) |
| **Config file** | none |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && node -e "const fs=require('fs'); const f=fs.readdirSync('public/images/gallery'); console.log(f.length+' gallery images'); if(f.length<8) process.exit(1)"` |
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
| 02-01-01 | 01 | 1 | GAL-04 | file check | `ls public/images/gallery/*.webp \| wc -l` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | GAL-01 | build + grep | `npx vite build && grep "gallery" index.html` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | GAL-02, GAL-03 | build | `npx vite build` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | GAL-05 | grep | `grep "lqip\|blur" src/components/gallery.css` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | GAL-06 | build + check | `npx vite build && grep "photoswipe" package.json` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Gallery image directory exists (`public/images/gallery/`)
- [ ] Build script or image processing pipeline configured

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Masonry layout renders correctly | GAL-01 | Visual layout | Open browser, verify 3-column staggered grid |
| Filter animation is smooth | GAL-03 | Visual/interaction | Click category pills, observe fade/rearrange/fade |
| PhotoSwipe pinch-to-zoom | GAL-06 | Touch input | Test on mobile device or touch simulator |
| LQIP blur-up visible | GAL-05 | Visual timing | Throttle network, observe blur placeholder → sharp image |
| Mobile full-bleed layout | GAL-07 | Responsive visual | Resize to 320px, verify edge-to-edge images |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
