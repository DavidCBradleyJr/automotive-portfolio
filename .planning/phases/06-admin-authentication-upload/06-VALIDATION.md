---
phase: 06
slug: admin-authentication-upload
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks |
| **Config file** | none |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && test -f dist/admin.html && echo "ADMIN BUILD OK"` |
| **Estimated runtime** | ~15 seconds (includes Cloudinary API fetch) |

---

## Sampling Rate

- **After every task commit:** Run quick build
- **After every plan wave:** Run full suite
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Netlify Identity login flow | AUTH-01 | Requires deployed site | Deploy, visit /admin, login with invited email |
| Drag-and-drop upload | UPLOAD-01 | Interactive UI | Drop image files onto upload zone |
| Upload reaches Cloudinary | UPLOAD-06 | External service | Check Cloudinary Media Library after upload |
| Site rebuilds after upload | UPLOAD-07 | Netlify webhook | Check Netlify deploy log after upload |
| Hero image changes | n/a | Visual check | Select new hero in Settings tab, wait for rebuild |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
