## Goal

Create dedicated, indexable pages for the “Hỗ trợ khách hàng” items currently shown as plain text in the storefront footer (`apps/web/src/components/layout/footer.tsx`), then wire those footer entries to internal links.

This turns footer policy/help items into:

- real routes under `apps/web/src/app/**`
- SEO-friendly pages (use the repo’s `buildSeoMetadata` pattern)
- consistent UI (simple, readable content layout matching existing brand tokens)

## Non-goals

- No admin CMS/editor for these pages (static content in code).
- No changes to API / database.
- No redesign of the entire footer layout beyond turning items into links (unless needed for UX).

## Current state (observed)

- Footer’s “Hỗ trợ khách hàng” section includes these items as plain list text (not links):
  - “Chính sách khách hàng thân thiết”
  - “Chính sách bảo mật thông tin”
  - “Chính sách vận chuyển”
  - “Chính sách đổi - trả hàng”
  - “Chính sách thanh toán”
- Storefront uses Next.js App Router (`apps/web/src/app/*`).
- SEO metadata convention exists via `apps/web/src/lib/seo.ts` (`buildSeoMetadata({ title, description, canonicalPath })`).

## Proposed UX / IA

### Routes (storefront)

Create a dedicated route group for footer pages:

- `apps/web/src/app/(footer-pages)/...`

Within it, create one page per footer item using short, stable slugs:

- `/chinh-sach-khach-hang-than-thiet`
- `/chinh-sach-bao-mat`
- `/chinh-sach-van-chuyen`
- `/chinh-sach-doi-tra`
- `/chinh-sach-thanh-toan`

Notes:

- Slugs are Vietnamese, matching site language (`lang="vi"` in `apps/web/src/app/layout.tsx`).
- Keep them stable (don’t bake dates/versions into URLs).

### Page layout

Each page should be:

- a Server Component page (default in App Router)
- easy to read on mobile
- consistent typography and spacing with existing landing styles (reusing existing Tailwind + CSS variables like `--brand-cream`, `--brand-forest`)

Recommended structure:

- Page container with max width (e.g. `max-w-3xl` or `max-w-4xl`)
- Title (H1)
- “Last updated” (optional; can be omitted if you don’t want to maintain it)
- Content sections (H2 + paragraphs + bullet lists)

### SEO

For each page:

- implement `generateMetadata()` using `buildSeoMetadata`
- canonicalPath must match the route path
- description: short summary of that policy

## Content source

Static content should live close to pages, but not duplicated.

Preferred approach:

- Create a small data module exporting content objects, then import into each page.
  - Example file: `apps/web/src/data/footer-pages.ts`
  - Export list keyed by slug (title, description, sections as arrays)

This keeps pages thin and makes footer link generation easy (shared “source of truth”).

## Implementation Phases

### Phase 01 — Define data contract + content skeleton

Deliverables:

- `apps/web/src/data/footer-pages.ts` (or equivalent) with:
  - a typed structure for footer pages (slug, title, seoDescription, sections[])
  - initial placeholder content for each page (can be “TBD” blocks if content isn’t ready yet)

Acceptance criteria:

- There is one canonical source of truth for the footer pages list.
- Every footer item has:
  - slug
  - display title
  - SEO title/description fields (even if minimal)

### Phase 02 — Create routes + page template

Deliverables:

- Add App Router pages under `apps/web/src/app/(footer-pages)/<slug>/page.tsx`
- Each page renders:
  - H1 title
  - sections from the data module
- Each page has `generateMetadata()` using `buildSeoMetadata`

Acceptance criteria:

- Navigating to each route renders a real page (no 404).
- Metadata has correct canonical URL and title template behavior.

### Phase 03 — Wire footer items to internal links

Deliverables:

- Update `apps/web/src/components/layout/footer.tsx`:
  - Replace the 5 plain text list items with `<Link href="...">...</Link>`
  - Ensure hover/focus styles match existing link styles in footer

Acceptance criteria:

- All “Hỗ trợ khách hàng” entries are clickable and route internally.
- No layout regressions in footer across breakpoints.

### Phase 04 — QA checklist + polish

Checklist:

- Mobile layout: content width/spacing readable; no overflow.
- Accessibility: headings order (H1 then H2s), links focus visible.
- SEO: canonical URLs correct; page titles unique.
- No broken links in footer.

Optional polish:

- Add a small breadcrumb/back link to Home at top of policy pages.
- Add “Contact” CTA at bottom linking to whichever contact experience you want (`/` currently has “Liên hệ” link in footer).

## Files likely to change / add

- **Add** `apps/web/src/data/footer-pages.ts`
- **Add** `apps/web/src/app/(footer-pages)/chinh-sach-khach-hang-than-thiet/page.tsx`
- **Add** `apps/web/src/app/(footer-pages)/chinh-sach-bao-mat/page.tsx`
- **Add** `apps/web/src/app/(footer-pages)/chinh-sach-van-chuyen/page.tsx`
- **Add** `apps/web/src/app/(footer-pages)/chinh-sach-doi-tra/page.tsx`
- **Add** `apps/web/src/app/(footer-pages)/chinh-sach-thanh-toan/page.tsx`
- **Update** `apps/web/src/components/layout/footer.tsx`

## Risks / edge cases

- **Slug changes**: once indexed, changing slugs needs redirects (not planned). Pick stable slugs now.
- **Footer text vs page titles**: ensure the link text exactly matches the page title for clarity.
- **Content maintenance**: if policies change frequently, consider moving content to a CMS later; out of scope here.

## Open questions (answer later; plan doesn’t block)

- Do you want these URLs under a common prefix like `/ho-tro/…` or `/chinh-sach/…`, or keep them flat at root?
- Do you want English versions, or Vietnamese only?
- Should these pages be included in sitemap generation (if you have a custom sitemap route)?
