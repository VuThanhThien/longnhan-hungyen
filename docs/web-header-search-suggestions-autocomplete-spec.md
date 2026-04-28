# Spec: Web header search suggestions + autocomplete

## Context

Storefront header search lives in `apps/web/src/components/layout/header-search-bar.tsx`.

Current behavior:

- Category select + query input (`q`) stored in URL search params via `nuqs`.
- Submit navigates to `/products` with `q` and `category` via `serializeProductSearchUrl`.
- No suggestions dropdown; `<input autoComplete="off" />`.

Goal:

- Enhance header search with **suggestions + autocomplete** dropdown.
- UX decisions (locked):
  - **Hybrid**: recent searches local + API suggestions (debounced).
  - **Grouped suggestions**: Recent searches + Categories + Products.
  - **Open on focus**: show recent immediately; call API at **≥ 2 chars**.
  - **Direct navigation**:
    - Product suggestion → product detail page
    - Category suggestion → `/products?category=...`
    - Recent/query suggestion → `/products?q=...` (and keep category if selected)

Non-goals:

- Full search page redesign (`/products`) beyond what’s needed for integration.
- Personalization beyond local recents (no account-based history).

## User stories

- As a shopper, when I focus the header search input I can see my recent searches so I can re-run them quickly.
- As a shopper, when I type at least 2 characters, I see relevant categories and products so I can navigate faster.
- As a shopper, I can use keyboard arrows + Enter + Esc to control suggestions without leaving the keyboard.
- As a shopper, selecting a product takes me directly to that product page.

## UX / Interaction design

### Dropdown visibility rules

- Open dropdown when:
  - Input is focused, AND
  - Either:
    - query is empty → show Recent section (if any)
    - query length ≥ 2 → show Categories + Products (and optionally Recent as a first section)
- Close dropdown when:
  - Press `Escape`
  - Click outside
  - Route navigation happens (selection or form submit)

### Sections (grouped)

- **Recent searches** (local)
  - Shown on focus when query empty (primary)
  - Also may show when query non-empty (optional; recommended: show only when query empty to reduce noise)
  - Each item is clickable; includes “Remove” affordance on hover (optional)
  - Include “Clear recent” action (optional)

- **Categories**
  - Each item navigates to `/products?category=<slug>`
  - If a category is already selected in the select, category suggestions should still show but selection should override the select on navigate (navigate using the chosen category)

- **Products**
  - Each row: product name, optional thumbnail, optional price
  - Navigate to product detail on selection

### Keyboard + a11y requirements

Use an established combobox pattern:

- Input behaves as a **combobox** with `aria-expanded`, `aria-controls`, and `aria-autocomplete="list"`.
- Results container is a `listbox`.
- Each row is an `option`.

Keyboard behavior:

- `ArrowDown/ArrowUp`: moves active option (wrap optional; recommended: clamp)
- `Enter`:
  - If an option is active → select it
  - Else → submit search (existing behavior)
- `Escape`: closes dropdown, keeps input value
- `Tab`: moves focus away; dropdown closes

Accessibility:

- Visible focus ring for active option
- Adequate contrast for hovered/active items
- Screen-reader announcement of result count (optional but recommended)

### Empty / loading / error states

- Query length < 2:
  - No API call
  - Show recent (if query empty) else show nothing
- Loading:
  - Show a compact spinner row or skeleton rows inside dropdown
- Error:
  - Fail silently (no toast). Show “Không thể tải gợi ý” (or similar) row, with “Thử lại” action (optional)
- No results:
  - Show “Không tìm thấy gợi ý” row

## Data & API contracts

### Local “Recent searches”

Storage:

- `localStorage` key: `web.headerSearch.recentQueries.v1`

Shape:

```ts
type RecentQuery = {
  q: string;
  category?: string | null;
  at: number; // epoch ms
};
```

Rules:

- Save after:
  - submit search with non-empty `q`, OR
  - selecting a “query” suggestion
- Deduplicate by `(q.trim().toLowerCase(), category ?? '')`
- Keep most recent first
- Max length: 8–10 items (recommend 8)

### Suggestions API (server)

Need an API endpoint that returns categories and products for a given query.

Proposed endpoint:

- `GET /api/v1/products/suggestions?q=<string>&limit=<n>`

Request rules:

- `q` trimmed
- Web calls only when `q.length >= 2`
- `limit` default 10 (server clamps)

Response shape (example):

```ts
type ProductSuggestion = {
  id: string;
  name: string;
  slug: string; // for product detail route
  thumbnailUrl?: string | null;
  price?: number | null;
  salePrice?: number | null;
};

type CategorySuggestion = {
  slug: string;
  name: string;
};

type SuggestionsResponse = {
  q: string;
  categories: CategorySuggestion[];
  products: ProductSuggestion[];
};
```

Ranking:

- Server ranks by relevance (starts-with boost, contains, popularity if available).
- Client does not re-rank; only groups and renders.

Caching:

- Server can add short cache headers (optional).
- Client uses react-query caching:
  - `staleTime`: ~30s
  - `gcTime`: a few minutes

## Client implementation outline (for planning)

### Component boundaries

Keep `header-search-bar.tsx` focused on layout and URL params.
Add a small isolated unit for suggestion behavior:

- `apps/web/src/components/layout/header-search-suggestions.tsx` (new)
  - Handles dropdown rendering + listbox semantics
  - Receives:
    - `q`, `category`
    - callbacks: `onSelectProduct`, `onSelectCategory`, `onSelectQuery`
    - `open`, `onOpenChange`

Add utilities:

- `apps/web/src/lib/header-search-recent-queries.ts` (new)
  - `readRecents`, `writeRecents`, `addRecent`, `removeRecent`, `clearRecents`

Add query hook:

- `apps/web/src/services/product-suggestions.ts` (new or existing pattern under `services/`)
  - `getProductSuggestions({ q, limit })`
  - `useProductSuggestions(q)` wrapping react-query

### Debounce

Debounce query input before API calls:

- delay: 200–300ms
- Cancel in-flight if query changes

### Category select interaction

- Current category select writes to query params via `nuqs` which also updates the input value.
- On selecting a category suggestion:
  - Navigate to `/products?category=<suggested>`
  - Keep `q` as-is only if query is non-empty and we want combined filter (recommend: keep `q`)

### Navigation

- Product suggestion navigation requires the product detail route pattern.
  - If product detail route is `/products/[slug]` (or similar), use that.
  - If not present, fall back to `/products?q=<product name>` (only as fallback; prefer detail).

## Edge cases

- IME composition (Vietnamese input):
  - Do not fetch suggestions while composing (`compositionstart`→`compositionend`)
- Very fast typing:
  - Ensure stale responses don’t overwrite newer ones (react-query handles by queryKey)
- Mobile:
  - Dropdown should not extend beyond viewport; allow scroll within dropdown
- Click outside:
  - Ensure clicking suggestion doesn’t immediately close before onClick runs (use `onMouseDown` or prevent default appropriately)

## Testing strategy

Unit-ish (web):

- `header-search-recent-queries` utility tests (pure functions)

Integration (web):

- Lightweight component tests if test setup exists; otherwise manual QA checklist.

Manual QA checklist:

- Focus input shows recent (if any)
- Typing 2+ chars shows loading then results
- Arrow keys highlight options; Enter selects; Esc closes
- Clicking product navigates to detail
- Submitting with no active option navigates to `/products` with correct params
- Recent list updates after submit/selection; dedup works; max length enforced

## Success metrics

- Higher search engagement:
  - Increase “search initiated” rate (baseline vs after)
- Reduced time-to-product:
  - More sessions reaching product detail from header search without visiting `/products` list first
- Performance:
  - No noticeable typing lag; suggestions appear < 300–500ms under normal network

## Open questions (resolve before implementation plan)

- Product detail route shape in `apps/web` (e.g. `/products/[slug]` vs `/product/[slug]`).
- Whether to show **Recent** section when query is non-empty (recommend: only when empty).
- Whether product rows show thumbnail + price (recommended: thumbnail yes, price optional).
