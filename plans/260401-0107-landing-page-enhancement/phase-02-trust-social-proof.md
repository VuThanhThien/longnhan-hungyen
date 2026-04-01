# Phase 02 — Trust & Social Proof

**Status:** Completed | **Priority:** P1 | **Effort:** 3h

## Context Links
- Plan: [plan.md](./plan.md)
- Testimonials: `apps/web/src/components/landing/landing-testimonials-trust.tsx`
- Content data: `apps/web/src/data/landing-page-content.ts`
- Footer: `apps/web/src/components/layout/footer.tsx`

## Overview

Current testimonials section is placeholder (empty items array). Trust section has unfilled copy. Add visual star ratings, certification badges, customer stats bar, and payment method icons.

## Key Insights

- `LANDING_TESTIMONIALS.items` is currently `[]` — section falls back to placeholder text
- `LANDING_TRUST.items` contains placeholder "Điền MST..." text — needs real content structure
- Vietnamese buyers heavily weight: certifications (OCOP/ATTP), COD guarantee, order count
- Payment icons near CTA reduce purchase friction for first-time buyers

## Requirements

### Functional
- [ ] Star rating display on testimonial cards (1–5 stars, visual)
- [ ] Customer stats bar: order count / years in business / satisfaction rate
- [ ] Certification / quality badges section (OCOP, ATTP, or placeholder with clear slot)
- [ ] Payment method icons in footer or near CTA section (COD, bank transfer, Shopee Pay)
- [ ] Update `LANDING_TRUST` data structure to support real content (not placeholders)

### Non-Functional
- Stats bar animates numbers on scroll-reveal (optional enhancement)
- Certification images: use Next.js `<Image>` with explicit dimensions

## Architecture

```
apps/web/src/
  components/
    landing/
      landing-testimonials-trust.tsx   ← MODIFY (add star rating, stats bar, cert badges)
      landing-stats-bar.tsx            ← NEW (customer stats: orders, years, rating)
    layout/
      footer.tsx                       ← MODIFY (add payment icons row)
  data/
    landing-page-content.ts            ← MODIFY (update LANDING_TESTIMONIALS type, LANDING_TRUST, add LANDING_STATS, LANDING_CERTS)
```

## Related Code Files

- **MODIFY** `apps/web/src/components/landing/landing-testimonials-trust.tsx`
- **MODIFY** `apps/web/src/components/layout/footer.tsx`
- **MODIFY** `apps/web/src/data/landing-page-content.ts`
- **CREATE** `apps/web/src/components/landing/landing-stats-bar.tsx`

## Implementation Steps

1. **Update `LANDING_TESTIMONIALS` type** in `landing-page-content.ts`
   ```ts
   // Add optional rating field
   items: { quote: string; author: string; location?: string; rating?: number }[]
   ```

2. **Add star rating to testimonial cards** in `landing-testimonials-trust.tsx`
   - Render `★` / `☆` based on `rating` (1–5), default 5 if not set
   - Gold color: `text-(--brand-gold-dark)`
   - Only render stars if `rating` defined

3. **Add `LANDING_STATS`** data in `landing-page-content.ts`
   ```ts
   export const LANDING_STATS = [
     { value: '500+', label: 'Đơn hàng mỗi mùa' },
     { value: '5+', label: 'Năm kinh nghiệm' },
     { value: '98%', label: 'Khách hài lòng' },
   ]
   ```

4. **Create `landing-stats-bar.tsx`**
   - `flex justify-center gap-12 md:gap-20` row
   - Each stat: large number (font-bold, brand-forest) + small label
   - Background: `bg-(--brand-forest)` dark section or subtle cream stripe
   - Keep under 50 lines

5. **Insert stats bar** in `page.tsx` after `LandingTestimonialsTrust`

6. **Add `LANDING_CERTS`** data
   ```ts
   export const LANDING_CERTS = {
     sectionTitle: 'Chứng nhận & uy tín',
     items: [
       { label: 'An toàn thực phẩm', imageSrc: null }, // slot for real image
       { label: 'Sản phẩm OCOP', imageSrc: null },
     ]
   }
   ```
   - Render as badge cards with label; show placeholder if `imageSrc` null
   - Add cert section inside `landing-testimonials-trust.tsx` or as separate component

7. **Update `LANDING_TRUST`** — replace placeholder strings with real structure
   ```ts
   export const LANDING_TRUST = {
     sectionTitle: 'Cam kết của chúng tôi',
     items: [
       'Giao hàng COD toàn quốc — nhận hàng mới thanh toán',
       'Đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả',
       'Quy trình chế biến khép kín, an toàn vệ sinh thực phẩm',
       'Hỗ trợ tư vấn miễn phí qua Zalo và điện thoại',
     ],
   }
   ```

8. **Add payment icons to footer**
   - Row of text labels or SVG icons: "COD · Chuyển khoản · Shopee Pay · Ví MoMo"
   - Simple `flex gap-3 text-xs text-green-300` row in footer bottom section

## Todo List

- [ ] Add `rating?: number` to `LANDING_TESTIMONIALS` items type
- [ ] Add star rendering to testimonial cards
- [ ] Add `LANDING_STATS` data to `landing-page-content.ts`
- [ ] Create `landing-stats-bar.tsx`
- [ ] Insert `<LandingStatsBar />` in `page.tsx`
- [ ] Add `LANDING_CERTS` data and render cert badges in trust section
- [ ] Update `LANDING_TRUST.items` with real commitment copy
- [ ] Add payment method labels/icons to `footer.tsx`

## Success Criteria

- Testimonial cards show gold stars (or nothing if no rating set)
- Stats bar visible on landing page with placeholder numbers
- Trust section shows real commitment text (not "Điền..." placeholders)
- Certification badges section renders with fallback when no image
- Footer shows accepted payment methods

## Risk Assessment

- **Empty testimonials** — stars section only renders when items exist; keep fallback
- **OCOP images** — use `null` slots with text fallback until real assets provided
- **Stats numbers** — use conservative estimates; owner must verify accuracy

## Next Steps

→ Phase 03 (UX & Navigation Polish)
