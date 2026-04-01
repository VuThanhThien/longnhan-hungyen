# Phase 03 — UX & Navigation Polish

**Status:** Completed | **Priority:** P2 | **Effort:** 3h

> ✅ Already done: Breadcrumb wired on product page, JSON-LD schemas fully implemented.

## Context Links
- Plan: [plan.md](./plan.md)
- Header: `apps/web/src/components/layout/header.tsx`
- Breadcrumb UI: `apps/web/src/components/ui/breadcrumb.tsx`
- Product page: `apps/web/src/app/products/[slug]/page.tsx`
- Article page: `apps/web/src/app/articles/[slug]/page.tsx`

## Overview

Polish UX gaps: back-to-top button, breadcrumb on inner pages, seasonal urgency element, and cart icon in header. These reduce friction and improve navigation confidence.

## Key Insights

- `breadcrumb.tsx` component exists but isn't wired to product/article pages
- Header has no cart icon — reference site shows cart with total amount
- Long landing page has no back-to-top — standard UX expectation
- Seasonal urgency ("Mùa nhãn tháng 7–9") is a strong differentiator for agricultural products

## Requirements

### Functional
- [ ] Back-to-top button — appears after user scrolls 400px, smooth scroll
- [ ] Breadcrumb on product detail page (`/products/[slug]`)
- [ ] Breadcrumb on article detail page (`/articles/[slug]`)
- [ ] Seasonal availability badge / urgency strip on hero or near CTA
- [ ] Cart icon in header with item count badge

### Non-Functional
- Back-to-top must be client component (scroll event listener)
- Breadcrumb uses existing `breadcrumb.tsx` component — no new component needed
- Cart count from existing cart state/context
- Urgency strip only shows during season months (configurable, not hardcoded)

## Architecture

```
apps/web/src/
  components/
    ui/
      back-to-top-button.tsx         ← NEW (client component, scroll listener)
    layout/
      header.tsx                     ← MODIFY (add cart icon + count badge)
    landing/
      landing-urgency-strip.tsx      ← NEW (seasonal availability notice)
  app/
    layout.tsx                       ← MODIFY (mount BackToTopButton globally)
    products/[slug]/
      page.tsx                       ← MODIFY (add Breadcrumb)
    articles/[slug]/
      page.tsx                       ← MODIFY (add Breadcrumb)
    page.tsx                         ← MODIFY (add LandingUrgencyStrip)
```

## Related Code Files

- **CREATE** `apps/web/src/components/ui/back-to-top-button.tsx`
- **CREATE** `apps/web/src/components/landing/landing-urgency-strip.tsx`
- **MODIFY** `apps/web/src/components/layout/header.tsx` — cart icon
- **MODIFY** `apps/web/src/app/layout.tsx` — mount BackToTopButton
- **MODIFY** `apps/web/src/app/products/[slug]/page.tsx` — breadcrumb
- **MODIFY** `apps/web/src/app/articles/[slug]/page.tsx` — breadcrumb
- **MODIFY** `apps/web/src/app/page.tsx` — urgency strip
- **MODIFY** `apps/web/src/data/landing-page-content.ts` — urgency copy

## Implementation Steps

1. **Create `back-to-top-button.tsx`** (client component)
   ```tsx
   'use client'
   // Listen to window scroll; show button when scrollY > 400
   // Fixed bottom-right: `fixed bottom-20 right-4 md:bottom-6 z-40`
   // On mobile: above floating contact bar (bottom-20), desktop bottom-6
   // Smooth scroll: window.scrollTo({ top: 0, behavior: 'smooth' })
   // Accessible: aria-label="Lên đầu trang"
   ```

2. **Mount in `layout.tsx`** — alongside FloatingContactWidget (Phase 1)

3. **Wire breadcrumb in product page** (`/products/[slug]/page.tsx`)
   - Items: `[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm', href: '/products' }, { label: product.name }]`
   - Place above product hero component

4. **Wire breadcrumb in article page** (`/articles/[slug]/page.tsx`)
   - Items: `[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức', href: '/articles' }, { label: article.title }]`

5. **Create `landing-urgency-strip.tsx`**
   - Show seasonal message: "🌟 Mùa nhãn tháng 7–9 — Đặt trước để đảm bảo nguồn hàng"
   - Configurable via `LANDING_URGENCY` data (show/hide toggle + message)
   - Compact banner: `bg-(--brand-gold)/15 border-b border-(--brand-gold)/30 text-center py-2 text-sm`
   - Place in `layout.tsx` above header OR in `page.tsx` above hero

6. **Add `LANDING_URGENCY`** to `landing-page-content.ts`
   ```ts
   export const LANDING_URGENCY = {
     enabled: true,
     message: 'Mùa nhãn tháng 7–9 — Liên hệ sớm để đảm bảo nguồn hàng chất lượng nhất',
   }
   ```

7. **Cart icon in header**
   - Read cart item count from existing cart context/store
   - Icon: shopping bag SVG with count badge `absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4`
   - If no cart state exists yet: show icon without badge (no-op, non-breaking)
   - Position: in header right area, before MobileNav

## Todo List

- [ ] Create `back-to-top-button.tsx`
- [ ] Mount BackToTopButton in `layout.tsx`
- [ ] Check existing cart context in codebase before adding cart icon
- [ ] Add cart icon to `header.tsx`
- [ ] Wire `Breadcrumb` in `products/[slug]/page.tsx`
- [ ] Wire `Breadcrumb` in `articles/[slug]/page.tsx`
- [ ] Create `landing-urgency-strip.tsx`
- [ ] Add `LANDING_URGENCY` to `landing-page-content.ts`
- [ ] Insert urgency strip in `page.tsx` or `layout.tsx`
- [ ] Verify back-to-top z-index doesn't conflict with floating contact widget

## Success Criteria

- Back-to-top button appears after scroll 400px, disappears at top
- Product and article pages show correct breadcrumb trail
- Urgency strip renders when `enabled: true`, hidden when `false`
- Cart icon in header shows count when items in cart
- No z-index conflicts between back-to-top, floating widget, header

## Risk Assessment

- **Cart context may not exist** — check `services/cart` or context providers before implementing; add icon as non-functional placeholder if needed
- **Urgency strip always-on** — must respect `enabled` flag so owner can toggle off-season
- **Breadcrumb long product names** — add `truncate` or `max-w` on last breadcrumb item

## Security Considerations

- No auth or data concerns in this phase

## Next Steps

→ Phase 04 (Content & SEO)
