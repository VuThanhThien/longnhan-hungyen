## Context links

- SEO helper: `apps/web/src/lib/seo.ts`
- Product metadata: `apps/web/src/app/products/[slug]/page.tsx`

## Overview

- **Priority**: P1
- **Status**: Pending
- **Outcome**: make product OG previews predictable across Facebook + Zalo, with a clear validation workflow.

## Key insights (from current code)

- `buildSeoMetadata()` already:
  - Produces canonical URL using `SITE_URL`
  - Forces OG/Twitter image URLs to absolute via `toAbsoluteUrl()`
  - Defaults to `summary_large_image` on Twitter metadata
- Product PDP `generateMetadata()` picks `firstImage` from product fields and passes as `ogImage`.

That likely works, but the preview quality can still be inconsistent if the product image is not ideal (dimensions, cropping, format).

## Requirements

### Functional requirements

- Product share previews should show:
  - Correct title (`product.name`)
  - Correct description (current string is acceptable)
  - A high-quality image with correct aspect ratio for common scrapers

### Non-functional requirements

- OG image URLs must be absolute https and publicly reachable.
- Avoid new infra dependencies; prefer Next.js native features.

## Recommended OG image strategy (choose one)

### Option A (minimal): keep using product’s first image

- Pros: simplest, no new routes
- Cons: inconsistent aspect ratios, some products may not have good images

### Option B (recommended): add a dedicated OG image generator for product pages

Implement Next.js App Router OG image route for products so previews are consistent:

- Add `apps/web/src/app/products/[slug]/opengraph-image.tsx` (and optionally `twitter-image.tsx`)
- Render a 1200x630 image containing:
  - Product name
  - Brand (“Long Nhãn Tống Trân”)
  - Product image thumbnail (optional, if available and safe)
- Point `generateMetadata()` to use the generated OG image URL (or let Next metadata route wiring handle it)

Pros:

- Consistent preview across products
- Better appearance on Zalo/Facebook

Cons:

- Slightly more implementation work
- Must ensure fonts/assets are stable

## Related code files

### Likely modify

- `apps/web/src/app/products/[slug]/page.tsx`
- `apps/web/src/lib/seo.ts` (only if we need minor tweaks)

### Likely create (if Option B)

- `apps/web/src/app/products/[slug]/opengraph-image.tsx`
- `apps/web/src/app/products/[slug]/twitter-image.tsx` (optional)

## Implementation steps (planning-level)

1. Confirm current product image URLs are always absolute or reliably resolvable by `toAbsoluteUrl()`.
2. Decide between Option A vs Option B.
3. If Option B:
   - Implement OG image route(s)
   - Ensure the route uses the same product data source (or minimal fetch) and reasonable caching
4. Ensure metadata includes:
   - canonical URL
   - OG image(s)
   - Twitter image(s)
5. Create a validation checklist:
   - Facebook Sharing Debugger: force re-scrape after deploy
   - Zalo preview check (manual share into a chat / official tool if available)

## Todo list

- [ ] Pick OG image strategy (A vs B)
- [ ] Define validation steps for FB + Zalo cache refresh
- [ ] Decide whether to include product image thumbnail in generated OG image

## Success criteria

- Sharing a product link shows correct title/description/image in Facebook + Zalo after re-scrape.
- OG image is consistently sized and not blurry/cropped badly (especially if Option B).

## Risk assessment

- **Scraper cache**: even correct metadata can appear wrong until re-scraped; mitigate via explicit validation steps.
- **Image generation latency** (Option B): keep route fast + cached.

## Security considerations

- OG image route must not leak private data (only public product fields).

## Next steps

- Implement Phase 3 share UI once the link preview (what users will see) is reliable.
