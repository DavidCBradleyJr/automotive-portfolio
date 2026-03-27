# Phase 11: Foundation & Pipeline Validation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 11-foundation-pipeline-validation
**Areas discussed:** Project setup, Netlify functions, Dark theme FOUC, Deployment strategy

---

## Project Setup (New project vs in-place)

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh project alongside | Create next/ directory with clean Next.js scaffold. Existing Vite site stays live. | ✓ |
| Replace in-place | Remove Vite config, restructure existing files. Breaks live site immediately. | |
| Separate repo | Entirely new repository. Maximum isolation but harder to reference existing code. | |

**User's choice:** Fresh project alongside (Recommended)
**Notes:** None — straightforward decision.

---

## Netlify Functions Fate

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as Netlify Functions | Leave all 11 functions untouched. Migrate in Phase 15. | ✓ |
| Migrate to API routes now | Convert all 11 to Next.js API routes in Phase 11. | |
| You decide | Claude picks best approach. | |

**User's choice:** Keep as Netlify Functions (Recommended)
**Notes:** None — defer migration to admin panel phase.

---

## Dark Theme FOUC Prevention

| Option | Description | Selected |
|--------|-------------|----------|
| CSS-only with color-scheme | Set color-scheme: dark + dark background in global CSS. Zero JS. | ✓ |
| Inline script in layout | Tiny script in head that sets dark class before paint. | |
| You decide | Claude picks simplest approach. | |

**User's choice:** CSS-only with color-scheme (Recommended)
**Notes:** None — simplest approach wins.

---

## Deployment Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| New staging Netlify site | Separate site for Next.js version. Swap DNS when ready. | ✓ |
| Branch deploys on same site | Use Netlify branch deploys on existing site. | |
| Same site, replace immediately | Push Next.js directly to existing site. | |

**User's choice:** New staging Netlify site (Recommended)
**Notes:** None — keeps live site safe during development.

---

## Claude's Discretion

- TypeScript configuration strictness
- ESLint/Prettier config
- Tailwind v4 base configuration
- next-cloudinary setup details
- Test image selection

## Deferred Ideas

None — discussion stayed within phase scope.
