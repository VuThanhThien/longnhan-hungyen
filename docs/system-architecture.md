# System Architecture

**Last Updated:** 2026-04-15

---

## Overview

Long Nhan Hung Yen is a **pnpm + Turborepo** monorepo: a **NestJS API** (`apps/api`), **Next.js storefront** (`apps/web`), **Next.js admin** (`apps/admin`), and shared **`@longnhan/types`**. Phase status: [Project Roadmap](./project-roadmap.md).

---

## Monorepo Structure

```
longnhantongtran/
├── .claude/                    # Code orchestration config
├── apps/
│   ├── api/                    # Main NestJS API application
│   │   ├── src/
│   │   │   ├── api/           # Feature modules
│   │   │   ├── background/    # Background jobs
│   │   │   ├── common/        # Shared DTOs, interfaces, types
│   │   │   ├── config/        # App configuration
│   │   │   ├── constants/     # Global constants
│   │   │   ├── database/      # ORM, entities, migrations
│   │   │   ├── decorators/    # Global decorators
│   │   │   ├── exceptions/    # Custom exceptions
│   │   │   ├── filters/       # Exception filters
│   │   │   ├── generated/     # Generated files (i18n)
│   │   │   ├── guards/        # Auth guards, JWT
│   │   │   ├── i18n/          # Language JSON files
│   │   │   ├── interceptors/  # Response/logging interceptors
│   │   │   ├── libs/          # Shared NestJS modules
│   │   │   ├── mail/          # Email service + templates
│   │   │   ├── shared/        # Global singleton services
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── app.module.ts  # Root module
│   │   │   └── main.ts        # App bootstrap
│   │   ├── test/              # E2E tests
│   │   ├── docs/              # API documentation
│   │   ├── Dockerfile         # Production image
│   │   ├── maildev.Dockerfile # MailDev service
│   │   └── package.json
│   ├── admin/                 # Next.js admin panel (Next.js 16, React 19, Tailwind CSS v4)
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router (login, dashboard, CRUD pages)
│   │   │   ├── components/    # Reusable UI (Radix UI, charts, forms)
│   │   │   ├── features/      # Feature-specific hooks & API calls
│   │   │   ├── services/      # Service layer (auth, API)
│   │   │   ├── lib/           # Utilities (admin-api-client, http-client, auth-token, etc.)
│   │   │   └── globals.css    # Tailwind CSS v4 config
│   │   └── package.json
│   └── web/                   # Next.js storefront
│       ├── public/            # Static assets (images, decorative art)
│       └── src/               # App Router, components, lib, services
├── packages/
│   └── types/                 # Shared @longnhan/types package
├── .github/workflows/         # CI/CD pipelines
├── docker-compose.yml         # Production infra
├── docker-compose.local.yml   # Local dev stack
├── pnpm-workspace.yaml        # Workspace definition
├── turbo.json                 # Turborepo config
└── docs/                      # Project documentation (NEW)
```

---

## Core Architecture Layers

### 1. API/Presentation Layer (src/api/)

**Modules** (feature-driven)

- **UserModule** — User CRUD, profile management
- **AuthModule** — JWT auth, sign-in/up, password reset
- **HealthModule** — Liveness/readiness probes
- **ProductsModule** — Product catalog CRUD with search
- **OrdersModule** — Order creation, status management
- **ArticlesModule** — Blog/content articles
- **MediaModule** — File uploads to Cloudinary
- **DashboardModule** — Admin analytics + statistics

Each module follows standard NestJS structure:

```
{module}/
├── entities/          # Database models
├── dto/              # Data Transfer Objects
├── services/         # Business logic
├── controllers/      # HTTP endpoints
├── {module}.module.ts
└── {module}.spec.ts
```

### 2. Shared Layer (src/common/, src/libs/)

**Shared DTOs & Interfaces**

- `common/dto/` — Common request/response structures
- `common/interfaces/` — TypeScript interfaces
- `common/types/` — Type definitions
- `common/constants/` — Global constants (enums, numbers, strings)

**Shared Modules (libs/)**

- Reusable NestJS modules available across apps
- Centralized configuration management
- Common validators, transformers

### 3. Infrastructure Layer

#### Authentication & Authorization (src/guards/, src/auth/)

- **JwtAuthGuard** — JWT token validation
- **RolesGuard** — Role-based access control
- **ApiPublic** decorator — Mark endpoints as public
- **ApiAuth** decorator — Mark endpoints as admin-only

#### Database (src/database/)

- **Entities** — TypeORM entity definitions per module
- **Migrations** — Auto-generated via TypeORM CLI
- **Seeds** — Sample data seeding with Faker
- **Data Source** — TypeORM configuration

#### Email Service (src/mail/)

- **MailerService** — Nodemailer + NestJS Mailer wrapper
- **Templates** — Handlebars email templates
- HTML emails for: sign-up, reset password, order confirmation, etc.

#### Caching (src/shared/cache/)

- **CacheManager** — Redis integration via cache-manager
- TTL-based expiration strategy
- Key-value storage for frequently accessed data

#### Background Jobs (src/background/)

- **BullMQ** — Queue processor for async tasks
- Email delivery, bulk operations, async reporting
- Configurable retries and failure handling

#### Global Error Handling (src/exceptions/, src/filters/)

- **Custom Exceptions** — Domain-specific error classes
- **ExceptionFilter** — Unified error response formatting
- Consistent HTTP status codes and error messages

#### Logging & Monitoring (src/interceptors/)

- **Pino** logger integration
- Request/response logging via nestjs-pino
- Performance metrics capture

### 4. Configuration Layer (src/config/)

Environment-driven configuration using `@nestjs/config`:

- Database connection settings (host, port, credentials, SSL)
- JWT secrets and token expiration
- Email SMTP settings
- Cloudinary credentials
- CORS origins
- API prefix and port

All values from `.env` file with validation.

---

## Admin Panel Architecture (apps/admin)

**Framework:** Next.js 16 App Router + React 19 + Tailwind CSS v4 + Radix UI

### Pages & Routes

- `/login` — Admin authentication (form → Server Action → /api/auth/login)
- `/(dashboard)/` — Dashboard home (stats cards, revenue chart, recent orders)
- `/(dashboard)/products` — Products CRUD (list, create, edit)
- `/(dashboard)/articles` — Articles CRUD (list, create, edit)
- `/(dashboard)/orders` — Orders list & detail (status updates)
- `/(dashboard)/media` — Media manager (Cloudinary upload, folder nav, URL picker)

### Data Access Patterns

**Server-side (Server Components):**

- `lib/admin-api-client.ts` — Server fetch wrapper that includes auth token from cookies
- `lib/admin-data.ts` — Data fetching utilities for dashboards/lists
- Uses `revalidatePath()` after mutations to sync cached component state

**Client-side (Client Components):**

- `lib/http-client.ts` — Axios instance configured for client-side requests
- React Query hooks in `features/` (media, orders)
- `useQuery()` for fetching, `useMutation()` for mutations
- Query keys follow pattern: `[resource, filters]`

### API Proxy Routes (apps/admin/src/app/api/)

Maps admin requests to backend NestJS API:

- `POST /api/auth/login` — Admin login
- `GET /api/auth/refresh` — Token refresh
- `POST /api/auth/logout` — Session logout
- `GET /api/users/me` — Current admin info
- `GET /api/media` — List media with filters
- `POST /api/media/upload` — Cloudinary file upload
- `DELETE /api/media/:id` — Delete media
- `PATCH /api/orders/:id/status` — Update order status
- `GET/POST/PUT/DELETE /api/products/*` — Product CRUD proxies
- `PUT /api/products/:productId/variants/:variantId` — Update product variant (admin, e.g. `skuCode`)
- `GET/POST/PUT/DELETE /api/articles/*` — Article CRUD proxies

### Authentication Pattern

- Cookie: `long-nhan-hy-admin-auth-token-data`
- Protected routes check auth in layout-level Server Components
- Token refresh interceptor: auto-refresh 60 seconds before expiry
- Logout clears cookie + redirects to /login

### State Management

- **Global Context:** AuthProvider for user & auth state
- **Query Cache:** React Query (stale 30s for lists, mutation invalidation)
- **UI Toast:** Radix UI toast notifications for success/error feedback

---

## Storefront architecture (`apps/web`)

**Framework:** Next.js App Router + React + Tailwind (see `package.json` for pinned versions).

### Routes (representative)

| Area                | Location                                                        | Notes                                                                                                |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Marketing home      | `src/app/page.tsx`                                              | Landing sections composed from `components/home` / `components/landing`                              |
| Products            | `src/app/products/page.tsx`, `src/app/products/[slug]/page.tsx` | Listing + PDP; listing participates in URL-driven search/filter via shared parsers                   |
| Articles            | `src/app/articles/…`                                            | List + detail                                                                                        |
| Cart                | `src/app/cart/page.tsx`                                         | Shopping cart with line items, totals, CTAs (checkout / continue shopping)                           |
| Checkout            | `src/app/checkout/page.tsx`                                     | Customer form + order summary; guards empty cart; submits via `submitOrder` Server Action            |
| Order success       | `src/app/order-success/`                                        | Post-checkout confirmation; clears cart on mount                                                     |
| Service unavailable | `src/app/service-unavailable/`                                  | User-facing 503-style page; `robots: noindex`; precached by `public/sw.js` for offline / origin-down |

### URL state (search / filters)

The storefront uses **nuqs** with shared definitions in **`src/lib/product-search-params.ts`**: parsers, server loader, and serializers so Server Components and client header/search stay aligned. Details: [Frontend Code Standards](./frontend-code-standards.md).

### Client-only state (cart)

**`src/services/cart/cart-store.ts`** exposes a **Zustand** store with **`persist`** middleware targeting **`localStorage`** (key `longnhan-cart-v2`). Lines hold `variantId`, `quantity`, `unitPriceVnd`, and display snapshots (`productName`, `productSlug`, `variantLabel`, `imageUrl`); totals are derived. Cart is browser-local until checkout flows consume it.

**New Routes (Phase 4 in-progress):**

- `/cart/page.tsx` — displays cart with `CartPageContent` client wrapper; shows line items, subtotal, shipping 30k ₫, CTAs.
- `/checkout/page.tsx` — checkout form (`CheckoutCustomerForm`) + order summary (`CheckoutOrderSummary`); guards against empty cart.
- `/order-success/page.tsx` — embeds `OrderSuccessCartClearer` to clear cart on mount.

**New Components:**

- `QuantityStepper` (shared UI) — qty input with ± buttons; min 1, max optional.
- `CartLineItem` — single cart line (thumbnail, name, qty, price, remove).
- `ProductAddToCart` — PDP add-to-cart button; uses `VariantPickerSheet` for multi-variant products.
- `VariantPickerSheet` — modal/sheet for variant selection + qty.

### Client-only state (cart)

### Header & navigation

**`header-search-bar.tsx`** and **`header-cart-button.tsx`** are composed in **`header.tsx`** and reflected in **`mobile-nav.tsx`** for smaller viewports.

### Data access

Server and client code call the Nest API using **`NEXT_PUBLIC_API_URL` / `API_URL`**, defaulting in code to **`http://localhost:3001/api/v1`** (aligned with [root README](../README.md)). Swagger for the API: **`http://localhost:3001/api-docs`**.

### Static assets

Raster/WebP/PNG live under **`apps/web/public/`** and are referenced via `next/image` or CSS `url('/…')`.

### Landing page & cache strategy

The home route (`src/app/page.tsx`) combines **server-side caching (Next.js)** with a **service worker** in the browser. They address different layers: the server cache keeps API-backed HTML fresh; the SW improves resilience when the network or origin misbehaves.

#### 1. Server: Cache Components + tagged home data

Featured products on the landing page are loaded in **`getHomeProducts()`** using:

- **`'use cache'`** — result is memoized per Next.js Cache Components rules.
- **`cacheTag('home-featured-products')`** — allows targeted invalidation when product data changes (via `updateTag` / revalidation flows).
- **`cacheLife({ revalidate: 300 })`** — **300 seconds (5 minutes)** max staleness for that cached segment before Next considers it eligible for refresh.

So when users are **online**, the storefront prefers **fresh server-rendered output** on a predictable schedule, independent of the service worker.

#### 2. Browser: Service Worker (`apps/web/public/sw.js`)

Registered from **`src/components/pwa/offline-support.tsx`** in **production** (or when **`NEXT_PUBLIC_ENABLE_SW=true`** for local testing). The script version is identified by a **`VERSION`** constant (e.g. `longnhan-web-sw-v3`); **bump `VERSION` when changing SW caching behavior** so `activate` drops obsolete Cache Storage buckets.

| Layer                                                        | Strategy                                  | Purpose                                                                                                                                                                                 |
| ------------------------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HTML navigations**                                         | Network-first; cache successful responses | When online, always try the network first so **HTML matches the latest deploy**; update the **pages** cache on success. If the network fails, fall back to cached documents (e.g. `/`). |
| **`/_next/static/*`**                                        | Stale-while-revalidate                    | JS/CSS chunks (including hashed filenames) and other build output: serve cache immediately, **refresh in the background** when possible.                                                |
| **Public assets** (`*.css`, images, fonts under same origin) | Stale-while-revalidate                    | Fast repeat visits and offline-friendly shell for static files.                                                                                                                         |
| **Not intercepted**                                          | Pass-through                              | **`/api/*`**, **`/monitoring`** (Sentry tunnel), **`/_next/data/*`** — not cached by this SW so API and Next data/RSC requests stay authoritative.                                      |

**Install precache:** `/` and **`/service-unavailable`** so a minimal shell exists after the SW has installed at least once while online.

**Upstream errors:** HTTP **502 / 503 / 504** on a navigation, or a **network error**, triggers a **302 redirect to `/service-unavailable`**, which is then served from cache or the network. The route **`src/app/service-unavailable/`** is the full Next.js page; the SW also ships a tiny **inline HTML 503** fallback if no cache entry exists. Special-case: requests that are **already** for `/service-unavailable` avoid redirect loops.

**HTTP headers:** `next.config.ts` sets **`Cache-Control: no-cache, no-store, must-revalidate`** for **`/sw.js`** so browsers revalidate the worker script and pick up new `VERSION` deployments.

#### 3. Client UX

- **`OfflineSupport`** listens for **`online` / `offline`** and shows **Sonner** toasts (connection lost / back online).
- **TanStack Query** defaults in **`app-providers.tsx`** (e.g. `staleTime`) apply to client-fetched data on pages that use hooks; they are separate from the SW **HTTP** cache.

---

## Media Module Architecture

**Backend (apps/api/src/api/media/):**

- Entity: `media.entity.ts` — Cloudinary metadata, JSONB folder tracking
- Service: `media.service.ts` — Cloudinary API integration
- Controller: `media.controller.ts` — REST endpoints
- DTOs:
  - `create-media-folder.req.dto.ts` — Folder creation request
  - `media-folder.res.dto.ts` — Folder response (name, path, itemCount)
  - `media-query.req.dto.ts` — Query/filter params (folder, search, limit, offset)
  - `media.res.dto.ts` — Media response (id, url, publicId, size, mime)
- Provider: `cloudinary.provider.ts` — Cloudinary SDK wrapper

**Endpoints:**

- `POST /media/upload` — Upload file to Cloudinary
- `GET /media` — List media with folder/search filtering
- `DELETE /media/:id` — Delete file from Cloudinary & database
- `POST /media/folders` — Create folder structure
- `GET /media/folders` — List folders

**Admin UI (apps/admin/src/components/media/):**

- `MediaManager` — Folder nav, upload, list display
- `MediaUrlPicker` — Modal to select/insert media URLs into forms
- `useMediaHooks()` — React Query hooks for fetch/upload/delete

---

## Data Flow & Key Interactions

### Request Flow (Example: Create Product)

```
HTTP Request (POST /api/v1/products)
  ↓
[CORS & Helmet Security Headers]
  ↓
[Auth Guard - Validate JWT]
  ↓
[Roles Guard - Check admin role]
  ↓
ProductsController.create(createProductDto)
  ↓
ProductsService.create() - Business logic
  ↓
TypeORM Repository.save(productEntity)
  ↓
[Database Transaction]
  ↓
[Cache invalidation on success]
  ↓
HTTP Response (201 Created + Product)
```

### Background Job Flow (Example: Send Email)

```
EmailService.sendEmail(dto)
  ↓
EmailQueue.add(job)
  ↓
[BullMQ processor picks up job]
  ↓
MailerService.sendMail(template, recipients)
  ↓
Nodemailer/SMTP delivery
  ↓
[Log delivery status]
  ↓
[Mark job complete or retry]
```

### Authentication Flow

```
POST /api/v1/auth/sign-in { email, password }
  ↓
AuthService.validateUser(email, password)
  ↓
[Argon2 hash comparison]
  ↓
JwtService.sign(payload) → Access Token
JwtService.sign(payload, refreshSecret) → Refresh Token
  ↓
Response: { token, refreshToken, user }
```

---

## Docker Architecture

### Production Stack (docker-compose.yml)

```yaml
Services:
  ├── db (PostgreSQL 13)
  │   └── Host port: 5435 (container 5432)
  │   └── Volume: postgres_data
  ├── redis
  │   └── Host port: 6380 (container 6379)
  │   └── Volume: redis_data
  ├── maildev (SMTP + Web UI)
  │   ├── SMTP Port: 1025
  │   └── Web UI: http://localhost:1080
  ├── pgadmin (PostgreSQL GUI)
  │   └── Port: 5050
  │   └── Volume: pgadmin_data
  └── longnhan-network (shared bridge)
```

**Use Cases**

- Local development without API container
- Staging testing with full stack
- Production infrastructure reference

### Local Development Stack (docker-compose.local.yml)

Extends production setup + adds:

```yaml
Services:
  ├── [all from production]
  └── api (NestJS API)
      ├── Port: 3000
      ├── Watch mode enabled (hot-reload)
      └── Volume: src/ (code mounting)
```

**Launch**

```bash
docker compose -f docker-compose.local.yml up --build -d
# API available at http://localhost:3000
# MailDev at http://localhost:1080
```

---

## Module Dependencies

### Core Module Graph

```
AppModule (root)
  ├── ConfigModule (global)
  ├── DatabaseModule
  │   └── TypeOrmModule
  ├── CacheModule
  │   └── Redis via cache-manager-ioredis-yet
  ├── MailModule
  │   └── MailerModule
  ├── QueueModule
  │   └── BullModule (BullMQ)
  │
  └── Feature Modules
      ├── AuthModule
      │   ├── JwtModule
      │   ├── UserModule
      │   └── MailModule (injected)
      ├── ProductsModule
      │   ├── DatabaseModule
      │   └── CacheModule
      ├── OrdersModule
      │   ├── DatabaseModule
      │   ├── QueueModule
      │   └── MailModule
      ├── ArticlesModule
      ├── MediaModule
      │   └── Cloudinary SDK
      ├── DashboardModule
      │   └── DatabaseModule
      └── HealthModule
```

---

## Entity Relationships (Database)

```
User (1) ──── (many) Session
  ↓ (auth)
  └──── (many) Order

Product (1) ──── (many) ProductVariant
  ↓ (catalog)
  └──── (many) OrderItem (via Order)

Order (1) ──── (many) OrderItem
  ↓
  └──── (1) User

Article (1) ──── (many) Media (has thumbnail)

Media (Cloudinary references)
  └── Stored in: cloudinary_public_id, cloudinary_secure_url
```

---

## API Endpoints Structure

Local base URL (per [root README](../README.md)): `http://localhost:3001/api/v1` · Swagger: `http://localhost:3001/api-docs`

| Module        | Endpoints                                                                                                                                                                                                                                               | Auth             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Auth**      | `POST /auth/sign-up`, `POST /auth/sign-in`, `POST /auth/refresh`, `POST /auth/forgot-password`                                                                                                                                                          | Public/JWT       |
| **Users**     | `GET /users/:id`, `PUT /users/:id`, `GET /users` (admin)                                                                                                                                                                                                | JWT              |
| **Products**  | `GET /products`, `GET /products/admin` (admin), `GET /products/:slug`, `GET /products/admin/:id` (admin), `POST /products` (admin), `PUT /products/:id` (admin), `PUT /products/:productId/variants/:variantId` (admin), `DELETE /products/:id` (admin) | Public/Admin     |
| **Orders**    | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` (admin)                                                                                                                                                                    | Public/JWT/Admin |
| **Articles**  | `GET /articles`, `GET /articles/admin` (admin), `GET /articles/:slug`, `GET /articles/admin/:id` (admin), `POST /articles` (admin), `PUT /articles/:id` (admin), `DELETE /articles/:id` (admin)                                                         | Public/Admin     |
| **Media**     | `POST /media/upload` (admin), `GET /media` (admin), `DELETE /media/:id` (admin)                                                                                                                                                                         | Admin            |
| **Dashboard** | `GET /dashboard/stats?period=today\|week\|month\|all`                                                                                                                                                                                                   | Admin            |
| **Health**    | `GET /health`                                                                                                                                                                                                                                           | Public           |

---

## Security Architecture

### Authentication

- **Method:** JWT (JSON Web Tokens)
- **Secret Storage:** Environment variables (`AUTH_JWT_SECRET`)
- **Token Lifetime:** Configurable (default 1 day)
- **Refresh Tokens:** Separate secret, longer lifetime (default 365 days)

### Authorization

- **Model:** RBAC (Role-Based Access Control)
- **Roles:** admin, user
- **Assignment:** Database column (manual for now)
- **Enforcement:** Guards on controller methods

### Password Security

- **Hash Algorithm:** Argon2 (current best practice)
- **Storage:** Hashed only in database
- **Comparison:** Timing-safe via argon2 package

### CORS

- **Config:** `APP_CORS_ORIGIN` environment variable
- **Methods:** GET, HEAD, PUT, PATCH, POST, DELETE
- **Credentials:** Allowed when same-origin
- **Wildcard:** Disabled in production

### Helmet

- Sets security headers: X-Frame-Options, X-XSS-Protection, CSP, etc.
- Enabled by default in main.ts

---

## Performance Considerations

### Caching Strategy

- **Products/Articles:** Cache with TTL, invalidate on create/update
- **User data:** Cache profile, invalidate on change
- **Dashboard stats:** Cache per period, refresh daily

### Database Optimization

- **Indexing:** Add indexes on: user_id, product_id, slug, created_at
- **Query optimization:** Use select() to limit fields
- **Pagination:** Always use limit/offset or cursor for large datasets
- **Lazy loading:** Avoid N+1 queries with eager loading

### Async Processing

- **Email:** Queue via BullMQ, process in background
- **Bulk operations:** Use queue for large data processing
- **File operations:** Upload to Cloudinary asynchronously

---

## Deployment Architecture

### Environment Promotion Path

```
Local Development
  ↓
Staging (docker-compose)
  ↓
Production (kubernetes/managed container)
```

### Production Checklist

- [ ] ENV vars set (no .env file in production)
- [ ] Database backups configured
- [ ] Redis persistence enabled
- [ ] SSL certificates installed
- [ ] Cloudinary credentials validated
- [ ] Email SMTP credentials verified
- [ ] API rate limiting configured
- [ ] Monitoring/alerting setup
- [ ] Health check endpoints verified
- [ ] CI/CD pipeline passing

---

## Development Workflow

### Local Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Start infrastructure (db, redis, mail, pgadmin)
docker compose -f docker-compose.local.yml up --build -d

# Run API in watch mode
pnpm dev
```

### Code Quality Gates

- **Linting:** ESLint (via `pnpm lint`)
- **Formatting:** Prettier (via `pnpm format`)
- **Type checking:** TypeScript (via `pnpm type-check`)
- **Testing:** Jest (via `pnpm test`)
- **Pre-commit:** Husky + lint-staged (automatic)

### Database Workflow

```bash
# Generate migration from entities
pnpm migration:generate src/database/migrations/MyMigration

# Run pending migrations
pnpm migration:up

# Revert last migration
pnpm migration:down

# Seed sample data
pnpm seed:run
```

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless API** — JWT tokens, no session storage
- **External cache** — Redis for shared state
- **Queue-based** — BullMQ with Redis backend supports distributed processing
- **CDN** — Cloudinary handles media distribution

### Vertical Scaling

- **Database** — Connection pooling, query optimization
- **Caching** — Strategic TTL to reduce DB load
- **Monitoring** — Identify bottlenecks via Pino logs

### Future Improvements

- Add API rate limiting (express-rate-limit)
- Implement request/response compression
- Add GraphQL layer (alternative to REST)
- Migrate to microservices if needed
- Add message broker (RabbitMQ) for complex workflows

---

## Technology Decisions

| Decision   | Rationale                                                              |
| ---------- | ---------------------------------------------------------------------- |
| NestJS     | Enterprise-grade framework, strong typing, modular architecture        |
| TypeScript | Type safety, better IDE support, self-documenting code                 |
| PostgreSQL | Mature RDBMS, ACID compliance, JSON support, great TypeORM support     |
| TypeORM    | Declarative entities, migration management, works with PostgreSQL well |
| JWT        | Stateless auth, scalable, industry standard                            |
| Argon2     | Cryptographically secure, resistant to GPU/ASIC attacks                |
| BullMQ     | Redis-backed queues, reliable job processing, good DX                  |
| Cloudinary | Handled media CDN, image optimization, secure uploads                  |
| pnpm       | Faster than npm, disk-efficient, monorepo-friendly                     |
| Turborepo  | Fast builds, task caching, monorepo orchestration                      |

---

## Glossary

- **DTO** — Data Transfer Object (request/response schema)
- **Entity** — TypeORM database model
- **Repository** — TypeORM data access layer
- **Service** — Business logic layer
- **Controller** — HTTP endpoint handler
- **Guard** — Middleware for auth/authorization
- **Interceptor** — Middleware for request/response transformation
- **Filter** — Exception handler
- **Decorator** — Function annotation (e.g., @Post, @UseGuards)
