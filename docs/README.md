# Long Nhan Hung Yen - Documentation Index

**Last Updated:** 2026-04-13

pnpm + Turborepo monorepo: **NestJS API** (`apps/api`), **Next.js storefront** (`apps/web`), **Next.js admin** (`apps/admin`), shared **@longnhan/types**.

**Canonical phase status:** [Project Roadmap](./project-roadmap.md).

---

## Quick navigation

| Doc | Use for |
|-----|---------|
| [Project Overview & PDR](./project-overview-pdr.md) | Vision, requirements |
| [Project Roadmap](./project-roadmap.md) | **Current phases & milestones** |
| [Project Changelog](./project-changelog.md) | Release-style change log |
| [System Architecture](./system-architecture.md) | How pieces connect |
| [Code Standards](./code-standards.md) | NestJS / `apps/api` |
| [Frontend Code Standards](./frontend-code-standards.md) | Next.js / `apps/web`, `apps/admin` |
| [Codebase Summary](./codebase-summary.md) | Trees, modules, commands |
| [Deployment Guide](./deployment-guide.md) | Environments & ops |

---

## By Role

### New Developer
1. [Project Overview](./project-overview-pdr.md) + [Project Roadmap](./project-roadmap.md)
2. [Codebase Summary](./codebase-summary.md) + [root README](../README.md) (ports, scripts)
3. [Deployment Guide](./deployment-guide.md) — local setup
4. Backend: [Code Standards](./code-standards.md) · Frontend: [Frontend Code Standards](./frontend-code-standards.md)
5. [System Architecture](./system-architecture.md) while exploring the repo

### DevOps Engineer
1. Review [System Architecture](./system-architecture.md) - Docker sections
2. Follow [Deployment Guide](./deployment-guide.md)
3. Understand database setup via [Codebase Summary](./codebase-summary.md)
4. Reference [Project Overview](./project-overview-pdr.md) for business context

### Project Manager
1. Read [Project Overview & PDR](./project-overview-pdr.md)
2. Review [Project Roadmap](./project-roadmap.md)
3. Reference timeline and milestones for planning

### Architect / Tech Lead
1. Study [System Architecture](./system-architecture.md) thoroughly
2. Review [Code Standards](./code-standards.md) and [Frontend Code Standards](./frontend-code-standards.md)
3. Check [Project Roadmap](./project-roadmap.md) for status and next work
4. Use [Codebase Summary](./codebase-summary.md) for module layout

---

## Documentation overview

| Document | Focus | Audience |
|----------|-------|----------|
| Project Overview & PDR | Requirements & scope | Everyone |
| Project Roadmap | **Canonical** phase status | PM, leads, devs |
| Project Changelog | Release notes | Everyone |
| System Architecture | Stack & flows | Architects, devs |
| Code Standards | `apps/api` (NestJS) | Backend devs |
| Frontend Code Standards | `apps/web`, `apps/admin` | Frontend devs |
| Codebase Summary | Trees & commands | All devs |
| Deployment Guide | Environments | DevOps, devs |

---

## Key information

### Tech stack
- **API:** NestJS 10, TypeORM, PostgreSQL, Redis, BullMQ, Cloudinary (see [root README](../README.md))
- **Web / Admin:** Next.js App Router, React, TanStack Query, Tailwind (details in [System Architecture](./system-architecture.md))
- **Monorepo:** pnpm workspaces + Turborepo

### Local URLs (from root README)
| Service | URL |
|--------|-----|
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api-docs |
| Storefront | http://localhost:3000 |
| Admin | http://localhost:3002 |

REST routes use URI versioning (e.g. `http://localhost:3001/api/v1/...`), matching `NEXT_PUBLIC_API_URL` defaults in the Next.js apps.

### Quick commands
```bash
pnpm install
pnpm dev                    # all apps (turbo)
pnpm dev:api                # API → :3001 (per root README)
pnpm dev:web                # storefront → :3000
pnpm dev:admin              # admin → :3002
pnpm --filter @longnhan/api migration:up   # DB migrations
pnpm lint && pnpm type-check
```

### Environment
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env   # then fill values
```

---

## Directory structure (high level)

```
longnhantongtran/
├── docs/                    # This index + PDR, architecture, standards, changelog, …
├── apps/
│   ├── api/                 # NestJS API
│   ├── web/                 # Next.js storefront (app/, src/components/, public/)
│   └── admin/               # Next.js admin
├── packages/
│   └── types/               # @longnhan/types
├── docker-compose.yml
└── docker-compose.local.yml
```

---

## Common tasks

### Get started
Follow [root README](../README.md) (Docker infra, `pnpm --filter @longnhan/api migration:up`, `pnpm dev`).

### Add API feature
1. Add module under `apps/api/src/api/{feature}/`
2. Follow [Code Standards](./code-standards.md)
3. Entities/migrations under `apps/api/src/database/`

### Add storefront UI
1. Prefer `apps/web/src/app/` (routes) and `apps/web/src/components/`
2. Follow [Frontend Code Standards](./frontend-code-standards.md)

### Deploy to Staging
1. Review [Deployment Guide](./deployment-guide.md) - Staging section
2. Follow step-by-step deployment instructions
3. Verify health check: `GET /health`

### Track Progress
1. Check [Project Roadmap](./project-roadmap.md) for current phase
2. Review phase objectives and success criteria
3. Update progress monthly

---

## External References

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Deployment](https://kubernetes.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support

### Questions About...

**Setup & Development?**
→ See [Deployment Guide - Local Setup](./deployment-guide.md#local-development-setup)

**Code style?**
→ API: [Code Standards](./code-standards.md) · Web/Admin: [Frontend Code Standards](./frontend-code-standards.md)

**Architecture & Design?**
→ See [System Architecture](./system-architecture.md)

**Finding Files & Commands?**
→ See [Codebase Summary](./codebase-summary.md)

**Project status?**
→ [Project Roadmap](./project-roadmap.md) · [Project Changelog](./project-changelog.md)

**Business requirements?**
→ [Project Overview & PDR](./project-overview-pdr.md)

---

## Document Maintenance

These docs are living documents and updated regularly:
- **Weekly:** Phase status in Roadmap
- **Monthly:** Test coverage and metrics
- **Quarterly:** Architecture reviews
- **Annually:** Comprehensive audit

Last review: 2026-04-13

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-04-13 | Monorepo index, ports, changelog link, scoped standards |
| 1.0.0 | 2026-03-30 | Initial documentation creation |

---

Generated with ❤️ for the Long Nhan Hung Yen project.

