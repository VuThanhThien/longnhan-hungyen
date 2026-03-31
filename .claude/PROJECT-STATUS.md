# Long Nhãn Tống Trân — project status

**Last sync:** 2026-03-31 (23:45)  
**Tracked plans:** `plans/260329-2131-longnhan-ecommerce/plan.md`, `plans/260331-1000-frontend-animation-enhancement/plan.md`  
**Handoff detail:** `agent-memo.md` (same folder)

## Plan rollup

| Plan | Status | Checklist progress | Notes |
|------|--------|--------------------|-------|
| Long Nhan e-commerce | in-progress | 77/98 (~78.6%) | Phases 1–3 complete; 4–6 in progress; 7 pending |
| Frontend animation enhancement | in-progress | 4/39 (~10.3%) | Phase 1 partial (`motion` + `ScrollReveal`); 2–4 unchecked |

## E-commerce phase rollup

| Phase | Name | Status |
|------:|------|--------|
| 1 | Monorepo setup | completed |
| 2 | Database & entities | completed |
| 3 | Backend API | completed |
| 4 | Storefront | in-progress |
| 5 | Admin panel | in-progress |
| 6 | Landing motion & effects | in-progress |
| 7 | Deployment | pending |

## Repo reality highlights

| Area | State |
|------|-------|
| `apps/api` | NestJS API includes admin list/detail endpoints for products/articles (`/admin`, `/admin/:id`) |
| `apps/web` | Storefront: landing, `/products`, `/products/[slug]`, articles, order flow, `robots.ts` / `sitemap.ts`, JSON-LD helpers, Cloudinary loader |
| `apps/web` stack | axios + TanStack Query + RHF/yup + order Server Action |
| `apps/web` motion | `motion` package installed; `ScrollReveal` (CSS + IO) on `app/page.tsx`; not yet using `motion.*` components broadly |
| `apps/admin` | CRUD pages/routes for orders/products/articles/media implemented; internal API proxies + media URL picker/upload + Tiptap editor integrated |
| `apps/admin` modern stack | `axios` + `@tanstack/react-query` added (QueryProvider, feature API layer, media/order mutation hooks) |
| Animation plan | Checklists aligned to code: install + section wraps + type-check in phase 01; product lightbox, landing parallax/carousel, mobile CTA/drawer still absent |

## Current blockers

1. **Storefront QA:** Mobile viewport pass + Lighthouse audit (`phase-04-storefront.md` last two items).
2. **Orders:** Add date-range/search filters in admin orders screen and confirm web order payload parity for reliable E2E.
3. **Admin verification:** Verify storefront reflection after admin updates and run CRUD E2E checklist.
4. **Animation:** Decide whether to keep evolving `ScrollReveal` or migrate toward plan-native `AnimatedSection` / `StaggerContainer` / `motion` primitives.

## Next priority order

1. Close Phase 4 verification (mobile + Lighthouse) and order contract check.
2. Finish Phase 5 verification tasks (reflection checks + E2E).
3. Continue animation plan Phase 1 gaps (shared `use-reduced-motion` hook, page transitions, stagger) then Phases 2–4.
4. Phase 7 deployment when 4–6 acceptance criteria are met.

## Reports

- `plans/reports/pm-260330-1433-phase1-2-completion.md`
- `plans/reports/pm-260330-1436-phase3-completion.md`
- `plans/reports/pm-260330-session-sync.md`
- `plans/reports/pm-260331-1800-status-sync.md`
- `plans/reports/pm-260331-1815-admin-product-article-media-scope-sync.md`
