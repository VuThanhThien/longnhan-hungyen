# Phase 01 — Public order tracking (API + web)

## Priority

P1 within this plan (foundation for trust).

## Overview

Add **guest-safe** order read: **POST** `…/orders/lookup` with `code` + `phone` (normalize VN formats). Add **POST** `…/orders/request-tracking-link` with `code` + `email` — if email matches order row, enqueue email with **one-time** link. **GET** `…/orders/track-by-token` (or web route handler that calls API) with opaque token returns same summary DTO.

## Requirements

**Functional**

- Normalize phone: strip spaces, handle `0…` vs `84…` consistently; compare to stored `order.phone`.
- Lookup response: `code`, `orderStatus`, `paymentStatus`, `paymentMethod`, `total`, `createdAt`, line items summary (names from snapshot), **no** full address if minimizing PII (product decision: can show province only or omit — **recommend:** city/province + masked address e.g. first line only).
- Wrong pair: HTTP 404 + generic message (no “phone wrong” vs “code wrong”).
- Magic link: only if `order.email` equals normalized input email (case-fold); if order has `email: null`, respond 400 with guidance to use phone lookup or contact support.
- Token: store **hash** in DB table `order_tracking_token` (`order_id`, `token_hash`, `expires_at`, `used_at`) or Redis with TTL; plain token only in email URL once.

**Non-functional**

- Rate limit: e.g. `@nestjs/throttler` or Redis sliding window per IP + per `code` prefix.
- Token TTL: 24–72h; single use.

## Architecture

```text
Web /track-order  →  POST lookup (server action or Route Handler → API)
Web "Gửi link"      →  POST request-tracking-link → Bull email job
Email link          →  Web /track-order?t=…  →  API exchanges token → summary (or SSR fetch)
```

Prefer **server-side** calls to Nest from Next (existing `apiServer` pattern) so secrets stay server-side.

## Related code files

**Create**

- `apps/api/src/api/orders/dto/lookup-order.req.dto.ts`
- `apps/api/src/api/orders/dto/request-tracking-link.req.dto.ts`
- `apps/api/src/api/orders/dto/public-order-summary.res.dto.ts` (explicit expose)
- `apps/api/src/api/orders/entities/order-tracking-token.entity.ts` + migration
- `apps/api/src/mail/templates/order-tracking-link.hbs` (or similar)
- `apps/web/src/app/track-order/page.tsx`
- `apps/web/src/components/orders/order-track-form.tsx` (and magic-link subform)

**Modify**

- `apps/api/src/api/orders/orders.controller.ts` — new `@ApiPublic` routes; **do not** expose admin list.
- `apps/api/src/api/orders/orders.service.ts` — lookup + token issue/consume.
- `apps/api/src/constants/job.constant.ts` — `ORDER_TRACKING_LINK` job name.
- `apps/api/src/background/queues/email-queue/email.processor.ts` — switch branch.
- `apps/api/src/mail/mail.service.ts` — `sendOrderTrackingLink(email, url)`.
- `apps/web/src/app/order-success/page.tsx` — link “Tra cứu đơn hàng” → `/track-order?code=…`.
- `packages/types/src/order.ts` — public summary types if needed.

## Implementation steps

1. Add migration: `order_tracking_token` with indexes on `token_hash`, `order_id`.
2. Phone normalize helper (shared util in API `common` or orders module).
3. `OrdersService.lookupByCodeAndPhone` — transaction read; map to `PublicOrderSummaryResDto`.
4. `requestTrackingLink` — validate email match; generate random token; hash with SHA-256; save; queue email with `WEB_PUBLIC_URL/track-order?t=…`.
5. `consumeTrackingToken` — hash lookup; check expiry/used; mark `used_at`; return same DTO as lookup.
6. Register ThrottlerModule (or custom guard) on these three endpoints.
7. Web: forms + error states; a11y; no PII in client logs.
8. Swagger + e2e/unit tests for happy path + 404 + rate limit smoke.

## Success criteria

- Manual test: create order in dev → lookup by code+phone → see status.
- Email in MailDev contains link → opens tracking with token.
- Token reuse fails after first success.

## Security

- Never log full phone/email in production info-level logs.
- Constant-time compare optional for token hash compare (crypto.timingSafeEqual on buffers).
