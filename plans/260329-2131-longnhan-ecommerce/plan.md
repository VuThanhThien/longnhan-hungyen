---
title: "Long Nhan Hung Yen E-Commerce Platform"
description: "Full-stack e-commerce platform for longan specialties with NestJS API, Next.js storefront + admin, Vietnamese SEO"
status: in-progress
priority: P1
effort: 47h
branch: main
tags: [ecommerce, nestjs, nextjs, typeorm, turborepo, vietnamese-seo, axios, tanstack-query]
created: 2026-03-29
updated: "2026-03-31T18:15"
---

# Long Nhan Hung Yen E-Commerce Platform

## Overview

E-commerce + content platform selling "Long Nhan Hung Yen" (longan specialties) targeting Vietnamese market. Monorepo with NestJS backend, Next.js storefront (SEO-first), Next.js admin panel. No customer accounts; orders via form (COD + QR bank transfer). Admin-only JWT auth.

## Progress & continuity

**Last updated:** 2026-03-31 (scope alignment for admin product/article/media flow)

| Artifact | Purpose |
|----------|---------|
| [`.agent/agent-memo.md`](../../.agent/agent-memo.md) | Session handoff — what to do next, key paths |
| [`.agent/PROJECT-STATUS.md`](../../.agent/PROJECT-STATUS.md) / [`.claude/PROJECT-STATUS.md`](../../.claude/PROJECT-STATUS.md) | Phase rollup vs repo reality |
| [`plans/reports/pm-260331-1800-status-sync.md`](../reports/pm-260331-1800-status-sync.md) | Latest PM checklist reconciliation |
| [`plans/reports/brainstorm-260331-1815-admin-product-article-media-dynamic-pages.md`](../reports/brainstorm-260331-1815-admin-product-article-media-dynamic-pages.md) | Scope decision for admin-driven product/article dynamic pages |

**Phases 1–3:** Done (monorepo, DB/entities, public + admin API surface per phase docs).
**Checklist progress:** 69/94 tasks checked (~73.4%) across `phase-*.md` (synced to repo 2026-03-31).

**Phase 4 (near closure):** Storefront routes, PDP stack, articles, robots/sitemap, JSON-LD, Cloudinary loader, and metadata are implemented; **remaining** in `phase-04-storefront.md`: manual mobile viewport pass and Lighthouse audit. Confirm **order payload** parity with `CreateOrderReqDto` for reliable E2E submit.

**Phase 5 (in progress):** Auth shell, dashboard overview, toasts, and basic loading/error paths exist; remaining priority is product/article/media CRUD completion + media URL binding and E2E verification of storefront reflection per `phase-05-admin-panel.md`.

**Phase 6 (in progress):** `motion` dependency and `ScrollReveal`-based landing motion are in place; hero motion polish, FAQ accordion motion, channels/testimonials polish, optional keyframes, and Lighthouse smoke still open per `phase-06-frontend-landing-enhancement.md`.

**Phase 7:** Not started (deployment checklist open).

## Research References

- [Brainstorm Report](../reports/brainstorm-260329-2123-longnhan-hungyên-ecommerce.md)
- [Scope Alignment Brainstorm (Admin product/article/media)](../reports/brainstorm-260331-1815-admin-product-article-media-dynamic-pages.md)
- [NestJS + TypeORM Research](../reports/researcher-260329-2130-nestjs-typeorm-ecommerce-guide.md)
- [Next.js SEO Research](../reports/researcher-260329-2129-nextjs14-ecommerce-vietnamese-seo.md)
- [Backend Boilerplate](https://vndevteam.github.io/nestjs-boilerplate/development.html) — use as foundation for apps/api

## Storefront PDP design reference

Product detail page (PDP) UX and content structure should follow the parity spec derived from a real Vietnamese specialty PDP:

- **Reference URL:** [Long nhãn Hưng Yên — Tinh Hoa Phố Hiến](https://tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua) (MAI TRANG / WooCommerce-style layout).
- **Agent handoff:** [`.agent/agent-memo.md`](../../.agent/agent-memo.md) — condensed requirements, content blocks, and implementation notes for Phase 4.
- **Plan detail:** [Phase 4 — Product detail subsection](phase-04-storefront.md#product-detail-page-pdp--reference-parity) in `phase-04-storefront.md`.

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Monorepo | Turborepo + pnpm workspaces | -- |
| Backend | NestJS + TypeORM + PostgreSQL (vndevteam boilerplate) | Railway |
| Local Dev DB | PostgreSQL + Redis via Docker Compose (localhost) | Docker |
| Storefront | Next.js 16 App Router, React 19, Tailwind CSS 4 | Vercel |
| Storefront (data & forms) | axios, TanStack Query, react-hook-form, yup (`@hookform/resolvers`) | -- |
| Admin | Next.js App Router + shadcn/ui (same major stack as web) | Vercel |
| Shared | `packages/types` TypeScript | -- |
| Media | Cloudinary | Free tier |
| Payments | Manual COD + QR bank transfer | -- |

## Phases

| # | Phase | File | Effort | Status |
|---|-------|------|--------|--------|
| 1 | Monorepo Setup | [phase-01](phase-01-monorepo-setup.md) | 3h | completed |
| 2 | Database & Entities | [phase-02](phase-02-database-entities.md) | 5h | completed |
| 3 | Backend API | [phase-03](phase-03-backend-api.md) | 10h | completed |
| 4 | Storefront | [phase-04](phase-04-storefront.md) | 12h | in-progress |
| 5 | Admin Panel | [phase-05](phase-05-admin-panel.md) | 10h | in-progress |
| 6 | Frontend — landing motion & effects | [phase-06](phase-06-frontend-landing-enhancement.md) | 5h | in-progress |
| 7 | Deployment | [phase-07](phase-07-deployment.md) | 2h | pending |

**Total estimated effort: ~47 hours (solo developer)** — includes PDP reference parity (Phase 4) and landing motion/micro-interactions (Phase 6).

## Key Architecture Decisions

1. **Simplified entity model** -- Product has variants (weight/size), no separate SKU table. MVP scope.
2. **No customer auth** -- Orders captured via phone/email form, admin manages lifecycle.
3. **Vietnamese-only** -- No i18n complexity. Single locale, UTF-8 throughout.
4. **ISR for products/articles** -- Product detail revalidate every 60s; article detail uses ISR window 3600s by explicit scope decision for current phase (no on-demand revalidation in Phase 5).
5. **Server Actions for orders** -- No client-side cart state needed, single form submission.
6. **CRITICAL: Frontend never touches DB directly** -- Both `apps/web` and `apps/admin` MUST call `apps/api` (NestJS REST API) for all data. No TypeORM/DB imports in frontend apps. All data access goes through HTTP API calls.

```
apps/web   ──HTTP──▶  apps/api  ──TypeORM──▶  PostgreSQL
apps/admin ──HTTP──▶  apps/api  ──TypeORM──▶  PostgreSQL
                       (only layer that touches DB)
```

## Dependencies Between Phases

```
Phase 1 (Monorepo) --> Phase 2 (Database) --> Phase 3 (API) --> Phase 4 (Storefront)
                                                            --> Phase 5 (Admin)
Phase 1 --> Phase 6 (Landing motion)   # can start early; finish before prod launch
                                                Phase 3 + 4 + 5 + 6 --> Phase 7 (Deploy)
```

Phase 4 and 5 can run in parallel once Phase 3 is complete. Phase 6 can run in parallel with 4/5 after Phase 1 (landing code exists in `apps/web`); **Phase 7** assumes Phase 6 done for production polish.

## Monthly Cost

| Service | Cost |
|---------|------|
| Vercel (web + admin) | Free |
| Railway (API + PostgreSQL) | ~$5-10 |
| Cloudinary | Free (25GB) |
| Domain | ~$1 |
| **Total** | **~$6-11/mo** |
