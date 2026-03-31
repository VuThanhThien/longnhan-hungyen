# PM report — session sync (Long Nhãn Tống Trân)

**Date:** 2026-03-30  
**Scope:** Progress mirrors written to `.claude/PROJECT-STATUS.md`, `.agent/PROJECT-STATUS.md`, `.agent/agent-memo.md`.

## Plan vs codebase

| Item | Note |
|------|------|
| Phases 1–3 | Marked completed in `plan.md`; API + DB + monorepo in tree |
| Phase 4 | Open: storefront routes, ISR, SEO, order flow E2E |
| Phase 6 | Plan file exists (`phase-06-frontend-landing-enhancement.md`); not started |
| Phase 7 | Renumbered from old Phase 6 deploy doc |

## Recent implementation (web)

- Axios layer + envelope unwrap (`lib/http/create-longnhan-api.ts`, `api-client`, `api-server` + `server-only`)
- TanStack Query + `AppProviders` in root layout
- Order form: react-hook-form + yup + `@hookform/resolvers`
- `useProductsList` + `query-keys` + paginated types (for upcoming product pages)

## Risks / open

| ID | Topic |
|----|--------|
| R1 | Web order `FormData` / JSON keys may not match `CreateOrderReqDto` — must reconcile before claiming orders work |
| R2 | `@longnhan/types` Product/Variant shapes vs API `ProductResDto` — regen or align when wiring PDP |
| R3 | PDP reference content fields may need small API extension (see `agent-memo.md`) |

## Suggested next commands

```text
/cook plans/260329-2131-longnhan-ecommerce/phase-04-storefront.md
```

## Unresolved questions

- Reviews tab on PDP: MVP or placeholder?
- Single-product order vs cart later?
