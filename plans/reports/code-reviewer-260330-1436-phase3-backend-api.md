# Code Review — Phase 3 Backend API

**Date:** 2026-03-30
**Score: 8.1 / 10**

---

## Scope

- Modules: products, orders, articles, media, dashboard
- Files reviewed: ~25 service/controller/entity/dto files
- Focus: security, correctness, type safety, patterns, edge cases

---

## Overall Assessment

Solid implementation. Consistent with boilerplate patterns, correct use of `@ApiPublic` / `@ApiAuth`, parameterized queries throughout (no SQL injection risk), and the order transaction with SELECT FOR UPDATE is correctly implemented. Issues below are mostly medium/low severity. One medium correctness bug in order code generation and one medium performance issue in dashboard.

---

## Critical Issues

None.

---

## High Priority

### 1. Order code generation race condition under concurrent load

**File:** `orders.service.ts:176-184`

`generateOrderCode` counts today's orders via `LIKE` then adds 1 to get the next sequence. This runs inside the same transaction that holds a pessimistic write lock on `product_variant` rows — but the `getCount()` query is not locked itself. Under burst traffic (e.g. two concurrent order creations at the same second) both transactions can read the same count, produce the same `code`, and one will fail with a unique-constraint violation on `order.code`.

The current approach is fragile. For a small e-commerce this may be acceptable at launch, but it should be documented or mitigated.

**Options:**
- Use a PostgreSQL sequence: `nextval('order_seq')` — atomic and correct.
- Or append a random 4-char hex suffix instead of a sequential counter (simpler, no collision risk at this scale).
- Minimum: document the known limitation in a code comment.

---

## Medium Priority

### 2. Dashboard fetches all orders into application memory

**File:** `dashboard.service.ts:24`

```ts
const orders = await qb.getMany(); // loads ALL orders for period
```

For `period = 'all'`, this pulls every order row into Node.js memory. Revenue and counts should be computed with SQL aggregates (`SUM`, `COUNT`, `GROUP BY DATE`). Acceptable for MVP with few orders, but will degrade as order volume grows.

### 3. `remove()` in `media.service.ts` — partial failure not handled

**File:** `media.service.ts:59-66`

Cloudinary `destroy` is called first, then `mediaRepo.remove`. If the DB remove fails after Cloudinary deletion succeeds, the DB record remains but the file is gone — leading to broken state on future access or delete retry. Should wrap in a try/catch or reverse the order (DB delete first, then Cloudinary, since DB is the source of truth and retries are simpler).

### 4. `update()` in `products.service.ts` — variant replacement not transactional

**File:** `products.service.ts:120-139`

`variantRepo.delete({ productId: id })` followed by `variantRepo.save(variants)` is not wrapped in a transaction. If the save fails, variants are permanently deleted with no rollback. Must use `dataSource.transaction()` or a single `transactional` decorator.

### 5. Article `update()` — `published: false` does not reset `publishedAt`

**File:** `articles.service.ts:99-101`

```ts
} else if (dto.published === false) {
  article.status = ArticleStatus.DRAFT;
  // publishedAt is NOT cleared
}
```

If an article is published then unpublished, `publishedAt` retains the old timestamp. Re-publishing later will keep the old `publishedAt` (line 98: `article.publishedAt ?? new Date()` short-circuits). This means the article appears to have been published earlier than it actually was. Either clear `publishedAt` on unpublish, or always set it to `new Date()` on (re-)publish.

### 6. No MIME type validation for file uploads

**File:** `media.controller.ts:42`

`FileInterceptor` only enforces a 5MB size limit. There is no `fileFilter` to restrict MIME types. An admin could upload executable files (`.sh`, `.exe`, etc.) which Cloudinary would accept and store. Add a `fileFilter` to whitelist `image/*` and `video/*` at minimum.

---

## Low Priority

### 7. `generateOrderCode` `em` parameter typed as `any`

**File:** `orders.service.ts:169`

`private async generateOrderCode(em: any)` — should be typed as `EntityManager` from TypeORM. Minor type safety gap.

### 8. Product `slug` route conflicts with admin routes

**File:** `products.controller.ts:41-43`

`GET /products/:slug` will catch any string including `'create'` or future sub-routes if added. Not a current bug, but worth noting that the public `/:slug` route should remain the last defined route (it currently is, which is correct).

### 9. `CreateOrderReqDto.items` — no minimum length validation

**File:** `orders/dto/create-order.req.dto.ts:40-44`

`@IsArray()` alone allows an empty array. An order with zero items would pass validation, then create an order with `total = 0`. Add `@ArrayMinSize(1)`.

### 10. Dashboard `period` query param — no validation

**File:** `dashboard.controller.ts:16`

`@Query('period')` accepts any string. Invalid values fall through to `switch` and hit no case, returning `null` from `getPeriodStart` — which means `all` behavior. Should add `@IsIn(['today', 'week', 'month', 'all'])` validation or at least sanitize the input.

---

## Positive Observations

- SELECT FOR UPDATE (pessimistic_write) in order creation is correctly scoped inside the transaction — good concurrency handling.
- `variantSnapshot` JSONB column on `order_item` correctly preserves pricing data at order time — resilient to future variant edits.
- Slug generation with `locale: 'vi'` is appropriate for Vietnamese content.
- All admin endpoints consistently use `@ApiAuth()`, public endpoints use `@ApiPublic()` — auth guard coverage is correct.
- Parameterized queries via TypeORM QueryBuilder throughout — no SQL injection vectors.
- `images` stored as `simple-array` is suitable for the scale; JSONB would be more robust but not necessary now.
- Media controller correctly restricts all endpoints to `@ApiAuth()` — no public file listing.

---

## Recommended Actions (Prioritized)

1. **[High]** Document or mitigate order code collision risk — add a comment at minimum; use a DB sequence if ordering volume warrants it.
2. **[Medium]** Wrap product variant replace (delete + insert) in a transaction.
3. **[Medium]** Add `ArrayMinSize(1)` to `CreateOrderReqDto.items`.
4. **[Medium]** Fix article `publishedAt` logic on unpublish.
5. **[Medium]** Handle Cloudinary/DB partial failure in `media.remove()`.
6. **[Medium]** Add MIME type `fileFilter` to media upload interceptor.
7. **[Low]** Replace dashboard in-memory aggregation with SQL aggregates.
8. **[Low]** Type `generateOrderCode` `em` parameter as `EntityManager`.
9. **[Low]** Add `@IsIn(...)` guard on dashboard `period` query param.

---

## Unresolved Questions

- Is rate limiting applied at the gateway/load-balancer level for the public `POST /orders` endpoint? Without it, the endpoint is open to spam order creation.
- Are Cloudinary credentials validated at startup (fail-fast) or only on first upload? `getOrThrow` in the provider suggests fail-fast — confirm this is tested in staging.
- Is there a plan to paginate `order.items` in `findMany`? Currently all items are eager-loaded per page of orders, which could be heavy for large orders.
