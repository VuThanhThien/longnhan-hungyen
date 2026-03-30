---
phase: 1
title: "Monorepo Setup"
status: completed
effort: 3h
completed_at: 2026-03-30
---

# Phase 1: Monorepo Setup

## Context Links

- [Plan Overview](plan.md)
- [NestJS Research](../reports/researcher-260329-2130-nestjs-typeorm-ecommerce-guide.md)

## Overview

- **Priority:** P1 (blocking all other phases)
- **Status:** completed
- Scaffold Turborepo monorepo with pnpm workspaces, configure 3 apps (api, web, admin) + 1 shared package (types), set up base tooling.

## Key Insights

- Turborepo caches builds per workspace; `turbo.json` pipeline config is critical
- pnpm workspaces via `pnpm-workspace.yaml` + root `package.json`
- Shared `packages/types` avoids DTO duplication between frontend and backend
- **Backend based on [vndevteam/nestjs-boilerplate](https://vndevteam.github.io/nestjs-boilerplate/development.html)** — use as foundation for `apps/api` (TypeORM, auth, swagger, BullMQ already wired)
- **Local dev infra via Docker Compose** — PostgreSQL + Redis run as Docker containers on localhost, no remote DB needed for development

## Requirements

### Functional
- Turborepo monorepo with `apps/api`, `apps/web`, `apps/admin`, `packages/types`
- Each app independently buildable and runnable
- Shared types importable as `@longnhan/types`
- Dev mode starts all 3 apps concurrently

### Non-Functional
- pnpm for fast, disk-efficient installs
- TypeScript strict mode everywhere
- ESLint shared config
- `.env` files per app (gitignored)

## Architecture

```
longnhantongtran/
├── apps/
│   ├── api/              # NestJS
│   │   ├── src/
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── web/              # Next.js storefront
│   │   ├── app/
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── admin/            # Next.js admin
│       ├── app/
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── types/
│       ├── src/
│       │   ├── product.ts
│       │   ├── order.ts
│       │   ├── article.ts
│       │   ├── auth.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .gitignore
└── .env.example
```

## Related Code Files

### Files to Create
- `package.json` (root)
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.gitignore`
- `.env.example`
- `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/nest-cli.json`
- `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
- `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`
- `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`
- `apps/admin/package.json`, `apps/admin/tsconfig.json`, `apps/admin/next.config.ts`
- `apps/admin/app/layout.tsx`, `apps/admin/app/page.tsx`
- `packages/types/package.json`, `packages/types/tsconfig.json`
- `packages/types/src/index.ts`

## Implementation Steps

### 1. Root Monorepo Config

```bash
# Initialize root
pnpm init
```

Root `package.json`:
```json
{
  "name": "longnhantongtran",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2",
    "typescript": "^5.4"
  },
  "packageManager": "pnpm@9.0.0"
}
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 2. Shared Types Package

`packages/types/package.json`:
```json
{
  "name": "@longnhan/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4"
  }
}
```

### 3. NestJS API App (from boilerplate)

Clone the vndevteam boilerplate into `apps/api`:
```bash
# Clone boilerplate into apps/api
git clone https://github.com/vndevteam/nestjs-boilerplate apps/api
rm -rf apps/api/.git  # detach from upstream git

# Copy env template
cp apps/api/.env.example apps/api/.env
```

The boilerplate ships with: TypeORM, JWT auth, Swagger, class-validator, BullMQ (Redis), pgAdmin, maildev.
We keep what we need, remove what we don't (social auth, i18n, etc. can be stripped later).

Add `@longnhan/types` as workspace dependency in `apps/api/package.json`.

### 4. Docker Compose for Local Dev

Create `docker-compose.yml` at monorepo root:

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    container_name: longnhan_db
    environment:
      POSTGRES_DB: longnhan
      POSTGRES_USER: longnhan
      POSTGRES_PASSWORD: longnhan
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: longnhan_redis
    ports:
      - "6379:6379"
    command: redis-server --save 20 1 --loglevel warning

  pgadmin:
    image: dpage/pgadmin4
    container_name: longnhan_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@longnhan.vn
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data:
```

Start local infra:
```bash
docker compose up -d db redis
# Optional: docker compose up -d pgadmin
```

`apps/api/.env` for local dev:
```env
# Database (Docker localhost)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=longnhan
DB_USERNAME=longnhan
DB_PASSWORD=longnhan

# Redis (Docker localhost)
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001

# JWT
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend origins (CORS)
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002
```

### 5. Next.js Web App

```bash
cd apps && npx create-next-app@latest web --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-pnpm
```

### 6. Next.js Admin App

```bash
cd apps && npx create-next-app@latest admin --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-pnpm
```

Add shadcn/ui to admin:
```bash
cd apps/admin && npx shadcn@latest init
```

### 7. Base TypeScript Config

`tsconfig.base.json` at root:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Each app's `tsconfig.json` extends this base.

### 8. Gitignore

```
node_modules/
dist/
.next/
.turbo/
.env
.env.local
*.log
```

### 9. Verify

```bash
pnpm install
pnpm dev  # all 3 apps start
```

## Todo List

- [x] Init root package.json + pnpm-workspace.yaml
- [x] Create turbo.json
- [x] Create tsconfig.base.json
- [x] Clone vndevteam/nestjs-boilerplate into apps/api, remove .git
- [x] Create docker-compose.yml (PostgreSQL + Redis + pgAdmin)
- [x] Configure apps/api/.env for local Docker (localhost:5432, localhost:6379)
- [x] Verify `docker compose up -d db redis` starts successfully
- [x] Scaffold Next.js web app
- [x] Scaffold Next.js admin app (+ shadcn/ui init)
- [x] Create packages/types with base types
- [x] Wire workspace dependencies (@longnhan/types in all apps)
- [x] Create root .gitignore + .env.example
- [x] Verify `pnpm dev` starts api (3001), web (3000), admin (3002)
- [x] Verify `pnpm build` succeeds

## Success Criteria

- `pnpm dev` starts api (port 3001), web (port 3000), admin (port 3002) concurrently
- `pnpm build` succeeds for all workspaces
- `packages/types` importable from all 3 apps
- TypeScript strict mode, no compilation errors

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| pnpm version mismatch | Low | Pin in `packageManager` field |
| Turborepo cache issues | Low | `turbo clean` script |
| TypeScript path resolution | Medium | Use workspace protocol, verify imports |

## Next Steps

- Phase 2: Database entities and migrations
