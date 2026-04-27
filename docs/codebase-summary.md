# Codebase Summary

**Generated:** 2026-04-18  
**Project:** Long Nhan Hung Yen — e-commerce monorepo (API + storefront + admin)  
**Phase status:** [Project Roadmap](./project-roadmap.md) (canonical). Storefront Phase 4 and **deployment Phase 7 (go-live 2026-04-18)** are complete; ongoing work is Phases **5–6** polish and post-launch operations.

---

## Quick Facts

| Metric              | Value                                                       |
| ------------------- | ----------------------------------------------------------- |
| **Type**            | pnpm + Turborepo (NestJS API + Next.js web + Next.js admin) |
| **Language**        | TypeScript 5.6+                                             |
| **Database**        | PostgreSQL 13+                                              |
| **Package Manager** | pnpm 10.32.1                                                |
| **Node Version**    | >= 20.10.0                                                  |
| **Entry Point**     | `apps/api/src/main.ts`                                      |
| **Build Output**    | `apps/api/dist/`                                            |

---

## Directory Tree (High-Level)

```
longnhantongtran/
├── .claude/                          # Code orchestration (skills, hooks)
├── .github/workflows/                # CI/CD pipelines (GitHub Actions)
├── apps/
│   ├── api/                          # Main NestJS application
│   │   ├── src/
│   │   │   ├── api/                 # Feature modules (12 modules in ApiModule)
│   │   │   ├── background/          # Background jobs (email queue, etc.)
│   │   │   ├── common/              # Shared DTOs, interfaces, types
│   │   │   ├── config/              # Application configuration
│   │   │   ├── constants/           # Global constants & enums
│   │   │   ├── database/            # ORM setup, entities, migrations, seeds
│   │   │   ├── decorators/          # Global decorators
│   │   │   ├── exceptions/          # Custom exception classes
│   │   │   ├── filters/             # HTTP exception filters
│   │   │   ├── generated/           # Auto-generated files (i18n)
│   │   │   ├── guards/              # Auth guards (JWT, Roles)
│   │   │   ├── i18n/                # Language translation files (JSON)
│   │   │   ├── interceptors/        # Request/response interceptors
│   │   │   ├── libs/                # Shared NestJS modules
│   │   │   ├── mail/                # Email service & templates
│   │   │   ├── shared/              # Singleton services
│   │   │   ├── utils/               # Utility functions
│   │   │   ├── app.module.ts        # Root module
│   │   │   └── main.ts              # Application bootstrap
│   │   ├── test/                    # E2E tests
│   │   ├── docs/                    # API documentation (README, guides)
│   │   ├── Dockerfile               # Production image
│   │   ├── jest.config.json         # Jest configuration
│   │   ├── tsconfig.json            # TypeScript config
│   │   ├── nest-cli.json            # NestJS CLI config
│   │   └── package.json
│   ├── admin/                        # Next.js admin panel (App Router)
│   │   ├── src/
│   │   │   ├── app/                 # Next.js App Router pages
│   │   │   │   ├── login/           # Admin login page
│   │   │   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   │   │   ├── page.tsx     # Dashboard home
│   │   │   │   │   ├── products/    # CRUD: products list/create/edit
│   │   │   │   │   ├── categories/  # CRUD: categories list/create/edit
│   │   │   │   │   ├── articles/    # CRUD: articles list/create/edit
│   │   │   │   │   ├── orders/      # Orders list & detail page
│   │   │   │   │   ├── reviews/     # Admin review list & status updates
│   │   │   │   │   └── media/       # Media upload & management
│   │   │   │   ├── api/             # API routes (proxies to backend)
│   │   │   │   ├── layout.tsx       # Root layout
│   │   │   │   └── page.tsx         # Redirect to /login
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── layout/          # Header, sidebar, user menu
│   │   │   │   ├── dashboard/       # Dashboard widgets (stats, charts, tables)
│   │   │   │   ├── products/        # Product form, table, URL picker
│   │   │   │   ├── articles/        # Article form, editor, table
│   │   │   │   ├── orders/          # Order table, status panel, detail
│   │   │   │   ├── media/           # Media manager, upload, picker
│   │   │   │   ├── providers/       # React Query, Auth providers
│   │   │   │   └── ui/              # shadcn/ui-style primitives (Radix + Tailwind)
│   │   │   ├── features/            # Feature-specific logic
│   │   │   │   ├── media/           # Media hooks, API calls
│   │   │   │   └── orders/          # Order hooks, mutations
│   │   │   ├── services/            # Service layer
│   │   │   │   ├── auth/            # Auth service, token handling
│   │   │   │   └── api/             # API client wrappers
│   │   │   ├── lib/                 # Utility functions
│   │   │   │   ├── admin-api-client.ts    # Fetch wrapper for server-side API calls
│   │   │   │   ├── admin-api-proxy.ts     # Route handler helpers to proxy requests
│   │   │   │   ├── admin-data.ts          # Data fetching utilities for Server Components
│   │   │   │   ├── admin-form-parsers.ts  # Form data parsing helpers
│   │   │   │   ├── auth.ts                # Auth utilities
│   │   │   │   ├── auth-token.ts          # Cookie token management
│   │   │   │   ├── http-client.ts         # Axios instance for client-side calls
│   │   │   │   ├── media.ts               # Media upload & processing
│   │   │   │   └── utils.ts               # General helpers (cn, format, etc.)
│   │   │   ├── app.tsx              # Root component
│   │   │   └── globals.css           # Global styles
│   │   ├── public/                  # Static assets
│   │   └── package.json
│   └── web/                          # Next.js storefront (@longnhan/web)
│       ├── public/                   # Static assets (images, decorative art)
│       ├── src/
│       │   ├── app/                  # App Router (/, /products, /articles, /cart, /checkout, …)
│       │   ├── components/           # UI (~76 .tsx under components/; excludes app/)
│       │   ├── data/                 # Marketing copy (e.g. landing-page-content.ts)
│       │   ├── hooks/                # Shared hooks
│       │   ├── lib/                  # API clients, SEO, nuqs product search, format helpers
│       │   ├── services/             # auth/, cart/ (Zustand guest cart)
│       │   └── actions/              # Server Actions (e.g. orders)
│       └── package.json
├── packages/
│   └── types/                        # Shared @longnhan/types package
│       ├── src/
│       │   ├── api/
│       │   ├── common/
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── docs/
│   ├── README.md
│   ├── project-overview-pdr.md
│   ├── project-roadmap.md
│   ├── project-changelog.md
│   ├── system-architecture.md
│   ├── code-standards.md
│   ├── frontend-code-standards.md
│   ├── codebase-summary.md
│   └── deployment-guide.md
├── docker-compose.yml                # Production services (db, redis, mail, pgadmin)
├── docker-compose.local.yml          # Local dev stack (with API container)
├── pnpm-workspace.yaml               # Workspace configuration
├── turbo.json                        # Turborepo build config
├── tsconfig.json                     # Root TypeScript config
├── eslint.config.mjs                 # ESLint rules
├── .prettierrc                       # Prettier formatting
├── jest.config.json                  # Jest test config
├── commitlint.config.mjs             # Commit message linting
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore patterns
├── CLAUDE.md                         # AI development instructions
├── DESIGN.md                         # Visual design spec (admin + shared reference)
├── README.md                         # Project root README
└── pnpm-lock.yaml                    # Dependency lock file
```

---

## Module Structure

### 1. Feature Modules (src/api/)

**Registered in `ApiModule` (12 domain modules + `ThrottlerModule`):** User, Health, Auth, Home, Post, Products, Categories, Reviews, Orders, Articles, Media, Dashboard.

#### UserModule

- **Purpose:** User management, profiles
- **Key Files:**
  - `entities/user.entity.ts` — User database model
  - `user.service.ts` — User CRUD logic
  - `user.controller.ts` — User endpoints
  - `dto/create-user.dto.ts`, `update-user.dto.ts`

#### AuthModule

- **Purpose:** Authentication, JWT tokens, password management
- **Key Files:**
  - `auth.service.ts` — Sign-in, sign-up, token refresh
  - `auth.controller.ts` — Auth endpoints
  - `guards/jwt-auth.guard.ts` — JWT token validation
  - `guards/roles.guard.ts` — Role-based access control
  - `strategies/jwt.strategy.ts` — Passport JWT strategy

#### HealthModule

- **Purpose:** Application health checks
- **Endpoints:** `GET /health`
- **Key Files:**
  - `health.controller.ts`

#### ProductsModule

- **Purpose:** E-commerce product catalog
- **Key Files:**
  - `entities/product.entity.ts` — Product model
  - `entities/product-variant.entity.ts` — Product variants (OneToMany)
  - `product.service.ts` — CRUD, search, filtering
  - `products.controller.ts` — Endpoints
  - `dto/create-product.dto.ts`, `update-product.dto.ts`
- **Endpoints:**
  - `GET /products` — List with pagination
  - `GET /products/admin` — List products for admin
  - `GET /products/:slug` — Get by slug
  - `GET /products/admin/:id` — Get product by id for admin
  - `POST /products` — Create (admin)
  - `PUT /products/:id` — Update (admin)
  - `PUT /products/:productId/variants/:variantId` — Update variant fields (admin; e.g. `skuCode`)
  - `DELETE /products/:id` — Delete (admin)

#### OrdersModule

- **Purpose:** Order management
- **Key Files:**
  - `entities/order.entity.ts` — Order model
  - `entities/order-item.entity.ts` — Order line items (OneToMany)
  - `orders.service.ts` — Order logic
  - `orders.controller.ts` — Endpoints
  - `dto/create-order.dto.ts`, `update-order-status.dto.ts`
- **Endpoints:**
  - `POST /orders` — Create order
  - `GET /orders` — User's orders
  - `GET /orders/:id` — Order details
  - `PATCH /orders/:id/status` — Update status (admin)

#### ArticlesModule

- **Purpose:** Blog/content articles
- **Key Files:**
  - `entities/article.entity.ts` — Article model
  - `articles.service.ts` — CRUD
  - `articles.controller.ts` — Endpoints
  - `dto/create-article.dto.ts`, `update-article.dto.ts`
- **Endpoints:**
  - `GET /articles` — List articles
  - `GET /articles/admin` — List articles for admin
  - `GET /articles/:slug` — Get by slug
  - `GET /articles/admin/:id` — Get article by id for admin
  - `POST /articles` — Create (admin)
  - `PUT /articles/:id` — Update (admin)
  - `DELETE /articles/:id` — Delete (admin)

#### MediaModule

- **Purpose:** File uploads, media management, Cloudinary integration
- **Key Files:**
  - `entities/media.entity.ts` — Media metadata
  - `media.service.ts` — Cloudinary integration, folder management
  - `media.controller.ts` — Upload & folder endpoints
  - `providers/cloudinary.provider.ts` — Cloudinary upload logic
  - `dto/create-media-folder.req.dto.ts` — Create folder request
  - `dto/media-folder.res.dto.ts` — Folder response
  - `dto/media-query.req.dto.ts` — Query/filter params
  - `dto/media.res.dto.ts` — Media response
- **Endpoints:**
  - `POST /media/upload` — Upload file (admin)
  - `GET /media` — List uploads with filters (admin)
  - `DELETE /media/:id` — Delete file (admin)
  - `POST /media/folders` — Create folder (admin)
  - `GET /media/folders` — List folders (admin)

#### DashboardModule

- **Purpose:** Admin analytics & statistics
- **Key Files:**
  - `dashboard.service.ts` — Stats calculation
  - `dashboard.controller.ts` — Stats endpoints
- **Endpoints:**
  - `GET /dashboard/stats?period=today|week|month|all` — Statistics (admin)

#### HomeModule

- **Purpose:** Minimal public root controller (API welcome)
- **Endpoints:** `GET /` — Plain-text welcome (see `home.controller.ts`)

#### PostModule

- **Purpose:** Posts resource (admin-auth CRUD + pagination; see `post.controller.ts` / `post.service.ts`)

#### CategoriesModule

- **Purpose:** Product categories (public list + admin CRUD, soft delete)
- **Key Files:** `categories.service.ts`, `categories.controller.ts`, DTOs under `dto/`
- **Endpoints:**
  - `GET /categories` — Active categories (public)
  - `GET /categories/admin` — All categories (admin)
  - `POST /categories` — Create (admin)
  - `PUT /categories/:id` — Update (admin)
  - `DELETE /categories/:id` — Deactivate (admin)

#### ReviewsModule

- **Purpose:** Product reviews (verified purchase create path, public listing, admin moderation)
- **Key Files:** `reviews.service.ts`, `reviews.controller.ts`, `entities/product-review.entity.ts`
- **Endpoints:**
  - `POST /products/:productId/reviews` — Create review (public; business rules in service)
  - `GET /products/:productId/reviews` — Published reviews + aggregate (public)
  - `GET /reviews/admin` — List for moderation (admin)
  - `PATCH /reviews/admin/:id` — Update review status (admin)

### 2. Background Jobs (src/background/)

**Email Queue Processing**

- **Files:**
  - `queues/email-queue/` — BullMQ email queue
  - `queues/email-queue/email-queue.events.ts` — Job definitions
- **Purpose:** Async email delivery via background jobs
- **Technology:** BullMQ + Redis

### 3. Shared Modules (src/libs/)

Reusable NestJS modules:

- Configuration management
- Common decorators
- Shared services
- Constants and types

### 4. Common Layer (src/common/)

**DTOs** (`common/dto/`)

- `pagination.dto.ts` — Pagination parameters
- `api-response.dto.ts` — API response wrapper
- `error-response.dto.ts` — Error response format

**Interfaces** (`common/interfaces/`)

- `paginated-response.interface.ts` — Paginated data structure
- `user-payload.interface.ts` — JWT payload shape

**Types** (`common/types/`)

- `pagination.type.ts` — Pagination types
- `user-role.type.ts` — Role enums

**Constants** (`common/constants/`)

- `api-messages.const.ts` — Message strings
- `user-roles.const.ts` — Role definitions
- `http-status.const.ts` — HTTP status mappings

### 5. Infrastructure (src/)

#### Database (`src/database/`)

- **config/** — TypeORM configuration
- **entities/** — ORM entity definitions
- **migrations/** — Database schema changes (auto-generated)
- **seeds/** — Sample data seeding
- **data-source.ts** — TypeORM DataSource config

#### Configuration (`src/config/`)

- Environment variable schemas
- Config services for: app, database, auth, email, etc.

#### Authentication (`src/guards/`, `src/decorators/`)

- **Guards:**
  - `jwt-auth.guard.ts` — Token validation
  - `roles.guard.ts` — Role checking
- **Decorators:**
  - `@ApiPublic()` — Mark endpoint as public
  - `@Roles('admin')` — Restrict to role
  - `@ApiAuth()` — Require authentication

### 6. Admin App (apps/admin/src/)

**Purpose:** Next.js 16 admin dashboard with CRUD for products, **categories**, articles, orders, **product reviews (moderation)**, and media.

**Design & UI:** Follow root **[DESIGN.md](../DESIGN.md)** for visual language. Build surfaces with **shadcn/ui** patterns under `components/ui/` (Radix + Tailwind); see [Frontend code standards](./frontend-code-standards.md) and **`apps/admin/AGENTS.md`**.

**Key Pages:**

- `/login` — Admin authentication
- `/(dashboard)/` — Dashboard home with stats cards, revenue charts, recent orders
- `/(dashboard)/products` — Products list/create/edit with TiptapHtmlEditor for descriptions
- `/(dashboard)/categories` — Categories list/create/edit (ordered catalog taxonomy)
- `/(dashboard)/articles` — Articles list/create/edit with rich text editor
- `/(dashboard)/orders` — Orders list with status filter; detail page with status panel
- `/(dashboard)/reviews` — Reviews list (client table) and status updates via admin API
- `/(dashboard)/media` — Media manager with Cloudinary upload, folder navigation, URL picker

**Architecture:**

- **Server-side fetching:** `lib/admin-api-client.ts` (`adminFetch`) for Server Components
- **Client-side queries:** `lib/http-client.ts` (Axios instance) + React Query hooks in `features/`
- **API proxies:** `/app/api/*` route handlers forward to backend + validate auth
- **State:** AuthProvider (context), React Query (stale 30s), Radix UI toast notifications
- **Forms:** react-hook-form + yup validation, Server Actions for login/mutations
- **Cache:** `revalidatePath()` after mutations to sync Server Component state

**Dashboard data layer:**

- **`lib/dashboard/dashboard-types.ts`** — Type definitions for dashboard stats
  - `DashboardPeriod` — Period selector type (`'today' | 'week' | 'month' | 'all'`)
  - `DashboardStats` — Mirrors API `DashboardStatsResDto` (orders, revenue, daily breakdown)
  - `DailyStatPoint` — Daily aggregation (date, count, revenue)
  - `parsePeriod()` — Safe period parser with default fallback
  - `PERIOD_LABELS` — Localized period display strings (Vietnamese)

**Dashboard UI components:**

- **`components/ui/empty-state.tsx`** — Shared empty state primitive (icon, title, description, action)
- **`components/ui/inline-error-state.tsx`** — Shared error state primitive (error message display)
- **`components/dashboard/period-switcher.tsx`** — Client component for URL-based period switching
- **`components/dashboard/dashboard-error-state.tsx`** — Dashboard-level error card wrapper

**Key libraries (admin):**

- **shadcn/ui-style `components/ui/`** — Radix primitives (`@radix-ui/*`) composed with Tailwind; extend via shadcn registry CLI from `apps/admin`
- `recharts` — Revenue & stats charts
- `react-hook-form` + `yup` — Form validation
- `axios` — HTTP client
- `@tanstack/react-query` — Data fetching & caching
- `motion` — Micro-interactions
- `tailwind-css@v4` — Styling

**Authentication pattern:**

- Cookie: `long-nhan-hy-admin-auth-token-data`
- Protected routes check layout-level auth
- Token refresh via proxy route: `GET /api/auth/refresh`
- Logout via proxy route: `POST /api/auth/logout`

**API proxy routes (`apps/admin/src/app/api/`):**

- `POST /api/auth/login` — Admin login (Server Action wrapper)
- `GET /api/auth/refresh` — Refresh token via cookie
- `POST /api/auth/logout` — Clear session
- `GET /api/users/me` — Current admin info
- `GET /api/media` — List media (delegated to backend)
- `POST /api/media/upload` — Cloudinary upload
- `DELETE /api/media/:id` — Delete media
- `PATCH /api/orders/:id/status` — Update order status
- `GET /api/reviews/admin`, `PATCH /api/reviews/admin/[id]` — Review moderation proxies
- `GET/POST /api/categories`, `GET /api/categories/admin`, `GET/PATCH/DELETE /api/categories/[id]` — Category proxies
- Plus standard CRUD proxies for products, articles, orders

### 6b. Storefront App (`apps/web/src/`)

**Routes (`app/`):** marketing home, product listing + `[slug]` PDP, articles, **cart**, **checkout**, order success, **track-order**, **service-unavailable**.

**Layout & navigation (`components/layout/`):** `header.tsx`, `header-search-bar.tsx`, `header-cart-button.tsx`, `mobile-nav.tsx`, `footer.tsx`, `floating-contact-widget.tsx`.

**Catalog & content:** `components/products/*`, `components/home/*`, `components/landing/*`, `components/articles/*`, `components/orders/*`, `components/cart/*`, `components/checkout/*` (cart/checkout flows, order form / QR UI).

**Client state:** `services/cart/cart-store.ts` — Zustand + `persist` (`longnhan-cart-v2`). **URL state:** `lib/product-search-params.ts` — nuqs parsers shared with server loaders.

**API/data:** `lib/api-client.ts`, `lib/api-server.ts`, `lib/http/create-longnhan-api.ts`, TanStack Query usage; default public API base `http://localhost:3001/api/v1` via env (see `NEXT_PUBLIC_API_URL`).

**Assets:** `apps/web/public/` — raster/WebP/PNG used by layout and landing (not under `src/`). **`public/sw.js`** — service worker (offline shell, asset caching, `/service-unavailable` routing on 502/503/504 or network failure).

**Landing / home caching:** `app/page.tsx` uses **`'use cache'`** with **`cacheTag('home-featured-products')`** and **`cacheLife({ revalidate: 300 })`** for featured products. Browser caching and offline behavior are documented under **Storefront → Landing page & cache strategy** in [System Architecture](./system-architecture.md).

**Key libraries (storefront):** `next`, `react`, `@tanstack/react-query`, `nuqs`, `zustand`, `axios`, `motion`, `react-hook-form`, `yup`, `@longnhan/types`, `sonner` (offline / connection toasts with the SW).

### 7. Shared Types Package (@longnhan/types)

**Purpose:** TypeScript types shared across all apps.

**Structure:**

- `src/api/` — API request/response DTOs
- `src/common/` — Shared interfaces, enums, constants
- `src/index.ts` — Public export barrel

**Usage:**

- `apps/api` — Entity validation & API response types
- `apps/web` — Form inputs, API calls, UI state
- `apps/admin` — Admin forms, API proxies, mutations

#### Email Service (`src/mail/`)

- **mail.service.ts** — Nodemailer wrapper
- **templates/** — Handlebars HTML templates
- Integration: NestJS Mailer + Nodemailer

#### Caching (`src/shared/cache/`)

- Redis cache manager
- TTL-based expiration
- Cache invalidation logic

#### Error Handling (`src/exceptions/`, `src/filters/`)

- **Custom Exception Classes:**
  - `NotFoundException` — Resource not found
  - `BadRequestException` — Invalid input
  - `UnauthorizedException` — Auth failure
- **Global Exception Filter:**
  - Catches all exceptions
  - Formats consistent error responses

---

## Key Files Overview

### Entry Points

| File                       | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `src/main.ts`              | Bootstrap application, Swagger setup        |
| `src/app.module.ts`        | Root NestJS module, imports all features    |
| `docker-compose.yml`       | Production infrastructure (db, redis, mail) |
| `docker-compose.local.yml` | Local dev stack with API container          |

### Configuration Files

| File                  | Purpose                        |
| --------------------- | ------------------------------ |
| `.env.example`        | Template environment variables |
| `tsconfig.json`       | TypeScript compiler options    |
| `jest.config.json`    | Jest test configuration        |
| `nest-cli.json`       | NestJS CLI config (generators) |
| `eslint.config.mjs`   | ESLint rules                   |
| `.prettierrc`         | Code formatting rules          |
| `turbo.json`          | Turborepo task configuration   |
| `pnpm-workspace.yaml` | Workspace package paths        |

### Testing

| File               | Pattern             |
| ------------------ | ------------------- |
| `src/**/*.spec.ts` | Unit tests (Jest)   |
| `test/`            | E2E tests           |
| `jest.config.json` | Test setup          |
| `setup-jest.mjs`   | Jest initialization |

---

## Data Models (TypeORM Entities)

### Core Entities

**User**

```typescript
- id (UUID, PK)
- email (unique, varchar)
- password (hashed, varchar)
- firstName, lastName
- role (enum: admin, user)
- createdAt, updatedAt
- Relations: Session[], Order[]
```

**Session**

```typescript
- id (UUID, PK)
- userId (FK → User)
- refreshToken
- expiresAt
- createdAt
```

**Product**

```typescript
- id (UUID, PK)
- name (varchar)
- slug (unique, varchar)
- description (text)
- price (decimal)
- stock (int)
- createdAt, updatedAt
- Relations: ProductVariant[], OrderItem[]
```

**ProductVariant**

```typescript
- id (UUID, PK)
- productId (FK → Product)
- name, color, size
- sku (unique)
- price (decimal, nullable)
- stock
- Relations: Product
```

**Order**

```typescript
- id (UUID, PK)
- userId (FK → User)
- status (enum: pending, processing, shipped, delivered)
- totalPrice (decimal)
- shippingAddress
- createdAt, updatedAt
- Relations: User, OrderItem[]
```

**OrderItem**

```typescript
- id (UUID, PK)
- orderId (FK → Order)
- productId (FK → Product)
- quantity
- unitPrice
- Relations: Order, Product
```

**Article**

```typescript
- id (UUID, PK)
- title (varchar)
- slug (unique, varchar)
- content (text)
- tags (TypeORM `simple-array`; stored as comma-separated text)
- thumbnailId (FK → Media, nullable)
- createdAt, updatedAt
- Relations: Media
```

**Notes**

- Tag filtering in SQL must treat `tags` as comma-separated text, e.g. `:tag = ANY(COALESCE(string_to_array(article.tags, ','), ARRAY[]::text[]))`.

**Media**

```typescript
- id (UUID, PK)
- cloudinaryPublicId (varchar)
- cloudinarySecureUrl (varchar)
- mimeType (varchar)
- fileSize (bigint)
- createdAt
- Relations: Article[]
```

---

## Dependencies (Key Packages)

### Core Framework

- `@nestjs/common` — NestJS core
- `@nestjs/core` — Core module
- `@nestjs/platform-express` — Express adapter
- `express` — Web framework

### Database & ORM

- `typeorm` — ORM library
- `@nestjs/typeorm` — NestJS TypeORM integration
- `pg` — PostgreSQL driver

### Authentication

- `@nestjs/jwt` — JWT support
- `jsonwebtoken` — Token management (via jwt)
- `argon2` — Password hashing

### Validation & Serialization

- `class-validator` — Input validation
- `class-transformer` — DTO serialization

### API Documentation

- `@nestjs/swagger` — Swagger/OpenAPI

### Email

- `@getbrevo/brevo` — Brevo transactional email SDK
- `handlebars` — Email templates

### Background Jobs

- `@nestjs/bullmq` — BullMQ integration
- `bullmq` — Job queue library
- `redis` — Queue backend

### Caching

- `@nestjs/cache-manager` — Cache service
- `cache-manager-ioredis-yet` — Redis adapter

### Media Management

- `cloudinary` — Image/video CDN
- `streamifier` — Stream utilities

### Content Processing

- `slugify` — URL slug generation

### Logging

- `nestjs-pino` — Structured logging
- `pino` — Logger library
- `pino-http` — HTTP logging
- `pino-pretty` — Pretty formatter

### Utilities

- `axios` — HTTP client
- `uuid` — UUID generation
- `ms` — Time conversion
- `helmet` — Security headers
- `compression` — Response compression

### Testing

- `jest` — Test framework
- `@nestjs/testing` — NestJS test utilities
- `supertest` — HTTP testing
- `ts-jest` — TypeScript support

---

## Scripts & Commands

### Development

```bash
pnpm dev              # Start with file watcher
pnpm start            # Run production build
pnpm start:debug      # Debug mode with watcher
```

### Building & Quality

```bash
pnpm build            # Build for production
pnpm lint             # Lint and fix
pnpm format           # Format code with Prettier
pnpm type-check       # Type checking without emit
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:watch      # Watch mode
pnpm test:cov        # Coverage report
pnpm test:e2e        # E2E tests
```

### Database

```bash
pnpm migration:up     # Run migrations
pnpm migration:down   # Revert migration
pnpm migration:show   # Show migration status
pnpm migration:generate src/database/migrations/Name
pnpm seed:run         # Run seeders
pnpm seed:create      # Create new seeder
pnpm db:create        # Create database
pnpm db:drop          # Drop database
```

### Docker

```bash
docker compose up -d                     # Production stack
docker compose -f docker-compose.local.yml up --build -d  # Local dev
docker compose logs -f api               # Watch API logs
```

---

## Environment Variables

Key variables from `.env.example`:

| Category       | Variable                    | Example                                                                   |
| -------------- | --------------------------- | ------------------------------------------------------------------------- |
| **App**        | `NODE_ENV`                  | development                                                               |
|                | `APP_PORT`                  | 3000                                                                      |
|                | `APP_DEBUG`                 | false                                                                     |
|                | `APP_CORS_ORIGIN`           | http://localhost:3000                                                     |
| **Database**   | `DATABASE_HOST`             | localhost                                                                 |
|                | `DATABASE_PORT`             | 5435 (local host; Docker service `db` still uses 5432 inside the network) |
|                | `DATABASE_NAME`             | nestjs_api                                                                |
|                | `DATABASE_USERNAME`         | postgres                                                                  |
|                | `DATABASE_PASSWORD`         | postgres                                                                  |
| **Auth**       | `AUTH_JWT_SECRET`           | secret_key                                                                |
|                | `AUTH_JWT_TOKEN_EXPIRES_IN` | 1d                                                                        |
|                | `AUTH_REFRESH_SECRET`       | refresh_key                                                               |
| **Email**      | `BREVO_API_KEY`             | Brevo transactional email API key                                         |
|                | `MAIL_DEFAULT_EMAIL`        | noreply@example.com                                                       |
|                | `MAIL_DEFAULT_NAME`         | No Reply                                                                  |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`     | (prod only)                                                               |
|                | `CLOUDINARY_API_KEY`        | (prod only)                                                               |
|                | `CLOUDINARY_API_SECRET`     | (prod only)                                                               |

---

## Docker Services

### Infrastructure (docker-compose.yml)

- **postgres** — PostgreSQL 13 on host port 5435 (maps to container 5432)
- **redis** — Redis on host port 6380 (maps to container 6379)
- **pgadmin** — PostgreSQL GUI on port 5050

### Local Dev (docker-compose.local.yml)

- All production services
- **api** — NestJS API on port 3000 (hot-reload enabled)

---

## API Response Format

### Success Response

```json
{
  "data": {},
  "statusCode": 200,
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Authentication

- **Method:** JWT (Bearer token)
- **Storage:** Authorization header
- **Format:** `Authorization: Bearer <token>`
- **Validation:** JwtAuthGuard
- **Expiry:** Configurable per environment

---

## Pagination

Two modes supported:

**Offset Pagination**

```
GET /api/v1/products?page=1&limit=20
```

**Cursor Pagination**

```
GET /api/v1/products?cursor=abc123&limit=20
```

---

## Important Patterns

### Error Handling

All endpoints use custom exceptions that are caught by global filter:

```typescript
throw new NotFoundException(`Product ${id} not found`);
```

### Dependency Injection

NestJS IoC container auto-injects services:

```typescript
constructor(
  @InjectRepository(Product) private repo: Repository<Product>,
  private service: ProductService,
) {}
```

### Database Transactions

TypeORM handles transactions in migrations and seeders.

### Validation

Class-validator decorators on DTOs automatically validate input.

---

## Performance Optimizations

- Database indexes on frequently queried columns
- Redis caching for expensive queries
- Pagination for large datasets
- BullMQ for async heavy operations
- Compression middleware for responses

---

## Security Measures

- JWT authentication for protected endpoints
- Argon2 password hashing
- CORS configuration
- Helmet security headers
- Input validation via class-validator
- Environment-based secrets (no hardcoded keys)

---

## Storefront components (Phase 4 complete; ongoing UX)

Major landing/product additions from **4.1.0** (2026-04-01); **4.2.0** (2026-04-13) adds cart flow, header search/cart, `product-search-params`, and related layout wiring — see [Project Changelog](./project-changelog.md).

### Components added (4.1.0)

**Landing Page Section Components:**

- `landing-hero.tsx` — Hero section with CTA
- `landing-story.tsx` — Brand story narrative
- `landing-product-quality.tsx` — Product quality highlights
- `landing-nutrition-season.tsx` — Seasonal nutrition info
- `landing-service-badges.tsx` — Service quality badges
- `landing-stats-bar.tsx` — Animated statistics (founded, users, orders)
- `landing-urgency-strip.tsx` — Time-sensitive messaging
- `landing-articles-preview.tsx` — Featured blog carousel
- `landing-origin-badge.tsx` — Origin & authenticity indicator
- `landing-channels.tsx` — Distribution channels
- `landing-testimonials-trust.tsx` — Customer testimonials
- `landing-faq.tsx` — FAQ accordion

**Product Experience:**

- `product-quick-view-modal.tsx` — Quick-view popup (NEW)
- `product-pdp-trust-badges.tsx` — Trust indicators (NEW)
- `product-pdp-share-buttons.tsx` — Social share buttons (NEW)
- `product-card.tsx` — Updated with discount badges, stock overlay, quick-view trigger
- `product-images.tsx` — Updated with zoom interaction
- `product-pdp-hero.tsx` — Updated: diacritics fix, tags, category display

**Navigation & Utility:**

- `hero-carousel.tsx` — Landing carousel (NEW)
- `category-nav-cards.tsx` — Category navigation grid (NEW)
- `landing-category-carousel.tsx` — Home: category menu + banner carousel (NEW)
- `landing-banner-carousel.client.tsx` — Home: banner carousel (client) (NEW)
- `featured-products.tsx` — Featured products grid (Home)
- `video-section.tsx` — Embedded product videos (Home)
- `floating-contact-widget.tsx` — Persistent contact UI (NEW)
- `back-to-top-button.tsx` — Scroll-to-top button (NEW)
- `header.tsx` — Navigation header (extended in 4.2.0 with search + cart)
- `footer.tsx` — Footer
- `mobile-nav.tsx` — Mobile navigation

**Data structures (4.1.0):**

- `LANDING_SERVICE_BADGES` — Service definitions
- `LANDING_STATS` — Statistics data
- `LANDING_CERTS` — Certification badges
- `LANDING_URGENCY` — Urgency messaging
- `LANDING_HERO_SLIDES` — Hero carousel data
- `LANDING_CATEGORIES` — Category card data
- `LANDING_BANNER_SLIDES` — Home banner carousel slides (NEW)

### Module counts (approximate)

- **`apps/web/src/components/**/\*.tsx`:\*\* **~76** files (layout, landing, products, cart, checkout, etc.); re-count after large UI changes.
- **App routes:** see `apps/web/src/app/` (includes **`cart/`**, **`checkout/`**, **`track-order/`**, **`service-unavailable/`**).

---

## Links to Detailed Docs

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Deployment Guide](./deployment-guide.md)
- [Project Roadmap](./project-roadmap.md)
- [Project Changelog](./project-changelog.md)
- [API App README](../apps/api/README.md)
