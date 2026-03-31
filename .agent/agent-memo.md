# Agent memo — current handoff

**Updated:** 2026-03-31 (23:45)  
**Progress mirrors:** [`.agent/PROJECT-STATUS.md`](PROJECT-STATUS.md) · [`.claude/PROJECT-STATUS.md`](../.claude/PROJECT-STATUS.md)  
**Main plan:** [`plans/260329-2131-longnhan-ecommerce/plan.md`](../plans/260329-2131-longnhan-ecommerce/plan.md)

## 30-second resume

- Main plan is `in-progress`, checklist **77/98 (~78.6%)**.
- Admin Phase 5 now has concrete CRUD surfaces for orders/products/articles/media.
- Admin interactive flows now use modern stack: `axios` + `@tanstack/react-query` (QueryProvider + feature API/hooks).
- Remaining focus is QA/verification, not scaffolding.

## Do first next session

1. **Set admin env:** create/update `apps/admin/.env.local` with `API_URL=http://localhost:3001/api/v1` (previous attempt blocked by privacy prompt).
2. **Phase 4 closure:** run mobile viewport pass + Lighthouse for storefront and tick last 2 Phase 4 checkboxes.
3. **Phase 5 finish:** add date-range + search filters on orders table.
4. **E2E verification:** verify storefront reflects admin-updated `featuredImageUrl/images[]` for products and `featuredImageUrl/contentHtml` for articles; then run full CRUD E2E pass.

## Key files

- `apps/admin/src/components/providers/query-provider.tsx`
- `apps/admin/src/lib/http-client.ts`
- `apps/admin/src/features/media/api/media-api.ts`
- `apps/admin/src/features/media/hooks/use-media-library.ts`
- `apps/admin/src/features/orders/api/orders-api.ts`
- `apps/admin/src/features/orders/hooks/use-update-order-status.ts`
- `plans/260329-2131-longnhan-ecommerce/phase-05-admin-panel.md`

## Unresolved questions

- Should we migrate remaining server-rendered admin listing pages (`/orders`, `/products`, `/articles`) to react-query client patterns now, or keep SSR for list screens and react-query for interactive modules only?
- Lighthouse acceptance target for closing Phase 4 (threshold and environment) is still unspecified.
