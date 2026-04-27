## Context links

- Product metadata: `apps/web/src/app/products/[slug]/page.tsx`
- SEO helper: `apps/web/src/lib/seo.ts`
- Share UI: `apps/web/src/components/products/product-pdp-share-buttons.tsx`

## Overview

- **Priority**: P1
- **Status**: Pending
- **Outcome**: verify sharing UX + previews across platforms, and ship safely without SEO regressions.

## QA checklist

### A) Functional share UX

- Desktop (Chrome/Safari):
  - Copy link works and shows confirmation
  - Zalo share link opens correctly
  - Facebook share link opens correctly
- Mobile (iOS Safari + Android Chrome):
  - “Share” triggers native share sheet when supported
  - Fallback UI appears when `navigator.share()` is unavailable
  - Copy link works (or degrades gracefully if blocked)

### B) OG/Twitter previews

Pick 2–3 real product slugs and validate:

- Title matches product name
- Description is present
- Image loads and is not distorted

Tools/flows:

- Facebook:
  - Use Facebook Sharing Debugger and trigger “Scrape Again” after deploy
- Zalo:
  - Manual share in a test chat
  - If Zalo provides an official debug tool, add it to the checklist

### C) SEO sanity checks

- Canonical URL is correct and stable
- `og:image` and `twitter:image` are absolute https URLs
- No missing metadata warnings (inspect page source/head tags)

## Rollout plan

- Ship as a small storefront-only change.
- After deploy, run the OG validation steps (scrape refresh).
- Monitor for:
  - Error logs from clipboard/share APIs
  - Reports of wrong previews (usually scraper cache)

## Release notes (internal)

- “PDP share improved (copy + mobile share sheet) and better OG previews for social share.”

## Success criteria

- No production errors after rollout.
- Users can copy and share product links easily on mobile/desktop.
- FB + Zalo previews show correct product image/title after re-scrape.

## Risks / mitigations

- **OG cache persists**: include explicit “refresh” steps and expectations in rollout notes.
- **Some browsers block clipboard**: keep UX resilient with error handling and fallback.
