# Phase 04 — Content & SEO

**Status:** Pending | **Priority:** P2 | **Effort:** 3h

## Context Links
- Plan: [plan.md](./plan.md)
- Root layout: `apps/web/src/app/layout.tsx`
- Product page: `apps/web/src/app/products/[slug]/page.tsx`
- Article page: `apps/web/src/app/articles/[slug]/page.tsx`
- Landing page: `apps/web/src/app/page.tsx`
- Articles list: `apps/web/src/app/articles/page.tsx`

## Overview

Add JSON-LD structured data for rich Google results, articles preview on landing page, and a product origin visual. These improve organic discovery and keep users engaged longer.

## Key Insights

- Reference has BreadcrumbList, Product, and Organization JSON-LD schemas — critical for Google Shopping & rich snippets
- No articles preview on current landing page — reference embeds related content
- Origin story ("Phố Hiến", geographic identity) is a key differentiator; a visual map or region badge strengthens brand authority
- Next.js App Router supports `generateMetadata` and `<Script>` for structured data

## Requirements

### Functional
- [ ] JSON-LD Organization schema in root layout
- [ ] JSON-LD Product schema on product detail page (`/products/[slug]`)
- [ ] JSON-LD BreadcrumbList schema on product + article detail pages
- [ ] JSON-LD Article schema on article detail page (`/articles/[slug]`)
- [ ] Articles preview section on landing page (latest 3 articles)
- [ ] Product origin visual/badge on landing — geographic identity element

### Non-Functional
- JSON-LD injected via Next.js `<Script type="application/ld+json">` in page head
- Articles preview fetches from API (same pattern as `getHomeProducts`)
- Origin visual is pure CSS/SVG — no image dependency

## Architecture

```
apps/web/src/
  lib/
    structured-data.ts              ← NEW (JSON-LD builders: organization, product, article, breadcrumb)
  components/
    landing/
      landing-articles-preview.tsx  ← NEW (latest 3 articles cards)
      landing-origin-badge.tsx      ← NEW (geographic origin visual/badge)
  app/
    layout.tsx                      ← MODIFY (Organization JSON-LD)
    products/[slug]/page.tsx        ← MODIFY (Product + BreadcrumbList JSON-LD)
    articles/[slug]/page.tsx        ← MODIFY (Article + BreadcrumbList JSON-LD)
    page.tsx                        ← MODIFY (add LandingArticlesPreview, LandingOriginBadge)
```

## Related Code Files

- **CREATE** `apps/web/src/lib/structured-data.ts`
- **CREATE** `apps/web/src/components/landing/landing-articles-preview.tsx`
- **CREATE** `apps/web/src/components/landing/landing-origin-badge.tsx`
- **MODIFY** `apps/web/src/app/layout.tsx`
- **MODIFY** `apps/web/src/app/products/[slug]/page.tsx`
- **MODIFY** `apps/web/src/app/articles/[slug]/page.tsx`
- **MODIFY** `apps/web/src/app/page.tsx`

## Implementation Steps

1. **Create `structured-data.ts`** — pure builder functions, no JSX
   ```ts
   // buildOrganizationSchema() → Organization schema object
   // buildProductSchema(product) → Product schema with offers, image
   // buildArticleSchema(article) → Article schema
   // buildBreadcrumbSchema(items: {name, url}[]) → BreadcrumbList schema
   // All return plain objects; caller serializes with JSON.stringify
   ```

2. **Organization schema in `layout.tsx`**
   ```tsx
   <Script type="application/ld+json" id="org-schema">
     {JSON.stringify(buildOrganizationSchema())}
   </Script>
   ```
   - Include: name, url, telephone, address, sameAs (Facebook, Shopee)

3. **Product + BreadcrumbList schemas in product page**
   - After fetching product data, inject both schemas
   - Product schema: name, description, image, offers (price, priceCurrency: "VND"), availability

4. **Article + BreadcrumbList schemas in article page**
   - Article schema: headline, datePublished, dateModified, author, image

5. **Create `landing-articles-preview.tsx`**
   - Fetch latest 3 articles from API (async server component, same pattern as `getHomeProducts`)
   - Cards: thumbnail + title + date + "Đọc thêm →" link
   - Layout: `grid grid-cols-1 sm:grid-cols-3 gap-6`
   - Fallback: render nothing if fetch fails (no error state shown to user)

6. **Fetch articles in `page.tsx`**
   ```ts
   async function getLatestArticles(): Promise<Article[]> {
     try {
       const res = await fetchPaginated<Article>('/articles', { limit: 3 })
       return res.data
     } catch { return [] }
   }
   ```
   - Pass to `<LandingArticlesPreview articles={articles} />`
   - Insert after `LandingFaq`, before `FeaturedProducts`

7. **Create `landing-origin-badge.tsx`**
   - Simple decorative component: map pin icon + "Hưng Yên · Phố Hiến" text
   - Style: pill badge or decorated text block, subtle gold/green palette
   - Place in hero section or story section
   - Pure CSS — no external image needed

## Todo List

- [ ] Create `structured-data.ts` with 4 builder functions
- [ ] Inject Organization schema in `layout.tsx`
- [ ] Inject Product + BreadcrumbList schemas in `products/[slug]/page.tsx`
- [ ] Inject Article + BreadcrumbList schemas in `articles/[slug]/page.tsx`
- [ ] Create `landing-articles-preview.tsx`
- [ ] Add `getLatestArticles()` fetch in `page.tsx`
- [ ] Insert `<LandingArticlesPreview>` in `page.tsx`
- [ ] Create `landing-origin-badge.tsx`
- [ ] Place origin badge in hero or story section
- [ ] Validate JSON-LD with Google Rich Results Test (manual QA)

## Success Criteria

- Google Rich Results Test shows valid Product schema on product page
- Organization schema present in root layout HTML source
- BreadcrumbList schema present on product + article pages
- Articles preview shows up to 3 article cards on landing page
- Graceful fallback (no render) when articles API is empty
- Origin badge visible in hero or story section

## Risk Assessment

- **Article API may return 0 items** — handled by empty array fallback, no visible error
- **Product price format** — VND prices in integer (no decimals); schema `priceCurrency: "VND"`
- **JSON-LD size** — keep schemas lean; omit optional fields unless data is available

## Security Considerations

- JSON.stringify output in `<Script>` — ensure no user-supplied unescaped HTML in product/article data
- Use `dangerouslySetInnerHTML` only with `JSON.stringify()` output (safe for ld+json)

## Next Steps

- All 4 phases complete → full enhancement delivered
- Owner action: fill real content (OCOP certs, testimonial ratings, stats numbers, Zalo/Shopee links)
