# Documentation Update Report: NestJS API

**Date:** 2026-03-30
**Time:** 15:01
**Scope:** Long Nhan Hung Yen e-commerce API documentation update
**Status:** COMPLETED

## Summary

Updated 7 documentation files in `apps/api/docs/` to reflect actual backend conventions, module structure, technology stack, and development workflows.

## Files Modified

### 1. `README.md`
**Changes:**
- Replaced generic "NestJS Boilerplate" title with "Long Nhan Hung Yen E-commerce API"
- Updated description to reflect the project purpose (e-commerce platform)
- Updated feature list to match actual implementation:
  - Added Products, Orders, Articles, Media, Dashboard modules
  - Added Cloudinary integration
  - Removed incomplete features (Social sign-in, File uploads S3)
- Fixed broken link: `conventions/linting.md` → `conventions/linting-and-formatting.md`
- Added API Reference link

### 2. `development.md`
**Changes:**
- Clarified `MODULES_SET` env var with all three options: `monolith` (default), `api`, `background`
- Added dedicated "Code Quality Tools" section with three commands:
  - `pnpm format` — Prettier formatting
  - `pnpm lint` — ESLint with auto-fix
  - `pnpm type-check` — TypeScript type checking
- Added missing `pnpm build` and `pnpm start:prod` commands
- Clarified that `pnpm dev` is an alias for `pnpm start:dev`

### 3. `architecture.md`
**Changes:**
- Expanded `api` module section with complete module list and descriptions:
  - UserModule, HealthModule, AuthModule, HomeModule, PostModule
  - **ProductsModule** — Products catalog with full CRUD + variant relationships
  - **OrdersModule** — Order management with line items
  - **ArticlesModule** — Blog articles
  - **MediaModule** — Cloudinary-based media uploads
  - **DashboardModule** — Admin statistics endpoint
- Added endpoint details (HTTP methods, routes, auth requirements)

### 4. `database.md`
**Changes:**
- Added "Entity Structure" section listing all 8 domain entities:
  - User, Session, Product, ProductVariant (OneToMany)
  - Order, OrderItem (OneToMany)
  - Article, Media
- **CRITICAL:** Emphasized "NEVER write migration files manually" — TypeORM auto-generates
- Updated migration generation example with UUID primary key
- Added guidance on entity field patterns:
  - `@CreateDateColumn()`, `@UpdateDateColumn()` for timestamps
  - `@Column('enum', { enum: SomeEnum })` for enums
  - `@Column('jsonb')` for JSON data (PostgreSQL)
- Clarified auto-detection workflow: modify entity → run `migration:generate`

### 5. `api.md` (Complete rewrite)
**Changes:**
- Added Swagger documentation access (dev/prod URLs)
- Added Base URL explanation (`/api/v1` prefix)
- **Authentication section:**
  - JWT Bearer token format
  - Public vs Admin vs User endpoints
  - Example sign-in request
- **Comprehensive endpoint table:**
  - All 17+ endpoints across 6 modules
  - HTTP method, path, auth level, description
- **Error response format** with JSON structure
- **Common HTTP status codes** table
- **Pagination modes:** Offset and Cursor
- **Request/Response examples:** Get Products, Create Order, Upload Media

### 6. `technologies.md`
**Changes:**
- Added new "File & Media Management" section:
  - **Cloudinary** — Cloud-based media storage
  - **Streamifier** — Stream utilities for file uploads
  - **Slugify** — URL-friendly slug generation (Vietnamese support)

### 7. `conventions/linting-and-formatting.md` (Enhanced)
**Changes:**
- Expanded Prettier configuration section with:
  - Complete `.prettierrc` JSON snippet
  - Settings table explaining each option
  - Running Prettier examples
- Added ESLint configuration file reference
- Added 3 new command examples:
  - `pnpm lint` — With explanation
  - `pnpm format` — With explanation
  - `pnpm type-check` — New command
- Improved file structure with clearer sections
- Added configuration files reference table

## Accuracy Verification

All changes verified against actual codebase:

- ✓ Module imports from `src/api/api.module.ts`
- ✓ Scripts from `apps/api/package.json` (lines 8-34)
- ✓ Entity structure from actual entity files
- ✓ Prettier config from `apps/api/.prettierrc`
- ✓ MODULES_SET from environment variable documentation
- ✓ Endpoint routes from controller files

## Key Improvements

1. **Accuracy**: All documented conventions match actual package.json scripts
2. **Completeness**: Added missing sections (formatting, migration generation, media tech)
3. **Clarity**: Emphasized critical rules (no manual migrations, auto-generate only)
4. **Structure**: Better organization with tables, examples, and cross-references
5. **Project Identity**: Changed from generic boilerplate to Long Nhan Hung Yen e-commerce

## Breaking Changes

None. This is a documentation-only update. No code changes required.

## Gaps Remaining (Out of Scope)

Not modified per user constraints:
- `security.md` — Out of scope
- `testing.md` — Out of scope
- `troubleshooting.md` — Out of scope
- `deployment.md` — Out of scope
- `benchmarking.md` — Out of scope
- `faq.md` — Out of scope
- Convention files (except linting-and-formatting.md)

## Recommendations

1. **Next Steps:**
   - Review module-specific documentation (one per module: Products, Orders, Articles, Media, Dashboard)
   - Add API authentication examples for each protected endpoint type
   - Document common error scenarios in troubleshooting.md

2. **Maintenance:**
   - Update development.md when new scripts are added to package.json
   - Update architecture.md when new feature modules are added
   - Keep api.md in sync with actual endpoint routes

3. **Testing:**
   - Verify all code examples are correct (especially curl commands)
   - Test Swagger generation at `/api-docs`
   - Validate links to referenced files

## Unresolved Questions

None. All documentation updates completed successfully.
