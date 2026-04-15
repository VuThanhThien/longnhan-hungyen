---
title: 'Cart & Checkout — Concrete Implementation Steps'
description: 'Ordered task list with exact files, APIs, and edge cases for phases 1–6.'
status: in-progress
priority: P1
effort: 12h
branch: feature/cart-checkout
tags: [web, ecommerce, cart, checkout]
created: 2026-04-15
---

# Cart & Checkout — Implementation Steps

Parent plan: `plans/20260415-cart-checkout/plan.md`

---

## Step 1 — Extend `CartLine` + bump storage key ✅

**Status: COMPLETE**

**File:** `apps/web/src/services/cart/cart-store.ts`

✅ Extended `CartLine` with display fields (productName, productSlug, variantLabel, imageUrl)
✅ Bumped storage key to `'longnhan-cart-v2'`
✅ `upsertLine` accepts full snapshot and merges quantities
✅ Added `setQuantity(variantId, quantity)` with clamp & auto-remove at 0
✅ Added `SHIPPING_FLAT_VND = 30_000` to constants
✅ Extended `getCartTotals` return (though subtotalVnd computed inline in components)

---

## Step 2 — Cart line-item component ✅

**Status: COMPLETE**

**File:** `apps/web/src/components/cart/cart-line-item.tsx`

✅ Renders thumbnail, product name (linked to PDP), variant label, unit price, qty stepper
✅ Qty stepper with keyboard arrows, min 1, accessible aria-label
✅ Remove button with aria-label
✅ Line subtotal with tabular-nums styling

---

## Step 3 — `/cart` page (replace stub) ✅

**Status: COMPLETE**

**File:** `apps/web/src/app/cart/page.tsx` + `apps/web/src/components/cart/cart-page-content.tsx`

✅ Server component with client wrapper
✅ Empty state with "Xem sản phẩm" link
✅ Line items rendered via CartLineItem component
✅ Summary block: Tạm tính | Phí vận chuyển: 30.000 ₫ | Tổng cộng
✅ Coupon placeholder (disabled, "Sắp ra mắt")
✅ CTAs: "Tiếp tục mua hàng" → /products; "Thanh toán" → /checkout
✅ aria-live region for item count announcements

---

## Step 4 — Extract checkout form from `OrderForm` ✅

**Status: COMPLETE**

**Files:**

- `apps/web/src/components/checkout/checkout-customer-form.tsx` ✅
- `apps/web/src/components/checkout/checkout-order-summary.tsx` ✅

✅ Customer form extracted with name, phone, email, address, province, payment, notes
✅ Order summary component renders read-only line list, shipping 30k, totals
✅ Coupon placeholder in summary (disabled)

---

## Step 5 — `/checkout` page ✅

**Status: COMPLETE**

**Files:**

- `apps/web/src/app/checkout/page.tsx` ✅
- `apps/web/src/components/checkout/checkout-page-content.tsx` ✅

✅ Server component with metadata
✅ Client wrapper guards empty cart (redirect/message)
✅ Two-column layout (lg+): left = form, right = summary
✅ On submit: builds FormData with items, calls submitOrder
✅ Error display integrated

---

## Step 6 — PDP: remove `OrderForm`, add "Add to cart" ✅

**Status: COMPLETE**

**File:** `apps/web/src/app/products/[slug]/page.tsx`

✅ Removed OrderForm import and usage
✅ Added ProductAddToCart component (`apps/web/src/components/products/product-add-to-cart.tsx`)
✅ Uses VariantSelector, qty stepper
✅ "Thêm vào giỏ" button calls upsertLine with full snapshot
✅ Toast confirmation with aria-live announcement
✅ Optional "Thanh toán ngay" link to checkout

---

## Step 7 — Product card: no nested interactive ✅

**Status: COMPLETE**

**Files:**

- `apps/web/src/components/products/product-card.tsx` ✅
- `apps/web/src/components/products/variant-picker-sheet.tsx` ✅

✅ Card changed from Link wrapper to article
✅ Image + name in Link, price + "Thêm" button in footer
✅ Single-variant: button directly adds to cart
✅ Multi-variant: button opens variant picker sheet
✅ Variant picker: bottom sheet with VariantSelector, qty stepper, confirm
✅ No nested interactive elements (a11y fixed)

---

## Step 8 — Observability in `submitOrder` + clear cart on success ✅

**Status: COMPLETE**

**Files:**

- `apps/web/src/actions/order-actions.ts` ✅
- `apps/web/src/components/orders/order-success-cart-clearer.tsx` ✅
- `apps/web/src/app/order-success/page.tsx` ✅

✅ submitOrder logs success to Sentry with order_code tag
✅ Errors captured (non-PII) with order_submit:error tag
✅ NODE_ENV production gate applied
✅ isRedirectError guard prevents false error logging
✅ OrderSuccessCartClearer component clears cart on mount
✅ No PII in Sentry events

---

## Step 9 — Shared `QuantityStepper` extraction ✅

**Status: COMPLETE**

**File:** `apps/web/src/components/ui/quantity-stepper.tsx`

✅ Shared component with value, onChange, min/max, aria-label
✅ −/+ buttons with numeric display
✅ Keyboard: ArrowUp/Down, focus-visible ring
✅ Used by: CartLineItem, ProductAddToCart, VariantPickerSheet

---

## Step 10 — Polish & a11y pass ⚠️

**Status: NEEDS FINAL AUDIT**

Items to verify:

- [ ] All money values use `tabular-nums`
- [ ] aria-live regions on add-to-cart confirmation and header cart count
- [ ] Header cart button updates live (count badge)
- [ ] No nested button/link in product card (verified — refactored to article)
- [ ] Keyboard navigation through qty stepper, variant picker, cart page
- [ ] Stock messaging: out-of-stock variants greyed out with "(Hết hàng)"
- [ ] Visual alignment with Web Interface Guidelines (Vercel)
- [ ] Web design guidelines pass on touched files

---

## File Inventory

### New files (9)

| File                                               | Type   | Purpose                            |
| -------------------------------------------------- | ------ | ---------------------------------- |
| `components/cart/cart-line-item.tsx`               | client | Single cart row with qty/remove    |
| `components/cart/cart-page-content.tsx`            | client | Cart page client wrapper           |
| `components/checkout/checkout-customer-form.tsx`   | client | Customer + payment fields          |
| `components/checkout/checkout-order-summary.tsx`   | client | Read-only line list + totals       |
| `components/checkout/checkout-page-content.tsx`    | client | Checkout page client wrapper       |
| `app/checkout/page.tsx`                            | server | Route entry, metadata              |
| `components/products/product-add-to-cart.tsx`      | client | PDP variant+qty+add button         |
| `components/products/variant-picker-sheet.tsx`     | client | Modal/sheet for multi-variant pick |
| `components/ui/quantity-stepper.tsx`               | client | Shared qty ±1 control              |
| `components/orders/order-success-cart-clearer.tsx` | client | Side-effect: clear cart on mount   |

All paths prefixed with `apps/web/src/`.

### Modified files (7)

| File                                   | Change                                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| `services/cart/cart-store.ts`          | Extended `CartLine`, v2 key, `setQuantity`                 |
| `lib/constants.ts`                     | Add `SHIPPING_FLAT_VND`                                    |
| `app/cart/page.tsx`                    | Replace stub with `CartPageContent`                        |
| `app/products/[slug]/page.tsx`         | Remove `OrderForm`, add `ProductAddToCart`                 |
| `components/products/product-card.tsx` | Article wrapper, add-to-cart button, no nested interactive |
| `actions/order-actions.ts`             | Sentry success/failure/error + redirect guard              |
| `app/order-success/page.tsx`           | Embed `OrderSuccessCartClearer`                            |

### Deleted files (1)

| File                               | Reason                                                            |
| ---------------------------------- | ----------------------------------------------------------------- |
| `components/orders/order-form.tsx` | Replaced by `checkout-customer-form.tsx` (after checkout is live) |

---

## Execution Order

```
Step 1  Cart store v2 + SHIPPING_FLAT_VND constant
  ↓
Step 9  Shared QuantityStepper (needed by steps 2, 6, 7)
  ↓
Step 2  CartLineItem component
  ↓
Step 3  /cart page (uses CartLineItem + QuantityStepper)
  ↓
Step 4  Extract checkout form from OrderForm
  ↓
Step 5  /checkout page (uses extracted form + cart summary)
  ↓
Step 6  PDP: replace OrderForm with ProductAddToCart
  ↓
Step 7  Product card refactor + VariantPickerSheet
  ↓
Step 8  Sentry in submitOrder + OrderSuccessCartClearer
  ↓
Step 10 Polish & a11y audit
```

Steps 6 + 7 can run in parallel. Step 8 is independent of 6/7.

---

## Edge Cases

- **Storage key bump (v1→v2):** Zustand `persist` with new key = fresh store. Old `longnhan-cart-v1` data stays in `localStorage` unused (harmless). No migration needed.
- **Stale snapshot data:** If admin changes product name/price after user added to cart, cart shows stale info. Acceptable for v1; server recalculates real totals on order submit. Could add optional revalidation later.
- **Empty cart checkout guard:** `/checkout` must gracefully handle cart becoming empty mid-session (e.g. another tab cleared it). Show message + redirect to `/cart`.
- **`redirect()` in server action:** `redirect()` throws `NEXT_REDIRECT` error internally. The `catch` block in `submitOrder` MUST rethrow it via `isRedirectError()` check — otherwise Sentry logs false errors and the redirect silently fails.
- **Race condition — double submit:** `isPending` from `useTransition` already disables submit button. Sufficient for v1.
- **SSR hydration mismatch:** Cart store is client-only (`localStorage`). Cart components must be `'use client'` and handle initial render where `lines = []` before hydration. Use `useEffect` or Zustand's `onRehydrateStorage` if flicker is visible.

---

## Unresolved Questions

1. **Delete `order-form.tsx` immediately or keep as deprecated?** Recommend: keep until checkout is verified working, then delete in step 10.
2. **Order summary in checkout — editable quantities?** Plan says read-only summary + "Quay lại giỏ hàng" link. Recommend: read-only for v1.
3. **`order.total` field — items-only or items+shipping?** Plan flags this. Backend currently computes items-only total. For v1 (flat 30k), display shipping client-side only. Decide before GHN integration.
