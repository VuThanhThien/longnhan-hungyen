# Project Roadmap

**Last Updated:** 2026-03-30
**Current Phase:** Phase 4 - Testing & Optimization (In Progress)

---

## Overview

Long Nhan Hung Yen development roadmap tracks features, improvements, and milestones through completion and production release. This document is living and updated monthly.

---

## Phase Overview

| Phase | Title | Status | Progress | Duration |
|-------|-------|--------|----------|----------|
| 1 | Core Setup & Architecture | Complete | 100% | 2 weeks |
| 2 | Authentication & Database | Complete | 100% | 2 weeks |
| 3 | E-commerce Modules | Complete | 100% | 3 weeks |
| 4 | Testing & Quality | In Progress | 40% | 2 weeks |
| 5 | Performance & Monitoring | Planned | 0% | 1 week |
| 6 | Staging Deployment | Planned | 0% | 1 week |
| 7 | Production Release | Planned | 0% | 1 week |

---

## Phase 1: Core Setup & Architecture (COMPLETE)

**Duration:** 2 weeks | **Status:** DONE | **Progress:** 100%

### Objectives
- [x] Initialize NestJS monorepo with pnpm workspaces
- [x] Configure TypeScript, ESLint, Prettier
- [x] Setup Docker & Docker Compose
- [x] Configure CI/CD pipelines (GitHub Actions)
- [x] Create shared packages (@longnhan/types)
- [x] Setup database with TypeORM
- [x] Implement global error handling & filters
- [x] Add Swagger/OpenAPI documentation

### Deliverables
- [x] Monorepo structure with apps/ and packages/
- [x] docker-compose.yml with PostgreSQL, Redis, MailDev
- [x] docker-compose.local.yml with API container
- [x] GitHub Actions CI pipeline (lint, test, build)
- [x] TypeORM configuration & migrations setup
- [x] Global exception handling

### Key Files
- `docker-compose.yml` — Infrastructure setup
- `apps/api/src/app.module.ts` — Root module
- `apps/api/src/filters/exception.filter.ts` — Error handling
- `.github/workflows/ci.yml` — CI pipeline

---

## Phase 2: Authentication & Database (COMPLETE)

**Duration:** 2 weeks | **Status:** DONE | **Progress:** 100%

### Objectives
- [x] JWT-based authentication system
- [x] User sign-up, sign-in, password reset
- [x] Refresh token mechanism
- [x] Role-based access control (RBAC)
- [x] Password hashing with Argon2
- [x] User entity and database schema
- [x] Auth guards and decorators
- [x] Email service with Nodemailer

### Deliverables
- [x] AuthModule with JWT strategy
- [x] UserModule for user management
- [x] JwtAuthGuard & RolesGuard
- [x] User entity with hashed passwords
- [x] Email service for notifications
- [x] Session management
- [x] Auth endpoints (sign-up, sign-in, refresh, forgot-password)

### Key Files
- `apps/api/src/api/auth/` — Auth module
- `apps/api/src/api/users/` — User module
- `apps/api/src/mail/` — Email service
- `apps/api/src/guards/` — JWT/Roles guards

### Completed Features
- User registration with email verification
- JWT token generation & refresh
- Password hashing and comparison
- Admin role assignment
- Email notifications

---

## Phase 3: E-commerce Modules (COMPLETE)

**Duration:** 3 weeks | **Status:** DONE | **Progress:** 100%

### Objectives
- [x] Product catalog module (CRUD + search)
- [x] Product variants support
- [x] Order management system
- [x] Order status tracking
- [x] Article/blog module
- [x] Media upload to Cloudinary
- [x] Admin dashboard with statistics
- [x] Pagination (offset & cursor)

### Deliverables
- [x] ProductsModule (create, read, update, delete, search)
- [x] ProductVariant support (OneToMany relationship)
- [x] OrdersModule (create, list, status update)
- [x] OrderItem with price tracking
- [x] ArticlesModule (blog/content)
- [x] MediaModule (Cloudinary integration)
- [x] DashboardModule (admin analytics)
- [x] Pagination utilities

### Key Files
- `apps/api/src/api/products/` — Products module
- `apps/api/src/api/orders/` — Orders module
- `apps/api/src/api/articles/` — Articles module
- `apps/api/src/api/media/` — Media uploads
- `apps/api/src/api/dashboard/` — Admin dashboard

### Completed Features
- Product listing with slug-based routing
- Product variants with separate pricing
- Order creation and management
- Order status workflow (pending → processing → shipped → delivered)
- Article management with SEO-friendly slugs
- Media upload to Cloudinary with public URL storage
- Admin dashboard stats (daily/weekly/monthly/all-time)
- Pagination for large datasets

---

## Phase 4: Testing & Quality (IN PROGRESS)

**Duration:** 2 weeks | **Status:** IN PROGRESS | **Progress:** 40%

### Objectives
- [ ] Unit tests for all services (Jest)
- [ ] Unit tests for controllers
- [ ] Integration tests for critical flows
- [ ] E2E tests for API endpoints
- [ ] Achieve 70%+ code coverage
- [ ] Code review and refactoring
- [ ] Performance benchmarking
- [ ] Security audit

### Current Tasks
- [x] Setup Jest and test configuration
- [x] Write service unit tests (auth, users, products)
- [ ] Write controller tests
- [ ] Write E2E tests for orders module
- [ ] Achieve 70% coverage
- [ ] Fix linting issues
- [ ] Performance profiling

### Test Coverage Target
| Module | Target | Current |
|--------|--------|---------|
| Auth | 80% | ~50% |
| Users | 75% | ~40% |
| Products | 75% | ~45% |
| Orders | 70% | ~30% |
| Articles | 70% | ~35% |
| Media | 70% | ~25% |
| **Overall** | **70%** | **~40%** |

### Key Files
- `apps/api/src/**/*.spec.ts` — Unit tests
- `apps/api/test/` — E2E tests
- `jest.config.json` — Test configuration

### Success Criteria
- [ ] `pnpm test:cov` shows >= 70% coverage
- [ ] No failing tests in CI
- [ ] All critical paths covered
- [ ] E2E tests passing

---

## Phase 5: Performance & Monitoring (PLANNED)

**Estimated Duration:** 1 week
**Status:** PLANNED | **Progress:** 0%

### Objectives
- [ ] Database query optimization
- [ ] Implement caching strategy (Redis)
- [ ] API response time optimization (target < 200ms)
- [ ] Setup monitoring and logging
- [ ] Configure alert rules
- [ ] Load testing and stress testing
- [ ] Database index optimization

### Tasks
- [ ] Profile API endpoints with Apache Bench
- [ ] Add database indexes on frequently queried columns
- [ ] Implement Redis caching for products/articles
- [ ] Setup Pino structured logging
- [ ] Configure CloudWatch/Google Cloud Logging
- [ ] Create monitoring dashboards
- [ ] Load test with 100+ concurrent users
- [ ] Optimize N+1 queries

### Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 200ms | ~100ms |
| Database Query | < 50ms | ~30ms |
| Cache Hit Rate | > 80% | N/A |
| Error Rate | < 0.1% | Tracking |
| Uptime | 99.9% | Staging |

### Key Files
- `apps/api/src/shared/cache/` — Caching service
- `apps/api/src/interceptors/` — Logging interceptors

### Success Criteria
- [ ] P95 response time < 200ms
- [ ] Cache hit rate > 80% for products
- [ ] Load test passes 1000 requests/sec
- [ ] Error rate < 0.1%

---

## Phase 6: Staging Deployment (PLANNED)

**Estimated Duration:** 1 week
**Status:** PLANNED | **Progress:** 0%

### Objectives
- [ ] Deploy to staging environment
- [ ] Verify all services functional
- [ ] Test production-like configuration
- [ ] Perform security testing
- [ ] Load test in production environment
- [ ] Document deployment procedures

### Tasks
- [ ] Setup staging infrastructure (database, redis, etc.)
- [ ] Deploy API container to staging
- [ ] Run full integration tests
- [ ] Test Cloudinary integration
- [ ] Test email delivery
- [ ] Security vulnerability scan
- [ ] Performance load test
- [ ] Document runbook

### Verification Checklist
- [ ] API responsive and healthy
- [ ] Database migrations applied
- [ ] Swagger docs accessible
- [ ] Authentication working
- [ ] Product CRUD operations
- [ ] Order management
- [ ] File uploads working
- [ ] Admin dashboard accessible
- [ ] Monitoring/logging active

### Success Criteria
- [ ] 24-hour stability test (zero downtime)
- [ ] All critical flows tested and working
- [ ] Load test: 100+ concurrent users
- [ ] Deployment procedure documented

---

## Phase 7: Production Release (PLANNED)

**Estimated Duration:** 1 week
**Status:** PLANNED | **Progress:** 0%

### Objectives
- [ ] Deploy to production
- [ ] Verify production environment
- [ ] Enable monitoring and alerting
- [ ] Monitor for 7 days post-launch
- [ ] Document incident procedures
- [ ] Setup backup/restore procedures

### Tasks
- [ ] Finalize production environment
- [ ] Obtain SSL/TLS certificates
- [ ] Configure DNS and routing
- [ ] Setup production database with replication
- [ ] Enable automated backups
- [ ] Configure CDN for media
- [ ] Setup uptime monitoring
- [ ] Create incident response runbook
- [ ] Deploy with blue-green strategy
- [ ] Monitor metrics post-launch

### Pre-Launch Checklist
- [ ] All tests passing
- [ ] Code review complete
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Staging deployment stable
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team trained on operations

### Post-Launch Monitoring (Week 1)
- [ ] Monitor error rates (should be < 0.1%)
- [ ] Monitor response times (should be < 200ms P95)
- [ ] Monitor database performance
- [ ] Monitor Redis cache effectiveness
- [ ] Check for security incidents
- [ ] Review user feedback
- [ ] Document any issues

---

## Future Enhancements (Backlog)

### Short-term (Next Quarter)
- [ ] **API Rate Limiting** — Prevent abuse, implement per-user/IP limits
- [ ] **GraphQL Layer** — Alternative to REST API
- [ ] **Real-time Notifications** — WebSocket support for order updates
- [ ] **Advanced Search** — Elasticsearch integration for product search
- [ ] **Multi-language Support** — i18n translations (framework exists)
- [ ] **Payment Integration** — Stripe/PayPal checkout
- [ ] **Inventory Management** — Stock tracking, low stock alerts
- [ ] **Customer Reviews** — Product rating and review system

### Medium-term (Next 2-3 Quarters)
- [ ] **Admin Panel UI** — Dashboard for product/order management
- [ ] **Mobile App API** — Dedicated endpoints for mobile clients
- [ ] **Notification Preferences** — User-configurable alerts
- [ ] **Analytics Dashboard** — Business intelligence tools
- [ ] **Batch Operations** — Bulk product uploads, status updates
- [ ] **API Versioning** — Support multiple API versions
- [ ] **Custom Branding** — Multi-tenant support (if needed)
- [ ] **Microservices Migration** — Split into independent services

### Long-term (1+ year)
- [ ] **Machine Learning** — Recommendation engine
- [ ] **Advanced Analytics** — User behavior tracking
- [ ] **Global Expansion** — Multi-currency, multi-language
- [ ] **Marketplace** — Vendor management, commission tracking
- [ ] **Subscription Handling** — Recurring billing
- [ ] **Loyalty Program** — Points, discounts, rewards
- [ ] **Supply Chain Integration** — Supplier management
- [ ] **B2B Portal** — Wholesale ordering system

---

## Known Issues & Tech Debt

### Current Issues (To Fix)
1. **Email Queue** — Background job processing needs more testing
2. **Integration Tests** — Coverage is minimal, need comprehensive E2E
3. **Cloudinary Error Handling** — Need better error messages for upload failures
4. **N+1 Queries** — Some list endpoints have potential N+1 issues
5. **Cache Invalidation** — Cache TTL strategy needs review

### Tech Debt
- [ ] Refactor email service (reduce duplication)
- [ ] Extract validation logic to shared validators
- [ ] Update dependencies to latest versions
- [ ] Add more JSDoc comments to complex functions
- [ ] Consolidate error handling strategies
- [ ] Optimize database queries with indexes

---

## Dependency Management

### Planned Updates
- [ ] Upgrade NestJS to 11.x (when stable)
- [ ] Upgrade TypeScript to 5.7 (when available)
- [ ] Review and upgrade devDependencies monthly
- [ ] Use Renovate bot for automated PRs

### Deprecated Dependencies
- None currently, but monitoring:
  - `typeorm-extension` (may have better alternatives)
  - `slugify` (consider built-in URL slug methods)

---

## Timeline & Milestones

```
2026 Q1
├── Phase 1: Core Setup ✓
├── Phase 2: Auth & DB ✓
└── Phase 3: E-commerce ✓

2026 Q2
├── Phase 4: Testing (Current)
├── Phase 5: Performance (Planned)
├── Phase 6: Staging Deploy (Planned)
└── Phase 7: Production Release (Planned)

2026 Q3 & Beyond
├── Rate Limiting
├── GraphQL API
├── Real-time Notifications
├── Payment Integration
└── Mobile App Support
```

---

## Success Metrics

### Development Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Code Coverage | 70% | 40% |
| Build Time | < 2 min | 1.5 min |
| Test Execution | < 5 min | 3 min |
| Linting Errors | 0 | 0 |
| Type Errors | 0 | 0 |

### Production Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Uptime | 99.9% | Staging |
| P95 Response | < 200ms | ~100ms |
| Error Rate | < 0.1% | Monitoring |
| Cache Hit | > 80% | N/A |
| DB Connection | < 50ms | ~30ms |

---

## Release Notes Template

For each release, update with:

```markdown
## [Version X.Y.Z] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description

### Deprecated
- Deprecated feature description

### Removed
- Removed feature description

### Security
- Security fix description

### Breaking Changes
- Breaking change description (if any)
```

---

## Review Cadence

| Review Type | Frequency | Owner |
|-------------|-----------|-------|
| Status Update | Weekly | Dev Lead |
| Roadmap Review | Monthly | Product Owner |
| Backlog Refinement | Bi-weekly | Team |
| Retrospective | End of Phase | Team |

---

## Decision Log

### Decisions Made

#### Decision 1: Monorepo with pnpm
- **Date:** 2026-01-15
- **Decision:** Use pnpm workspaces + Turborepo for monorepo
- **Rationale:** Fast, disk-efficient, great for shared packages
- **Status:** Implemented

#### Decision 2: TypeORM over Prisma
- **Date:** 2026-01-20
- **Decision:** Use TypeORM as ORM
- **Rationale:** Declarative entities, good migration support
- **Status:** Implemented

#### Decision 3: Cloudinary for Media
- **Date:** 2026-02-01
- **Decision:** Use Cloudinary for image/video management
- **Rationale:** CDN included, image optimization, secure uploads
- **Status:** Implemented

### Pending Decisions
- [ ] **Payment Gateway** — Stripe vs PayPal vs local solution
- [ ] **Search Engine** — Elasticsearch vs native PostgreSQL FTS
- [ ] **Caching Strategy** — Redis vs In-memory (decided: Redis)
- [ ] **Logging Service** — Google Cloud vs AWS vs self-hosted

---

## Contact & Escalation

- **Product Owner:** [Name] — Feature prioritization, business decisions
- **Tech Lead:** [Name] — Architecture, technical decisions
- **DevOps Lead:** [Name] — Infrastructure, deployment decisions
- **QA Lead:** [Name] — Testing strategy, quality gates

---

## References

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Deployment Guide](./deployment-guide.md)
- [Development Guide](../apps/api/docs/development.md)

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-03-30 | 1.0.0 | Team | Initial roadmap creation |
| | | | |

