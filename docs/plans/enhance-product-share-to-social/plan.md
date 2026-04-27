---
title: 'Enhance product sharing to social'
description: 'Improve PDP share UX (copy/share sheet + more targets) and ensure consistent OG previews (FB/Zalo) for product links.'
status: pending
priority: P1
effort: 1-2d
tags: [web, seo, open-graph, ux, sharing, nextjs]
created: 2026-04-25
---

## Overview

This plan enhances the storefront product detail page (PDP) sharing experience:

- **Better share UX**: share sheet on mobile, copy link, and additional share targets beyond the current Zalo + Facebook buttons.
- **Consistent previews**: ensure product links render correct **Open Graph** / **Twitter** previews across Facebook and Zalo.

## Current reality (baseline)

- **Share UI exists (limited):** `apps/web/src/components/products/product-pdp-share-buttons.tsx`
  - Targets: Zalo + Facebook only
  - No copy-to-clipboard, no Web Share sheet, no “link copied” feedback
- **PDP metadata is already dynamic:** `apps/web/src/app/products/[slug]/page.tsx`
  - Uses `buildSeoMetadata()` from `apps/web/src/lib/seo.ts`
  - Picks first product image (featured or first gallery) for OG image when available
  - Canonical URL is composed via `SITE_URL` + `canonicalPath`

## Goals

- Share controls feel modern, fast, and mobile-friendly (no clutter).
- Copy link is one click/tap with clear confirmation.
- Facebook + Zalo render the **correct title/description/image** when sharing a product URL.
- Implementation stays small, consistent with existing Next.js App Router patterns and existing SEO helper.

## Non-goals

- Building a full “social campaign” system (UTM manager, affiliate links, referral codes).
- Adding third-party analytics if the repo doesn’t already use one.
- Redesigning the entire PDP layout beyond the share block.

## Phases

| #   | Phase                                                            | Status  | Effort    | Link                                         |
| --- | ---------------------------------------------------------------- | ------- | --------- | -------------------------------------------- |
| 1   | Requirements + UX spec (targets, copy, mobile behavior)          | Pending | 0.25-0.5d | [phase-01](./phase-01-requirements-ux.md)    |
| 2   | OG preview hardening (metadata, OG image strategy, cache)        | Pending | 0.5d      | [phase-02](./phase-02-open-graph-preview.md) |
| 3   | Implement share component upgrades (Web Share + copy + targets)  | Pending | 0.5d      | [phase-03](./phase-03-implement-share-ui.md) |
| 4   | QA + rollout checklist (FB/Zalo validators, mobile, regressions) | Pending | 0.25d     | [phase-04](./phase-04-qa-rollout.md)         |

## Key dependencies / references

- Next.js metadata helper: `apps/web/src/lib/seo.ts`
- Product PDP page: `apps/web/src/app/products/[slug]/page.tsx`
- Existing share component: `apps/web/src/components/products/product-pdp-share-buttons.tsx`

## Risks / watch-outs (high signal)

- **Scraper caching**: Facebook/Zalo cache OG data aggressively; we need a validation flow and “refresh” steps.
- **Image shape**: product images may be portrait/small; previews may look bad unless we provide a consistent OG image.
- **Absolute URLs**: OG images must be absolute https; ensure all sources resolve correctly.

## Success criteria

- Copy link works reliably (desktop + mobile) and shows confirmation.
- On mobile, user can share via native share sheet when supported.
- Sharing `https://.../products/{slug}` shows correct product title + image on:
  - Facebook share dialog + link preview
  - Zalo share link preview
- No SEO regression: canonical remains correct; metadata remains valid.

## Unresolved questions (answer in Phase 1)

- Which share targets are must-have besides **Zalo + Facebook**? (e.g. Messenger, Telegram, WhatsApp, Email)
- Do we want to add UTM parameters to shared links (and if so, what convention)?
