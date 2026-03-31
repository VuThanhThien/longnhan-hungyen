# Agent memo — current handoff

**Updated:** 2026-03-31 (18:00)  
**Progress mirrors:** [`.agent/PROJECT-STATUS.md`](PROJECT-STATUS.md) · [`.claude/PROJECT-STATUS.md`](../.claude/PROJECT-STATUS.md)  
**PM report:** [`plans/reports/pm-260331-1800-status-sync.md`](../plans/reports/pm-260331-1800-status-sync.md)

## 30-second resume

- **Main plan:** `plans/260329-2131-longnhan-ecommerce/plan.md` — `in-progress`, checklist **68/94 (~72.3%)** after checkbox sync to repo.
- **Secondary plan:** `plans/260331-1000-frontend-animation-enhancement/plan.md` — `in-progress`, checklist **4/39 (~10.3%)**; Phase 1 partially covered by `ScrollReveal` + `motion` install, not full `AnimatedSection` / page-transition stack.
- **Immediate goal:** finish Phase 4 QA (mobile + Lighthouse), validate order API contract, then expand `apps/admin` beyond dashboard home.

## Do first next session

1. **Phase 4 closure:** Run mobile viewport check + Lighthouse on `apps/web`; tick items in `phase-04-storefront.md` when done.
2. **Order parity:** Diff `apps/web/src/actions/order-actions.ts` against `apps/api/src/api/orders/dto/create-order.req.dto.ts` and `packages/types` order types; fix any field or variant-id mismatch.
3. **Admin Phase 5:** Add routes for orders list/detail, products, articles, media; reuse `components/ui/*` and `admin-api-client`.
4. **Animation Phase 1 gaps:** Optional `use-reduced-motion.ts`, `page-transition-wrapper.tsx`, or consciously keep `ScrollReveal`-only approach and adjust phase text on next pass.

## Key files to inspect first

| Path | Why |
|------|-----|
| `plans/260329-2131-longnhan-ecommerce/phase-04-storefront.md` | Last open storefront checklist items |
| `plans/260329-2131-longnhan-ecommerce/phase-05-admin-panel.md` | Admin backlog vs current `apps/admin/src/app` |
| `apps/web/src/actions/order-actions.ts` | Order submit payload |
| `apps/api/src/api/orders/dto/create-order.req.dto.ts` | API contract |
| `apps/web/src/components/ui/scroll-reveal.tsx` | Current scroll + reduced-motion behavior |
| `plans/260331-1000-frontend-animation-enhancement/phase-01-core-animation-layer.md` | Remaining motion infra todos |

## Reference links

- PDP reference: [tinhhoaphohien.vn — Long nhãn](https://tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua)
- Storefront phase: [`phase-04-storefront.md`](../plans/260329-2131-longnhan-ecommerce/phase-04-storefront.md)
- Animation plan: [`plans/260331-1000-frontend-animation-enhancement/`](../plans/260331-1000-frontend-animation-enhancement)

## Unresolved questions

- Should `ScrollReveal` be treated as the canonical “AnimatedSection” for this repo, or should we add parallel `motion`-based components per the animation plan?
- For admin, prefer incremental routes (`/orders`, `/products`, …) under `(dashboard)` or a single app segment strategy?
- Lighthouse: what target scores and environments (local vs preview) count as “done” for Phase 4?
