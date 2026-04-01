# Phase 01 — Critical Conversion Elements

**Status:** Completed | **Priority:** P1 | **Effort:** 4h

## Context Links
- Plan: [plan.md](./plan.md)
- Reference: https://tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua
- Hero: `apps/web/src/components/landing/landing-hero.tsx`
- Layout: `apps/web/src/components/layout/`
- Constants: `apps/web/src/lib/constants.ts`

## Overview

Three highest-ROI missing elements. Vietnamese e-commerce conversion depends heavily on Zalo/phone accessibility and immediate trust signals.

## Key Insights

- ~40-60% of orders on Vietnamese e-commerce initiated via Zalo/phone — floating contact is critical
- Reference site shows floating panel (desktop) + bottom bar (mobile) always visible
- Current hero shows logo only — no actual product photo
- Service badges ("Giao hàng 24h", "COD", "Tư vấn") dramatically reduce first-visit hesitation

## Requirements

### Functional
- [ ] Floating sticky contact widget: desktop (left float panel) + mobile (bottom bar)
  - Buttons: Gọi điện, Chat Zalo, Chat Facebook
  - Desktop: fixed left side, vertical pill/card layout
  - Mobile: fixed bottom, horizontal icon+label row
- [ ] Service badges strip — horizontal row below hero or in hero section
  - 3 badges: "Giao hàng 24h", "Tư vấn miễn phí", "Thanh toán COD"
  - Each badge: icon + text, compact horizontal layout
- [ ] Hero section — add real product image alongside logo
  - Show product photo (use first product from API or static fallback)
  - Logo stays but product image should be visible

### Non-Functional
- Floating widget must NOT block content on mobile — use safe-area insets
- Lazy-load product image in hero (non-blocking)
- Accessible: aria-labels on all contact buttons

## Architecture

```
apps/web/src/
  components/
    layout/
      floating-contact-widget.tsx   ← NEW (desktop float + mobile bottom bar)
    landing/
      landing-service-badges.tsx    ← NEW (3 badge strip)
      landing-hero.tsx              ← MODIFY (add product image slot)
  app/
    layout.tsx                      ← MODIFY (add FloatingContactWidget)
    page.tsx                        ← MODIFY (add LandingServiceBadges after hero)
```

## Related Code Files

- **MODIFY** `apps/web/src/components/landing/landing-hero.tsx` — add product photo column
- **MODIFY** `apps/web/src/app/layout.tsx` — mount FloatingContactWidget globally
- **MODIFY** `apps/web/src/app/page.tsx` — insert LandingServiceBadges
- **MODIFY** `apps/web/src/data/landing-page-content.ts` — add service badges copy
- **CREATE** `apps/web/src/components/layout/floating-contact-widget.tsx`
- **CREATE** `apps/web/src/components/landing/landing-service-badges.tsx`

## Implementation Steps

1. **Create `floating-contact-widget.tsx`**
   - Desktop: `fixed left-4 bottom-24 z-50 flex flex-col gap-2` — 3 pill buttons
   - Mobile: `fixed bottom-0 inset-x-0 z-50 flex justify-around border-t` — show on `md:hidden`
   - Use `SOCIAL_LINKS.zalo`, `SOCIAL_LINKS.facebook`, `CONTACT_PHONE` from constants
   - Add `aria-label` to each button
   - Desktop pills: icon + label text; mobile: icon + small label below

2. **Mount in `layout.tsx`**
   - Import and add `<FloatingContactWidget />` before closing `</body>`
   - Add `pb-16 md:pb-0` to main content wrapper to avoid mobile bar overlap

3. **Create `landing-service-badges.tsx`**
   - 3 items: `{ icon, label, sublabel }[]`
   - Layout: `flex flex-wrap justify-center gap-6 md:gap-10`
   - Each: icon (SVG) + text, `bg-(--brand-cream)` strip style
   - Keep under 60 lines

4. **Add badges data to `landing-page-content.ts`**
   ```ts
   export const LANDING_SERVICE_BADGES = [
     { icon: 'truck', label: 'Giao hàng 24h', sublabel: 'Toàn quốc' },
     { icon: 'chat', label: 'Tư vấn miễn phí', sublabel: 'Zalo & điện thoại' },
     { icon: 'cash', label: 'Thanh toán COD', sublabel: 'Nhận hàng mới trả' },
   ]
   ```

5. **Insert badges in `page.tsx`** — after `<LandingHero />`, before `<LandingStory />`

6. **Update hero** — add product image in right column alongside logo
   - Accept optional `productImageSrc?: string` prop or use first product from parent
   - If no product image, fall back to logo only (current behavior)

## Todo List

- [ ] Create `floating-contact-widget.tsx`
- [ ] Mount FloatingContactWidget in `layout.tsx`
- [ ] Add body padding-bottom for mobile bar overlap
- [ ] Create `landing-service-badges.tsx`
- [ ] Add `LANDING_SERVICE_BADGES` data to `landing-page-content.ts`
- [ ] Insert `<LandingServiceBadges />` in `page.tsx`
- [ ] Update `landing-hero.tsx` to show product image when available
- [ ] Test mobile bottom bar on narrow viewport (375px)
- [ ] Verify floating widget does not overlap content on desktop

## Success Criteria

- Floating Zalo/Phone buttons visible on all pages at all scroll positions
- Mobile bottom bar visible on screens < 768px
- Service badges visible immediately below hero
- Hero displays product image when API returns products
- No layout shift or content overlap from floating elements

## Risk Assessment

- **Floating widget z-index conflicts** — test against header (z-50), modals
- **Mobile safe-area** — add `pb-safe` or `env(safe-area-inset-bottom)` for iPhone notch
- **SOCIAL_LINKS.zalo/facebook empty** — widget still renders with tel: fallback

## Security Considerations

- `rel="noopener noreferrer"` on all external links (Zalo, Facebook)
- No user data collected in floating widget

## Next Steps

→ Phase 02 (Trust & Social Proof) can begin in parallel
