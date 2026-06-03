---
name: seo
description: >-
  Audits and improves search visibility for the Long Nhãn storefront (Next.js App Router).
  Covers metadata, canonical URLs, Open Graph/Twitter, JSON-LD, sitemap, robots, and Vietnamese
  e-commerce copy. Use when the user invokes /seo, asks for SEO audit/fix, metadata, sitemap,
  structured data, or search/social previews.
disable-model-invocation: true
---

# SEO (Long Nhãn — `apps/web`)

## Scope

Work in **`apps/web`** unless the user explicitly asks about admin/API. Primary surface: public storefront at `SITE_URL` (`@/lib/constants`).

## Workflow

1. **Clarify intent** (if ambiguous): audit only, fix one page, or site-wide pass.
2. **Inventory** affected routes and read existing SEO code before editing.
3. **Apply** project patterns below (do not invent parallel metadata helpers).
4. **Verify**: type-check web app; spot-check `/robots.txt`, `/sitemap.xml`, and one changed page’s `<title>`, canonical, OG tags.
5. **Report** using [Output format](#output-format).

## Project conventions (required)

| Concern               | Location / pattern                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Metadata builder      | `buildSeoMetadata()` in `@/lib/seo` — always use for page-level SEO                                                      |
| Site constants        | `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION` in `@/lib/constants`                                                         |
| JSON-LD               | `@/lib/structured-data` — `buildOrganizationSchema`, `buildProductSchema`, `buildArticleSchema`, `buildBreadcrumbSchema` |
| Breadcrumbs + schema  | `buildBreadcrumb()` in `@/lib/breadcrumb`                                                                                |
| Sitemap               | `apps/web/src/app/sitemap.ts` (static routes + API-backed products/articles)                                             |
| Robots                | `apps/web/src/app/robots.ts`                                                                                             |
| Landing copy/keywords | `LANDING_SEO` in `@/data/landing-page-content.ts`                                                                        |
| Footer/legal pages    | `seoDescription` in `@/data/footer-pages.ts`                                                                             |
| PWA / install UI      | `PWA_CONFIG` in `@/lib/pwa-config.ts` — do not duplicate; extend via `buildSeoMetadata` merge fields                     |

### Adding or updating page metadata

**Static route** — export metadata from the page (or reuse `generateMetadata`):

```ts
import { buildSeoMetadata } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: '…', // becomes full title via layout template where applicable
  description: '…', // 120–160 chars, Vietnamese, benefit-led
  canonicalPath: '/path', // leading slash, no domain
  openGraphType: 'website', // or 'article' for blog posts
  ogImage: { url: '/…', width: 1200, height: 630, alt: '…' },
});
```

**Dynamic route** — `generateMetadata` must fetch the entity, then call `buildSeoMetadata`. Follow `apps/web/src/app/products/[slug]/page.tsx` and `articles/[slug]/page.tsx`.

Rules:

- **`canonicalPath`** must match the public URL path (normalized in `buildSeoMetadata`).
- **OG images**: prefer absolute URLs via `toAbsoluteUrl()` (handled inside builder for relative paths). Use real product/article images when available; fallback default is `/banner-web2.png`.
- **`openGraphType: 'article'`** for article detail pages only.
- Do **not** hand-roll duplicate `openGraph` / `twitter` / `canonical` blocks outside `buildSeoMetadata` unless merging intentional overrides via `BuildSeoMetadataInput` partial fields.
- Keep **one** `metadataBase` at layout level; pages should not fight `SITE_URL`.

### JSON-LD

Inject with `<script type="application/ld+json">` (see root `layout.tsx` for Organization). Per page:

- Product PDP → `buildProductSchema(product)`
- Article → `buildArticleSchema(article)`
- Breadcrumb trail → `buildBreadcrumbSchema` via `buildBreadcrumb`

Validate: required fields present, prices in **VND**, URLs use `SITE_URL`, images are absolute where crawlers expect them.

### Sitemap & robots

- New **indexable** top-level routes → add entry in `sitemap.ts` with sensible `priority` / `changeFrequency`.
- New **dynamic** content types → extend sitemap fetch + map (mirror products/articles).
- **Noindex** pages (checkout, cart, account, errors) → set `robots: { index: false, follow: false }` via `buildSeoMetadata` or page metadata; do not add to sitemap.
- `robots.ts` changes are rare; only edit when crawl policy intentionally changes.

### Content & locale

- Primary language: **Vietnamese** (`vi_VN` OG locale is default in builder).
- Titles: clear product/brand intent; avoid keyword stuffing.
- Descriptions: unique per URL, not duplicated across listing vs detail.
- `google: notranslate` is intentional — do not remove without product decision.

### Out of scope (unless user asks)

- Paid ads, GSC property setup, backlink campaigns
- `apps/admin` SEO (unless specified)
- Changing production `SITE_URL` or domain/DNS

## Audit checklist

Use [checklist.md](checklist.md) for full passes. Minimum checks:

- [ ] Every public route has unique `title` + `description`
- [ ] Canonical matches deployed path (no staging host in prod metadata)
- [ ] PDP/article OG image resolves (absolute https)
- [ ] JSON-LD on money/content pages; no invalid JSON
- [ ] Sitemap includes new routes; private flows excluded
- [ ] Heading hierarchy sensible (one H1 per page)
- [ ] Images have meaningful `alt` on hero/PDP
- [ ] Internal links use stable paths (`/products/...`, not query-only navigation for core content)

## Implementation priorities

When fixing issues, prefer this order:

1. Correctness (wrong canonical, missing metadata, broken sitemap)
2. Crawlability (robots, sitemap, indexation flags)
3. Rich results (Product / Article / Breadcrumb JSON-LD)
4. Snippet quality (titles, descriptions, OG)
5. Performance-related SEO (LCP image priority, font display — only if user ties to SEO)

## Output format

```markdown
## SEO summary

[1–2 sentences: what was wrong / goal]

## Changes

- `path` — what changed and why

## Verification

- [ ] Commands run / manual checks

## Follow-ups (optional)

- Items needing product/copy decisions or Search Console
```

## Additional reference

- Detailed audit rows: [checklist.md](checklist.md)
