---
title: Brainstorm — PDP reviews & rating flow
date: 2026-04-19
scope: apps/web PDP + apps/api reviews + deferred order history page
status: proposed
---

## Problem statement

PDP review UX weak: reviews hidden behind tab; write form (Order UUID, phone, number input for stars) appears before review list; list shows only rating/date/comment — no masked identity, no purchased variant. Users do not know order UUID; need device-local saved orders + picker. Need star UI (not `<input type="number">`), display name, anonymous option (default off → show masked identity; on → show fixed anonymous label). Order history as full page: **out of scope for this iteration**, only hooks + copy pointing to future route.

## Current context (codebase)

- **Web**: `ProductReviewsTab` in `apps/web/src/components/products/product-pdp-tabs.tsx` — tabs default `description`; reviews tab loads `GET /v1/products/:id/reviews`, posts `orderId`, `phone`, `rating`, `comment`.
- **API**: `ReviewsService.createProductReview` validates delivered order, phone match, product in order items via `variantSnapshot.productId`; `ProductReviewEntity` has `productId`, `orderId`, `rating`, `comment`, `status` only. `listPublishedReviews` returns minimal public items.
- **Order items**: `variantSnapshot` includes `label`, `productId`, etc. (`orders.service.ts`).
- **Migrations**: entity changes → `pnpm run migration:generate` in `apps/api` (no hand-written migrations).

## User stories

1. As shopper on PDP, I see aggregate rating + published reviews (avatar row, masked name + masked phone, stars, variant bought, comment, date) **without opening a tab first**.
2. As shopper, I scroll to “Viết đánh giá”: display name (required if not anonymous), interactive stars, phone, order chosen from **saved-on-this-device** orders containing this product — not raw UUID typing.
3. As shopper, I can check “Bình luận ẩn danh” (default unchecked); if checked, public label is anonymous (e.g. **Ẩn danh**), name field ignored for display.
4. As shopper, after checkout I can save order reference to device (separate small UX) so future reviews can use picker.
5. Later: dedicated order history page — not in this release; link/placeholder acceptable.

## Evaluated approaches

### A — Full-width reviews section on PDP (recommended)

Move reviews out of `ProductPdpTabs`; keep tabs for Mô tả / Thông tin bổ sung only. New `ProductReviewsSection` under image+hero grid, order: summary strip → review cards → write form. Pros: matches “see reviews first”; one scroll. Cons: longer page.

### B — Default tab to reviews when `ratingCount > 0`

Minimal code move. Pros: fast. Cons: still tab chrome; description hidden; does not fix “form before list” inside tab.

### C — Sticky sub-nav with anchor #reviews

Adds complexity. Pros: deep-link. Cons: more UI work for marginal gain — defer anchor until section exists (can add `id="reviews"` on section).

**Choice:** **A**.

## Final design

### Information architecture (PDP)

1. Breadcrumb + product grid (unchanged).
2. **`ProductReviewsSection`** (new client island):
   - Header: avg stars, count, optional histogram later (YAGNI).
   - **List first**: card stack — star row, masked `reviewerLabel` (e.g. `Nguy***Anh (084***567)` or single line per product copy), `variantLabel`, comment, relative/date.
   - **Form below**: title “Viết đánh giá”, short trust copy, fields: Tên hiển thị (required if not anonymous), Sao (component), SĐT, Đơn hàng (Select from saved + “Nhập mã đơn…” fallback optional), Nhận xét, checkbox “Bình luận ẩn danh”, submit.
3. `ProductPdpTabs` — remove reviews tab + related types.

### Backend contracts

**Create review `POST` body extensions:**

- `displayName` — string, required when `isAnonymous === false`; max length e.g. 80; trim; reject if looks like full phone.
- `isAnonymous` — boolean, default `false`.

On create (still pending until admin publish):

- Resolve matching `OrderItemEntity` for `productId`; read `variantSnapshot.label` → store **`variantLabelSnapshot`** on review row (string).
- If `isAnonymous`: set stored public display fields to show anonymous only (no masks).
- If not anonymous: compute **`maskedDisplayName`** and **`maskedPhone`** from `displayName` + normalized order phone using fixed rules (document in code): e.g. name keep first 3 + `***` + last 2 if length ≥ 6 else simpler; phone `0xx***xxx` last 3 digits.

Persist snapshots on `product_review` so published list stable if order data changes.

**Public list item fields (add to DTO):**

- `rating`, `comment`, `createdAt` (existing)
- `reviewerLabel` — string (either `"Ẩn danh"` or combined masked line per agreed format)
- `variantLabel` — string | null

**Admin:** extend `ProductReviewResDto` / admin UI to show `displayName` raw? Only if moderators need it — can show pending row with internal note; optional phase-1 admin column for `variantLabelSnapshot`.

### Masking rules (concrete)

- **Phone** (VN): normalize to `0xxxxxxxxx`; display `0xx***` + last 3 digits (user example `084***456` — align to `084` prefix style if order stored with 84).
- **Name**: trim; if length ≤ 4 show `***` + last char; else `prefix***suffix` with prefix length 3–4 and suffix 2–3 chars (product decision: implement one function, unit-test).

### Frontend components

- **`StarRatingInput`**: 5 clickable stars + keyboard (optional); controlled `value` 1–5.
- **`SavedOrderPicker`**: reads `localStorage` key e.g. `ln_saved_orders_v1`; filters entries where `lineItems` contains `productId`; shows `orderCode` + masked phone + variant label for product; on select fills hidden `orderId` + phone for submit.
- **`useSavedOrders` hook** + **`saveOrderToDevice`** called from order success/thank-you route when exists (if no dedicated page yet, document in plan: wire when checkout success view exists).

### Anonymous copy

- Checkbox label: `Bình luận ẩn danh`.
- Published label when checked: **`Ẩn danh`** (Vietnamese primary); avoid typo “Annonymous” in UI.

### Security / privacy

- Never expose full phone/name on public list; only masked snapshots on entity.
- localStorage holds `orderId` + `phone` for convenience — same trust model as today’s manual entry; document in README/plan for users on shared devices.

### Out of scope (explicit)

- Authenticated account order list from server.
- Full **order history page** — separate project; add TODO link “Lịch sử đơn (sắp có)” or hide until route exists.

## Error handling

- API unchanged errors for invalid order/phone/product.
- New validation: `displayName` required when `!isAnonymous`; `displayName` max length; optional profanity filter YAGNI.
- Empty saved orders: show helper text + optional collapsible manual UUID (behind “Không tìm thấy đơn đã lưu?”) to avoid blocking power users — product call; default **no** manual UUID in MVP to push saved-order flow.

## Testing strategy

- API unit tests: masking helpers, create with variant snapshot, anonymous vs named.
- Web: component test for `StarRatingInput`; smoke test saved-order filter util.
- Manual: publish review in admin → PDP list shows new fields.

## Success metrics

- Reviews visible without tab click.
- Form uses stars + order picker when saved data exists.
- Published cards show variant + masked identity or Ẩn danh.

## Risks

- Migration + DTO sync across `packages/types` if shared types used for API responses on web.
- Existing published reviews have no snapshot columns → migration backfill: **approved** — null variant shows **“—”**; missing public label shows **“Khách hàng”**.

---

Spec self-review: scope single PDP+API; order history deferred; masking rules fixed; no TBD left for MVP beyond optional manual UUID.
