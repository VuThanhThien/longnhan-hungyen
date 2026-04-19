---
title: PDP product reviews & rating enhancement
date: 2026-04-19
status: completed
spec: docs/brainstorm-2026-04-19-product-reviews-rating-pdp.md
---

## Goal

Improve PDP review experience: visible review list first (rich cards), write-review form below with star picker, display name, anonymous checkbox, saved-order picker; extend API + DB for display snapshots. Defer dedicated order history page.

## Preconditions

- Read spec: `docs/brainstorm-2026-04-19-product-reviews-rating-pdp.md`.
- Migrations: **only** `pnpm run migration:generate` from `apps/api` after entity edits; ask before `migration:up`.

## Phase 1 — Data model & API

1. **Entity** `ProductReviewEntity` (`apps/api/src/api/reviews/entities/product-review.entity.ts`): add nullable/string + boolean columns, e.g.
   - `isAnonymous` (bool, default false)
   - `variantLabelSnapshot` (varchar/text, nullable)
   - `publicReviewerLabel` (varchar ~120) — computed at create: `"Ẩn danh"` or masked composite
   - Optional split: `maskedName` + `maskedPhone` if admin needs separately; else single `publicReviewerLabel` is enough for web.

2. **Generate migration**  
   `cd apps/api && pnpm run migration:generate src/database/migrations/AddProductReviewDisplayFields`

3. **DTOs**
   - `CreateProductReviewReqDto`: add `displayName` optional string; `isAnonymous` boolean (default false). Validation: if `!isAnonymous` then `displayName` required, trimmed, max length.
   - `PublicProductReviewResDto` + list mapping: expose `reviewerLabel`, `variantLabel` (from snapshots).

4. **Service** `createProductReview`
   - After order/item validation, pick first matching item for `productId`, read `variantSnapshot.label`.
   - Implement `buildPublicReviewerLabel({ isAnonymous, displayName, orderPhone })` in small util file + unit tests.
   - Save new fields; keep unique `(orderId, productId)`.

5. **Service** `listPublishedReviews`
   - Map entity fields to public DTO (include new fields).

6. **Backfill behavior**
   - Existing rows: `publicReviewerLabel` null → mapper returns **`"Khách hàng"`**; `variantLabelSnapshot` null → public **`variantLabel`** **`"—"`** (locked with stakeholder).

7. **Admin** (minimal): ensure admin list still loads; extend DTO if admin needs new columns for moderation (optional in phase 1).

## Phase 2 — Web PDP layout & UI

1. **New component** `ProductReviewsSection` (client), props: `productId`, `productName` optional for empty states.
   - Layout: section heading → aggregate row → **review list** (redesigned cards: stars component read-only, `reviewerLabel`, `variantLabel`, comment, date) → **form** card below.
   - Use existing `fetchApi` patterns + Sentry capture keys.

2. **Edit** `apps/web/src/app/products/[slug]/page.tsx`: render `<ProductReviewsSection productId={...} />` **between** main grid and `<ProductPdpTabs />`.

3. **Edit** `ProductPdpTabs`: remove `reviews` tab and `ProductReviewsTab` import; only description + extra.

4. **`StarRatingInput`**: new under `components/ui/` or `components/products/` — controlled 1–5, a11y (`role="radiogroup"` or buttons with `aria-pressed`).

5. **Form fields**: display name input; phone; `StarRatingInput`; comment; checkbox “Bình luận ẩn danh” default `false`; disable/hide name when anonymous checked (or ignore value server-side).

6. **`SavedOrderPicker`**:
   - Define `SavedOrderV1` type + `localStorage` key constant.
   - `useMemo` filter where `lineItems.some(p => p.productId === productId)`.
   - Select sets internal state for `orderId` + `phone`.
   - Empty state: short instruction + link text for future `/orders` or “Lưu đơn sau khi đặt hàng”.

## Phase 3 — Save order to device

1. Locate checkout success / thank-you UI (order create response includes `id`, `code`, `phone`). If missing, add minimal success step on web that calls `saveOrderToDevice` when user clicks “Lưu đơn để đánh giá sau”.
2. Payload: `{ orderId, code, phone, savedAt: ISO, lineItems: { productId, variantLabel }[] }` from API response mapping.

## Phase 4 — Types & admin alignment

1. **`@longnhan/types`**: extend public review type if web imports shared type for reviews; else keep local types in sync manually.
2. **Admin reviews table**: optional column variant + public label for approve context.

## Phase 5 — QA

1. Create order (staging) → deliver (admin) → save to device → post review named + anonymous.
2. Approve in admin → verify PDP list order and labels.
3. Regression: description/extra tabs still work.

## Deferred (do not implement in this plan)

- Full **order history** page (`/orders` or similar): separate plan; only prepare copy/storage so migration is easy.

## Cook handoff

After approval, run implementation via cook using this plan path:

`/cook /Users/vuthanhthien/Documents/Coding/Vibe/longnhantongtran/docs/plan-2026-04-19-product-reviews-pdp.md`

(Or open the file in workspace and pass its path.)
