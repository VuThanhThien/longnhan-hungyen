---

## title: 'Categories API, landing data, breadcrumb redesign, admin UX (TipTap, lists, orders)'
description: 'Normalize categories; landing: API categories + articles list + /articles CTA + video/image album sections; breadcrumb; admin TipTap, lists, orders.'
status: draft
priority: P1
effort: large
branch: feature/categories-admin-breadcrumb
tags: [api, web, admin, ecommerce]
created: 2026-04-15
updated: 2026-04-15

# Categories, landing API, breadcrumb, and admin hardening

## Overview

Today `**product.category` is a free-form `varchar(50)**` on `product` (`[product.entity.ts](../../apps/api/src/api/products/entities/product.entity.ts)`); there is **no `category` table** or admin CRUD. The **landing** mixes **hardcoded** `LANDING_CATEGORIES` (`[landing-page-content](../../apps/web/src/data/landing-page-content.ts)`) with **API-fetched products** (`GET /products?limit=8` on `[page.tsx](../../apps/web/src/app/page.tsx)`). **Order workflow types diverge** between API (`OrderStatus`: `pending` | `confirmed` | `shipping` | `delivered` | `cancelled`) and `[packages/types](../../packages/types/src/order.ts)` (extra `PROCESSING`, `SHIPPED`, aliases) — admin UI shows **raw enums** in `[OrderStatusPanel](../../apps/admin/src/components/orders/order-status-panel.tsx)` and **fires API on every `<select>` change** (no explicit Save).

Goals:

1. **API + DB:** Introduce real **categories**; **link products** to categories; **review/migrate** existing string values; expose **consistent public + admin** endpoints for listing and filters.
2. **Web / landing:** **Fetch categories from API** for the category carousel/nav (replace hardcoded `LANDING_CATEGORIES` once `GET /categories` exists). **Show published articles** on the home page (cards from `GET /articles` with small limit) and add **visible CTAs** linking to `**/articles`** (and per-card links to `**/articles/[slug]**`). Add **two new sections**: **video album** (curated gallery of clips, not only product `videoUrl`) and **image album** (responsive grid / lightbox). **Redesign breadcrumb** (visual + a11y + JSON-LD alignment).
3. **Admin:** **No SEO** focus; prioritize **correct domain logic**, **row navigation** on articles/products lists, **order detail** with **Save-before-API**, **validated** status transitions, **badges** mapped from enums to Vietnamese labels.

## Locked decisions (proposed — confirm before implementation)


| Topic                            | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category model                   | `**category` table** (`id`, `slug`, `name`, `sortOrder`, `active`, timestamps); `**product.categoryId`** FK (nullable during migration, then NOT NULL if business allows).                                                                                                                                                                                                                                                               |
| Legacy `product.category` string | **Migration**: create rows from **distinct** existing values, map products to `categoryId`, then **drop column** (or keep read-only shadow until verified — prefer drop after QA).                                                                                                                                                                                                                                                       |
| Public API                       | `GET /v1/categories` (active, ordered); products list filter by `**category` slug or id** (align with existing `[ProductQueryReqDto](../../apps/api/src/api/products/dto/product-query.req.dto.ts)`).                                                                                                                                                                                                                                    |
| Landing data loading             | `**page.tsx`** uses **parallel** server helpers (e.g. `Promise.all` or separate cached functions) for `**/categories`**, `**/products**`, `**/articles**` — same revalidate window or tagged invalidation; avoid sequential waterfalls.                                                                                                                                                                                                  |
| Home articles                    | `**GET /v1/articles?limit=4**` (or `page=1&limit=4`) — public list already **omits `contentHtml`** in list query (`[ArticlesService.findMany](../../apps/api/src/api/articles/articles.service.ts)`) — suitable for cards.                                                                                                                                                                                                               |
| Home — link to articles index    | Section header row: **primary CTA** “Tất cả bài viết” / “Xem thêm” → `**/articles`**; each card title/image → `**/articles/[slug]**`. Today home has **no** article block — **gap closed**.                                                                                                                                                                                                                                              |
| Video + image albums             | **v1 (fast):** `landing-page-content.ts` or env-driven **arrays** (`videoUrls[]`, `imageUrls[]`) + reuse/extend `[VideoSection](../../apps/web/src/components/home/video-section.tsx)` patterns. **v2 (CMS):** optional `**media_album`** / `**landing_block**` API + admin CRUD so marketing edits without deploy. Pick one in implementation; plan assumes **v1 first** unless product insists on admin-managed galleries immediately. |
| Order status source of truth     | **API enum only**; **narrow `packages/types`** to match `[OrderStatus` in `order.entity.ts](../../apps/api/src/api/orders/entities/order.entity.ts)`; remove duplicate/alias enum members that confuse selects.                                                                                                                                                                                                                          |
| Order detail UX                  | **Local draft state** for `orderStatus` + `paymentStatus`; **single Save** button calls update API once; optional **Discard**; show **dirty** indicator.                                                                                                                                                                                                                                                                                 |


## Current-state facts (audit)

- Products: `[ProductsService.findMany](../../apps/api/src/api/products/products.service.ts)` filters `category` as **string** contains/equality — must switch to **join** or **category slug**.
- Home: `[getHomeProducts](../../apps/web/src/app/page.tsx)` uses `**fetchPaginated('/products', { limit: 8 })`** — no category awareness; `[FeaturedProducts](../../apps/web/src/components/home/featured-products.tsx)` is a flat grid ( `**HomeProductsByCategory**` exists but is not used on home). **No articles** on home; `**[VideoSection](../../apps/web/src/components/home/video-section.tsx)`** only shows YouTube IDs derived from **product `videoUrl`s** — not a standalone “album” block with its own copy/positioning.
- Articles API: public `**GET /articles`** already returns **published** rows **without** heavy `contentHtml` in list — OK for landing previews (`[articles.service.ts](../../apps/api/src/api/articles/articles.service.ts)` `select` list).
- Breadcrumb: `[breadcrumb.tsx](../../apps/web/src/components/ui/breadcrumb.tsx)` — slash separators, no `aria-current="page"`.
- Admin lists: `[products/page.client.tsx](<../../apps/admin/src/app/(dashboard)`/products/page.client.tsx>) — edit only via **“Sửa”** link; `[articles/page.client.tsx](<../../apps/admin/src/app/(dashboard)`/articles/page.client.tsx>) — same.
- Orders: `[OrderStatusPanel](../../apps/admin/src/components/orders/order-status-panel.tsx)` — immediate PATCH per change; enum list **does not match** API (`PROCESSING` vs `shipping`, missing **shipping** in panel list).

## UX notes (designer handoff)

- **Breadcrumb:** Prefer **chevron** separators; **muted links** + stronger current step; `**aria-current="page"`** on last item; **derive** visible trail and `buildBreadcrumbSchema` from **one data structure** per page.
- **Order detail:** **Badges** for read summary; **labeled groups** for fulfillment vs payment; **Save** for workflow-sensitive updates; avoid raw enum strings in UI — use shared **label map** (same keys as `@longnhan/types` after alignment).
- **Tables:** Row click **or** primary-cell **Link**; `**stopPropagation`** on Delete; ensure **keyboard** path (link in first column).

## Landing page (storefront) — detailed plan

### Data fetching (`apps/web/src/app/page.tsx`)

1. **Categories** (after Phase 2 exists): add `getHomeCategories()` — `fetch`/`fetchPaginated` `**GET /v1/categories`** (or stub returning `[]` until API ships). Use `**'use cache'**` + `cacheTag('home-categories')` + `cacheLife` aligned with products (e.g. 300s).
2. **Products:** keep `getHomeProducts()`; optionally increase limit if layout needs more for category grouping later.
3. **Articles:** add `getHomeArticles()` — `**GET /v1/articles?limit=4`** (or `page=1&limit=4`), published only server-side; `cacheTag('home-articles')`.
4. **Orchestration:** `const [categories, products, articles] = await Promise.all([...])` **inside** the page **or** call three cached functions — either way **one round-trip wait** for independent IO (RSC parallel fetch).

### Components / sections (order suggestion — tune in UI pass)


| Section               | Behavior                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category carousel** | Pass `**categories`** from API into `[LandingCategoryCarousel](../../apps/web/src/components/landing/landing-category-carousel.tsx)`; replace `LANDING_CATEGORIES` links with `**/products?category=<slug>**` (or future `/categories/[slug]` if routed). Fallback: show skeleton or hide nav if API empty.                                                                                         |
| **Featured products** | Unchanged initially; optional later: pass `**category` slug** from API for section titles.                                                                                                                                                                                                                                                                                                          |
| **Articles preview**  | **New** `LandingArticlesPreview` (or `home-articles.tsx`): grid of cards (`title`, `excerpt`, `featuredImageUrl`, link `**/articles/[slug]`**). **Header** includes `**Link` to `/articles`** (“Xem tất cả bài viết” / similar). If **zero** articles, hide section or show short copy + CTA to `/articles` only.                                                                                   |
| **Video album**       | **New** section: curated list of YouTube (or embed) URLs — **v1** from static config array **or** merged with existing product-derived URLs (decide: **separate** “Hình ảnh & video” marketing block vs current “Quy Trình Sản Xuất”). Reuse `**getYouTubeId`** logic from `[video-section.tsx](../../apps/web/src/components/home/video-section.tsx)` (extract to `lib/youtube.ts` if duplicated). |
| **Image album**       | **New** `LandingImageAlbum`: grid of images (Next `Image` with width/height or fill), optional **dialog/lightbox** on click; **v1** static URLs (Cloudinary or public paths).                                                                                                                                                                                                                       |


### SEO / metadata

- Home `**metadata`** in `[page.tsx](../../apps/web/src/app/page.tsx)` can stay; new sections **do not require** extra `generateMetadata` unless adding JSON-LD for `ItemList` of articles (optional follow-up).

### Phases mapping

Landing work splits across: **Phase 2** (categories API), **Phase 5** (wire home + carousel + articles + albums v1), optional **Phase 5b** (admin-managed media API).

## Phases

| #      | Phase                                  | Deliverables                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **1**  | **DB + entities**                      | `category` entity + migration; `ProductEntity` relation `ManyToOne` → `CategoryEntity`; data migration from `product.category` string; TypeORM relations indexed (`categoryId`, `slug` unique).                                                                                                                                                                                                                                                                                                            |
| **2**  | **API — categories**                   | Nest module `categories`: admin `POST/PATCH/DELETE` (soft-delete or `active` flag), public `GET` list; Swagger + DTOs; **validate** slug uniqueness.                                                                                                                                                                                                                                                                                                                                                       |
| **3**  | **API — products**                     | Create/update DTOs: accept `categoryId` (required or optional per rules); `**ProductResDto`** exposes `category: { id, slug, name }` or flatten `categorySlug` + `categoryName` for backward compatibility; `**findMany**` filter by category slug/id; **admin** list filter unchanged UX but backed by relation.                                                                                                                                                                                          |
| **4**  | **packages/types**                     | Update `Product`, category types; **fix `OrderStatus` / `PaymentStatus`** to mirror API (breaking change — grep all usages).                                                                                                                                                                                                                                                                                                                                                                               |
| **5**  | **Web — data + landing**               | **Parallel fetch** on home: categories + products + articles. `**LandingCategoryCarousel`** consumes API categories + links to `**/products?category=**` by slug. **New** articles preview section + **CTA to `/articles`** + cards to `**/articles/[slug]**`. **New** **video album** + **image album** sections (v1: static URL lists + shared styling with landing brand); extract YouTube helper if needed. Ensure `/products?category=` matches **slug** once products filter uses category relation. |
| **5b** | **API — media galleries (optional)**   | If admin must edit albums without deploy: `media_item` table or JSON column + `GET /landing/media?type=video                                                                                                                                                                                                                                                                                                                                                                                               | image` + admin UI; else **defer** and keep v1 static. |
| **6**  | **Web — breadcrumb**                   | Redesign component; add `aria-current`; refactor pages building `breadcrumbItems` + JSON-LD to **single builder** helper (e.g. `lib/breadcrumb.ts`).                                                                                                                                                                                                                                                                                                                                                       |
| **7**  | **Admin — categories**                 | New dashboard section: CRUD list + form; slug validation; used by product edit **select**.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **8**  | **Admin — product form**               | Category **dropdown/async** from API; remove free-text category if DB is source of truth.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **9**  | **Admin — TipTap**                     | **Image:** selectable node — toolbar or bubble menu: **edit src**, **alt**, **link href** (wrap image in `<a>` or use Image extension `Link` integration per HTML strategy); reuse Cloudinary/upload flow if project has upload API; **sanitize** pasted URLs. **Link:** ensure existing `[LinkPopover](../../apps/admin/src/components/tiptap-ui/link-popover)` covers text; extend for image nodes if needed (`@tiptap/extension-link` + custom Image extension or `Image.extend`).                      |
| **10** | **Admin — lists**                      | Products + articles tables: **navigate to edit** on row (with propagation rules) **or** title cell `Link`; keep delete explicit.                                                                                                                                                                                                                                                                                                                                                                           |
| **11** | **Admin — order detail**               | Replace immediate select updates with **draft state** + **“Lưu thay đổi”**; **validate** allowed transitions (optional matrix in service or front-end guard mirroring API); on success refresh query; **header/summary** show `[OrderStatusBadge](../../apps/admin/src/components/orders/order-status-badge.tsx)` + payment badge component; sync selectable options with **real** API enum.                                                                                                               |
| **12** | **API — order transitions (optional)** | If product rules need it: `PATCH` validates transitions (e.g. cannot go `delivered` → `pending`); return `400` with code.                                                                                                                                                                                                                                                                                                                                                                                  |
| **13** | **QA**                                 | E2E smoke: category CRUD → product assign → storefront filter; **home** shows categories + article cards + CTA; order save flow; TipTap round-trip HTML stored in article `bodyHtml`.                                                                                                                                                                                                                                                                                                                      |

## Technical notes

### React / Next.js

- Prefer **direct imports** over heavy barrels where applicable (`[bundle-barrel-imports](../../.claude/skills/react-best-practices/SKILL.md)`); `**useTransition`** for non-urgent admin UI updates if needed.
- Server Components: **parallel** `fetch` for categories + products on home to avoid waterfalls.

### Validation matrix (orders)

- Document allowed transitions in plan README or `docs/` **only if** user asks — otherwise encode in `OrdersService.updateStatus` and mirror in admin for UX.

## Risks


| Risk                                                    | Mitigation                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Breaking change for `Product.category` string consumers | **Grep** web + admin + mobile; ship types + API together; temporary compatibility field in DTO if needed. |
| Landing content drift                                   | Single API for categories; CMS later if marketing needs copy beyond DB `name`.                            |
| TipTap XSS                                              | Continue sanitizing HTML server-side on article save if already present; validate `https` image URLs.     |
| Order enum migration                                    | Coordinate API + admin + any web order display (storefront order-success).                                |


## Definition of done

- Categories manageable via API + admin; products **linked** by FK; legacy strings migrated.
- **Home** calls `**GET /categories`** (when available) and **drives** category carousel/nav; **no** stale-only hardcoded categories in production path (fallback acceptable if API fails).
- **Home** lists **recent published articles** via `**GET /articles`**; **button/link to `/articles`** present; cards link to **article detail**.
- **Home** includes **video album** + **image album** sections (v1 static or API per decision); accessible markup; responsive layout.
- Public product list + home/landing consume **consistent** category slugs; no contradictory hardcoded category labels (unless explicitly “marketing-only” with documented exception).
- Breadcrumb redesigned; `**aria-current`**; JSON-LD aligned with visible items where both exist.
- Admin articles/products: **click-through** to edit works; delete still reliable.
- TipTap: **edit image URL** and **image link** without raw HTML in normal flow.
- Order detail: **Save** applies status changes; **badges** show Vietnamese labels; enums **match** API; invalid transitions handled gracefully.

## References

- API: `[apps/api/src/api/products](../../apps/api/src/api/products/)`, `[apps/api/src/api/articles](../../apps/api/src/api/articles/)`, `[apps/api/src/api/orders](../../apps/api/src/api/orders/)`
- Web: `[apps/web/src/app/page.tsx](../../apps/web/src/app/page.tsx)`, `[apps/web/src/components/landing/landing-category-carousel.tsx](../../apps/web/src/components/landing/landing-category-carousel.tsx)`, `[apps/web/src/components/home/video-section.tsx](../../apps/web/src/components/home/video-section.tsx)`, `[apps/web/src/components/ui/breadcrumb.tsx](../../apps/web/src/components/ui/breadcrumb.tsx)`
- Admin: `[apps/admin/src/components/tiptap-templates/simple/simple-editor.tsx](../../apps/admin/src/components/tiptap-templates/simple/simple-editor.tsx)`, `[apps/admin/src/components/orders/order-status-panel.tsx](../../apps/admin/src/components/orders/order-status-panel.tsx)`
- Types: `[packages/types/src/order.ts](../../packages/types/src/order.ts)`

## Unresolved questions

1. Should **category slug** be **editable** after publish (SEO URLs) — if yes, add **redirect** or **immutable slug** rule?
2. **TipTap images**: upload only via existing Cloudinary integration vs **paste URL** only for v1?
3. **Order transition rules**: strict state machine vs “any forward/back” with confirmation?
4. **Home articles:** how many items (e.g. **3 vs 6**) and sort (`**publishedAt` desc** assumed)?
5. **Video album vs `VideoSection`:** replace existing block, place **above/below** it, or **merge** product videos + curated URLs into one section?
6. **Image album:** Cloudinary-only vs any HTTPS URL; need **lightbox** v1 or simple grid + new tab?
7. **Media galleries:** ship **static v1** only, or **block** landing until admin API exists?

---

**Cook handoff:** after review, run implementation with the cook workflow and this plan path:

`./.claude/skills/.venv/bin/python3` not needed for cook — use:

```bash
node .claude/scripts/set-active-plan.cjs plans/20260415-categories-admin-breadcrumb
```

```text
/cook /Users/vuthanhthien/Documents/Coding/Vibe/longnhantongtran/plans/20260415-categories-admin-breadcrumb/plan.md
```

(Adjust if your cook entrypoint is `pnpm` / CLI alias as documented in repo.)
