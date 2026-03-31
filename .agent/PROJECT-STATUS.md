# Long Nhãn Tống Trân — project status

**Last sync:** 2026-03-31 (18:00)  
**Tracked plans:** `plans/260329-2131-longnhan-ecommerce/plan.md`, `plans/260331-1000-frontend-animation-enhancement/plan.md`  
**Handoff detail:** `agent-memo.md` (same folder)

## Plan rollup

| Plan | Status | Checklist progress | Notes |
|------|--------|--------------------|-------|
| Long Nhan e-commerce | in-progress | 68/94 (~72.3%) | Phases 1–3 complete; 4–6 in progress; 7 pending |
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
| `apps/api` | NestJS API present and aligned with Phase 3 scope |
| `apps/web` | Storefront: landing, `/products`, `/products/[slug]`, articles, order flow, `robots.ts` / `sitemap.ts`, JSON-LD helpers, Cloudinary loader |
| `apps/web` stack | axios + TanStack Query + RHF/yup + order Server Action |
| `apps/web` motion | `motion` package installed; `ScrollReveal` (CSS + IO) on `app/page.tsx`; not yet using `motion.*` components broadly |
| `apps/admin` | Login, middleware, dashboard (stats + chart + recent orders), shadcn UI, toasts — no dedicated CRUD routes for orders/products/articles/media yet |
| Animation plan | Checklists aligned to code: install + section wraps + type-check in phase 01; product lightbox, landing parallax/carousel, mobile CTA/drawer still absent |

## Current blockers

1. **Storefront QA:** Mobile viewport pass + Lighthouse audit (`phase-04-storefront.md` last two items).
2. **Orders:** Confirm web order payload matches `CreateOrderReqDto` / `@longnhan/types` for reliable E2E.
3. **Admin:** Build remaining management surfaces (orders list/detail, products, articles, media) per phase 5.
4. **Animation:** Decide whether to keep evolving `ScrollReveal` or migrate toward plan-native `AnimatedSection` / `StaggerContainer` / `motion` primitives.

## Next priority order

1. Close Phase 4 verification (mobile + Lighthouse) and order contract check.
2. Implement Phase 5 CRUD routes and wire existing UI primitives.
3. Continue animation plan Phase 1 gaps (shared `use-reduced-motion` hook, page transitions, stagger) then Phases 2–4.
4. Phase 7 deployment when 4–6 acceptance criteria are met.

## Reports

- `plans/reports/pm-260330-1433-phase1-2-completion.md`
- `plans/reports/pm-260330-1436-phase3-completion.md`
- `plans/reports/pm-260330-session-sync.md`
- `plans/reports/pm-260331-1629-status-sync.md`
- `plans/reports/pm-260331-1800-status-sync.md`
