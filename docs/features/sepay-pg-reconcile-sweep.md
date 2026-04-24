# SePay PG hourly reconcile sweep (design spec)

## Problem

SePay **IPN** can be missed (downtime, timeouts, retry exhaustion). Today only IPN + `order.retrieve` in `PaymentsService.handleSepayIpn` marks bank-transfer orders **PAID / CONFIRMED**. Missed IPN leaves a legitimately paid checkout stuck **PENDING**.

## User stories

- As **ops**, I want **hourly** automatic reconciliation so paid SePay checkouts become **CONFIRMED** without manual DB edits when IPN failed.
- As **admin**, if I **cancel** an order, I want the system to **never** auto-mark it paid from SePay (internal cancel wins; edge case: pay-after-cancel → manual handling).

## Decisions (locked)

| Topic                    | Choice                                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SePay surface            | **PG only** — `sepay-pg-node` `order.retrieve`, same credentials as checkout/IPN. **No** User API token / `userapi/transactions/list`.                                                                           |
| Work unit                | **One sweep job per tick** — single BullMQ job loads batch, processes in-process (sequential or small controlled concurrency).                                                                                   |
| Schedule                 | **Hourly** repeat (cron `0 * * * *` or equivalent).                                                                                                                                                              |
| Candidate window         | Orders with `created_at` within **last 24 hours**.                                                                                                                                                               |
| Batch cap                | **200** orders max per sweep, **FIFO** (`created_at` ASC).                                                                                                                                                       |
| Terminal / business rule | **Exclude** `order_status = cancelled` and any row not eligible below. **Defense in depth:** query filter + **re-read before write**; abort if status changed to **cancelled** or payment no longer **pending**. |
| Infra                    | **BullMQ** for execution + **repeatable job** for hourly tick (avoids adding `@nestjs/schedule` unless you prefer Nest cron later).                                                                              |

## Eligibility (candidate query)

Include only rows where auto PG sync is meaningful and aligned with hosted checkout:

- `payment_method = bank_transfer`
- `payment_status = pending`
- `order_status = pending` (excludes **cancelled** and anomalous `confirmed|shipping|delivered` + unpaid)
- `sepay_transaction_id IS NULL` (already reconciled → skip)
- `created_at >= now() - interval '24 hours'`
- `ORDER BY created_at ASC LIMIT 200`

## Data flow

1. **Repeatable job** fires hourly → adds **sweep** job to new queue (e.g. `sepay-reconcile`).
2. **Processor** runs query → for each `order.id`:
   - `findOne` fresh row (or transactional re-read).
   - If not still eligible → **skip** (log `debug`).
   - `SepayService.verifyOrderPayment(order.code)` (extend to return **transaction id** + **paidAt** when present in PG retrieve payload — required for same idempotency as IPN on `sepay_transaction_id`).
   - If PG says not paid / mismatch → **skip** (log `warn`/`error` as today).
   - If paid: call **shared** apply path (same DB updates as IPN: order, transaction, status history).

## Shared apply path (DRY with IPN)

Extract from `PaymentsService.handleSepayIpn` a single internal method, e.g. `applyVerifiedSepayCapture(orderId, { sepayTransactionId, paidAt })`, containing the existing `dataSource.transaction` block (order update, `TransactionEntity`, `OrderStatusHistoryEntity`).

- **IPN** supplies `sepayTransactionId` / `paidAt` from DTO after verify.
- **Sweep** supplies values from **extended** `verifyOrderPayment` (or from raw retrieve parse).

Unique index `UQ_order_sepay_transaction_id` must remain satisfied: never insert duplicate `sepay_transaction_id`; if another path won the race, second attempt hits idempotent branch.

## Error handling

- **PG / network errors:** log + continue next order (partial progress OK); job completes unless you choose fail-fast (prefer **continue** for sweep).
- **Cancelled race:** second read shows `cancelled` → **no** state change; log `warn` with `orderCode`.
- **Amount / currency / status mismatch:** same as IPN — log, do not update.

## Testing

- **Unit:** eligibility query (or service method) with factories for edge statuses (`cancelled`, `paid`, `failed`, wrong method).
- **Unit:** sweep handler skips cancelled after re-read (mock repo returning cancelled on second read).
- **Integration:** mock `SepayService` paid vs pending; assert order + transaction + history (mirror IPN tests pattern if present).

## Risks

- **`order.retrieve` payload** may not expose `transaction.id` in all environments — **implementation spike** on first PR: confirm shape from sandbox log or SePay PG docs; extend `SepayVerifiedPayment` accordingly. If truly absent, define fallback (e.g. use `transaction_id` string from payload) before marking paid.
- **Hourly cadence:** up to ~1h lag after IPN failure (accepted).
- **Pay after admin cancel:** no auto-paid; may need **manual refund** / support (accepted product rule).

## Success metrics

- Missed-IPN orders in candidate set become **PAID + CONFIRMED** within **≤2h** under normal worker health.
- Zero **cancelled** orders transitioned to **paid** by sweep (monitor logs + spot checks).

## Doc / config follow-ups

- `.env.example`: optional tuning vars (`SEPAY_RECONCILE_WINDOW_HOURS`, `SEPAY_RECONCILE_BATCH_LIMIT`, `SEPAY_RECONCILE_ENABLED=true`) if you want runtime knobs.
- Short cross-links in `docs/sepay/payment-flow-sepay.md` and `docs/system-architecture.md` after implementation.

## Next step

Implementation plan: `docs/plans/sepay-pg-reconcile-sweep/plan.md`.
