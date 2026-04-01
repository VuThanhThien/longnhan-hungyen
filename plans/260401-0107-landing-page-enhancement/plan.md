---
title: "Storefront Enhancement — Landing, Product Page & Home Page"
description: "6-phase plan covering conversion elements, trust signals, UX polish, product page improvements, and home page redesign based on tinhhoaphohien.vn reference"
status: completed
priority: P1
effort: 25h
issue:
branch: master
tags: [frontend, feature, landing, product-page, home-page]
created: 2026-04-01
---

# Storefront Enhancement Plan

## Overview

Gap analysis comparing current storefront against two reference pages:
- Product page: tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua
- Home page: tinhhoaphohien.vn/

**Note on already-implemented items:** `structured-data.ts` fully built, product breadcrumb wired, related products exist. Phase 4 scope adjusted accordingly.

## Phases

| # | Phase | Status | Effort | Priority | Link |
|---|-------|--------|--------|----------|------|
| 1 | Critical Conversion Elements | Completed | 4h | P1 | [phase-01](./phase-01-conversion-elements.md) |
| 2 | Trust & Social Proof | Completed | 3h | P1 | [phase-02](./phase-02-trust-social-proof.md) |
| 3 | UX & Navigation Polish | Completed | 3h | P2 | [phase-03](./phase-03-ux-navigation-polish.md) |
| 4 | Content Sections | Completed | 2h | P2 | [phase-04](./phase-04-content-sections.md) |
| 5 | Product Page Enhancement | Completed | 5h | P1 | [phase-05](./phase-05-product-page-enhancement.md) |
| 6 | Home Page Enhancement | Completed | 8h | P1 | [phase-06](./phase-06-home-page-enhancement.md) |

## Dependency Chain

```
Phase 1 (Floating contact, service badges)
  ↓
Phase 2 (Trust/social proof) ─── Phase 5 (Product page) [parallel]
  ↓
Phase 3 (UX polish) ─────────── Phase 6 (Home page) [parallel after Phase 1]
  ↓
Phase 4 (Content sections)
```

## Key Dependencies

- Phase 1 first — floating contact bar is global, blocks layout for other phases
- Phases 2 & 5 can run in parallel after Phase 1
- Phases 3 & 6 can run in parallel after Phase 1
- Phase 4 after Phase 3 (uses back-to-top, layout stable)
- `SOCIAL_LINKS` constants must be filled before Phase 1 CTAs work

## Already Implemented (skip in planning)

- `apps/web/src/lib/structured-data.ts` — full JSON-LD builders ✅
- Product page: breadcrumb, JSON-LD Product + BreadcrumbList schemas ✅
- Product page: related products, tabs, spec table ✅
- Product images: thumbnail switcher ✅

## Files Reference

- Entry: `apps/web/src/app/page.tsx`
- Landing components: `apps/web/src/components/landing/`
- Product page: `apps/web/src/app/products/[slug]/page.tsx`
- Product components: `apps/web/src/components/products/`
- Layout: `apps/web/src/components/layout/`
- Content data: `apps/web/src/data/landing-page-content.ts`
- Constants: `apps/web/src/lib/constants.ts`
