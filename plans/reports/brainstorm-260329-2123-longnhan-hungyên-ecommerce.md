# Brainstorm Report: Long Nhãn Hưng Yên E-Commerce App

**Date:** 2026-03-29
**Status:** Agreed — ready for implementation planning

---

## Problem Statement

Build a Vietnamese-market e-commerce + content platform to sell and SEO-promote "Long Nhãn Hưng Yên" (longan specialties). Needs: beautiful product showcase, video, blog/articles, ordering, and admin management. Solo/small team, ASAP launch.

---

## Requirements

### Functional
- Landing page: hero images, video (YouTube embed), product showcase
- Product pages with order form (no customer accounts required)
- Blog/articles with SEO-optimized pages
- Order management: COD + Bank transfer/QR confirmation
- Admin panel: products/SKUs, orders, articles, dashboard (revenue)

### Non-Functional
- Vietnamese language only
- SEO-first (SSG/ISR for content pages)
- Fast load for Vietnamese users (Cloudinary CDN + Vercel edge)
- Simple ops (managed infra, no devops complexity)
- Solo-maintainable codebase

---

## Tech Stack (Final Decision)

| Layer | Tech | Host |
|---|---|---|
| Backend API | NestJS + TypeORM + PostgreSQL | Railway |
| Storefront | Next.js 14 App Router | Vercel |
| Admin Panel | Next.js 14 App Router + shadcn/ui | Vercel |
| Media | Cloudinary | Cloudinary free tier |
| Monorepo | Turborepo | — |
| Shared types | `packages/types` (TypeScript) | — |

---

## Architecture

### Monorepo Structure

```
longnhantongtran/
├── apps/
│   ├── web/          # Next.js storefront (public-facing)
│   ├── admin/        # Next.js admin panel (protected)
│   └── api/          # NestJS backend
├── packages/
│   └── types/        # Shared TypeScript types (DTOs, enums)
├── turbo.json
└── package.json
```

### Backend (NestJS)

**Modules:**
- `auth` — JWT, bcrypt, admin login only
- `products` — SKU/variant management, inventory
- `orders` — order lifecycle, payment status
- `articles` — CMS for blog/SEO content
- `media` — Cloudinary upload, URL storage
- `dashboard` — aggregate stats (revenue, order counts)

**Key design choices:**
- TypeORM (user preference, entity-class based, NestJS-native integration)
- No customer auth — orders captured via phone/email form
- Payment: manual confirmation flow (order created → customer pays → admin marks paid)
- REST API (not GraphQL — overkill for this scope)

### Database Schema

```sql
-- Products
products (id, name_vi, slug, description_vi, base_price, images[], category, active, created_at)
product_variants (id, product_id, label, weight_g, price, stock, sku, active)

-- Orders
orders (id, code, customer_name, phone, email, address, province,
        total, payment_method, payment_status, order_status, notes, created_at)
order_items (id, order_id, variant_id, variant_snapshot jsonb, qty, unit_price)

-- Content
articles (id, title, slug, content_html, meta_title, meta_description,
          featured_image_url, tags[], published_at, created_at)

-- Admin
admins (id, email, password_hash, created_at)

-- Media
media (id, cloudinary_public_id, url, resource_type, created_at)
```

### Storefront (Next.js web)

- **SSG** — landing page, article list, article detail (excellent Google SEO)
- **ISR** — product pages (revalidate every 60s, fresh stock)
- **Server Actions** — order form submission
- **SEO** — generateMetadata per page, JSON-LD structured data, OpenGraph images
- **Media** — next/image + Cloudinary loader
- No customer login needed

### Admin (Next.js admin)

- JWT auth with HTTP-only cookies
- shadcn/ui components
- TanStack Table for orders/products lists
- Rich text editor (Tiptap) for articles
- Dashboard: revenue chart (Recharts), order status kanban

---

## Evaluated Approaches

### Monorepo vs Separate Repos
| | Monorepo (Turborepo) | Separate Repos |
|---|---|---|
| Type sync | Automatic via shared package | Manual / OpenAPI codegen |
| Solo DX | Excellent | Friction |
| CI/CD | Single pipeline | 3 pipelines |
| **Decision** | ✅ **Chosen** | ❌ Rejected |

### Admin UI: Custom vs AdminJS
| | Custom Next.js + shadcn | AdminJS |
|---|---|---|
| Setup time | ~2-3 days | ~4 hours |
| Customization | Full | Limited |
| Branding fit | Yes | Generic |
| Long-term | Maintainable | Lock-in risk |
| **Decision** | ✅ **Chosen** | ❌ Rejected |

### CMS: DB-driven vs MDX vs Headless
| | DB (PostgreSQL) | MDX files | Sanity/Contentful |
|---|---|---|---|
| Non-tech editor | Yes | No (needs git) | Yes |
| Extra service | No | No | Yes (cost) |
| SEO | Full control | Good | Good |
| **Decision** | ✅ **Chosen** | ❌ | ❌ Too complex |

---

## MVP Scope (v1 — ASAP)

### Include
- [ ] Turborepo monorepo scaffolding
- [ ] NestJS API: products, orders, articles, auth, media
- [ ] PostgreSQL schema + TypeORM migrations
- [ ] Storefront: landing, product list, product detail + order form, articles
- [ ] Admin: login, orders, products/SKUs, articles CRUD, basic dashboard
- [ ] Cloudinary image upload in admin
- [ ] COD + QR payment (manual confirmation)
- [ ] Vietnamese SEO (meta, JSON-LD, sitemap)

### Defer to v2
- Customer accounts / order tracking by phone
- Discount codes / promotions
- Reviews & ratings
- Email/SMS order notifications (add later with SendGrid/Twilio)
- Analytics dashboard beyond basic counts
- Inventory low-stock alerts

---

## Implementation Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Payment reconciliation (manual QR) | Medium | Admin order notes + status workflow |
| Image performance on slow 4G | Medium | Cloudinary auto-format + next/image sizes |
| SEO not ranking for "long nhãn hưng yên" | Medium | Consistent slug strategy, structured data, internal linking |
| Solo dev scope creep | High | Stick to MVP, defer v2 features ruthlessly |

---

## Estimated Cost (Monthly)

| Service | Cost |
|---|---|
| Vercel (web + admin) | Free |
| Railway (API + PostgreSQL) | ~$5-10 |
| Cloudinary | Free (25GB) |
| Domain | ~$1 |
| **Total** | **~$6-11/mo** |

---

## Success Metrics (v1)

- First order placed within 2 weeks of launch
- Google index all article pages within 1 month
- Admin can manage orders without developer help
- Page load < 3s on mobile 4G (Vietnamese average)

---

## Next Steps

1. Scaffold Turborepo monorepo with 3 apps + shared types
2. Set up NestJS with TypeORM, PostgreSQL, Cloudinary
3. Implement core API modules (products, orders, articles, auth)
4. Build storefront landing page + order flow
5. Build admin panel (orders + products priority)
6. Deploy to Vercel + Railway
7. SEO tuning (sitemap, meta, JSON-LD)

---

## Unresolved Questions

- Will there be multiple admins (multi-user) or single admin account?
- Do you need order notification emails to customer after placing order?
- Any specific province/city delivery restriction or nationwide shipping?
