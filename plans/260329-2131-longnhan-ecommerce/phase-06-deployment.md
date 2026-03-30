---
phase: 6
title: "Deployment"
status: pending
effort: 2h
depends_on: [3, 4, 5]
---

# Phase 6: Deployment

## Context Links

- [Plan Overview](plan.md)

## Overview

- **Priority:** P2
- **Status:** pending
- Deploy API to Railway (NestJS + PostgreSQL), web + admin to Vercel. Configure env vars, domains, and basic CI.

## Requirements

### Functional
- API running on Railway with PostgreSQL addon
- Web storefront on Vercel (longnhan.vn)
- Admin panel on Vercel (admin.longnhan.vn)
- All env vars configured
- Database migrations run on deploy
- HTTPS on all services

### Non-Functional
- Zero-downtime deploys
- Auto-deploy on push to main
- Environment separation (dev/prod)

## Architecture

```
                    ┌─────────────┐
                    │   Vercel    │
                    │ longnhan.vn │ ──── apps/web
                    └──────┬──────┘
                           │ fetch
┌─────────────┐    ┌──────▼──────┐    ┌──────────────┐
│   Vercel    │    │  Railway    │    │  Cloudinary  │
│admin.longnhan│───▶│ NestJS API  │───▶│    CDN       │
│    .vn      │    │ + PostgreSQL│    │   (images)   │
└─────────────┘    └─────────────┘    └──────────────┘
     apps/admin        apps/api
```

## Related Code Files

### Files to Create
- `apps/api/Dockerfile` (or use Railway Nixpacks auto-detect)
- `apps/api/Procfile` (optional)
- `.github/workflows/ci.yml` (optional, basic lint+build check)

### Files to Modify
- `apps/api/src/modules/database/typeorm.config.ts` — production DATABASE_URL parsing
- `apps/web/next.config.ts` — production env
- `apps/admin/next.config.ts` — production env

## Implementation Steps

### 1. Railway Setup (API + PostgreSQL)

1. Create Railway project
2. Add PostgreSQL plugin → get DATABASE_URL
3. Connect GitHub repo, set root directory to `apps/api`
4. Set build command: `pnpm install && pnpm build`
5. Set start command: `node dist/main.js`
6. Configure env vars:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=<generate-random-64-char>
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   WEB_URL=https://longnhan.vn
   ADMIN_URL=https://admin.longnhan.vn
   NODE_ENV=production
   PORT=3001
   ```
7. Run migration: `npx typeorm migration:run`
8. Run admin seed

### 2. Vercel Setup (Web)

1. Import GitHub repo in Vercel
2. Set root directory: `apps/web`
3. Framework preset: Next.js
4. Build command: `cd ../.. && pnpm turbo build --filter=web`
5. Install command: `cd ../.. && pnpm install`
6. Env vars:
   ```
   NEXT_PUBLIC_API_URL=https://api.longnhan.vn/api/v1
   NEXT_PUBLIC_SITE_URL=https://longnhan.vn
   NEXT_PUBLIC_CLOUDINARY_CLOUD=...
   API_URL=https://api.longnhan.vn  (server-side only)
   ```
7. Configure custom domain: longnhan.vn

### 3. Vercel Setup (Admin)

1. Import same repo as separate Vercel project
2. Set root directory: `apps/admin`
3. Build command: `cd ../.. && pnpm turbo build --filter=admin`
4. Install command: `cd ../.. && pnpm install`
5. Env vars:
   ```
   API_URL=https://api.longnhan.vn
   NEXT_PUBLIC_API_URL=https://api.longnhan.vn/api/v1
   ```
6. Configure custom domain: admin.longnhan.vn

### 4. Database Migration Strategy

For production:
```typescript
// typeorm.config.ts — handle Railway DATABASE_URL
const config: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/modules/database/migrations/*.js'],
    }
  : { /* local dev config */ };
```

### 5. CORS Configuration

```typescript
// main.ts — production CORS
app.enableCors({
  origin: [
    process.env.WEB_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3002',
  ],
  credentials: true,
});
```

### 6. Basic CI (Optional)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
```

## Todo List

- [ ] Set up Railway project with PostgreSQL
- [ ] Deploy API to Railway
- [ ] Run production migration + seed
- [ ] Set up Vercel project for web
- [ ] Set up Vercel project for admin
- [ ] Configure all env vars
- [ ] Configure custom domains
- [ ] Verify CORS works cross-origin
- [ ] Test full flow: storefront → API → admin
- [ ] Set up basic CI workflow (optional)

## Success Criteria

- API accessible at api.longnhan.vn
- Storefront loads at longnhan.vn with real data
- Admin panel accessible at admin.longnhan.vn
- Admin can log in and manage data
- Orders placed on storefront appear in admin
- Images served via Cloudinary CDN
- HTTPS on all endpoints

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Railway cold starts | Low | Keep starter plan, acceptable for MVP |
| Vercel build timeout (monorepo) | Low | Turborepo caching, filter builds |
| DATABASE_URL SSL issues | Low | `rejectUnauthorized: false` for Railway |
| CORS misconfiguration | Medium | Test with actual domains before launch |

## Security Considerations

- All secrets in platform env vars (never in code)
- HTTPS enforced on all services
- Database SSL in production
- JWT_SECRET unique per environment
- Admin panel on separate subdomain

## Next Steps

- Monitor logs for errors
- Set up Cloudinary upload preset for security
- Consider adding health check endpoint to API
