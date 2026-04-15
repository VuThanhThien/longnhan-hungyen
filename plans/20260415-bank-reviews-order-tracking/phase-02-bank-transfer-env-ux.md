# Phase 02 — Bank transfer configuration + storefront UX

## Priority

P2 — quick win; reduces support mistakes.

## Overview

Replace **hardcoded** Vietcombank placeholders in `QrPaymentInfo` with values from **environment variables** (validated at startup or read in server component). Success and checkout pages show **order code** in transfer content (already partially supported via `orderCode` prop). Document required env keys in `apps/web/.env.example` and root `.env.example`.

## Requirements

**Functional**

- Env keys (example names — align with existing `ConfigService` pattern if web uses server-only env): bank name, account number, account holder, optional **QR image URL** (if no image, show text-only instructions).
- Checkout: when `bank_transfer` selected, show dynamic amount + **memo = order code** only **after** order created — today QR block may show before submit; **adjust** so bank instructions on checkout use **cart total** as estimate and **success page** shows **final** order code + amount (already redirect with `code` query).
- Align copy: “Chuyển khoản trong 24h” + what happens next.

**Non-functional**

- No secrets committed; document placeholder values for local.

## Related code files

**Modify**

- `apps/web/src/components/orders/qr-payment-info.tsx` — accept props from env-backed loader or `getBankTransferConfig()` in `lib/`.
- `apps/web/src/components/checkout/checkout-customer-form.tsx` — pass estimated total; ensure success flow uses real `code` from redirect.
- `apps/web/src/app/order-success/page.tsx` — embed `QrPaymentInfo` with `orderCode` + **server-read** bank config when payment method was bank (needs payment method on success: either pass `?payment=bank_transfer` from redirect or fetch order by code — **prefer** query param from `submitOrder` redirect extension: `order-success?code=&pm=bank_transfer` to avoid extra API).

**Optional small API change**

- `submitOrder` redirect URL includes `paymentMethod` query for success page bank block — **no DB call** on success page.

## Implementation steps

1. Add `lib/bank-transfer-public-config.ts` (or under `lib/constants`) reading `process.env.NEXT_PUBLIC_…` vs server-only — **prefer server components** for non-public bank account (account number) — do **not** expose in client bundle if avoidable: load bank details in **server component** parent and pass as props to `QrPaymentInfo`.
2. Update `order-actions.ts` redirect to append `pm=` when present in form.
3. `order-success`: read `searchParams`; if `pm=bank_transfer`, render `QrPaymentInfo` with `orderCode` + total — total may need query `total=` from submit response or second fetch — **simplest:** extend API create response already returns order; pass `total` as query param from server action redirect (encode) or fetch public order by code+phone not available without phone — **easiest:** add optional `totalVnd` to redirect query from `submitOrder` after API returns `{ code, total }` (check `OrderResDto`).
4. Document env vars.

## Success criteria

- Production can set real bank data without code change.
- Success page shows correct amount + code for bank transfer orders.

## Risks

- **PII in URL:** avoid putting phone in query; `total` + `code` is acceptable for success page.
