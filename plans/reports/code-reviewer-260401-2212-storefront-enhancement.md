# Code Review — Storefront Enhancement (6-Phase)

**Date:** 2026-04-01
**Score: 8.0 / 10**

---

## Scope

- **New files:** 14 components (landing/, home/, ui/, products/)
- **Modified files:** 6 (layout.tsx, product-card, product-images, product-pdp-hero, product-pdp-tabs, landing-page-content.ts)
- **Total LOC reviewed:** ~616 new + ~370 modified
- All files are well under 200 LOC — KISS/YAGNI respected.

---

## Overall Assessment

Implementation is clean, focused, and idiomatic Next.js. Security fundamentals are correct (rel="noopener noreferrer", encodeURIComponent). Vietnamese diacritics are accurate throughout. No syntax errors. Carousel interval is properly cleared on unmount. The few issues below are medium/low priority — nothing blocks shipping.

---

## Critical Issues

None.

---

## High Priority

### 1. `Math.min/max` spread on potentially empty array — `product-pdp-tabs.tsx`

`buildSpecRows` spreads the result of `.filter((weight) => weight > 0)` directly into `Math.min/Math.max`. When ALL variants have weight 0 or undefined, the filtered array is empty and the spread produces `Math.min()` → `Infinity` and `Math.max()` → `-Infinity`. The guard `minWeight > 0` on line 28 saves the display from showing garbage, but `Infinity` and `-Infinity` are still stored in local variables unnecessarily — can cause subtle bugs if the condition logic changes later.

**Fix:** guard before calling:
```ts
const weights = product.variants
  .map((v) => v.weightG ?? v.weightGrams ?? 0)
  .filter((w) => w > 0);
const minWeight = weights.length ? Math.min(...weights) : 0;
const maxWeight = weights.length ? Math.max(...weights) : 0;
```

### 2. Body scroll not locked when quick-view modal is open — `product-quick-view-modal.tsx`

The modal renders as `fixed inset-0` overlay but never sets `document.body.style.overflow = 'hidden'`. On mobile, users can scroll the page behind the modal while it is open — degraded UX and visually broken on shorter viewports.

**Fix:** add to the `useEffect` that listens for `product`:
```ts
document.body.style.overflow = product ? 'hidden' : '';
return () => { document.body.style.overflow = ''; };
```

---

## Medium Priority

### 3. Carousel does not reset auto-rotation timer on manual navigation — `hero-carousel.tsx`

`useEffect` only depends on `count`, so the `setInterval` is never cleared/restarted when user clicks prev/next/dot. If a user clicks a slide 4.9 s into the 5 s cycle, the slide changes immediately then flips again in 0.1 s. Standard pattern: debounce reset or include `active` in the dep array with a debounced interval.

### 4. No `aria-live` region on carousel — `hero-carousel.tsx`

Screen readers don't announce slide changes. Add `aria-live="polite"` and `aria-atomic="true"` to the `<h1>` wrapper or a hidden live region.

### 5. `icons` map silently renders `undefined` for unknown icon keys — `landing-service-badges.tsx`

`icons[badge.icon]` returns `undefined` if a future `LANDING_SERVICE_BADGES` entry uses a key not in the map (e.g. `star`). React renders nothing, no error. Add a fallback:
```ts
{icons[badge.icon] ?? <span className="h-6 w-6" />}
```

### 6. `LANDING_HERO_SLIDES[active]` is not guarded — `hero-carousel.tsx`

Line 24: `const slide = LANDING_HERO_SLIDES[active]`. If `active` ever exceeds `count - 1` (race condition on fast unmount/remount), this returns `undefined` and the destructure on line 25 throws. A simple `?? LANDING_HERO_SLIDES[0]` fallback is sufficient.

### 7. Hardcoded ingredient/shelf-life text in `product-pdp-hero.tsx`

Lines 57–62 render "Long nhãn Hưng Yên tuyển chọn chất lượng cao" and "12 tháng" as static strings regardless of the actual product data. If product variants have different shelf lives or compositions, this will mislead users. Should come from product data or be omitted until the field exists in the type.

### 8. Duplicate `getPriceRange` / `formatPrice` logic in 3 files

`product-card.tsx`, `product-quick-view-modal.tsx`, and `product-pdp-hero.tsx` each implement their own `getPriceRange`/`formatPrice`. Extract to a shared `lib/product-utils.ts` (DRY).

---

## Low Priority

### 9. z-index ordering is correct but uses mixed conventions

- header: `z-50`
- floating-contact-widget: `z-50` (same as header — works because they don't overlap, but fragile)
- back-to-top: `z-40`
- quick-view modal: `z-[60]`

Recommend a single z-index scale in `tailwind.config` (`z-header: 50`, `z-overlay: 60`, etc.) to avoid magic numbers. Current values are functional.

### 10. `product-card.tsx` marked `'use client'` but has no client-only hooks

The `onQuickView` prop uses event handlers so `'use client'` is justified, but the component could be split: a pure server card + a thin client wrapper for the quick-view button (minor optimization).

### 11. `LandingStatsBar` uses `text-green-200` (raw Tailwind) instead of brand token

All other components use `text-(--brand-*)` CSS vars. `text-green-200` in `landing-stats-bar.tsx:11` is inconsistent with design system.

### 12. `formatDate` in `landing-articles-preview.tsx` does not handle invalid date strings

`new Date('not-a-date').toLocaleDateString(...)` returns `"Invalid Date"` which will render literally. Add an `isNaN` guard.

---

## Positive Observations

- `rel="noopener noreferrer"` correctly applied on all external links (floating widget, share buttons).
- `encodeURIComponent` used correctly in share URLs and category query params.
- Vietnamese text uses accurate diacritics throughout (Mô tả, Đánh giá, Hưng Yên, etc.).
- Carousel `clearInterval` on unmount — no memory leak.
- Mobile safe-area inset correctly applied via `env(safe-area-inset-bottom)` on floating widget.
- `{ passive: true }` on scroll listener in `back-to-top-button.tsx`.
- `aria-label` on all interactive icon-only buttons.
- `aria-hidden="true"` on all decorative SVGs.
- `pb-16 md:pb-0` on `<main>` in `layout.tsx` correctly accounts for mobile bottom bar height.
- Quick-view modal Escape key handler properly cleaned up.
- `'use client'` boundary correctly placed only where needed.

---

## Recommended Actions (Priority Order)

1. Fix `Math.min/max` on empty array in `product-pdp-tabs.tsx` — avoids Infinity in state.
2. Add body scroll lock in `product-quick-view-modal.tsx`.
3. Extract `getPriceRange`/`formatPrice` to shared util (DRY, 3 duplicates).
4. Guard `LANDING_HERO_SLIDES[active]` with fallback.
5. Fix carousel auto-rotation reset on manual nav (UX polish).
6. Add `aria-live="polite"` to carousel (a11y).
7. Replace hardcoded ingredient/shelf-life text in `product-pdp-hero.tsx` with dynamic data.
8. Fix `text-green-200` → brand token in `landing-stats-bar.tsx`.
9. Add `isNaN` guard to `formatDate` in `landing-articles-preview.tsx`.

---

## Unresolved Questions

- Will `product.tags` be added to the `@longnhan/types` `Product` type? Currently cast via `as unknown as { tags?: string[] }` in `product-pdp-hero.tsx` — should be resolved before type library is stable.
- `LANDING_CERTS.items` has `imageSrc: null` entries — placeholder or intentional? Renders nothing currently.
- `LANDING_TESTIMONIALS.items` is empty array — is there a fallback render path or will the section be conditionally excluded from page assembly?
