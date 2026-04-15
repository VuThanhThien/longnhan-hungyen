---
title: 'Cart, checkout, and add-to-cart (guest, client-side cart)'
description: 'Wire Zustand cart to UI; /cart + /checkout; add-to-cart on PDP and product cards; align with order API.'
status: pending
priority: P1
effort: medium
branch: feature/cart-checkout
tags: [web, ecommerce, ux]
created: 2026-04-15
updated: 2026-04-15
---

# Cart, checkout, and add-to-cart

## Overview

Storefront today: **order API + server action** (`submitOrder`) already accept multiple `items: { variantId, qty }[]`; **server recomputes** line subtotals from DB (`OrdersService.create`) — client prices are display hints only. **Zustand + `persist`** (`localStorage`, key `longnhan-cart-v1`) exists with `CartLine` `{ variantId, quantity, unitPriceVnd }` but **only the header** uses totals; **`/cart` is a stub**; **PDP embeds full `OrderForm`** — **to be removed**; flow becomes **cart → checkout** only.

Goal: **Add to cart** from listing + PDP, **review cart** on `/cart`, **checkout** on `/checkout` with **summary + shipping breakdown**, **guest / no DB cart**, **clear cart after successful order**, **Sentry** visibility on order submit outcomes.

## Locked product decisions

| Topic                            | Decision                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PDP**                          | **Remove** large inline `OrderForm`. PDP = discovery + **Add to cart** (+ qty / variant on PDP). Checkout only on `/checkout`.                                                                                                                                                                                                                                |
| **Product card (multi-variant)** | **Open a picker** (modal/sheet) to choose variant before add — do **not** auto-pick cheapest.                                                                                                                                                                                                                                                                 |
| **After order**                  | **Clear cart** on successful submit (client after redirect to `order-success`, or reliable equivalent).                                                                                                                                                                                                                                                       |
| **Coupon (mã ưu đãi)**           | **Placeholder UI only** in cart/checkout (disabled or non-submitting). **Full coupon feature** → separate later plan (API, validation, admin).                                                                                                                                                                                                                |
| **Shipping (v1)**                | **Hard-coded `30_000` VND** flat fee in storefront `constants` (or single source used by `/cart` + `/checkout` summary). Shown in UI as subtotal + shipping = **grand total** (customer-facing).                                                                                                                                                              |
| **Shipping (later)**             | Replace constant with **GHN [Calculate Fee](https://api.ghn.vn/home/docs/detail?id=76)** (`POST .../v2/shipping-order/fee`) — needs Token, ShopId, `to_district_id`, `to_ward_code`, weight/dimensions, optional `service_id`, etc. Document follow-up: map customer address → GHN district/ward IDs (GHN address APIs), aggregate cart weight from variants. |
| **Order DB `total` vs shipping** | Until GHN + persisted fees: **confirm** whether `order.total` stays **items-only** or migration adds `shipping_fee` + revised `total` — **decide before** persisting GHN fee in backend.                                                                                                                                                                      |

## Decisions (technical)

| Approach                                                                                                              | Pros                                            | Cons                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| **A — Extend client cart snapshot** (add `productName`, `imageUrl`, `variantLabel`, `productSlug` to persisted lines) | Cart page renders without extra API calls; fast | Stale data if admin edits; optional revalidate on cart load |
| **B — Store only variantIds; fetch on cart**                                                                          | Always fresh                                    | More API calls                                              |
| **Recommendation:** **A** for v1                                                                                      |

| Storage                                          | Notes                              |
| ------------------------------------------------ | ---------------------------------- |
| **`localStorage` via Zustand persist** (current) | Keep; no cookie requirement for v1 |

## Shipping implementation phases

1. **Now:** `SHIPPING_FLAT_VND = 30_000` (name TBD) in `apps/web/src/lib/constants.ts` (or dedicated `shipping.ts`). Cart + checkout show **Tạm tính**, **Phí vận chuyển**, **Tổng cộng** = items + 30k.
2. **Later:** Server or Route Handler proxy to GHN fee API (avoid exposing Token client-side); inputs from checkout address + cart weight. Ref: [GHN Calculate Fee](https://api.ghn.vn/home/docs/detail?id=76) — response `data.total` as fee; handle errors + fallback.

## Coupon (deferred)

- v1: **UI placeholder** only (label + input + “Áp dụng” disabled or toast “Sắp ra mắt”).
- Later plan: coupon codes, eligibility, API, admin, GHN `coupon` field if integrated.

## Web Interface Guidelines (Vercel)

Apply during implementation: **semantic table vs card stack**, **icon buttons** `aria-label`, **quantity steppers** keyboard + focus-visible, **`aria-live="polite"`** on add-to-cart, **tabular-nums** for money, **modal/sheet** for variant picker (`overscroll-behavior`, focus trap), **no nested button-in-link** on product card.

## UX alignment

- **`/cart`:** lines, qty, remove; subtotal; **shipping 30k**; grand total; **coupon placeholder**; continue shopping → `/products`; checkout → `/checkout`.
- **`/checkout`:** fields from extracted `OrderForm`; order summary sidebar; submit → `submitOrder`.
- **PDP:** images, info, variant + qty, **Add to cart** → cart; link to checkout optional (“Thanh toán”).
- **Product card:** link to PDP + **Add to cart** opens **variant picker** if `variants.length > 1`.

## Phases

| #   | Phase                           | Deliverables                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Cart line model + migration** | Extend `CartLine` with display fields; bump storage key if needed (`longnhan-cart-v2`); `upsertLine` accepts snapshot                                                                                                                                                                                                                                                                                                                                                                      |
| 2   | **`/cart` page**                | Responsive line list; qty; remove; subtotal; **shipping 30k**; total; **coupon placeholder**; CTAs; empty state                                                                                                                                                                                                                                                                                                                                                                            |
| 3   | **`/checkout` page**            | Extract checkout form from `order-form.tsx`; load `items` from cart; summary; **remove `OrderForm` from PDP**; wire product detail to **Add to cart** only                                                                                                                                                                                                                                                                                                                                 |
| 4   | **Product card + picker**       | Split card layout (no button inside `<Link>`); **variant picker** modal for multi-variant; single-variant can add directly                                                                                                                                                                                                                                                                                                                                                                 |
| 5   | **Submit + observability**      | **`submitOrder`:** Sentry **success** (e.g. `captureMessage` / structured event with order code hash or no PII), **failure** (API non-2xx, validation), **error** (`captureException`). **Clear cart** after success (e.g. `order-success` client effect calling `useCartStore.getState().clear()`). App already has `@sentry/nextjs` — use **server-safe** APIs in the server action (`import * as Sentry from '@sentry/nextjs'`), gate with `NODE_ENV === 'production'` like `error.tsx` |
| 6   | **Polish**                      | Stock/price messaging; web-design-guidelines pass on touched files                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7   | **Future (separate)**           | GHN fee API; optional DB `shipping_fee`; coupon backend                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Risks

- **Next.js `redirect()`** throws a special error — do **not** log it as failure to Sentry; log success **before** `redirect()`, or use `catch` that **rethrows** redirect errors (see Next.js `isRedirectError` / redirect handling docs).
- **PII:** Sentry events must **not** include full phone/address; use tags `order_submit:success|failed` and optional `order_code` only after success.
- **Price drift:** Server remains source of truth for line totals.

## Definition of done

- [ ] Add to cart from PDP and listing; picker when multiple variants.
- [ ] `/cart` + `/checkout` with **30k** shipping in summary; coupon row is placeholder only.
- [ ] PDP **without** inline full order form.
- [ ] Successful order **clears** persisted cart.
- [ ] `submitOrder` emits **success / failed / error** to Sentry (production-gated).
- [ ] No nested interactive controls in product card (a11y).

## References

- `apps/web/src/services/cart/cart-store.ts`
- `apps/web/src/components/orders/order-form.tsx`
- `apps/web/src/actions/order-actions.ts`
- `apps/web/sentry.server.config.ts` — Sentry server init
- `apps/api/src/api/orders/orders.service.ts`
- [GHN — Calculate Fee API](https://api.ghn.vn/home/docs/detail?id=76)
- Web Interface Guidelines: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`

## Next step

Implement phases 1–6; GHN + coupon backend as follow-up plans.
