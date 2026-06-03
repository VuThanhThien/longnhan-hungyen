# SEO audit checklist — `apps/web`

## Technical

| Check          | Pass criteria                                                |
| -------------- | ------------------------------------------------------------ |
| `SITE_URL`     | Matches production domain in `@/lib/constants`               |
| `metadataBase` | Set once in root layout; pages use `buildSeoMetadata`        |
| Canonical      | Every indexable page has canonical = `SITE_URL` + path       |
| OG/Twitter     | Title, description, image present; images absolute https     |
| Article type   | Article detail uses `openGraphType: 'article'`               |
| Robots meta    | Checkout/cart/account/error pages noindex                    |
| `robots.txt`   | Allows public content; points to sitemap                     |
| `sitemap.xml`  | Home, listings, all published product/article slugs          |
| JSON-LD        | Valid JSON; Organization sitewide; Product/Article on detail |
| 404 metadata   | Missing slug still has sensible title; avoid indexing junk   |

## On-page

| Check            | Pass criteria                                                 |
| ---------------- | ------------------------------------------------------------- |
| Title            | Unique; brand template via layout where used                  |
| Meta description | Unique, 120–160 chars, Vietnamese, clear CTA/benefit          |
| H1               | One primary H1 aligned with page intent                       |
| Alt text         | Product/hero images described                                 |
| Internal links   | Key hubs linked (home → products, articles)                   |
| Thin pages       | Footer/legal pages have `seoDescription` in `footer-pages.ts` |

## Content / i18n

| Check      | Pass criteria                              |
| ---------- | ------------------------------------------ |
| Language   | Vietnamese copy consistent with `vi_VN` OG |
| Duplicates | Listing vs detail descriptions differ      |
| Keywords   | Natural use in title/H1/body; no stuffing  |

## Social preview

| Check       | Pass criteria                                 |
| ----------- | --------------------------------------------- |
| Default OG  | `/banner-web2.png` or PWA hero where intended |
| PDP/article | Entity image when available                   |
| Dimensions  | 1200×630 preferred for large cards            |

## Post-change verification

```bash
pnpm --filter @longnhan/web type-check
```

Manual (or share with user):

- View source: `<link rel="canonical">`, `og:*`, JSON-LD script
- Fetch `https://<SITE_URL>/sitemap.xml` and spot-check new URLs
- Facebook Sharing Debugger / Twitter Card Validator (production URL)
