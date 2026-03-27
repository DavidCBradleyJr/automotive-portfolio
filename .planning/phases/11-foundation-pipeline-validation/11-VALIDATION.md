---
phase: 11
slug: foundation-pipeline-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + CLI checks (no test framework in Phase 11 — infrastructure validation) |
| **Config file** | none — Phase 11 is scaffolding |
| **Quick run command** | `cd next && npm run build` |
| **Full suite command** | `cd next && npm run build && npx next start & sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd next && npm run build`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | V4-FOUND-01 | build | `cd next && npm run build` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | V4-FOUND-01 | deploy | `netlify deploy --dir=next/.next` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 1 | V4-FOUND-02 | build | `cd next && npm run build` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 1 | V4-FOUND-03 | bundle | `cd next && npm run build && du -sh .next/static` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `next/` directory scaffolded with `create-next-app`
- [ ] `next/package.json` — dependencies installed
- [ ] Netlify site created and linked

*Infrastructure phase — Wave 0 IS the phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No FOUC (dark theme loads immediately) | V4-FOUND-01 | Visual check in browser | Open deployed URL, verify dark background appears with no white flash |
| CldImage blur-up placeholder | V4-FOUND-02 | Visual rendering check | Open test page, verify image loads with blur placeholder transitioning to full image |
| Direct URL access works | V4-FOUND-01 | Netlify routing | Navigate directly to deployed URL paths, verify no 404/500 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
