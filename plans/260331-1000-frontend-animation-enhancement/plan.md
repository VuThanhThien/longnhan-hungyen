---
title: "Frontend Animation Enhancement"
description: "Add motion library, scroll-reveal, product UX animations, landing sections, and mobile UX to apps/web"
status: in-progress
priority: P2
effort: ~16h
branch: master
tags: [frontend, feature, animation, ux]
created: 2026-03-31
updated: "2026-03-31T18:15"
---

# Frontend Animation Enhancement

## Overview

Adds elegant, subtle motion to `apps/web` (Next.js 16 App Router + React 19 + Tailwind CSS v4) using the `motion` library. Four sequential phases building from core infrastructure to advanced UX.

Style direction: premium organic food brand — scroll-triggered reveals, soft parallax, refined micro-interactions.

## Progress & continuity

**Last updated:** 2026-03-31 (consistency sync)

- `motion` is installed; `pnpm --filter @longnhan/web type-check` passes.
- `ScrollReveal` wraps landing + home sections on `app/page.tsx` (interim pattern vs plan’s `AnimatedSection` / `StaggerContainer` filenames).
- **Checklist progress:** 4/39 (~10.3%) across `phase-*.md` after sync-back; Phase 1 items partially satisfied by `ScrollReveal`; Phases 2–4 still entirely open in code vs their checklists.

## Research

- [Brainstorm Report](../reports/brainstorm-260331-1000-frontend-animation-enhancement.md)

## Tech Constraints

- `motion` v11+ (Framer Motion successor) — React 19 native, tree-shakable
- All `motion.*` components must be in `'use client'` files (SSR-safe)
- `prefers-reduced-motion` respected globally
- Tailwind CSS v4 — no class conflicts with motion transforms
- Lighthouse Performance ≥ 85 must be maintained

## Phases

| # | Phase | File | Effort | Status |
|---|-------|------|--------|--------|
| 1 | Core Animation Layer | [phase-01](phase-01-core-animation-layer.md) | ~4h | in-progress |
| 2 | Product Experience | [phase-02](phase-02-product-experience.md) | ~4h | pending |
| 3 | Landing Page Sections | [phase-03](phase-03-landing-page-sections.md) | ~5h | pending |
| 4 | Mobile UX | [phase-04](phase-04-mobile-ux.md) | ~3h | pending |

**Total: ~16h**

## Dependency Chain

```
Phase 1 (motion install + AnimatedSection) ← start
Phase 2 (product UX) ← blocked by Phase 1
Phase 3 (landing sections) ← blocked by Phase 1
Phase 4 (mobile UX) ← blocked by Phase 1
```

Phases 2, 3, 4 can run in parallel after Phase 1 completes.
