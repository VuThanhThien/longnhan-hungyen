## Context links

- Existing component: `apps/web/src/components/products/product-pdp-share-buttons.tsx`
- PDP page: `apps/web/src/app/products/[slug]/page.tsx`

## Overview

- **Priority**: P1
- **Status**: Pending
- **Outcome**: implement the agreed share UX with a small, accessible, mobile-friendly component.

## Requirements

### Functional requirements

- Provide:
  - Copy-to-clipboard for canonical product link
  - Zalo share link
  - Facebook share link
  - Web Share sheet (when supported)
- Use canonical product URL for all shares.

### Non-functional requirements

- Accessible buttons/links (aria-labels, focus ring).
- Client-only logic only where necessary (clipboard/share APIs).
- Minimal dependencies (prefer existing UI primitives; don’t add icon packs unless already used).

## Architecture

### Component split (recommended)

- Keep a single exported component for PDP usage:
  - `ProductPdpShareButtons` (or rename if needed)
- Internals:
  - Build share URLs via small pure helpers
  - Use a tiny client hook/state for “copied” feedback and `navigator.share()` gating

### Share URL rules

- **Zalo**: `https://zalo.me/share/url?url={url}&title={title}`
- **Facebook**: `https://www.facebook.com/sharer/sharer.php?u={url}`
- Title should be encoded; URL should be encoded.

## Related code files

### Modify

- `apps/web/src/components/products/product-pdp-share-buttons.tsx`

### Optional create

- `apps/web/src/components/products/share-helpers.ts` (pure helpers only, if file size grows)

## Implementation steps (planning-level)

1. Update UI layout based on Phase 1 decisions:
   - Desktop actions row
   - Mobile “Share” button that uses `navigator.share()` when available
2. Implement copy-to-clipboard:
   - Prefer `navigator.clipboard.writeText(productUrl)` with fallback to legacy method if needed
   - Provide clear success feedback (“Đã sao chép”)
3. Add safe external link attributes:
   - `target="_blank"` and `rel="noopener noreferrer"`
4. Ensure share buttons do not break SSR:
   - Component likely needs `"use client"` once it uses clipboard/share APIs
5. Basic smoke tests:
   - Copy works in modern browsers
   - FB/Zalo links open correctly
   - Mobile share sheet triggers on supported devices

## Todo list

- [ ] Implement copy-to-clipboard + feedback
- [ ] Implement Web Share + fallback behavior
- [ ] Keep visuals consistent with storefront styling
- [ ] Ensure a11y (labels, focus)

## Success criteria

- Share controls are usable on mobile + desktop.
- Copy link provides immediate feedback.
- No runtime errors in server logs related to browser-only APIs.

## Risk assessment

- Clipboard API may fail on insecure origins; ensure behavior is safe and error-handled.

## Security considerations

- Do not include user-specific info in the shared URL.

## Next steps

- Validate real share previews end-to-end in Phase 4 (scraper caches, real devices).
