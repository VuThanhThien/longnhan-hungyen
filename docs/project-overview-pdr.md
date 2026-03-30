# Project Overview & PDR (Product Development Requirements)

## Project: Long Nhan Hung Yen E-commerce API

**Status:** In Development
**Version:** 0.0.1
**Team:** ViBe Coding Team
**Last Updated:** 2026-03-30

---

## Executive Summary

Long Nhan Hung Yen is a full-featured e-commerce API platform built with NestJS, TypeScript, and PostgreSQL. It enables end-to-end management of longan fruit product sales, including product catalogs, order processing, media uploads, and admin analytics.

---

## Project Vision

Provide a scalable, secure, and maintainable backend API for an e-commerce platform specializing in longan fruit products, with robust admin capabilities, real-time notifications, and multi-channel integration support.

---

## Core Features

### Released/Implemented
- **E-commerce Modules** — Products, Orders, Articles, Media management
- **Authentication** — JWT-based with email sign-in/up, Argon2 password hashing
- **Authorization** — Role-Based Access Control (RBAC) for admin/user roles
- **Media Uploads** — Cloudinary integration for product images and media
- **Pagination** — Offset and cursor-based pagination support
- **API Documentation** — Swagger/OpenAPI at `/api-docs`
- **Database** — TypeORM with PostgreSQL, auto-generated migrations
- **Seeding** — Sample data via typeorm-extension with Faker
- **Testing** — Jest unit tests + E2E test support
- **Email Delivery** — Nodemailer + NestJS Mailer with Handlebars templates
- **Background Jobs** — BullMQ queue processing for async tasks
- **Caching** — Redis cache-manager integration
- **Monitoring** — Health check endpoints
- **Docker** — Local dev and production compose setups
- **CI/CD** — GitHub Actions workflows

### In Progress / Planned
- Integration testing suite expansion
- Performance optimization (caching strategies)
- Comprehensive logging/monitoring (Google Cloud Logging, AWS CloudWatch)
- Real-time notifications (WebSockets)
- Multi-language i18n (framework in place, translations needed)

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
│   └── api/                    # Main NestJS API app
├── packages/
│   └── types/                  # Shared TypeScript types
├── docker-compose.yml          # Prod infra (db, redis, maildev, pgadmin)
├── docker-compose.local.yml    # Local dev stack with hot-reload
├── pnpm-workspace.yaml         # Workspace config
└── turbo.json                  # Turborepo config
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

| Phase | Duration | Status | Key Deliverables |
|-------|----------|--------|-------------------|
| Phase 1: Core Setup | Complete | Done | Project structure, CI/CD, Docker |
| Phase 2: Auth & DB | Complete | Done | JWT auth, PostgreSQL, migrations |
| Phase 3: E-commerce | Complete | Done | Products, Orders, Articles modules |
| Phase 4: Media & Admin | Complete | Done | Cloudinary, Dashboard, RBAC |
| Phase 5: Testing | In Progress | 40% | Unit tests, E2E tests, coverage |
| Phase 6: Optimization | Planned | 0% | Caching, performance tuning |
| Phase 7: Deployment | Planned | 0% | Production setup, monitoring |

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

