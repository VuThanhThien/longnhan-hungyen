---
title: 'Bank transfer UX, product reviews, public order tracking'
description: 'Env-driven bank details; verified reviews with admin queue; order lookup by code+phone and optional email magic link.'
status: pending
priority: P2
effort: 20h
branch: master
tags: [feature, backend, web, admin, api, ecommerce]
created: 2026-04-15
---

# Bank transfer, Google-style ratings, order tracking

## Overview

Extend storefront + API so customers: **pay by bank** with configurable instructions (manual reconciliation); **rate products** (Maps-like: stars + text, aggregate on PDP) after **verified delivery**; **track orders** via **order code + full phone** or **email magic link**. **No** automated payment gateway in v1. **No** email when status changes (only magic-link delivery). **Reviews** go to **admin queue** before public.

## Locked decisions (from stakeholder)

| Topic                | Decision                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Bank (v1)            | Manual reconciliation; real bank details from **env** (or shared config); admin marks **paid** in admin panel   |
| Reviews              | **Verified purchase only** (`orderStatus = delivered`, item’s product/variant in that order)                    |
| Tracking             | **Both:** instant lookup **order code + full phone**; **magic link** to email when order has **matching email** |
| Review moderation    | **Queue** — publish only after admin approves                                                                   |
| Status notifications | **None** (customer refreshes tracking page)                                                                     |

## Current codebase anchors

- Orders: `OrderEntity` has `code`, `phone`, `email`, `orderStatus`, `paymentStatus`, `paymentMethod`; `POST /v1/orders` public; admin `PATCH …/status`.
- Checkout: `bank_transfer` + `QrPaymentInfo` (placeholder bank data — replace with env).
- No public `GET` order by code; no reviews tables.

## Phases

| #   | Phase                                 | Status  | Effort | Link                                            |
| --- | ------------------------------------- | ------- | ------ | ----------------------------------------------- |
| 1   | Public order tracking (API + web)     | Pending | 6h     | [phase-01](./phase-01-public-order-tracking.md) |
| 2   | Bank transfer config + storefront UX  | Pending | 3h     | [phase-02](./phase-02-bank-transfer-env-ux.md)  |
| 3   | Product reviews (DB, API, admin, web) | Pending | 9h     | [phase-03](./phase-03-product-reviews.md)       |
| 4   | Security, types package, tests        | Pending | 2h     | [phase-04](./phase-04-security-types-tests.md)  |

## Dependencies

- Phase 2 can parallel Phase 1 after shared types touchpoints agreed (minimal).
- Phase 3 depends on Phase 1 for consistent `packages/types` order DTOs if extended.
- Phase 4 last.

## Risks

- **Enumeration** on lookup/magic-link: same generic error + **rate limits** (IP + key).
- **Magic link** without order email: return clear message “Thêm email khi đặt hàng…” — cannot send.
- **`OrderStatus` enum** duplicates `PROCESSING`/`SHIPPING` string — normalize when touching status labels.

## Definition of done

- [ ] Lookup returns masked-safe payload; wrong code/phone yields no leak.
- [ ] Magic link email uses existing Mail + Bull queue pattern; token TTL + one-time use.
- [ ] Bank details from env; no secrets in repo.
- [ ] Reviews: create → pending; admin publishes; PDP shows aggregates for approved only.
- [ ] Lint/tests for new API paths; Swagger updated.
