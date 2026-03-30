# Long Nhan Hung Yen E-commerce API - Project Overview

**Generated:** March 30, 2026  
**Project:** Long Nhan Hung Yen (Longan E-commerce Platform)  
**Type:** NestJS Backend API  
**Location:** `/apps/api/`

---

## 1. Project Purpose and Tech Stack

### Purpose
The Long Nhan Hung Yen is a full-featured e-commerce API backend for selling longan fruit products. It provides:
- Product catalog and management
- Order management system
- Blog articles and content management
- Media upload functionality (with Cloudinary integration)
- Admin dashboard with statistics
- User authentication and authorization
- Multi-language support (I18N)

### Core Technology Stack

**Framework & Runtime:**
- Node.js (v20.10.0+)
- NestJS 10.4.7 (Progressive Node.js framework)
- Express (underlying HTTP framework)
- TypeScript 5.6.3

**Database & ORM:**
- PostgreSQL (primary database)
- TypeORM 0.3.20 (Object-Relational Mapping)
- TypeORM Extension 3.6.3 (Seeding & migrations)

**Authentication & Security:**
- JWT (JSON Web Tokens) via @nestjs/jwt 10.2.0
- Argon2 0.41.1 (Password hashing)
- Helmet 8.0.0 (HTTP security headers)
- Role-Based Access Control (RBAC)

**File & Media Management:**
- Cloudinary (Cloud-based media storage)
- Streamifier 0.1.1 (File streaming)
- Slugify 1.6.8 (URL-friendly slugs)

**Logging & Monitoring:**
- Pino (Logging library)
- Nestjs-pino 4.1.0
- @nestjs/terminus 10.2.3 (Health checks)

**Email & Notifications:**
- Nodemailer 6.9.16
- @nestjs-modules/mailer 2.0.2
- Handlebars templating

**Background Jobs:**
- BullMQ 5.23.0 (Job queue)
- @nestjs/bullmq 10.2.2
- Redis (cache & job broker)

**API Documentation:**
- Swagger UI (@nestjs/swagger 8.0.5)
- Automatic API documentation generation

**Validation & Transformation:**
- class-validator 0.14.1
- class-transformer 0.5.1

**Testing:**
- Jest 29.7.0
- Supertest 7.0.0 (HTTP assertion library)

**Development Tools:**
- PNPM 10.32.1 (Package manager)
- ESLint 9.14.0 + TypeScript ESLint
- Prettier 3.3.3 (Code formatter)
- Husky 9.1.6 (Git hooks)
- Lint-staged 15.2.10
- Commitlint 19.5.0 (Commit message validation)

**DevOps & CI/CD:**
- Docker & Docker Compose
- GitHub Actions (CI/CD pipeline)
- Renovate (Dependency updates)

**Internationalization:**
- nestjs-i18n 10.5.0 (Multi-language support)

---

## 2. Key Documentation Content Summary

### API Documentation (`api.md`)
- **Base URL:** `/api/v1` (configurable)
- **Swagger UI:** Available at `/api-docs` in development
- **Authentication:** JWT Bearer tokens required for protected endpoints
- **Error handling:** Standardized JSON error responses with status codes
- **Pagination:** Supports both offset and cursor pagination modes
- **Key endpoints:**
  - Products: CRUD operations, public listing by slug
  - Orders: Create, retrieve, status updates
  - Articles: Blog content management
  - Media: File uploads to Cloudinary
  - Dashboard: Admin statistics (today/week/month/all periods)
  - Health: Monitoring endpoint

### Architecture (`architecture.md`)
- **Structure:**
  - `.github/workflows/` - CI/CD workflows (semantic PRs, tests, doc deployment)
  - `docs/` - VuePress documentation site
  - `src/` - Main source code
  - `test/` - E2E test suites

- **Feature Modules:**
  - `UserModule` - User authentication & profiles
  - `AuthModule` - JWT authentication & authorization
  - `HealthModule` - Health check endpoint
  - `HomeModule` - Root endpoint
  - `PostModule` - Blog posts (legacy, being replaced)
  - `ProductsModule` - E-commerce product catalog
  - `OrdersModule` - Order management
  - `ArticlesModule` - Blog articles
  - `MediaModule` - Media uploads (Cloudinary)
  - `DashboardModule` - Admin statistics

- **Infrastructure:**
  - Global decorators for auth, field validation, HTTP operations
  - Exception filters for centralized error handling
  - Guards for authentication & authorization
  - Interceptors for request/response transformation
  - Database config with TypeORM & migrations
  - Mail module with templating support
  - Shared services & utilities

### Database (`database.md`)
- **ORM:** TypeORM with auto-generated migrations
- **Migration workflow:** Modify entities → Auto-generate → Review → Apply
- **Key entities:**
  - User (authentication)
  - Session (user sessions)
  - Product + ProductVariant (OneToMany)
  - Order + OrderItem (OneToMany)
  - Article (blog content)
  - Media (file references)

- **Seeding:** TypeORM Extension with Faker for test data
- **Factory pattern:** Used for generating random data in tests
- **Commands:**
  - `pnpm migration:generate` - Auto-generate migrations
  - `pnpm migration:up/down` - Apply/revert
  - `pnpm seed:run` - Load seed data

### Setup & Development (`development.md`)
- **Prerequisites:** Node.js 20.10.0+, PNPM 9.5.0+
- **Installation:** `pnpm install`
- **Environment config:** Copy `.env.example` to `.env`
- **Database setup:** Docker Compose or manual PostgreSQL
- **Local development mail:** MailDev (included in Docker Compose)
- **Key env variables:**
  - `NODE_ENV` - Environment mode
  - `APP_PORT`, `APP_URL`, `API_PREFIX`
  - `DATABASE_*` - Database connection
  - `MAIL_*` - Email configuration
  - `AUTH_JWT_*` - JWT token secrets and expiry
  - `MODULES_SET` - monolith/api/background deployment mode

- **Development commands:**
  - `pnpm start` - Development server
  - `pnpm dev` - Watch mode
  - `pnpm build` - Production build
  - `pnpm lint` - ESLint + fix
  - `pnpm format` - Prettier format
  - `pnpm type-check` - TypeScript check

### Technologies (`technologies.md`)
Comprehensive list of 40+ libraries organized by category:
- Core: Node.js, NestJS, Express, TypeScript
- Database: TypeORM, PostgreSQL
- Auth: JWT, class-validator
- Media: Cloudinary, Streamifier, Slugify
- Logging: Pino
- Testing: Jest, Supertest
- Tools: PNPM, ESLint, Prettier, Husky, Commitlint
- DevOps: Docker, GitHub Actions, Renovate
- Docs: Markdown, VuePress

### Security (`security.md`)
- **Authentication:** JWT-based stateless authentication
- **Authorization:** Role-Based Access Control (RBAC)
- **Password hashing:** Argon2 (industry standard)
- **HTTP headers:** Helmet middleware
- **CORS:** Configurable origin restrictions (not wildcard in prod)
- **Rate limiting:** Express-rate-limit (incomplete implementation noted)
- **Key security practices:**
  - No production Swagger UI
  - Environment-based CORS configuration
  - Proper token expiration times (short for JWT, long for refresh)

### Testing (`testing.md`)
- **Framework:** Jest
- **Test types:**
  - Unit tests: `pnpm test [file]`
  - E2E tests: `pnpm test:e2e`
  - Watch mode: `pnpm test:watch`
  - Coverage: `pnpm test:cov`
- **IDE support:** Jest Runner extension for VS Code
- **Status:** Integration testing docs incomplete (TODO)

### Deployment (`deployment.md`)
- **Manual process:** Upload files, configure env, run migrations, verify
- **Steps:** Environment prep → App upload → Config → Database setup → Start → Verify → Monitor
- **Database backup:** Required before deployment
- **Rollback plan:** Keep previous version ready
- **Status:** CI/CD pipeline docs incomplete (TODO)

### Code Conventions
- **Clean Code:** TypeScript adaptation of Robert Martin's Clean Code principles
  - Meaningful variable names
  - Pronounceable identifiers
  - Functions, objects, classes best practices
  - SOLID principles
  - Error handling guidelines
  - Comment standards

- **Commit conventions:** Conventional Commits format (enforced by Commitlint)
- **Branch conventions:** Feature/bugfix/hotfix naming patterns
- **Naming cheatsheet:** Comprehensive naming guidelines
- **Linting & formatting:** ESLint + Prettier integration with Husky pre-commit hooks
- **TypeScript style guide:** Comprehensive coding conventions

---

## 3. Directory Structure

```
apps/api/
├── src/
│   ├── api/                      # Feature modules
│   │   ├── home/                 # Root endpoint
│   │   ├── auth/                 # Authentication
│   │   ├── user/                 # User management
│   │   ├── health/               # Health checks
│   │   ├── post/                 # Blog posts (legacy)
│   │   ├── products/             # Product catalog
│   │   ├── orders/               # Order management
│   │   ├── articles/             # Blog articles
│   │   ├── media/                # Media uploads
│   │   └── dashboard/            # Admin dashboard
│   ├── background/               # Background jobs
│   │   └── queues/
│   │       └── email-queue/      # Email job processor
│   ├── database/                 # Database layer
│   │   ├── config/               # Database configuration
│   │   ├── decorators/           # Custom decorators
│   │   ├── entities/             # TypeORM entities
│   │   ├── migrations/           # Auto-generated migrations
│   │   ├── seeds/                # Database seeders
│   │   ├── factories/            # Faker factories
│   │   └── data-source.ts        # TypeORM data source
│   ├── common/                   # Shared DTOs, types, interfaces
│   │   ├── dto/
│   │   │   ├── offset-pagination/
│   │   │   └── cursor-pagination/
│   │   ├── types/
│   │   └── interfaces/
│   ├── config/                   # App configuration
│   ├── constants/                # Constants
│   ├── decorators/               # Global decorators
│   │   └── validators/           # Custom validators
│   ├── exceptions/               # Exception classes
│   ├── filters/                  # Global exception filters
│   ├── guards/                   # Auth guards
│   ├── interceptors/             # Global interceptors
│   ├── libs/                     # External library integrations
│   │   ├── gcp/                  # Google Cloud Platform
│   │   └── aws/                  # Amazon Web Services
│   ├── mail/                     # Email module
│   │   ├── config/               # Mailer configuration
│   │   └── templates/            # Email templates
│   ├── redis/                    # Redis configuration
│   │   └── config/
│   ├── shared/                   # Shared singleton services
│   ├── utils/                    # Utility functions
│   │   └── transformers/         # Data transformers
│   ├── generated/                # Generated files (i18n)
│   ├── app.module.ts             # Root module
│   └── main.ts                   # Application entry point
├── test/                         # E2E tests
├── dist/                         # Compiled output
├── docs/                         # VuePress documentation
│   ├── .vuepress/
│   │   └── config/               # Multilingual config
│   ├── conventions/              # Code conventions
│   └── *.md                      # Documentation files
├── Dockerfile                    # Production container
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── jest.config.json              # Jest configuration
├── .eslintrc                     # ESLint configuration
└── .prettierrc                   # Prettier configuration
```

---

## 4. Important Scripts & Dependencies

### Essential NPM Scripts

**Development:**
- `pnpm start` - Start dev server
- `pnpm dev` - Start with watch mode
- `pnpm start:debug` - Debug mode with watch
- `pnpm start:prod` - Production run

**Build & Type:**
- `pnpm build` - Compile TypeScript
- `pnpm type-check` - Type checking without emission

**Database:**
- `pnpm migration:generate [name]` - Auto-generate migration
- `pnpm migration:up` - Apply migrations
- `pnpm migration:down` - Revert migration
- `pnpm migration:show` - Show pending migrations
- `pnpm seed:run` - Run database seeders
- `pnpm seed:create [name]` - Create new seeder
- `pnpm db:create` - Create database
- `pnpm db:drop` - Drop database

**Testing:**
- `pnpm test` - Run all tests
- `pnpm test:watch` - Watch mode
- `pnpm test:cov` - Coverage report
- `pnpm test:e2e` - E2E tests

**Code Quality:**
- `pnpm lint` - ESLint with auto-fix
- `pnpm format` - Prettier format
- `pnpm type-check` - TypeScript validation

### Key Dependencies (Highlights)

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Framework** | @nestjs/core | 10.4.7 | NestJS runtime |
| **Framework** | @nestjs/common | 10.4.7 | Common utilities |
| **Database** | typeorm | 0.3.20 | ORM layer |
| **Database** | @nestjs/typeorm | 10.0.2 | NestJS integration |
| **Auth** | @nestjs/jwt | 10.2.0 | JWT handling |
| **Auth** | argon2 | 0.41.1 | Password hashing |
| **Security** | helmet | 8.0.0 | HTTP headers |
| **Validation** | class-validator | 0.14.1 | Input validation |
| **Validation** | class-transformer | 0.5.1 | DTO transformation |
| **API** | @nestjs/swagger | 8.0.5 | API documentation |
| **Email** | @nestjs-modules/mailer | 2.0.2 | Email service |
| **Email** | nodemailer | 6.9.16 | SMTP client |
| **Files** | cloudinary | 2.5.1 | Media storage |
| **Jobs** | @nestjs/bullmq | 10.2.2 | Job queue |
| **Jobs** | bullmq | 5.23.0 | Queue implementation |
| **Cache** | @nestjs/cache-manager | 2.3.0 | Caching |
| **Cache** | cache-manager-ioredis-yet | 2.1.2 | Redis adapter |
| **i18n** | nestjs-i18n | 10.5.0 | Translations |
| **Logging** | nestjs-pino | 4.1.0 | Pino integration |
| **Testing** | jest | 29.7.0 | Test framework |
| **Testing** | supertest | 7.0.0 | HTTP testing |
| **Linting** | eslint | 9.14.0 | Code linting |
| **Formatting** | prettier | 3.3.3 | Code formatting |
| **Git Hooks** | husky | 9.1.6 | Git hooks manager |
| **Commits** | @commitlint/cli | 19.5.0 | Commit linting |

---

## 5. Application Configuration

### Bootstrap Setup (`main.ts`)
The application is bootstrapped with:
- Helmet for security headers
- Compression middleware for response compression
- CORS with configurable origins
- Global API prefix `/api/v1` (excludes root and health endpoints)
- URI-based versioning
- Global auth guard
- Global exception filter
- Global validation pipes (strict mode, whitelist enabled)
- Class serialization interceptor
- Swagger documentation (development only)

### Environment Variables
```env
# Application
NODE_ENV=development|staging|production
MODULES_SET=monolith|api|background
APP_NAME="NestJS API"
APP_URL=http://localhost:3000
APP_PORT=3000
API_PREFIX=api
APP_DEBUG=false|true
APP_LOG_LEVEL=debug|info|warn|error
APP_CORS_ORIGIN=http://localhost:3000,http://example.com

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=longnhan_api
DATABASE_LOGGING=true|false
DATABASE_SYNCHRONIZE=false
DATABASE_MAX_CONNECTIONS=100

# Authentication
AUTH_JWT_SECRET=your_secret_key
AUTH_JWT_TOKEN_EXPIRES_IN=1d
AUTH_REFRESH_SECRET=refresh_secret
AUTH_REFRESH_TOKEN_EXPIRES_IN=365d

# Email
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_DEFAULT_EMAIL=noreply@example.com
```

---

## 6. API Endpoints Summary

### Authentication
- `POST /api/v1/auth/sign-in` - Login with email/password
- `POST /api/v1/auth/sign-up` - Register new user

### Products
- `GET /api/v1/products` - List products (public)
- `GET /api/v1/products/:slug` - Get product by slug (public)
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:id` - Update product (admin)
- `DELETE /api/v1/products/:id` - Delete product (admin)

### Orders
- `POST /api/v1/orders` - Create order (public)
- `GET /api/v1/orders` - Get user's orders (authenticated)
- `GET /api/v1/orders/:id` - Get order details (authenticated)
- `PATCH /api/v1/orders/:id/status` - Update status (admin)

### Articles
- `GET /api/v1/articles` - List articles (public)
- `GET /api/v1/articles/:slug` - Get article by slug (public)
- `POST /api/v1/articles` - Create article (admin)
- `PUT /api/v1/articles/:id` - Update article (admin)
- `DELETE /api/v1/articles/:id` - Delete article (admin)

### Media
- `POST /api/v1/media/upload` - Upload file (admin)
- `GET /api/v1/media` - List media (admin)
- `DELETE /api/v1/media/:id` - Delete media (admin)

### Dashboard
- `GET /api/v1/dashboard/stats?period=today|week|month|all` - Get statistics (admin)

### Health
- `GET /health` - Health check endpoint (public)

---

## 7. Notable Features & Implementation

### Multi-Language Support
- Uses `nestjs-i18n` for internationalization
- Auto-generated i18n files in `src/generated/`
- Documentation available in both English and Vietnamese (`docs/vi/`)

### Pagination
- **Offset-based:** `?page=1&limit=20`
- **Cursor-based:** `?cursor=abc123&limit=20`
- Shared DTOs in `src/common/dto/`

### Role-Based Access Control
- User roles (implicit admin role support)
- Custom `@ApiAuth()` and `@ApiPublic()` decorators
- Global auth guard in main.ts

### Background Jobs
- Email queue using BullMQ
- Job processor in `src/background/queues/email-queue/`
- Email events and event handlers

### Media Management
- Cloudinary integration for file storage
- Cloudinary package 2.5.1
- Dedicated media module with CRUD endpoints

### Database Migrations
- **Auto-generated** via TypeORM CLI
- Timestamp-based naming
- Located in `src/database/migrations/`
- Commands: generate → review → apply/revert

### Testing Infrastructure
- Jest with TypeScript support
- Supertest for HTTP assertions
- E2E tests in `test/` directory
- Optional test coverage reports

### Code Quality Enforcement
- ESLint configuration with TypeScript rules
- Prettier for code formatting
- Pre-commit hooks via Husky
- Staged file linting with lint-staged
- Commit message validation with Commitlint

### Documentation
- VuePress-based documentation site
- Multilingual support (EN/VI)
- Auto-deployed to gh-pages via GitHub Actions
- Comprehensive guides for setup, conventions, troubleshooting

---

## 8. Current Project State

### Completed Features
- E-commerce module (products, orders, articles)
- JWT authentication & authorization
- Media uploads to Cloudinary
- Admin dashboard with statistics
- Database migrations & seeding
- Comprehensive documentation
- Testing setup (Jest + Supertest)
- Code quality tools (ESLint + Prettier)
- Docker containerization
- CI/CD with GitHub Actions

### Partial/TODO Items
- Integration testing documentation (marked TODO in testing.md)
- CI/CD pipeline documentation (marked TODO in deployment.md)
- Rate limiting implementation (partially noted in security.md)
- Social sign-in (Apple, Facebook, Google, Twitter) - marked incomplete in README

### Legacy Items
- PostModule exists but being replaced by ArticlesModule

---

## 9. Development Workflow

### Local Setup
1. Clone repository
2. Copy `.env.example` → `.env`
3. `pnpm install`
4. `docker compose up -d db maildev` (optional - or use local PostgreSQL)
5. `pnpm migration:up`
6. `pnpm seed:run`
7. `pnpm dev` (starts dev server with watch)

### Git Workflow
- Conventional commits enforced via commitlint
- Pre-commit hooks via Husky
- Semantic PR checks via GitHub Actions
- Feature/bugfix branch naming conventions

### Deployment
- Docker build: `docker build -t app .`
- Environment configuration via `.env`
- Database migrations before startup
- Health check endpoint at `/health`

---

## 10. Project Statistics

- **Total API Modules:** 10 (home, auth, user, health, post, products, orders, articles, media, dashboard)
- **Database Entities:** 8 (user, session, product, variant, order, item, article, media)
- **Documentation Files:** 23+ (guides, conventions, API reference)
- **NPM Dependencies:** 75+ (core + dev)
- **Test Commands:** 6 (test, watch, coverage, debug, e2e, specific file)
- **Database Commands:** 6 (migrate up/down/show, seed, db create/drop)

---

**Report Generated By:** Exploration Agent  
**Duration:** Full codebase scan  
**Status:** Comprehensive documentation complete
