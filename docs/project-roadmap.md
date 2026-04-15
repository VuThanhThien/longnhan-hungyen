# Project Roadmap

**Last Updated:** 2026-04-13
**Current Phase:** Phase 5 — Admin Panel (in progress). Phase 4 — Storefront (**complete**).

---

## Overview

Long Nhan Hung Yen development roadmap tracks phases from core infrastructure through production deployment. Status reflects actual codebase state as of 2026-04-01; Phase 7 scope updated 2026-04-13 to match the active deployment / storefront hardening plan (see Phase 7).

---

## Phase Summary

| Phase | Title               | Status      | Progress | Completion     |
| ----- | ------------------- | ----------- | -------- | -------------- |
| 1     | Monorepo Setup      | Complete    | 100%     | 2026-03-29     |
| 2     | Database & Entities | Complete    | 100%     | 2026-03-29     |
| 3     | Backend API         | Complete    | 100%     | 2026-03-29     |
| 4     | Storefront (Web)    | Complete    | 100%     | 2026-04-01     |
| 5     | Admin Panel         | In Progress | ~75%     | ~2026-04-10    |
| 6     | Frontend Animation  | In Progress | ~50%     | ~2026-04-15    |
| 7     | Deployment          | Pending     | 0%       | Post Phase 5+6 |

**Overall Completion:** ~81% (approx. 86/106 tasks; Phase 7 expanded 2026-04-13)

---

## Phase 1: Monorepo Setup (COMPLETE)

**Duration:** 3 days | **Status:** DONE | **Progress:** 100% | **Completed:** 2026-03-29

### Objectives

- [x] Initialize Turborepo + pnpm workspaces
- [x] Configure TypeScript, ESLint, Prettier
- [x] Setup Docker & Docker Compose (production + local dev)
- [x] Configure GitHub Actions CI/CD
- [x] Create shared @longnhan/types package
- [x] Setup Swagger/OpenAPI documentation

### Deliverables

- [x] Monorepo structure: apps/ (api, web, admin), packages/ (types)
- [x] docker-compose.yml (PostgreSQL, Redis, MailDev, pgAdmin)
- [x] docker-compose.local.yml (+ NestJS API with hot reload)
- [x] GitHub Actions workflows (lint, test, build)
- [x] Root TypeScript & ESLint config
- [x] Shared types package with barrel exports

---

## Phase 2: Database & Entities (COMPLETE)

**Duration:** 5 days | **Status:** DONE | **Progress:** 100% | **Completed:** 2026-03-29

### Objectives

- [x] Setup TypeORM with PostgreSQL
- [x] Define all core entities: User, Session, Product, ProductVariant, Order, OrderItem, Article, Media
- [x] Configure migrations system
- [x] Setup database seeds with Faker
- [x] Implement entity relationships & constraints

### Deliverables

- [x] 8 entities with complete relationships
- [x] TypeORM migration system (auto-generated)
- [x] Seed data for development (users, products, articles)
- [x] Entity indexes on frequently-queried columns
- [x] JSONB support for flexible data (order variants, media metadata)

---

## Phase 3: Backend API (COMPLETE)

**Duration:** 10 days | **Status:** DONE | **Progress:** 100% | **Completed:** 2026-03-29

### Objectives

- [x] Implement 10 API modules: Auth, Users, Products, Orders, Articles, Media, Dashboard, Health, Home, Posts (scaffold)
- [x] JWT auth with refresh token rotation
- [x] Admin CRUD endpoints (products, articles, orders, media)
- [x] Public endpoints (product list/detail, article list/detail)
- [x] Order creation with pessimistic stock locking
- [x] Cloudinary media integration
- [x] Admin dashboard stats (revenue, order count, daily breakdown)
- [x] Email queue (BullMQ + Redis background jobs)

### Deliverables

- [x] 10 feature modules with controllers/services/DTOs
- [x] JWT guards + roles-based access control
- [x] Admin routes protected by JwtAuthGuard + RolesGuard
- [x] Global exception filter with consistent error responses
- [x] Cloudinary provider for media uploads
- [x] Redis cache manager
- [x] BullMQ email queue processor

---

## Phase 4: Storefront (Web) (COMPLETE)

**Duration:** 12 days | **Status:** DONE | **Progress:** 100% | **Completed:** 2026-04-01

### Objectives

- [x] Next.js 16 App Router with React 19
- [x] Landing page with Hero, Story, ProductQuality, NutritionSeason, Channels, Testimonials, FAQ sections
- [x] Product listing page with ISR (revalidate 60s)
- [x] Product detail page (PDP) with variants, images, description
- [x] Article listing page
- [x] Article detail page with rich content
- [x] Order success page (/order-success)
- [x] JSON-LD schema for SEO
- [x] robots.txt + sitemap.xml generation
- [x] Cloudinary loader with image optimization
- [x] Dynamic metadata for all pages
- [x] TanStack Query for data fetching
- [x] Cookie-based auth token refresh (60s before expiry)
- [x] 13 new UX components (landing, product, navigation, contact, utility)
- [x] Enhanced product experience (quick-view, discount badges, stock indicators)
- [x] Floating contact widget + back-to-top button

### Key Enhancements (4/1 Release)

**New Components:** floating-contact-widget, landing-service-badges, landing-stats-bar, landing-urgency-strip, landing-articles-preview, landing-origin-badge, back-to-top-button, hero-carousel, category-nav-cards, home-products-by-category, product-quick-view-modal, product-pdp-trust-badges, product-pdp-share-buttons

**Phase 4 Expansion (April 15): Cart & Checkout** — _In Progress_

- [x] Zustand cart store v2 with display snapshots (`CartLine` type)
- [x] Cart storage key bumped to `'longnhan-cart-v2'`
- [x] Shipping flat rate constant: `SHIPPING_FLAT_VND = 30_000`
- [x] Order actions with Sentry integration (PII-safe)
- [ ] `/cart` page with line items, quantities, totals, CTAs
- [ ] `/checkout` page with customer form + order summary
- [ ] `QuantityStepper` shared component (reusable qty control)
- [ ] `CartLineItem` component (single cart line)
- [ ] `ProductAddToCart` component + `VariantPickerSheet` (multi-variant products)
- [ ] `OrderSuccessCartClearer` side-effect component (clears cart on success)
- [ ] Product card refactor (article layout, add-to-cart button, no nested interactives)
- [ ] Accessibility audit (aria-live, keyboard navigation, tabular-nums)

**Component Updates:** product-card (discount/stock/quick-view), product-pdp-hero (diacritics/tags), product-pdp-tabs (diacritics), product-images (zoom), layout (floating widget), landing-page-content (6 new data structures)

**Bug Fixes:** Math.min/max empty array guards, modal body scroll lock

### Key Files

- `apps/web/src/app/` — App Router routes (home, products, articles, order success, **`cart/`**)
- `apps/web/src/components/` — UI by domain (layout, landing, home, products, …) including **`header-search-bar.tsx`**, **`header-cart-button.tsx`**, **`mobile-nav.tsx`**
- `apps/web/src/lib/` — API clients, SEO, **`product-search-params.ts`** (nuqs), **`format-vnd.ts`**, **`format-phone-display.ts`**, form/validation helpers
- `apps/web/src/services/cart/` — Zustand guest cart (`cart-store.ts`, persisted)
- `apps/web/public/` — Static images and decorative assets (referenced from layout/components)
- `apps/web/src/data/` — `landing-page-content.ts` and related marketing copy structures

---

## Phase 5: Admin Panel (IN PROGRESS)

**Duration:** 10 days | **Status:** IN PROGRESS | **Progress:** ~75% | **Target:** 2026-04-10

### Objectives

- [x] Next.js Admin dashboard with Auth guard
- [x] Login page with form validation
- [x] Dashboard home: stats cards, revenue chart, recent orders
- [x] Products CRUD: list, create, edit, delete
- [x] Articles CRUD: list, create, edit, delete
- [x] Orders list with status display
- [x] Orders detail page with status update panel
- [x] Media manager: upload, folder navigation, URL picker
- [x] React Query for client-side state (stale 30s)
- [x] API proxy routes to backend (/api/media, /api/orders/:id/status, etc.)
- [x] Server-side API access via admin-api-client (for Server Components)
- [x] Form validation (react-hook-form + yup)
- [x] Radix UI components + toast notifications
- [x] TiptapHtmlEditor for rich text (products, articles)
- [ ] Date-range filters for orders
- [ ] Search filters for products/articles
- [ ] Storefront reflection verification (PDP parity with admin inputs)
- [ ] End-to-end CRUD test pass (all workflows)

### Remaining Tasks

- [ ] Implement date-range filter on orders list
- [ ] Add search/filter UI for products (name, category, price range)
- [ ] Add search/filter UI for articles (title, status, date range)
- [ ] Verify storefront PDP renders exactly as admin input specifies
- [ ] Run full E2E test suite (create product → verify PDP, create article → verify detail, etc.)

### Key Files

- `apps/admin/src/app/(dashboard)/` — Dashboard pages
- `apps/admin/src/components/` — Admin UI (products, articles, orders, media, charts)
- `apps/admin/src/features/` — Feature hooks (media, orders)
- `apps/admin/src/lib/` — HTTP clients, auth, form parsers

---

## Phase 6: Frontend Animation & Polish (IN PROGRESS)

**Duration:** 5 days | **Status:** IN PROGRESS | **Progress:** ~50% | **Target:** 2026-04-15

### Objectives

- [x] Install `motion` library (React 19 native)
- [x] Implement ScrollReveal for landing sections
- [x] Add basic section reveals & stagger effects
- [ ] Hero section motion polish (gradient fade, text reveal, CTA animation)
- [ ] FAQ accordion expand/collapse motion
- [ ] Channels section motion (card reveal, hover states)
- [ ] Testimonials section motion (carousel, quote reveal)
- [ ] Lighthouse performance audit (maintain ≥85)
- [ ] Respect prefers-reduced-motion for accessibility

### Completed

- [x] `motion` package installed
- [x] `ScrollReveal` component wrapping landing sections
- [x] Basic scroll-triggered reveal animations
- [x] Type-safe `motion` usage in 'use client' components

### Remaining Tasks

- [ ] Polish hero section animations (title + subtitle + CTA stagger)
- [ ] Implement FAQ accordion with motion
- [ ] Animate channels section cards
- [ ] Animate testimonials carousel
- [ ] Run full Lighthouse audit (performance, SEO, accessibility)
- [ ] Fine-tune animation timing & easing curves
- [ ] Verify mobile animation performance

### Tech Constraints

- All `motion.*` components in 'use client' files (SSR-safe)
- `motion` v11+ (tree-shakable, React 19 native)
- Tailwind CSS v4 compatibility (no class conflicts)
- Maintain Lighthouse ≥85 performance score
- Respect `prefers-reduced-motion` media query

---

## Phase 7: Deployment (PENDING)

**Estimated Duration:** 3–4 days | **Status:** PENDING | **Progress:** 0% | **Blocked By:** Phase 5 + Phase 6 completion (storefront hardening below may start in parallel once plan is approved)

**Implementation plan (2026-04-13):** [`.cursor/plans/web-cloudflare-sentry-ux.plan.md`](../.cursor/plans/web-cloudflare-sentry-ux.plan.md) — Cloudflare target for `apps/web`, optional CI `Dockerfile` + build-args for env-specific `NEXT_PUBLIC_*`, `@sentry/nextjs` (client + server + edge), App Router `loading` / `error` / `global-error`, refresh `not-found`, header cart button aligned with search submit.

### Objectives

- [ ] Finalize production environment
- [ ] Deploy API to Railway
- [ ] Deploy **storefront (`apps/web`) to Cloudflare** (OpenNext / Workers or Cloudflare Pages per plan; not generic `next start` on CF)
- [ ] **Web CI/build:** reproducible Docker image or documented Cloudflare build with **Production vs Preview** env vars (`NEXT_PUBLIC_*`, Sentry DSNs)
- [ ] Deploy **admin** to Vercel (or align with team choice; default remains Vercel until changed)
- [ ] Configure custom domain DNS
- [ ] Setup SSL/TLS certificates
- [ ] Configure environment variables in production (including Sentry: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, build-only `SENTRY_AUTH_TOKEN` for source maps)
- [ ] **Storefront UX:** root `loading.tsx`, segment `error.tsx`, `global-error.tsx`; polish `not-found` (copy + brand)
- [ ] Setup monitoring & alerting (Sentry Issues + dashboards)
- [ ] Document deployment procedures (`docs/deployment-guide.md` — add Cloudflare subsection)
- [ ] Plan rollback strategy
- [ ] Monitor for 7 days post-launch

### Production Targets

| Service              | Platform                                 | Status                                                                       |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| **API**              | Railway                                  | Pending Phase 5 completion                                                   |
| **Web (storefront)** | **Cloudflare** (Workers/Pages + adapter) | Planned; implementation per `.cursor/plans/web-cloudflare-sentry-ux.plan.md` |
| **Admin**            | Vercel                                   | Pending Phase 5 completion                                                   |
| **Database**         | Railway PostgreSQL                       | Pending Phase 5 completion                                                   |
| **Media CDN**        | Cloudinary                               | Ready                                                                        |

### Pre-Launch Checklist

- [ ] All tests passing (units, integration, E2E)
- [ ] Code review complete
- [ ] Security audit passed
- [ ] Lighthouse all pages ≥85 (performance), ≥95 (SEO)
- [ ] Mobile responsive across all viewports
- [ ] Production .env configured (no secrets in code)
- [ ] Database backups automated
- [ ] Error tracking: **Sentry** (`@sentry/nextjs` for web per plan; verify events + source maps in CI)
- [ ] Analytics configured (GA4)
- [ ] Team trained on production procedures

---

## Task Completion Breakdown

| Phase     | Total Tasks | Completed | Remaining | % Complete |
| --------- | ----------- | --------- | --------- | ---------- |
| 1         | 10          | 10        | 0         | 100%       |
| 2         | 12          | 12        | 0         | 100%       |
| 3         | 20          | 20        | 0         | 100%       |
| 4         | 20          | 20        | 0         | 100%       |
| 5         | 18          | ~14       | ~4        | 75%        |
| 6         | 12          | ~6        | ~6        | 50%        |
| 7         | ~14         | 0         | ~14       | 0%         |
| **Total** | **~106**    | **~86**   | **~20**   | **~81%**   |

---

## Dependencies & Blocking

```
Phase 1 (Monorepo) ✓
  ↓
Phase 2 (Database) ✓
  ↓
Phase 3 (API) ✓
  ↓
Phase 4 (Storefront) ✓
  ↓
Phase 5 (Admin) — in progress
  ↓
Phase 6 (Frontend animation / polish) — in progress (overlaps storefront)
  ↓
Phase 7 (Deployment) — blocked until Phase 5 + 6 exit criteria met
```

**Critical path:** Finish Phase 5 and Phase 6 objectives → Phase 7 (deployment).  
**Note:** Phase 4 and Phase 5 were mostly parallel; Phase 6 continues to refine the storefront experience.

---

## Success Metrics

### Code Quality

| Metric            | Target | Current |
| ----------------- | ------ | ------- |
| TypeScript Errors | 0      | 0 ✓     |
| ESLint Warnings   | 0      | 0 ✓     |
| Test Coverage     | 70%    | ~50%    |
| Build Time        | <3 min | ~90s ✓  |

### Storefront Performance

| Metric                 | Target | Current             |
| ---------------------- | ------ | ------------------- |
| Lighthouse Performance | ≥85    | TBD (audit pending) |
| Lighthouse SEO         | ≥95    | TBD                 |
| FCP                    | <1.8s  | ~1.2s               |
| LCP                    | <2.5s  | ~2.0s               |

### Admin Performance

| Metric          | Target | Current    |
| --------------- | ------ | ---------- |
| Page Load       | <2s    | ~1.5s      |
| API Response    | <500ms | ~200-300ms |
| Query Cache Hit | >80%   | ~75%       |

---

## Known Issues & Technical Debt

### Phase 4 (Storefront) — COMPLETE

- 13 new UX components deployed (landing, product, contact, utility)
- Product card enhanced with discount badges, stock indicators, quick-view triggers
- PDP hero fixed: diacritics in Vietnamese names, category tags, share buttons
- Product images zoom interaction improved
- Floating contact widget + back-to-top button added to layout
- Landing page content expanded with 6 new data structures
- Bug fixes: Math.min/max empty array guards, modal scroll lock issue

### Phase 5 (Admin)

1. Date-range & search filters not yet implemented
2. Storefront reflection verification pending
3. End-to-end CRUD test suite not run

### Phase 6 (Frontend Animation)

1. Hero animation polish pending
2. FAQ accordion motion not implemented
3. Channels/testimonials animation polish pending
4. Full Lighthouse audit pending

### Cross-Cutting

1. E2E test coverage minimal
2. Admin-specific unit tests needed
3. Performance profiling on production-like data
4. **Storefront production hardening (Phase 7 plan):** Cloudflare deploy pipeline for `apps/web`, Sentry, loading/error surfaces, `not-found` polish, header cart/search control parity — tracked in [`.cursor/plans/web-cloudflare-sentry-ux.plan.md`](../.cursor/plans/web-cloudflare-sentry-ux.plan.md)

---

## Release timeline (targets)

Targets are planning aids; **actual completion** is reflected in the phase checklists above and in [Project Changelog](./project-changelog.md).

```
2026-04-01  Phase 4 storefront milestone (complete)
2026-04-10  Phase 5 target (admin filters + verification + E2E)
2026-04-15  Phase 6 target (animation polish + Lighthouse audit)
2026-04-17  Phase 7 target (production deployment)
```

---

## Future Enhancements (Post-Launch)

### Q2 2026

- [ ] API rate limiting
- [ ] Customer reviews & ratings
- [ ] Advanced product search (Elasticsearch)
- [ ] Real-time order notifications (WebSocket)

### Q3 2026

- [ ] Payment integration (Stripe/PayPal)
- [ ] Inventory management with low-stock alerts
- [ ] Email marketing integration
- [ ] Analytics dashboard (custom business metrics)

### Q4 2026

- [ ] GraphQL API layer
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Recommendation engine (ML)

---

## Document History

| Date       | Version | Changes                                                                                                                                                                                            |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-13 | 2.3.0   | Phase 7: web → Cloudflare, Sentry, web Dockerfile/env matrix, storefront error/loading/not-found + header parity; link to `.cursor/plans/web-cloudflare-sentry-ux.plan.md`; phase task totals ~106 |
| 2026-04-13 | 2.2.0   | Storefront cart/search/url-state docs sync; dependency diagram aligned (Phase 4 complete)                                                                                                          |
| 2026-04-01 | 2.1.0   | Phase 4 complete: 13 new components + product UX enhancements                                                                                                                                      |
| 2026-04-01 | 2.0.0   | Updated with Phase 4-6 actual progress (82% complete)                                                                                                                                              |
| 2026-03-30 | 1.0.0   | Initial roadmap creation                                                                                                                                                                           |
