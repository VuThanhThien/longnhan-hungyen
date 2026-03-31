# Project Overview & PDR (Product Development Requirements)

## Project: Long Nhan Hung Yen E-commerce Platform (API + Web + Admin)

**Status:** In Development (82% complete)
**Version:** 0.1.0-alpha
**Team:** ViBe Coding Team
**Last Updated:** 2026-04-01

---

## Executive Summary

Long Nhan Hung Yen is a full-stack e-commerce platform for longan specialty products with three integrated applications:
- **API (NestJS):** REST backend with JWT auth, product/order/media management, admin dashboard
- **Web (Next.js):** Public-facing storefront with product catalog, articles, order submission
- **Admin (Next.js):** Admin dashboard for products, articles, orders, media, and analytics

Target: Vietnamese market, SEO-optimized, ad-free, premium design.

---

## Project Vision

Provide a scalable, secure, and maintainable backend API for an e-commerce platform specializing in longan fruit products, with robust admin capabilities, real-time notifications, and multi-channel integration support.

---

## Core Features

### Released/Implemented (Backend - Phase 3)
- **API Modules** — Auth, Users, Products, Orders, Articles, Media, Dashboard, Health
- **Authentication** — JWT-based with email sign-in/up, Argon2 password hashing
- **Authorization** — Role-Based Access Control (RBAC) for admin/user roles
- **Products** — CRUD, slug-based routing, variants, pessimistic stock locking
- **Orders** — Creation with variant snapshots, status tracking, code format LN-YYMMDD-XXXX
- **Articles** — Blog/CMS with DRAFT/PUBLISHED status, Tiptap content
- **Media** — Cloudinary upload/delete, folder management, dual removal safety
- **Dashboard** — Admin stats (revenue by period, order count, daily breakdown)
- **Email** — Nodemailer + templates (queued via BullMQ)
- **API Documentation** — Swagger/OpenAPI at `/api-docs`
- **Database** — TypeORM with PostgreSQL, auto-generated migrations
- **Caching** — Redis cache-manager, pessimistic locking
- **Docker** — Local dev and production compose setups
- **CI/CD** — GitHub Actions workflows

### Released/Implemented (Web - Phase 4, ~95%)
- **Storefront Pages** — Landing, Products list/detail, Articles list/detail, Order success
- **Landing Sections** — Hero, Story, ProductQuality, NutritionSeason, Channels, Testimonials, FAQ
- **ISR** — Home (revalidate 300s), Products (60s)
- **SEO** — JSON-LD schema, robots.txt, sitemap.xml, dynamic metadata
- **Auth** — Cookie-based tokens, auto-refresh 60s before expiry
- **Data Fetching** — React Query (stale 60s), TanStack Query hooks
- **Forms** — Server Actions for order creation, yup validation
- **Images** — Cloudinary loader with optimization
- **Remaining** — Mobile viewport pass, Lighthouse audit (≥85 performance)

### Released/Implemented (Admin - Phase 5, ~75%)
- **Pages** — Login, Dashboard, Products CRUD, Articles CRUD, Orders list/detail, Media manager
- **State** — React Query (stale 30s), AuthProvider context
- **Forms** — react-hook-form + yup, TiptapHtmlEditor for rich text
- **API Proxies** — /api routes to backend (auth, media, orders status)
- **HTTP** — Dual mode (adminFetch server-side, httpClient client-side Axios)
- **UI** — Radix UI components, Recharts for dashboards
- **Remaining** — Date-range filters, search filters, storefront verification, E2E tests

### In Progress / Planned
- **Phase 6 (Frontend Animation)** — motion library, ScrollReveal, hero/FAQ/channels/testimonials polish
- **Phase 7 (Deployment)** — Railway (API), Vercel (web + admin), monitoring, SSL
- **Post-Launch** — API rate limiting, payment integration, customer reviews, real-time notifications

---

## Stakeholders

| Role | Responsibility |
|------|-----------------|
| **Product Owner** | Feature prioritization, business requirements |
| **Backend Team** | API development, database design, integration |
| **DevOps** | Docker setup, deployment pipelines, infrastructure |
| **QA** | Test planning, bug identification, acceptance criteria |

---

## Architecture Overview

### Tech Stack
- **Runtime:** Node.js >= 20.10.0
- **Framework:** NestJS 10 + Express
- **Language:** TypeScript 5.6
- **Database:** PostgreSQL 13+
- **ORM:** TypeORM 0.3.20
- **Auth:** JWT + Argon2
- **Media:** Cloudinary
- **Cache:** Redis + cache-manager
- **Queue:** BullMQ
- **Email:** Nodemailer + NestJS Mailer
- **Logging:** Pino
- **Testing:** Jest + Supertest
- **Package Manager:** pnpm 10.32.1
- **Monorepo Tool:** Turborepo

### Monorepo Structure
```
longnhantongtran/
├── apps/
│   ├── api/                    # NestJS REST API (backend)
│   ├── web/                    # Next.js storefront (public)
│   └── admin/                  # Next.js admin dashboard
├── packages/
│   └── types/                  # Shared TypeScript interfaces
├── docker-compose.yml          # Prod infra (db, redis, maildev, pgadmin)
├── docker-compose.local.yml    # Local dev stack (+ API hot-reload)
├── pnpm-workspace.yaml         # Workspace config
└── turbo.json                  # Turborepo orchestration
```

---

## Core Modules

### API Modules (src/api/)
- **UserModule** — User auth profiles, profile management
- **AuthModule** — JWT token generation, refresh, password reset
- **HealthModule** — Application health checks
- **ProductsModule** — CRUD for products, search, filtering
- **OrdersModule** — Order creation, status tracking, user orders
- **ArticlesModule** — Blog/content articles with slug routing
- **MediaModule** — File uploads (Cloudinary), media management
- **DashboardModule** — Admin statistics (daily/weekly/monthly/all-time)

### Infrastructure Modules
- **DatabaseModule** — TypeORM config, entity mappings, migrations
- **ConfigModule** — Environment variable management
- **MailModule** — Email sending with templates
- **CacheModule** — Redis-backed caching service
- **QueueModule** — Background job processing (BullMQ)

---

## Key Requirements

### Functional Requirements
| ID | Requirement | Status | Priority |
|----|-------------|--------|----------|
| FR-001 | User authentication (sign-in/up) | Done | High |
| FR-002 | JWT token + refresh token | Done | High |
| FR-003 | Product CRUD operations | Done | High |
| FR-004 | Order creation + tracking | Done | High |
| FR-005 | Admin dashboard with stats | Done | High |
| FR-006 | Media upload to Cloudinary | Done | High |
| FR-007 | Article/blog management | Done | Medium |
| FR-008 | Email notifications | Done | Medium |
| FR-009 | Pagination (offset + cursor) | Done | Medium |
| FR-010 | Role-based access control | Done | High |

### Non-Functional Requirements
| ID | Requirement | Status | Priority |
|----|-------------|--------|----------|
| NFR-001 | API response time < 200ms | In Progress | High |
| NFR-002 | 99% uptime SLA | Planned | High |
| NFR-003 | Code coverage >= 70% | In Progress | Medium |
| NFR-004 | Secure password hashing (Argon2) | Done | High |
| NFR-005 | CORS configurable per env | Done | High |
| NFR-006 | Database SSL support | Done | Medium |
| NFR-007 | Docker containerization | Done | High |
| NFR-008 | Multi-environment configs | Done | High |

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Test Coverage | >= 70% | ~40% |
| API Response Time | < 200ms | ~100ms |
| Error Rate | < 0.1% | Tracking |
| Code Quality (ESLint) | 0 warnings | Clean |
| Build Time | < 2min | ~1.5min |
| Deployment Time | < 5min | ~3min |

---

## Constraints & Assumptions

### Constraints
- PostgreSQL only (no MySQL support currently)
- Cloudinary required for media uploads (no local file storage)
- Monorepo structure with pnpm (not npm/yarn)
- Node.js 20.10.0+ required
- JWT tokens stateless (no session store)

### Assumptions
- Users have valid email for sign-up/reset flows
- Admin role assigned manually at database level
- Cloudinary credentials provided in production env
- Database backups handled by DevOps
- Redis available in all environments

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Database migration failure | High | Low | Automated rollback, testing in staging |
| Cloudinary API outage | Medium | Low | Local fallback, error handling |
| JWT token leak | High | Very Low | Rotation, secure storage, HTTPS only |
| Uncontrolled query growth | High | Medium | Query optimization, pagination, indexing |
| Cache invalidation issues | Medium | Medium | TTL strategy, versioning, cache warming |

---

## Dependencies

### External Services
- **Cloudinary** — Media storage and CDN
- **SMTP Server** — Email delivery (MailDev for local)
- **PostgreSQL Database** — Data persistence
- **Redis** — Caching and queue backend

### Internal Packages
- `@longnhan/types` — Shared TypeScript interfaces and types

---

## Timeline & Milestones

| Phase | Duration | Status | Progress | Key Deliverables |
|-------|----------|--------|----------|-------------------|
| Phase 1: Monorepo Setup | 3 days | Done | 100% | Turborepo, pnpm, Docker, CI/CD |
| Phase 2: Database | 5 days | Done | 100% | TypeORM, 8 entities, migrations |
| Phase 3: Backend API | 10 days | Done | 100% | 10 modules, auth, CRUD, dashboard |
| Phase 4: Storefront | 12 days | In Progress | ~95% | Next.js web, SEO, ISR, checkout |
| Phase 5: Admin Panel | 10 days | In Progress | ~75% | Next.js admin, products/articles/orders/media CRUD |
| Phase 6: Frontend Animation | 5 days | In Progress | ~40% | motion library, ScrollReveal, hero/FAQ polish |
| Phase 7: Deployment | 2 days | Pending | 0% | Railway API, Vercel web+admin, monitoring |

---

## Environment Variables

All configs in `.env.example`:

**Core App**
- `NODE_ENV` — local/development/staging/production
- `APP_PORT` — API port (default 3000)
- `APP_DEBUG` — Enable stack traces in responses
- `APP_CORS_ORIGIN` — Allowed origins (comma-separated)

**Database**
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, etc.

**Authentication**
- `AUTH_JWT_SECRET` — JWT signing key
- `AUTH_JWT_TOKEN_EXPIRES_IN` — Token lifetime (e.g., 1d)
- `AUTH_REFRESH_SECRET` — Refresh token key

**Email**
- `MAIL_HOST`, `MAIL_PORT` — SMTP settings
- `MAIL_CLIENT_PORT` — MailDev web UI port (1080)

**Cloudinary** (production only)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Next Steps

1. **Expand test suite** — Achieve 70%+ coverage
2. **Performance tuning** — Optimize queries, implement caching strategies
3. **Integration testing** — Full E2E flows with real Cloudinary
4. **Monitoring setup** — Cloud logging, error tracking
5. **Documentation** — Auto-generated API docs, architecture diagrams
6. **Staging deployment** — Pre-production validation
7. **Production release** — Full CI/CD pipeline, monitoring, alerts

---

## Contact & Support

- **Lead Developer:** longnhantongtran
- **Repository:** Private (ViBe Coding Team)
- **Documentation:** ./docs/ directory
- **Issues:** GitHub Issues (if applicable)

