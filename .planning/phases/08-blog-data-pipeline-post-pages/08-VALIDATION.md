---
phase: 08
slug: blog-data-pipeline-post-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 08 — Validation Strategy

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && test -d dist/blog && echo "BLOG BUILD OK"` |
| **Estimated runtime** | ~15 seconds |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog post renders with correct typography | BLOG-05 | Visual check | Open /blog/sample-post, verify dark theme + fonts |
| Photos display inline with PhotoSwipe | BLOG-03 | Interactive | Click a photo in a post, verify lightbox opens |
| Nav links work on blog pages | BLOG-05 | Navigation | Click Gallery/About links, verify they go to main page sections |
| Responsive at 320px and 1440px+ | BLOG-07 | Visual check | Resize browser, verify reading column adjusts |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify
- [ ] Sampling continuity maintained
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
