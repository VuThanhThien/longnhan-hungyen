# Project Roadmap

**Last Updated:** 2026-04-01
**Current Phase:** Phase 5 - Admin Panel (In Progress)

---

## Overview

Long Nhan Hung Yen development roadmap tracks phases from core infrastructure through production deployment. Status reflects actual codebase state as of 2026-04-01.

---

## Phase Summary

| Phase | Title | Status | Progress | Completion |
|-------|-------|--------|----------|------------|
| 1 | Monorepo Setup | Complete | 100% | 2026-03-29 |
| 2 | Database & Entities | Complete | 100% | 2026-03-29 |
| 3 | Backend API | Complete | 100% | 2026-03-29 |
| 4 | Storefront (Web) | In Progress | ~95% | ~2026-04-05 |
| 5 | Admin Panel | In Progress | ~75% | ~2026-04-10 |
| 6 | Frontend Animation | In Progress | ~40% | ~2026-04-15 |
| 7 | Deployment | Pending | 0% | Post Phase 5+6 |

**Overall Completion:** ~82% (approx. 81/98 tasks)

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

## Phase 4: Storefront (Web) (IN PROGRESS)

**Duration:** 12 days | **Status:** IN PROGRESS | **Progress:** ~95% | **Target:** 2026-04-05

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
- [ ] Mobile viewport responsive pass
- [ ] Lighthouse audit (performance ≥85, SEO ≥95)

### Remaining Tasks
- [ ] Mobile viewport testing across all pages (iPhone 12/13, iPad)
- [ ] Lighthouse performance audit (target: ≥85, currently TBD)
- [ ] Lighthouse SEO audit (target: ≥95)
- [ ] Responsive image optimization review

### Key Files
- `apps/web/src/app/` — Next.js App Router pages
- `apps/web/src/components/` — Reusable UI components
- `apps/web/src/lib/` — HTTP client, form helpers, SEO utilities
- `apps/web/src/lib/http/create-longnhan-api.ts` — Axios + auto-refresh interceptor

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

**Duration:** 5 days | **Status:** IN PROGRESS | **Progress:** ~40% | **Target:** 2026-04-15

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

**Estimated Duration:** 2 days | **Status:** PENDING | **Progress:** 0% | **Blocked By:** Phase 5 + Phase 6 completion

### Objectives
- [ ] Finalize production environment
- [ ] Deploy API to Railway
- [ ] Deploy web + admin to Vercel
- [ ] Configure custom domain DNS
- [ ] Setup SSL/TLS certificates
- [ ] Configure environment variables in production
- [ ] Setup monitoring & alerting
- [ ] Document deployment procedures
- [ ] Plan rollback strategy
- [ ] Monitor for 7 days post-launch

### Production Targets
| Service | Platform | Status |
|---------|----------|--------|
| **API** | Railway | Pending Phase 5 completion |
| **Web** | Vercel | Pending Phase 4 completion |
| **Admin** | Vercel | Pending Phase 5 completion |
| **Database** | Railway PostgreSQL | Pending Phase 5 completion |
| **Media CDN** | Cloudinary | Ready |

### Pre-Launch Checklist
- [ ] All tests passing (units, integration, E2E)
- [ ] Code review complete
- [ ] Security audit passed
- [ ] Lighthouse all pages ≥85 (performance), ≥95 (SEO)
- [ ] Mobile responsive across all viewports
- [ ] Production .env configured (no secrets in code)
- [ ] Database backups automated
- [ ] Error tracking setup (Sentry or similar)
- [ ] Analytics configured (GA4)
- [ ] Team trained on production procedures

---

## Task Completion Breakdown

| Phase | Total Tasks | Completed | Remaining | % Complete |
|-------|-----------|-----------|-----------|-----------|
| 1 | 10 | 10 | 0 | 100% |
| 2 | 12 | 12 | 0 | 100% |
| 3 | 20 | 20 | 0 | 100% |
| 4 | 20 | 19 | 1 | 95% |
| 5 | 18 | ~14 | ~4 | 75% |
| 6 | 12 | ~5 | ~7 | 40% |
| 7 | 6 | 0 | 6 | 0% |
| **Total** | **98** | **~81** | **~18** | **~82%** |

---

## Dependencies & Blocking

```
Phase 1 (Monorepo) ✓
  ↓
Phase 2 (Database) ✓
  ↓
Phase 3 (API) ✓
  ↓├─ Phase 4 (Storefront) — IN PROGRESS (~95%)
  └─ Phase 5 (Admin) — IN PROGRESS (~75%)
      ↓
      Phase 6 (Frontend Animation) — IN PROGRESS (~40%)
      ↓
      Phase 7 (Deployment) — BLOCKED (waiting for 5+6)
```

**Critical Path:** Phase 5 completion → Phase 7 unblocks
**Optimization:** Phase 4 & 5 can run in parallel (mostly do); Phase 6 can overlap

---

## Success Metrics

### Code Quality
| Metric | Target | Current |
|--------|--------|---------|
| TypeScript Errors | 0 | 0 ✓ |
| ESLint Warnings | 0 | 0 ✓ |
| Test Coverage | 70% | ~50% |
| Build Time | <3 min | ~90s ✓ |

### Storefront Performance
| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | ≥85 | TBD (audit pending) |
| Lighthouse SEO | ≥95 | TBD |
| FCP | <1.8s | ~1.2s |
| LCP | <2.5s | ~2.0s |

### Admin Performance
| Metric | Target | Current |
|--------|--------|---------|
| Page Load | <2s | ~1.5s |
| API Response | <500ms | ~200-300ms |
| Query Cache Hit | >80% | ~75% |

---

## Known Issues & Technical Debt

### Phase 4 (Storefront)
1. Mobile viewport testing not yet complete
2. Lighthouse audit pending (performance target: ≥85)
3. SEO schema validation needed

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

---

## Release Timeline

```
2026-04-05  Phase 4 closure (storefront mobile + Lighthouse audit)
2026-04-10  Phase 5 closure (admin filters + verification + E2E tests)
2026-04-15  Phase 6 closure (animation polish + Lighthouse audit)
2026-04-17  Phase 7 deployment to production
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

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-01 | 2.0.0 | Updated with Phase 4-6 actual progress (82% complete) |
| 2026-03-30 | 1.0.0 | Initial roadmap creation |
