---
phase: 05
slug: cloudinary-storage-build-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + automated CLI checks |
| **Config file** | none |
| **Quick run command** | `npx vite build && echo "BUILD OK"` |
| **Full suite command** | `npx vite build && node -e "const d=require('fs').readFileSync('src/data/gallery-images.js','utf8'); const m=d.match(/id:/g); console.log((m?m.length:0)+' entries'); if(!m||m.length<29) process.exit(1)"` |
| **Estimated runtime** | ~10 seconds (includes Cloudinary API fetch) |

---

## Sampling Rate

- **After every task commit:** Run `npx vite build && echo "BUILD OK"`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | STOR-01, STOR-05 | script + check | `node scripts/migrate-to-cloudinary.js --dry-run` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | BUILD-01, BUILD-02, BUILD-03, BUILD-04 | build + verify | `npx vite build && grep "cloudinary" src/data/gallery-images.js` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | STOR-02, STOR-03, STOR-04 | build + count | Full suite command | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- [ ] Cloudinary account created (user action)
- [ ] Cloudinary credentials as environment variables

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Images load from Cloudinary CDN | STOR-01 | Network check | Open site, DevTools Network tab, verify image URLs are res.cloudinary.com |
| WebP auto-format delivery | STOR-02 | Browser-dependent | Check response headers for content-type: image/webp |
| Gallery looks identical to v1 | BUILD-03 | Visual comparison | Compare before/after screenshots |
| BTS and social images still load | n/a | Path change | Verify BTS and social sections show images |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
