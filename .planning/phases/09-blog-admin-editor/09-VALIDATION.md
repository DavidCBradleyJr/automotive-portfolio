---
phase: 09
slug: blog-admin-editor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 09 — Validation Strategy

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && test -f dist/admin.html && echo "ADMIN BUILD OK"` |
| **Estimated runtime** | ~15 seconds |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog tab appears in admin | EDITOR-01 | Visual check | Log in to /admin, verify Blog tab exists |
| Formatting toolbar works | EDITOR-02 | Interactive | Select text, click Bold, verify markdown syntax inserted |
| Preview renders markdown | EDITOR-03 | Visual check | Type markdown, switch to Preview tab, verify rendered HTML |
| Gallery sidebar drag-to-insert | EDITOR-04 | Interactive | Drag image from sidebar into editor textarea |
| New photo upload in editor | EDITOR-05 | External service | Upload photo, verify it appears in Cloudinary gallery |
| Draft/publish toggle | EDITOR-07 | Workflow | Save as draft, verify not on public site. Publish, verify appears. |
| Post saves to GitHub | BDATA-05 | External service | Save post, check GitHub repo for committed file |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify
- [ ] Sampling continuity maintained
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s

**Approval:** pending
