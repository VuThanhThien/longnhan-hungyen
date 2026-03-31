---
phase: 3
title: "Backend API"
status: completed
effort: 10h
depends_on: [2]
---

# Phase 3: Backend API

## Context Links

- [Plan Overview](plan.md)
- [Phase 2: Database](phase-02-database-entities.md)
- [NestJS Research](../reports/researcher-260329-2130-nestjs-typeorm-ecommerce-guide.md)

## Overview

- **Priority:** P1 (blocking storefront + admin)
- **Status:** completed
- Implement all NestJS modules: auth, products, orders, articles, media, dashboard. REST API with class-validator DTOs, JWT admin auth guard, Cloudinary upload.

## Key Insights

- **Base from [vndevteam/nestjs-boilerplate](https://vndevteam.github.io/nestjs-boilerplate/development.html)** — boilerplate provides: TypeORM setup, JWT auth scaffolding, Swagger, class-validator, BullMQ/Redis, global exception filters, interceptors. Build domain modules on top.
- Public endpoints (storefront): products list/detail, articles list/detail, order creation
- Protected endpoints (admin): CRUD all entities, dashboard stats, media upload
- JWT via HTTP-only cookie for admin; no auth for storefront order submissions
- Cloudinary SDK v2 for image upload, return URL + public_id
- **Local dev**: PostgreSQL on `localhost:5432`, Redis on `localhost:6379` via Docker Compose (see Phase 1)

## Requirements

### Functional
- **Auth**: POST /auth/login, GET /auth/me, POST /auth/logout
- **Products**: GET /products (public, paginated), GET /products/:slug (public), POST/PUT/DELETE /products (admin)
- **Orders**: POST /orders (public - create order), GET /orders (admin, filtered), PATCH /orders/:id/status (admin)
- **Articles**: GET /articles (public, paginated), GET /articles/:slug (public), POST/PUT/DELETE /articles (admin)
- **Media**: POST /media/upload (admin), GET /media (admin), DELETE /media/:id (admin)
- **Dashboard**: GET /dashboard/stats (admin) — order counts, revenue by period

### Non-Functional
- class-validator on all DTOs
- Pagination: offset-based with total count
- CORS configured for web + admin origins
- Rate limiting on order creation (prevent spam)
- API prefix: `/api/v1`

## Architecture

### Module Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts      # login, me, logout
│   │   ├── auth.service.ts         # validateAdmin, issueJwt
│   │   ├── jwt.strategy.ts         # PassportStrategy
│   │   ├── jwt-auth.guard.ts       # @UseGuards(JwtAuthGuard)
│   │   ├── dto/login.dto.ts
│   │   └── auth.module.ts
│   ├── products/
│   │   ├── products.controller.ts  # public + admin endpoints
│   │   ├── products.service.ts     # CRUD + variant management
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── product-query.dto.ts
│   │   └── products.module.ts
│   ├── orders/
│   │   ├── orders.controller.ts    # public create + admin manage
│   │   ├── orders.service.ts       # create order, update status, stats
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   ├── update-order-status.dto.ts
│   │   │   └── order-query.dto.ts
│   │   └── orders.module.ts
│   ├── articles/
│   │   ├── articles.controller.ts
│   │   ├── articles.service.ts
│   │   ├── dto/
│   │   │   ├── create-article.dto.ts
│   │   │   ├── update-article.dto.ts
│   │   │   └── article-query.dto.ts
│   │   └── articles.module.ts
│   ├── media/
│   │   ├── media.controller.ts     # upload + list + delete
│   │   ├── media.service.ts
│   │   ├── cloudinary.provider.ts  # Cloudinary SDK config
│   │   └── media.module.ts
│   ├── dashboard/
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   └── common/
│       ├── filters/http-exception.filter.ts
│       ├── interceptors/transform.interceptor.ts
│       ├── decorators/public.decorator.ts
│       ├── dto/pagination.dto.ts
│       └── utils/slug.util.ts
├── app.module.ts
└── main.ts
```

### API Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | Public | Admin login, returns JWT cookie |
| GET | /auth/me | Admin | Current admin info |
| GET | /products | Public | List active products (paginated) |
| GET | /products/:slug | Public | Product detail + variants |
| POST | /products | Admin | Create product |
| PUT | /products/:id | Admin | Update product |
| DELETE | /products/:id | Admin | Soft delete product |
| POST | /orders | Public | Create order (customer) |
| GET | /orders | Admin | List orders (filtered, paginated) |
| GET | /orders/:id | Admin | Order detail |
| PATCH | /orders/:id/status | Admin | Update order/payment status |
| GET | /articles | Public | List published articles |
| GET | /articles/:slug | Public | Article detail |
| POST | /articles | Admin | Create article |
| PUT | /articles/:id | Admin | Update article |
| DELETE | /articles/:id | Admin | Delete article |
| POST | /media/upload | Admin | Upload to Cloudinary |
| GET | /media | Admin | List media |
| DELETE | /media/:id | Admin | Delete media |
| GET | /dashboard/stats | Admin | Revenue + order stats |

## Related Code Files

### Files to Create
- All files listed in Architecture section above (~30 files)

### Files to Modify
- `apps/api/src/app.module.ts` — import all modules
- `apps/api/src/main.ts` — CORS, global pipes, prefix
- `apps/api/package.json` — add passport, jwt, cloudinary deps

## Implementation Steps

### 1. Install Dependencies

```bash
cd apps/api
pnpm add @nestjs/passport passport passport-jwt @nestjs/jwt jsonwebtoken
pnpm add cloudinary multer @nestjs/platform-express
pnpm add class-validator class-transformer
pnpm add slug
pnpm add -D @types/passport-jwt @types/multer
```

### 2. Main Bootstrap (main.ts)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: [process.env.WEB_URL, process.env.ADMIN_URL],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
```

### 3. Auth Module

- `JwtStrategy` validates token from cookie or Authorization header
- `JwtAuthGuard` applied globally, `@Public()` decorator skips auth
- Login: validate email+password with bcrypt, return JWT in HTTP-only cookie
- JWT payload: `{ sub: adminId, email }`
- Token expiry: 7 days

### 4. Products Module

- **Public**: `GET /products` — find active products, include variant count, paginate
- **Public**: `GET /products/:slug` — find by slug, include variants
- **Admin**: `POST /products` — create with variants in single request
- **Admin**: `PUT /products/:id` — update product + upsert variants
- **Admin**: `DELETE /products/:id` — set `active: false`
- Slug auto-generated from name using `slug` package with Vietnamese locale

### 5. Orders Module

- **Public**: `POST /orders` — validate items exist + have stock, calculate totals, create order + items, snapshot variant data
- **Admin**: `GET /orders` — filter by orderStatus, paymentStatus, date range, search by code/phone
- **Admin**: `PATCH /orders/:id/status` — update orderStatus and/or paymentStatus
- Order code: auto-generated `LN-YYMMDD-XXXX`

Create order flow:
1. Validate variant IDs exist and are active
2. Check stock availability
3. Calculate item subtotals and order total
4. Snapshot each variant (name, price, weight, product name)
5. Create order + items in transaction
6. Decrement variant stock

### 6. Articles Module

- **Public**: `GET /articles` — published only, paginate, select fields (no content_html for list)
- **Public**: `GET /articles/:slug` — full article with content
- **Admin**: CRUD — slug auto-generated, `published` boolean, `publishedAt` set on first publish

### 7. Media Module

- Cloudinary provider: configure from env vars (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)
- Upload: multer memory storage → cloudinary.uploader.upload_stream
- Store URL + public_id in media table
- Delete: remove from Cloudinary + DB

### 8. Dashboard Module

```typescript
// dashboard.service.ts
async getStats(period: 'today' | 'week' | 'month' | 'all') {
  // Total orders by status
  // Total revenue (paid orders)
  // Orders count by day (for chart)
  // Recent orders (last 10)
}
```

### 9. Common Utilities

- **Pagination DTO**: `page`, `limit`, `sortBy`, `sortOrder`
- **Transform interceptor**: wrap responses in `{ data, meta }` format
- **HTTP exception filter**: consistent error format `{ statusCode, message, error }`
- **@Public() decorator**: mark endpoints that skip JWT guard
- **Slug util**: Vietnamese-aware slug generation

## Todo List

- [x] Configure main.ts (CORS, global prefix, pipes, filters)
- [x] Implement Auth module (login, JWT strategy, guard, @Public decorator)
- [x] Implement Products module (public list/detail + admin CRUD)
- [x] Implement Orders module (public create + admin manage)
- [x] Implement Articles module (public list/detail + admin CRUD)
- [x] Implement Media module (Cloudinary upload/list/delete)
- [x] Implement Dashboard module (stats endpoint)
- [x] Create common utilities (pagination, transform interceptor, exception filter)
- [x] Add slug generation utility
- [x] Wire all modules in AppModule
- [x] Test all endpoints with curl/Postman
- [x] Verify public endpoints work without auth
- [x] Verify admin endpoints reject without JWT

## Success Criteria

- All endpoints respond correctly (test with curl)
- Public endpoints accessible without auth
- Admin endpoints return 401 without valid JWT
- Order creation decrements stock in transaction
- Cloudinary upload returns URL
- Dashboard returns correct aggregate data

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Race condition on stock decrement | Medium | Use TypeORM transaction + SELECT FOR UPDATE |
| Cloudinary upload timeout | Low | Set 30s timeout, return error gracefully |
| JWT token theft | Medium | HTTP-only cookie, short-ish expiry, HTTPS only |
| Order spam | Medium | Rate limit POST /orders (10/min per IP) |

## Security Considerations

- JWT in HTTP-only cookie (not localStorage)
- Bcrypt password hashing (10 rounds)
- class-validator whitelist mode strips unknown fields
- CORS restricted to known origins
- File upload size limit (5MB)
- SQL injection prevented by TypeORM parameterized queries

## Next Steps

- Phase 4: Storefront consumes public endpoints
- Phase 5: Admin panel consumes admin endpoints
