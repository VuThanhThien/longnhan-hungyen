# Long Nhan Hung Yen - Documentation Index

**Last Updated:** 2026-03-30

Complete project documentation for the NestJS e-commerce API for longan fruit products.

---

## Quick Navigation

### 📋 Start Here
**[Project Overview & PDR](./project-overview-pdr.md)** (262 lines)
- Project vision, goals, features
- Stakeholders and responsibilities
- Functional/non-functional requirements
- Success metrics and timeline
- **Best for:** Understanding the "why" and "what"

### 🏗️ Architecture & Design
**[System Architecture](./system-architecture.md)** (501 lines)
- Monorepo structure with module breakdown
- API layers, request flows, data models
- Docker setup (local & production)
- Security architecture
- Scaling strategies
- **Best for:** Understanding the "how" technically

### 💻 Development
**[Code Standards](./code-standards.md)** (737 lines)
- Naming conventions (files, variables, functions)
- TypeScript/NestJS patterns with examples
- Error handling and testing standards
- Commit/branch conventions
- Code review checklist
- **Best for:** Writing code that fits the codebase style

### 📚 Reference
**[Codebase Summary](./codebase-summary.md)** (644 lines)
- Directory tree and file organization
- Module structure overview
- Data models (8 entities)
- API endpoints (12+)
- Dependencies list
- Available commands
- **Best for:** Quick reference and navigation

### 🚀 Operations
**[Deployment Guide](./deployment-guide.md)** (619 lines)
- Local development setup
- Staging deployment steps
- Production deployment options
- Database management (migrations, backup)
- Troubleshooting procedures
- **Best for:** Setting up and deploying environments

### 🗺️ Planning
**[Project Roadmap](./project-roadmap.md)** (530 lines)
- Development phases (7 phases, 3 complete)
- Feature backlog and enhancements
- Timeline and milestones
- Known issues and tech debt
- Success metrics
- **Best for:** Understanding project status and planning

---

## By Role

### New Developer
1. Read [Project Overview](./project-overview-pdr.md) (20 min)
2. Read [Codebase Summary](./codebase-summary.md) (20 min)
3. Follow [Deployment Guide](./deployment-guide.md) - Local Setup section
4. Review [Code Standards](./code-standards.md) before writing code
5. Explore codebase in IDE while referencing [System Architecture](./system-architecture.md)

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
2. Review [Code Standards](./code-standards.md) - Architecture patterns
3. Check [Project Roadmap](./project-roadmap.md) - Future enhancements
4. Analyze [Codebase Summary](./codebase-summary.md) - Module relationships

---

## Documentation Overview

| Document | Focus | Audience | Time |
|----------|-------|----------|------|
| Project Overview & PDR | Business & Requirements | Everyone | 20 min |
| System Architecture | Technical Design | Architects, Devs | 60 min |
| Code Standards | Development Patterns | Developers | 45 min |
| Codebase Summary | Navigation & Reference | All devs | 30 min |
| Deployment Guide | Operations | DevOps, Devs | 60 min |
| Project Roadmap | Planning & Status | PM, Leads | 30 min |

---

## Key Information at a Glance

### Tech Stack
- **Framework:** NestJS 10 + TypeScript 5.6
- **Database:** PostgreSQL 13+
- **ORM:** TypeORM 0.3.20
- **Authentication:** JWT + Argon2
- **Cache:** Redis
- **Queue:** BullMQ
- **Email:** Nodemailer
- **Media:** Cloudinary
- **Package Manager:** pnpm 10.32.1
- **Monorepo:** pnpm workspaces + Turborepo

### Core Modules
- **UserModule** — User auth & profiles
- **AuthModule** — JWT authentication
- **ProductsModule** — Product catalog (with variants)
- **OrdersModule** — Order management
- **ArticlesModule** — Blog/content
- **MediaModule** — Cloudinary uploads
- **DashboardModule** — Admin statistics
- **HealthModule** — Health checks

### Development Status
- **Phase 1-3:** Complete (Core setup, Auth, E-commerce)
- **Phase 4:** In Progress - 40% (Testing & quality)
- **Phase 5-7:** Planned (Performance, staging, production)

### Quick Commands
```bash
pnpm install           # Install dependencies
pnpm dev              # Start development server
pnpm build            # Production build
pnpm test             # Run tests
pnpm lint             # Lint and fix code
pnpm migration:up     # Run database migrations
pnpm seed:run         # Seed sample data
```

### API Base URL
```
Development: http://localhost:3000/api/v1
Swagger: http://localhost:3000/api-docs
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit database, auth, and email settings
```

---

## Directory Structure

```
longnhantongtran/
├── docs/                          # ← You are here
│   ├── README.md                  # This file
│   ├── project-overview-pdr.md
│   ├── system-architecture.md
│   ├── code-standards.md
│   ├── codebase-summary.md
│   ├── deployment-guide.md
│   └── project-roadmap.md
├── apps/
│   └── api/                       # Main NestJS application
│       ├── src/
│       │   ├── api/              # 8 feature modules
│       │   ├── common/           # Shared DTOs, types
│       │   ├── database/         # ORM, entities, migrations
│       │   ├── mail/             # Email service
│       │   └── ...
│       ├── test/                 # E2E tests
│       └── docs/                 # Additional API docs
├── packages/
│   └── types/                    # Shared @longnhan/types
├── docker-compose.yml            # Production services
└── docker-compose.local.yml      # Local dev stack
```

---

## Common Tasks

### Get Started
```bash
pnpm install
cp .env.example .env
docker compose -f docker-compose.local.yml up --build -d
pnpm migration:up
pnpm dev
```

### Add a Feature
1. Create module in `src/api/{feature}/`
2. Follow patterns in [Code Standards](./code-standards.md)
3. Add entity to `src/database/entities/`
4. Generate migration: `pnpm migration:generate`
5. Write tests (target 70%+ coverage)
6. Update [Codebase Summary](./codebase-summary.md) if new public API

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

**Code Style & Patterns?**
→ See [Code Standards](./code-standards.md)

**Architecture & Design?**
→ See [System Architecture](./system-architecture.md)

**Finding Files & Commands?**
→ See [Codebase Summary](./codebase-summary.md)

**Project Status & Roadmap?**
→ See [Project Roadmap](./project-roadmap.md)

**Business Requirements?**
→ See [Project Overview & PDR](./project-overview-pdr.md)

---

## Document Maintenance

These docs are living documents and updated regularly:
- **Weekly:** Phase status in Roadmap
- **Monthly:** Test coverage and metrics
- **Quarterly:** Architecture reviews
- **Annually:** Comprehensive audit

Last review: 2026-03-30

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-30 | Initial documentation creation |

---

Generated with ❤️ for the Long Nhan Hung Yen project.

