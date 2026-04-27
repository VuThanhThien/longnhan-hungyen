# Project Changelog

**Last Updated:** 2026-04-27

All notable changes to the Long Nhan Hung Yen e-commerce project are documented here. **Phase status** is canonical in [Project Roadmap](./project-roadmap.md).

---

## [5.4.0] - 2026-04-27 - Fix: Order tracking email sent only after payment success

### Fixed

- **Order tracking email timing** — Moved `enqueueOrderTrackingLinkEmail()` from `OrdersService.createOrder()` to `PaymentsService.applyVerifiedSepayCapture()`. Order tracking emails are now sent only after successful payment confirmation (IPN), not on order creation. This prevents customers from receiving tracking emails for unpaid orders.
  - Removed email call from order creation flow
  - Added email call to IPN payment success handler
  - Added email call to reconciliation sweep (`SepayReconcileProcessor`) when it catches a paid order
  - Idempotent: email sent only once per order

### Changed

- `docs/system-architecture.md` — Updated Payments section and Email Service description
- `docs/sepay/payment-flow-sepay.md` — Updated sequence diagram and IPN handler documentation
- `docs/codebase-summary.md` — Updated Email Service section
- `docs/project-overview-pdr.md` — Updated email feature description

---

## [5.3.0] - 2026-04-27 - Admin dashboard data layer & UI primitives

### Added

- **Dashboard data types** (`apps/admin/src/lib/dashboard/dashboard-types.ts`):
  - `DashboardPeriod` type for period selection (`'today' | 'week' | 'month' | 'all'`)
  - `DashboardStats` interface mirroring API `DashboardStatsResDto`
  - `DailyStatPoint` for daily aggregation (date, count, revenue)
  - `parsePeriod()` safe parser with default fallback
  - `PERIOD_LABELS` localized period display strings (Vietnamese)

- **Shared UI primitives** (`apps/admin/src/components/ui/`):
  - `empty-state.tsx` — Reusable empty state card (icon, title, description, action)
  - `inline-error-state.tsx` — Error message display component

- **Dashboard components** (`apps/admin/src/components/dashboard/`):
  - `period-switcher.tsx` — Client component for URL-based period switching
  - `dashboard-error-state.tsx` — Dashboard-level error card wrapper

### Changed

- `apps/admin/src/app/(dashboard)/page.tsx` — Integrated real API data, period param, visible error states
- `apps/admin/src/components/dashboard/stat-cards.tsx` — Aligned to `DashboardStatsResDto` contract
- `apps/admin/src/components/dashboard/revenue-chart.tsx` — Uses `dailyStats`, dynamic title based on period
- `apps/admin/src/components/dashboard/recent-orders.tsx` — Added error prop, uses shared `EmptyState`

### Documentation

- Updated `docs/codebase-summary.md` — Dashboard data layer and UI primitives inventory
- Updated `docs/frontend-code-standards.md` — Dashboard patterns, data types, and UI primitive usage examples

---

## [5.2.0] - 2026-04-25 - Migrate to Brevo SDK

### Changed

- Replaced `@nestjs-modules/mailer` + Nodemailer SMTP with `@getbrevo/brevo` HTTP SDK
- Simplified mail config: 9 SMTP vars → 3 vars (`BREVO_API_KEY`, `MAIL_DEFAULT_EMAIL`, `MAIL_DEFAULT_NAME`)
- `MailService` now compiles Handlebars templates locally and sends via Brevo API
- `MailModule` is a plain NestJS module (no MailerModule dependency)

### Removed

- `@nestjs-modules/mailer`, `nodemailer`, `@types/nodemailer` dependencies
- `mailer-custom-logger.ts` and its spec (Nodemailer-specific)
- SMTP-related env vars: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_IGNORE_TLS`, `MAIL_SECURE`, `MAIL_REQUIRE_TLS`

---

## [5.1.0] - 2026-04-24 - Remove MailDev, production SMTP

### Changed

- Removed MailDev service from `docker-compose.yml`, `docker-compose.local.yml`, and `Makefile`
- Deleted `apps/api/maildev.Dockerfile`
- Updated `.env.example` with production-ready SMTP provider placeholders (Brevo as example)
- Removed `MAIL_CLIENT_PORT` env var (only used for MailDev UI)
- Fixed `MAIL_PASS` → `MAIL_PASSWORD` in `mail-config.spec.ts` to match runtime config
- Updated all documentation to reflect SMTP provider workflow instead of MailDev

---

## [5.0.0] - 2026-04-18 - Production go-live (Phase 7)

### Summary

**Initial production deployment completed.** API, storefront, admin, and database are **live** on the planned platforms (see [Project Roadmap](./project-roadmap.md) — Phase 7 production targets and objectives). Post-launch: finish the 7-day monitoring objective and work through the pre-launch checklist where items are still open.

### Changed (process / product)

- Phase 7 marked **complete** (go-live milestone **100%**); roadmap task rollup **~92%** (~97/106 — monitoring + checklist still counted as open work)
- Production target table: services marked **Live**; Media CDN noted as in use

---

## [4.3.0] - 2026-04-18 - Documentation & roadmap sync

### Summary

Refreshed `docs/` to match the repository: API **Categories** and **Reviews** modules, admin **categories** and **reviews** dashboard routes, storefront **checkout** / **track-order** / **service-unavailable** routes, and current component counts. No application behavior change in this entry.

### Changed (documentation only)

- [Codebase summary](./codebase-summary.md) — ApiModule inventory (12 feature modules), admin route tree, storefront routes and `components/**/*.tsx` count (~76)
- [Project overview & PDR](./project-overview-pdr.md) — Backend and admin capability lists aligned with code
- [Project roadmap](./project-roadmap.md) — Phase 4 expansion (cart/checkout deliverables), Phase 5 progress (categories + reviews), dates and task breakdown

---

## [4.2.1] - 2026-04-16 - Storefront homepage module refactor

### Summary

Small storefront housekeeping release: align homepage section components with the current home composition (`FeaturedProducts`, `VideoSection`) and remove legacy home product section modules.

### Removed

- `apps/web/src/components/home/home-products-by-category.tsx` — removed (replaced by homepage composition changes)
- `apps/web/src/components/home/home-products-section.tsx` — removed (use `featured-products.tsx`)

### Changed

- `apps/web` home page sections — use `FeaturedProducts` + `VideoSection` alongside `components/landing/*` sections

---

## [4.2.0] - 2026-04-13 - Storefront cart, search, and URL state

### Summary

Storefront updates: guest shopping cart, header search tied to query params, supporting libs and static assets. Phase 4 remains **complete** per [Project Roadmap](./project-roadmap.md); this release is incremental UX on top of that baseline.

### Added

- **`apps/web/src/app/cart/`** — Cart route (guest cart UI)
- **`apps/web/src/services/cart/`** — Zustand cart store with `localStorage` persistence (`cart-store.ts`, storage key `longnhan-cart-v2`)
- **`apps/web/src/components/layout/header-search-bar.tsx`** — Header search (works with URL state)
- **`apps/web/src/components/layout/header-cart-button.tsx`** — Header cart entry point
- **`apps/web/src/lib/product-search-params.ts`** — nuqs parsers / loader / serializer for product search params
- **`apps/web/src/lib/format-vnd.ts`**, **`format-phone-display.ts`** — Display helpers for storefront
- **`apps/web/public/`** — Additional marketing/UI assets (banners, backgrounds, icons)

### Changed

- **`header.tsx`**, **`mobile-nav.tsx`** — Integrate search and cart affordances
- **`app-providers.tsx`** — Provider wiring for storefront (e.g. nuqs adapter + existing app providers)
- **`products/page.tsx`**, **`lib/product-description.ts`** — Listing/content refinements aligned with search params

---

## [4.1.0] - 2026-04-01 - Storefront Enhancement Release

### Phase 4 Completion: Landing Page & Product UX Overhaul

**Release Status:** Phase 4 (Storefront) marked complete in the roadmap (see [Project Roadmap](./project-roadmap.md) for task breakdown).

### Added

#### New Components (13)

- **Landing Page Enhancements:**
  - `landing-service-badges.tsx` — Service quality badges with icons
  - `landing-stats-bar.tsx` — Animated statistics display (founded, users, orders)
  - `landing-urgency-strip.tsx` — Limited-time offer urgency messaging
  - `landing-articles-preview.tsx` — Featured blog articles carousel
  - `landing-origin-badge.tsx` — Product origin & authenticity indicator

- **Product Experience:**
  - `product-quick-view-modal.tsx` — Quick-view popup with product details
  - `product-pdp-trust-badges.tsx` — Trust indicators (certified, authentic, warranty)
  - `product-pdp-share-buttons.tsx` — Social share & copy-link buttons

- **Navigation & Utility:**
  - `hero-carousel.tsx` — Landing hero image carousel with fade transitions
  - `category-nav-cards.tsx` — Category grid navigation component
  - `home-products-by-category.tsx` — Category-filtered product sections (later removed in 4.2.1)
  - `home-products-section.tsx` — General featured products grid (later removed in 4.2.1)
  - `back-to-top-button.tsx` — Scroll-to-top button for long pages

#### New Data Structures

- `LANDING_SERVICE_BADGES` — Service badge definitions (shipping, quality, origin, support)
- `LANDING_STATS` — Statistics data (founded year, user count, orders count)
- `LANDING_CERTS` — Certification badges (government compliance, authenticity)
- `LANDING_URGENCY` — Time-sensitive messaging data
- `LANDING_HERO_SLIDES` — Hero carousel image data
- `LANDING_CATEGORIES` — Category card definitions with images

#### Floating Contact Widget

- `floating-contact-widget.tsx` — Persistent contact UI (phone, email, messaging)
- Integrated to global layout for all pages

### Changed

#### Product Card (`product-card.tsx`)

- Added discount badge display (when stock < 10)
- Added stock level overlay indicator
- Integrated quick-view modal trigger (modal opens on button click)

#### Product PDP Hero (`product-pdp-hero.tsx`)

- Fixed Vietnamese diacritics rendering (ư, ơ, etc.)
- Added category tag display below product name
- Enhanced visual hierarchy with better spacing

#### Product PDP Tabs (`product-pdp-tabs.tsx`)

- Fixed Vietnamese diacritics in description rendering
- Updated review count display to match new component structure

#### Product Images (`product-images.tsx`)

- Improved CSS zoom interaction (hover zoom effect)
- Optimized image transition timing

#### App Layout (`layout.tsx`)

- Integrated floating-contact-widget to all pages
- Added back-to-top button with scroll threshold
- Improved layout component composition

#### Landing Page Content (`landing-page-content.ts`)

- Expanded with 6 new data structures (stats, badges, urgency, hero slides, categories, certs)
- Enhanced data typing for type safety
- Organized by functional sections

### Fixed

#### Bug Fixes

- **Math.min/max on empty array:** Added guards in homepage product section components to prevent NaN values when no products available
- **Modal scroll lock:** Fixed body scroll lock issue in product-quick-view-modal when modal opens (now properly locks/unlocks body scroll)
- **Diacritics rendering:** Fixed Vietnamese character rendering in PDP hero and tabs components

### Performance

- Lazy-loaded carousel components (hero, articles preview)
- Memoized quick-view modal to prevent unnecessary re-renders
- Optimized image loading with Cloudinary loader

### Stats

| Metric              | Value                             |
| ------------------- | --------------------------------- |
| Components Added    | 13                                |
| Components Modified | 5                                 |
| Data Structures     | 6 new                             |
| Bug Fixes           | 3                                 |
| Lines of Code       | ~2,500 (components) + ~800 (data) |

---

## [4.0.0] - 2026-03-29 - Backend API & Database Foundation Complete

### Phase 1-3 Complete: Monorepo, Database, API Infrastructure

**Status:** Phases 1, 2, 3 marked COMPLETE.

### Added

#### Monorepo Structure

- Turborepo configuration with pnpm workspaces
- Root TypeScript, ESLint, Prettier configuration
- GitHub Actions CI/CD pipelines (lint, test, build)
- Shared @longnhan/types package with barrel exports

#### Database Foundation

- PostgreSQL setup with TypeORM
- 8 core entities: User, Session, Product, ProductVariant, Order, OrderItem, Article, Media
- Database migrations system with auto-generation
- Seed data for development (Faker integration)

#### Backend API (10 Modules)

- **AuthModule** — JWT auth, sign-up/sign-in, refresh tokens, password reset
- **UserModule** — User CRUD, profile management
- **ProductsModule** — Product catalog with search, filtering, pagination
- **OrdersModule** — Order creation, status management, pessimistic stock locking
- **ArticlesModule** — Blog articles with CRUD operations
- **MediaModule** — Cloudinary integration, folder management
- **DashboardModule** — Admin analytics & statistics
- **HealthModule** — Liveness/readiness probes
- **UsersModule** — User management endpoints
- Support modules: Email queue (BullMQ), Caching (Redis), Configuration

#### Infrastructure

- Docker Compose setup (PostgreSQL, Redis, pgAdmin)
- Email service with Nodemailer + Handlebars templates
- Redis caching manager with TTL strategy
- Helmet security headers, CORS configuration
- Global exception filter with consistent error responses

### Configuration

- Environment variable system with validation
- TypeORM data source configuration
- BullMQ email queue setup
- Cloudinary media provider integration

### Documentation

- API documentation in Swagger/OpenAPI
- Development guides in apps/api/docs/
- Codebase summary with module overview
- System architecture documentation
- Code standards and project roadmap

---

## Legend

- **[MAJOR]** — Breaking changes or significant feature additions
- **[MINOR]** — New features, backward compatible
- **[PATCH]** — Bug fixes and improvements
- **Phase X** — Development phase reference (see project-roadmap.md)

---

## Versioning

This project follows Semantic Versioning (SemVer):

- **MAJOR.MINOR.PATCH** (e.g., 4.1.0)
- MAJOR = Phase number
- MINOR = Release number within phase
- PATCH = Bug fixes and patches

---

## Upcoming Releases

### Phase 5 (Admin Panel) — Target 2026-04-10

- Product/Article/Order CRUD interfaces
- Media manager with URL picker
- Dashboard with analytics charts
- Admin authentication & authorization

### Phase 6 (Frontend Animation) — Target 2026-04-15

- Landing page scroll-reveal animations
- Motion library integration (React 19 native)
- Prefers-reduced-motion accessibility
- Lighthouse performance audit (≥85)

### Phase 7 (Deployment) — Target 2026-04-17

- API deployment to Railway
- Web & Admin deployment to Vercel
- Domain configuration & SSL/TLS
- Monitoring & error tracking setup
