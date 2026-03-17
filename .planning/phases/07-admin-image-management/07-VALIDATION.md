---
phase: 07
slug: admin-image-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks |
| **Config file** | none |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && test -f dist/admin.html && echo "ADMIN BUILD OK"` |
| **Estimated runtime** | ~15 seconds |

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
| Edit modal opens with image data | MGMT-02 | Interactive UI | Click edit on gallery card, verify fields populated |
| Category change moves image | MGMT-02 | Cloudinary side effect | Change category, rebuild, verify image appears in new category |
| Soft delete hides from gallery | MGMT-03 | Build + visual | Delete image, rebuild, verify not in public gallery |
| Restore brings image back | MGMT-03 | Build + visual | Restore from trash, rebuild, verify back in gallery |
| Drag-and-drop reorder | MGMT-04 | Touch/mouse interaction | Drag cards to reorder, save, rebuild, verify order |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
