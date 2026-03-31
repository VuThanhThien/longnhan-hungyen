# Phase 04 — Mobile UX

## Context Links
- [Plan Overview](plan.md)
- [Phase 01](phase-01-core-animation-layer.md) ← must complete first
- [mobile-nav.tsx](../../apps/web/src/components/layout/mobile-nav.tsx)
- [header.tsx](../../apps/web/src/components/layout/header.tsx)
- [product-images.tsx](../../apps/web/src/components/products/product-images.tsx)
- [app/layout.tsx](../../apps/web/src/app/layout.tsx)
- [constants.ts](../../apps/web/src/lib/constants.ts)

## Overview
- **Priority:** P2
- **Status:** Pending (blocked by Phase 1)
- **Effort:** ~3h
- High-conversion mobile UX improvements: sticky floating CTA bar, swipeable product gallery, and slide-in mobile menu drawer.

## Key Insights
- Floating CTA bar: proven high-conversion pattern from reference site (tinhhoaphohien.vn) — always visible on mobile, links to order form / phone / Zalo
- Swipeable gallery: `drag="x"` with `dragConstraints` on motion.div — track `onDragEnd` offset to determine swipe direction
- Mobile menu drawer: currently `mobile-nav.tsx` likely uses CSS show/hide — refactor to motion `x: '-100%' → x: 0` with backdrop
- Floating CTA must be `hidden md:hidden` — never shown on desktop
- Safe area support: add `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch

## Requirements

### Functional
- Floating CTA bar visible on all mobile pages (bottom-fixed)
- CTA bar contains: "Đặt hàng ngay" button + Zalo icon link + phone icon link
- CTA bar hides/shows based on scroll direction (hides when scrolling down, shows when scrolling up)
- Product image gallery swipeable by touch drag on mobile
- Mobile nav opens as slide-in drawer from left with backdrop overlay
- Backdrop click closes mobile nav drawer

### Non-Functional
- CTA bar only on mobile (`md:hidden`)
- CTA bar handles iPhone safe area (bottom padding)
- Swipe detection threshold: 50px minimum drag to trigger slide change
- Drawer animation: 0.3s ease-out
- `prefers-reduced-motion`: instant open/close (no transition), CTA still visible

## Architecture

```
layout/
├── mobile-floating-cta.tsx     ← NEW: sticky bottom CTA bar
├── mobile-nav.tsx              ← MODIFY: add motion slide-in drawer
└── header.tsx                  ← MODIFY: pass open state to mobile-nav

products/
└── product-images.tsx          ← MODIFY: add touch drag swipe (Phase 2 coordination)

app/
└── layout.tsx                  ← MODIFY: add MobileFloatingCta
```

### Floating CTA Pattern
```tsx
// Scroll-direction aware show/hide
const { scrollY } = useScroll()
const [visible, setVisible] = useState(true)
useMotionValueEvent(scrollY, 'change', (curr) => {
  const prev = scrollY.getPrevious() ?? 0
  setVisible(curr < prev || curr < 100) // show when scrolling up or near top
})

<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      ...
    </motion.div>
  )}
</AnimatePresence>
```

### Mobile Drawer Pattern
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {/* Drawer */}
      <motion.nav
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
      >
        ...
      </motion.nav>
    </>
  )}
</AnimatePresence>
```

### Touch Swipe Pattern (product-images.tsx)
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.1}
  onDragEnd={(_, info) => {
    if (info.offset.x < -50) goNext()
    if (info.offset.x > 50) goPrev()
  }}
>
  <img src={images[current]} />
</motion.div>
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `apps/web/src/components/layout/mobile-floating-cta.tsx` | create | Sticky bottom CTA bar |
| `apps/web/src/components/layout/mobile-nav.tsx` | modify | Refactor to motion slide-in drawer |
| `apps/web/src/components/layout/header.tsx` | modify | Ensure open/close state passed correctly |
| `apps/web/src/components/products/product-images.tsx` | modify | Add touch drag swipe |
| `apps/web/src/app/layout.tsx` | modify | Add `<MobileFloatingCta />` |
| `apps/web/src/lib/constants.ts` | read | Get CONTACT_PHONE, ZALO_LINK values |

## Implementation Steps

1. **Read `constants.ts`** — note `CONTACT_PHONE` and any Zalo link constants

2. **Create `mobile-floating-cta.tsx`**
   - `'use client'` directive
   - Import `motion, AnimatePresence, useScroll, useMotionValueEvent` from `'motion/react'`
   - Import `useReducedMotion` from hooks
   - Import `CONTACT_PHONE` (and Zalo link if available) from `'@/lib/constants'`
   - Scroll-direction detection: `useMotionValueEvent(scrollY, 'change', ...)` — show when scrolling up or near top (< 100px)
   - Layout: `fixed bottom-0 inset-x-0 z-40 md:hidden bg-[var(--brand-cream)] border-t border-[var(--brand-gold)]/30 shadow-lg`
   - Safe area: `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}`
   - Three buttons in a row:
     - Phone icon + "Gọi ngay" → `href="tel:..."`
     - Primary CTA "Đặt hàng ngay" → `href="#order-form"` or order page
     - Zalo icon → `href={zaloLink}` (if available)
   - `AnimatePresence` wraps entire bar for show/hide
   - If `shouldReduceMotion`: always visible, no slide animation

3. **Add to `app/layout.tsx`**
   - Import `MobileFloatingCta`
   - Add `<MobileFloatingCta />` before closing `</body>` tag
   - Add bottom padding to main content area on mobile so CTA bar doesn't overlap: `pb-16 md:pb-0` on main

4. **Read `mobile-nav.tsx`** current implementation
   - Understand current show/hide mechanism and nav link structure
   - Preserve all existing nav links and functionality

5. **Refactor `mobile-nav.tsx`** to motion drawer
   - Add `'use client'` if not present
   - Import `motion, AnimatePresence` from `'motion/react'`
   - Replace CSS-based show/hide with `AnimatePresence` + motion drawer
   - Add backdrop `motion.div` behind drawer
   - Drawer: `motion.nav` with `initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}`
   - Transition: `type: 'tween', duration: 0.3, ease: 'easeOut'`
   - Close button inside drawer (×)
   - Backdrop `onClick` closes drawer

6. **Verify `header.tsx`** — ensure `isOpen`/`setIsOpen` state passed to `MobileNav`

7. **Add swipe to `product-images.tsx`** (coordinate with Phase 2 work)
   - Wrap image in `motion.div` with `drag="x"` + `dragConstraints`
   - `onDragEnd`: threshold 50px — call existing prev/next handlers
   - Add `cursor-grab active:cursor-grabbing` on desktop, `touch-action: pan-y` on mobile (allow vertical scroll)

8. **Run type-check and build**
   ```bash
   pnpm --filter @longnhan/web type-check
   pnpm --filter @longnhan/web build
   ```

## Todo List

- [ ] Read `constants.ts` for phone/Zalo values
- [ ] Create `apps/web/src/components/layout/mobile-floating-cta.tsx`
- [ ] Add scroll-direction show/hide to floating CTA
- [ ] Add iPhone safe area padding to floating CTA
- [ ] Add `<MobileFloatingCta />` to `app/layout.tsx`
- [ ] Add `pb-16 md:pb-0` padding to main content area
- [ ] Read current `mobile-nav.tsx` implementation
- [ ] Refactor `mobile-nav.tsx` to motion slide-in drawer with backdrop
- [ ] Verify header.tsx state flow for mobile nav
- [ ] Add touch drag swipe to `product-images.tsx`
- [ ] Run type-check — zero errors

## Success Criteria

- Floating CTA bar visible at bottom on all mobile pages
- CTA bar hides when scrolling down, reappears when scrolling up
- CTA bar has correct padding for iPhone safe area
- Mobile nav opens with smooth left slide-in, backdrop darkens
- Backdrop or × button closes nav
- Product images swipeable by touch drag
- Desktop layout unaffected (no CTA bar, no drawer regression)
- No hydration errors

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| CTA bar overlaps page content | Add `pb-16 md:pb-0` to main layout wrapper |
| `env(safe-area-inset-bottom)` CSS not supported | Fallback: `padding-bottom: 16px` alongside env() |
| Scroll direction detection too sensitive | Debounce or threshold: only toggle after 10px delta |
| Drag on product images conflicts with vertical page scroll | Use `dragDirectionLock: true` and `touch-action: pan-y` |
| Mobile nav state in header — prop drilling | Confirm current pattern in header.tsx before refactoring |

## Next Steps

After all 4 phases complete:
- Run full Lighthouse audit to verify Performance ≥ 85
- Test on real mobile device (iOS Safari + Android Chrome)
- Test with `prefers-reduced-motion` enabled in OS settings
