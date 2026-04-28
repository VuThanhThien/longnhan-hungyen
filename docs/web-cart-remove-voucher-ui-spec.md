# Spec: Remove voucher UI from `/cart` (voucher applies only on `/checkout`)

## Problem

`/cart` currently shows a disabled voucher input labeled “Mã giảm giá (sắp ra mắt)”, implying vouchers are not implemented. Meanwhile `/checkout` already implements voucher validation + display via `validateVoucher` and `CheckoutVoucherInput`.

Users asked to “implement voucher on cart + sync checkout”, but voucher rules are complex (phone-dependent validation, cart edits invalidating discounts). Product decision: **do not implement voucher application on `/cart`**.

## Goals

- Remove misleading “coming soon” voucher UI from `/cart`.
- Keep **single place** to apply vouchers: `/checkout`.
- Avoid introducing cart↔checkout voucher state that must stay synchronized.

## Non-goals

- Adding voucher persistence to `useCartStore` / localStorage for “applied voucher”.
- Duplicating server validation UX on `/cart`.
- Changing voucher API contracts (`POST /vouchers/validate` via `validateVoucher`).

## User stories

- As a shopper, I don’t see a fake/disabled voucher feature on cart.
- As a shopper, I apply vouchers during checkout where phone + totals are collected.
- As product/engineering, we avoid inconsistent totals between cart preview and checkout.

## Approaches considered

### A) Remove voucher section from `/cart` (chosen)

Pros: simplest; no misleading UI; no sync problem  
Cons: voucher discovery only at checkout

### B) Keep voucher box but redirect/CTA to checkout

Pros: more discoverable  
Cons: extra UI; user chose **not** to do this

### C) Implement voucher on `/cart` + sync to checkout

Pros: faster perceived checkout  
Cons: duplicate validation paths; phone requirement mismatch; high bug risk

## Final design

### UX / IA

- `/cart` order summary shows:
  - subtotal
  - shipping (flat)
  - grand total
  - primary CTA **Thanh toán** → `/checkout`
  - secondary **Tiếp tục mua hàng** → `/products`
- **No voucher input, no “Áp dụng”, no “coming soon” copy.**

### Checkout behavior (unchanged)

- Voucher entry remains in checkout flow (`CheckoutVoucherInput`).
- Validation continues to require **phone** + **order total** context (as today).
- Cart edits during checkout can clear voucher (existing `useEffect` on subtotal change).

### Data flow / state

- No shared “applied voucher” between `/cart` and `/checkout` besides the natural cart lines persisted in `useCartStore`.
- **No additional synchronization requirement**: voucher applies only after navigating to `/checkout`.

## Error handling / edge cases

- If user edits cart after applying voucher on checkout, voucher may clear (existing behavior). This remains acceptable; no cart-side voucher to reconcile.

## Testing / QA

Manual:

- `/cart` has **no** voucher UI block.
- `/checkout` voucher apply/remove still works.
- Order submission still sends `voucherCode` when applied (existing `submitOrder` wiring).

## Implementation notes (for planning)

Touch points likely limited to:

- `apps/web/src/components/cart/cart-page-content.tsx` — remove disabled voucher block.

No API changes expected.

## Success criteria

- `/cart` no longer advertises vouchers as upcoming/disabled.
- Checkout remains the only voucher application surface.
- No user expectation that cart “applied voucher” carries forward (because it doesn’t exist).

## Open questions

None (scope explicitly narrowed by product decision).
