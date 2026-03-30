---
title: "Long Nhan Hung Yen E-Commerce Platform"
description: "Full-stack e-commerce platform for longan specialties with NestJS API, Next.js storefront + admin, Vietnamese SEO"
status: pending
priority: P1
effort: 40h
branch: main
tags: [ecommerce, nestjs, nextjs, typeorm, turborepo, vietnamese-seo]
created: 2026-03-29
---

# Long Nhan Hung Yen E-Commerce Platform

## Overview

E-commerce + content platform selling "Long Nhan Hung Yen" (longan specialties) targeting Vietnamese market. Monorepo with NestJS backend, Next.js storefront (SEO-first), Next.js admin panel. No customer accounts; orders via form (COD + QR bank transfer). Admin-only JWT auth.

## Research References

- [Brainstorm Report](../reports/brainstorm-260329-2123-longnhan-hungyên-ecommerce.md)
- [NestJS + TypeORM Research](../reports/researcher-260329-2130-nestjs-typeorm-ecommerce-guide.md)
- [Next.js SEO Research](../reports/researcher-260329-2129-nextjs14-ecommerce-vietnamese-seo.md)
- [Backend Boilerplate](https://vndevteam.github.io/nestjs-boilerplate/development.html) — use as foundation for apps/api

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Monorepo | Turborepo + pnpm workspaces | -- |
| Backend | NestJS + TypeORM + PostgreSQL (vndevteam boilerplate) | Railway |
| Local Dev DB | PostgreSQL + Redis via Docker Compose (localhost) | Docker |
| Storefront | Next.js 14 App Router | Vercel |
| Admin | Next.js 14 App Router + shadcn/ui | Vercel |
| Shared | `packages/types` TypeScript | -- |
| Media | Cloudinary | Free tier |
| Payments | Manual COD + QR bank transfer | -- |

## Phases

| # | Phase | File | Effort | Status |
|---|-------|------|--------|--------|
| 1 | Monorepo Setup | [phase-01](phase-01-monorepo-setup.md) | 3h | completed |
| 2 | Database & Entities | [phase-02](phase-02-database-entities.md) | 5h | completed |
| 3 | Backend API | [phase-03](phase-03-backend-api.md) | 10h | completed |
| 4 | Storefront | [phase-04](phase-04-storefront.md) | 10h | pending |
| 5 | Admin Panel | [phase-05](phase-05-admin-panel.md) | 10h | pending |
| 6 | Deployment | [phase-06](phase-06-deployment.md) | 2h | pending |

**Total estimated effort: ~40 hours (solo developer)**

## Key Architecture Decisions

1. **Simplified entity model** -- Product has variants (weight/size), no separate SKU table. MVP scope.
2. **No customer auth** -- Orders captured via phone/email form, admin manages lifecycle.
3. **Vietnamese-only** -- No i18n complexity. Single locale, UTF-8 throughout.
4. **ISR for products** -- Revalidate every 60s for fresh stock data. SSG for articles.
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
                                                Phase 3 + 4 + 5 --> Phase 6 (Deploy)
```

Phase 4 and 5 can run in parallel once Phase 3 is complete.

## Monthly Cost

| Service | Cost |
|---------|------|
| Vercel (web + admin) | Free |
| Railway (API + PostgreSQL) | ~$5-10 |
| Cloudinary | Free (25GB) |
| Domain | ~$1 |
| **Total** | **~$6-11/mo** |
