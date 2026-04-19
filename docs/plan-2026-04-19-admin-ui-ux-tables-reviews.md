# Plan: Admin UI/UX — tables, detail save flow, reviews

**Date:** 2026-04-19  
**Scope:** `apps/admin` (+ API for review delete)  
**Standards:** Repository root `DESIGN.md` (canonical admin look/feel), `apps/admin/AGENTS.md`, `docs/frontend-code-standards.md`.  
**Note:** `docs/development-rules.md` referenced by the planning skill is not present in this repo; follow the files above instead.

---

## Goals (from product request)

1. **Tables:** Last column header must be a real `<th>` labeled **Action** (not an empty `<TableHead />`).
2. **Row actions:** Prefer **`<Button>`** (shadcn `Button`) for actions instead of plain text / `<Link>` styled as green underlined text. Navigation actions can use **`Button` + `asChild` + `Link`** so semantics stay correct.
3. **Detail pages:** Admins use an explicit **Save** control that submits persisted changes; avoid **immediate PATCH on `<select>` `onChange`** as the only path (current order detail behavior).
4. **Reviews list:** Default filter = **all** statuses; support **delete** for a review (backend + admin proxy + UI).

---

## UI/UX guidance (aligned with repo, not wholesale reskin)

A `ui-ux-pro-max` design-system run for “admin dashboard” suggested a generic dark/analytics stack (Fira, blue primary). **Do not adopt that wholesale** — it conflicts with `DESIGN.md` (warm cream surfaces, accent orange, existing admin tokens). Use the skill’s **interaction checklist** only: visible focus, `cursor-pointer` on controls, 150–300ms transitions, no emoji icons, touch-friendly targets (min ~44px where practical), `prefers-reduced-motion` for nonessential motion.

---

## Current state (codebase facts)

### Tables with empty last header (`<TableHead />`)

| File                                                        | Notes                                         |
| ----------------------------------------------------------- | --------------------------------------------- |
| `apps/admin/src/app/(dashboard)/categories/page.client.tsx` | Last col: `Link` “Sửa” + raw `<button>` “Xóa” |
| `apps/admin/src/app/(dashboard)/products/page.client.tsx`   | Same pattern                                  |
| `apps/admin/src/app/(dashboard)/articles/page.client.tsx`   | Same pattern                                  |
| `apps/admin/src/app/(dashboard)/orders/page.client.tsx`     | `Link` “Xem chi tiết” only                    |
| `apps/admin/src/app/(dashboard)/reviews/page.client.tsx`    | Last header empty; actions already `Button`   |

### Reviews

- **Default filter:** `useState<ReviewStatus>('pending')` in `reviews/page.client.tsx` — change to an **“all”** mode.
- **API list:** `ReviewsService.listAdminReviews(status?)` already returns **all** reviews when `status` is omitted (`where: {}`, `take: 50`). No backend change needed for “all” if the client **omits** the `status` query param.
- **Delete:** `ReviewsController` only exposes `GET reviews/admin`, `PATCH reviews/admin/:id`. **No DELETE** yet. `apps/admin/src/app/api/reviews/admin/[id]/route.ts` only implements `PATCH`.

### Detail / save behavior

| Screen                                                         | Today                                                                          | Gap vs request                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `products/[id]/edit/page.tsx`                                  | Info tab: `Button type="submit" form={...}` + `ProductForm` `hideSubmitButton` | Matches explicit save for main form. SKU / variants tabs: per-row saves (not `onChange` PATCH on selects). |
| `articles/[id]/edit/page.tsx`, `categories/[id]/edit/page.tsx` | Forms expose submit                                                            | OK                                                                                                         |
| `products/new`, `articles/new`, `categories/new`               | Form submit                                                                    | OK                                                                                                         |
| `orders/[id]/page.tsx`                                         | `OrderStatusPanel`: **both `<select>`s call `updateStatus` in `onChange`**     | **Violates** “Save triggers submit, not onChange only”.                                                    |

---

## Solution design

### 1) Table headers and actions (admin list pages)

- Replace `<TableHead />` with:

```tsx
<TableHead className="text-right w-[1%] whitespace-nowrap">Action</TableHead>
```

- Use `text-right` if actions are right-aligned (matches reviews row). Adjust if you keep left alignment — **consistency across list pages matters more than pixel-perfect choice**.
- **Edit / view links:** Replace underlined `Link` with e.g.:

```tsx
<Button asChild variant="outline" size="sm" className="cursor-pointer">
  <Link href="...">Sửa</Link>
</Button>
```

- Destructive actions: use `<Button variant="destructive" size="sm">` (or `outline` + destructive text per `DESIGN.md`) instead of unstyled `<button className="text-sm text-destructive hover:underline">`.
- **Accessibility:** Keep confirmation for destructive actions; ensure focus returns sensibly after dialog/confirm (optional polish).
- **Empty row `colSpan`:** Update if column count semantics change (here column count stays the same; only header label changes).

### 2) Order detail — explicit Save

**Target:** `apps/admin/src/components/orders/order-status-panel.tsx`

- Hold **draft** state for `orderStatus` and `paymentStatus` (initialize from props; consider `useEffect` when `initial*` props change after refetch).
- `<select>`: use `onChange` only to update **local draft** (no network).
- Add primary **`Button` “Lưu thay đổi”** (or “Lưu”) that:
  - Calls the existing `useUpdateOrderStatus` mutation with **both** current draft values (or only those that differ from initial — either is fine; **sending both** is simpler and idempotent if API allows).
  - On success: sync local state to saved values + existing toast.
- Optional UX: **“Hoàn tác”** / reset drafts to last saved; disable Save when `!dirty` or while pending.
- **Loading:** Disable selects + Save while `isPending`.

This matches the product pattern used on the product edit header (`type="submit"` triggering persistence).

### 3) Reviews — default “all” + delete

**Frontend (`reviews/page.client.tsx`)**

- State type: e.g. `'all' | 'pending' | 'published' | 'rejected'`, default **`'all'`**.
- `useQuery` / `adminClientGet`: when filter is `'all'`, pass **no** `status` param (or `{}` only). Verify axios/query serialization — if needed, build params explicitly so `status` is not sent as the string `"undefined"`.
- Add **`Button` variant destructive** “Xóa” per row with `window.confirm` or shadcn `AlertDialog` (prefer dialog for consistency with other admin flows).
- On success: `refetch()` + toast.

**Backend (`apps/api`)**

- `ReviewsService`: add `async deleteReview(id: Uuid): Promise<void>` — `findOne` → `NotFoundException` if missing → `reviewRepo.delete(id)` (or `remove` on entity). No migration if hard delete is acceptable (entity has no soft-delete column).
- `ReviewsController`: `@Delete('reviews/admin/:id')` with `@ApiAuth`, `@HttpCode(204)` or `200` with small JSON — align with other admin DELETE routes in this repo.
- Swagger DTO/summary consistent with existing `PATCH`.

**Admin BFF (`apps/admin`)**

- Extend `apps/admin/src/app/api/reviews/admin/[id]/route.ts` with `DELETE` forwarding to upstream `DELETE /reviews/admin/:id` (mirror `PATCH` pattern in `forwardAdminApi`).

**Types / clients**

- If OpenAPI or shared types are generated, regenerate or add manual type for delete response.

### 4) Product edit tabs (optional / clarify with PM)

Current copy says _“Lưu từng dòng trong nội dung bên dưới.”_ for SKU/variants — that is **explicit per-row save**, not silent auto-save. If stakeholders still want a **single top-right Save** on those tabs, that implies batching multiple variant PATCHes (new endpoint or sequential mutations + aggregated toast). **Defer** unless requested; the **must-fix** for “onChange only” is **order status**.

---

## Implementation phases

### Phase 1 — List tables (pure admin UI)

- Update `TableHead` + action controls in:
  - `categories/page.client.tsx`
  - `products/page.client.tsx`
  - `articles/page.client.tsx`
  - `orders/page.client.tsx`
  - `reviews/page.client.tsx` (header only; actions already buttons)
- Smoke-test: keyboard focus Tab through action buttons; mobile overflow (wrap or horizontal scroll inside card).

### Phase 2 — Order detail save UX

- Refactor `order-status-panel.tsx` as above.
- Manually test: change both fields → one Save → one or two API calls (document actual API contract in code comment if only one field can be sent).

### Phase 3 — Reviews filter + delete (full stack)

- Admin UI: default all, delete button, query keys.
- API: DELETE + service method.
- Admin route: DELETE proxy.
- Add/adjust tests if the API has e2e/unit coverage for reviews (search `reviews` under `apps/api` test folders).

### Phase 4 — QA checklist

- [ ] All targeted tables show **Action** in `<thead>`.
- [ ] No primary list action is bare underlined text.
- [ ] Order detail: changing selects does not PATCH until Save.
- [ ] Reviews: initial load shows mixed/all (up to API `take: 50`); filter still works.
- [ ] Delete review removes row after confirm; unauthorized case surfaces error toast.

---

## Risks and decisions

| Topic                               | Decision                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Header label “Action” vs Vietnamese | Request specifies **Action**; if you want full-VN UI later, switch to **Thao tác** in one pass.             |
| Review list cap                     | API `take: 50` — “all” may still truncate; document in UI (“Tối đa 50 mục gần nhất”) or backlog pagination. |
| Delete review                       | Hard delete; storefront published reviews simply lose that row — acceptable for moderation.                 |

---

## Handoff (implementation)

Use this plan as the single source of truth for the feature. Suggested cook / implementation prompt (absolute path):

```text
Implement docs/plan-2026-04-19-admin-ui-ux-tables-reviews.md: Phase 1–3 in order; skip Phase 4 optional product-tab batch save unless explicitly requested. Respect DESIGN.md and existing shadcn patterns in apps/admin.
```

Repository `.claude/scripts/set-active-plan.cjs` is **not** present in this workspace; track the active plan path manually or add that script later if your workflow expects it.
