## Context links

- Existing PDP share UI: `apps/web/src/components/products/product-pdp-share-buttons.tsx`
- PDP route: `apps/web/src/app/products/[slug]/page.tsx`
- SEO helper: `apps/web/src/lib/seo.ts`

## Overview

- **Priority**: P1
- **Status**: Pending
- **Outcome**: a small, explicit UX spec for product sharing behavior across desktop/mobile, including supported share targets and fallbacks.

## Key insights

- The repo already constructs product canonical URLs and OG metadata on the PDP; this phase is about **defining expected user behavior** and **platform targets** so implementation stays tight.
- Zalo and Facebook are already supported; the highest-value UX improvements are typically:
  - **Copy link** (works everywhere)
  - **Web Share API** on mobile (native share sheet)
  - A few additional “open URL” targets as simple anchors

## Requirements

### Functional requirements

- Share module must support:
  - **Copy link** (one action)
  - **Zalo share**
  - **Facebook share**
  - **System share sheet** (Web Share API) when available
- Share module must accept minimal inputs:
  - `productName`
  - `productUrl` (canonical product URL)

### Non-functional requirements

- Must be usable with keyboard and screen readers (focus states, labels).
- Must not degrade page performance (no heavy dependencies).
- Must not break SSR/RSC boundaries (Web Share + clipboard only in client components).

## UX decisions (define before coding)

### Desktop

- Show compact row of share actions:
  - Primary: Copy link
  - Secondary: Zalo, Facebook
  - Optional: Telegram / Email (if requested)
- Confirmation:
  - Inline “Đã sao chép” toast or small inline state (2–3 seconds)

### Mobile

- Prefer a single “Chia sẻ” action that:
  - Uses `navigator.share()` when available
  - Falls back to showing the action row (copy + Zalo + Facebook)

### Share text conventions

- Title: `productName`
- URL: canonical product URL (no tracking by default unless decided)
- Optional message (if platform supports): `productName` + short shop tagline (keep minimal)

## Related code files

### Likely modify

- `apps/web/src/components/products/product-pdp-share-buttons.tsx`
- Potentially PDP hero where share buttons are rendered (depending on current placement)

### Potentially create

- `apps/web/src/components/products/use-share-product.ts` (if we want to isolate clipboard/share logic)

## Implementation steps (planning-level)

1. Pick share targets list:
   - Must-have: Copy, Zalo, Facebook, Web Share
   - Decide on optional targets (Telegram / Email / Messenger / WhatsApp)
2. Decide whether to append UTM params to shared links:
   - Default recommendation: **no** unless business explicitly needs it
3. Decide UI layout:
   - Desktop: actions row
   - Mobile: single “Share” button + fallback row
4. Decide user feedback mechanism:
   - toast vs inline label; pick pattern consistent with web UI components

## Todo list

- [ ] Confirm share target list (beyond Zalo + Facebook)
- [ ] Confirm whether UTMs are required
- [ ] Confirm copy/share success feedback UI pattern

## Success criteria

- Spec clearly states:
  - What users see on desktop vs mobile
  - Exact list of share targets
  - Fallback rules when APIs are unavailable

## Risk assessment

- **Scope creep**: too many social targets increases QA surface; keep to a small curated list.

## Security considerations

- Only share public product URLs; do not include user/session data in shared URLs.

## Next steps

- Move to Phase 2 to ensure OG previews are correct for the canonical link we’ll share.
