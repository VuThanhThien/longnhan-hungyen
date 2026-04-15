# Phase 03 — Product reviews (Maps-like: stars + text, verified, moderated)

## Priority

P1 feature differentiation; largest slice.

## Overview

**Google Maps–like** = **1–5 stars**, optional **short text**, **aggregate** (average + count) on product listing/card/detail, **newest** reviews list. **Verified only:** customer may submit only if there exists a **delivered** order containing that **product** (via `order_item.variant_id` → `product_variant.product_id`). **Moderation:** `pending` → admin **approve** → `published`; storefront lists **published** only.

## Data model

**Table `product_review`**

- `id` (uuid), `product_id` (fk), `order_id` (fk), `rating` (smallint 1–5), `comment` (text, nullable, max 2000), `status` enum `pending` | `published` | `rejected`
- `created_at`, `updated_at`
- Unique constraint: `(order_id, product_id)` — one review per product per order

**Optional denormalization on `product`**

- `rating_avg` (numeric), `rating_count` (int) — update in transaction on publish/unpublish, or compute via SQL view for v1 (simpler: **scheduled** or **on approve** handler).

## API

**Public (or auth-none)**

- `POST /v1/products/:productId/reviews` body: `{ orderId, phone, rating, comment? }` — verify phone matches order, order delivered, order contains product; create `pending`.
- `GET /v1/products/:slugOrId/reviews?limit&cursor` — **published** only.

**Admin**

- `GET /v1/admin/reviews?status=pending` (paginated)
- `PATCH /v1/admin/reviews/:id` `{ status: published | rejected }`

Use existing `@ApiAuth` patterns from other admin resources.

## Web

- PDP: stars + count (if >0); list of recent reviews; **CTA** “Đánh giá” opens form only if eligible — eligibility check: new endpoint `GET …/reviews/eligibility?orderId&phone` or combine into submit (return 403 with reason).
- Post-submit: “Cảm ơn — đánh giá đang chờ duyệt”.

## Admin (`apps/admin`)

- New section or under products: **Reviews** queue; approve/reject; show product + order code link.

## Related code files

**Create**

- Entity + migration `product_review`
- `reviews.module.ts`, `reviews.service.ts`, `reviews.controller.ts` (namespaced under products or top-level `reviews`)
- Admin controller/service or extend existing admin pattern

**Modify**

- `packages/types` — DTOs + enums
- Product detail API may need to include `ratingAvg`, `ratingCount` for SSR

## Implementation steps

1. Migration + entity + indexes (`product_id`, `status`, `created_at`).
2. Eligibility resolver: join `order` + `order_item` + variant → product; check `orderStatus === delivered`.
3. Create review + list published with pagination.
4. Admin queue UI + API.
5. Update product card/PDP components to show aggregates.
6. i18n copy in Vietnamese for errors.

## Success criteria

- Cannot review without delivered order + phone proof.
- Pending reviews invisible on storefront until approved.
- Average matches published reviews only.

## Risks

- **Snapshot products:** if variant deleted, `variant_id` null but snapshot still has product info — eligibility should use snapshot JSON fallback if needed (plan: read `variantSnapshot.productId` if present).
