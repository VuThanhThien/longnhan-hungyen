# Brainstorm Report: Frontend Animation & UI Enhancement
**Date:** 2026-03-31 | **Session:** 10:00

---

## Problem Statement

Long Nhan Hung Yen e-commerce frontend (apps/web) lacks animation and visual polish. Current state uses only basic Tailwind hover utilities. User wants premium, elegant animations matching a high-end Vietnamese longan fruit brand — inspired by tinhhoaphohien.vn.

---

## Requirements

- **Style:** Elegant & subtle — scroll-triggered reveals, soft parallax, refined micro-interactions
- **Scope:** All 4 areas — landing hero, product UX, section transitions, mobile experience
- **Library:** `motion` (Framer Motion successor, React 19 + Next.js 15 native)
- **Principle:** YAGNI/KISS — no over-engineering, reusable animation primitives

---

## Reference Site Analysis (tinhhoaphohien.vn)

- Warm gold/rust premium palette (#d7942c, #d26e4b)
- Product gallery with lightbox + thumbnail nav
- Bottom-fixed mobile contact bar (Zalo, phone) — high-conversion
- Collapsible accordion product specs
- Multi-channel trust badges (Shopee, Zalo, etc.)
- Left-right product layout (image gallery + details)

---

## Recommended Solution

### Library: `motion` v11+
- 25kb gzip, tree-shakable
- React 19 concurrent rendering compatible
- `useInView`, `useScroll`, `useTransform` hooks
- Zero conflict with Tailwind CSS v4

### Reusable Pattern
```tsx
// components/ui/animated-section.tsx — DRY wrapper
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
>
```

---

## Implementation Phases

### Phase 1 — Core Animation Layer
- Install `motion` library
- `AnimatedSection` reusable wrapper component
- Scroll fade-up on all landing sections
- Stagger animations on product grid, FAQ, channels list
- Hero text reveal on mount
- Smooth page transitions with `AnimatePresence`

### Phase 2 — Product Experience
- Product image lightbox gallery (motion `AnimatePresence` + portal)
- Product card hover lift (`whileHover: { y: -4, shadow }`)
- Variant selector smooth indicator slide
- Image zoom on hover (CSS transform-origin)

### Phase 3 — Landing Page Sections
- Soft parallax hero (background 0.5x scroll speed via `useScroll` + `useTransform`)
- Sticky scroll brand story section
- Testimonials carousel with swipe transitions + dot indicators
- Number counter animation for stats on scroll enter
- Animated SVG section dividers

### Phase 4 — Mobile UX
- Sticky floating CTA bar (bottom-fixed: "Đặt hàng ngay" + Zalo/phone icons)
- Swipeable product image gallery (touch drag)
- Mobile menu slide-in drawer (`x: -100% → 0`)

---

## What Was Rejected

| Option | Reason |
|--------|--------|
| GSAP | Overkill, heavy learning curve for this scope |
| Parallax everywhere | Perf + UX degradation; only hero |
| Lottie animations | Extra assets, maintenance burden |
| Three.js / 3D | Wrong brand direction for food e-commerce |
| PhotoSwipe (ref site) | Extra dependency; Motion portal covers same need |

---

## Success Criteria

- Lighthouse Performance score stays ≥ 85
- All animations use `viewport: { once: true }` — no re-trigger on scroll back
- Animations respect `prefers-reduced-motion` media query
- Mobile CTA bar increases conversion (measurable via order form submissions)
- Zero hydration errors from Motion in SSR/Next.js App Router

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Motion SSR hydration mismatch | Use `m.div` with `LazyMotion` for SSR-safe components |
| Bundle size increase | Tree-shake: import only used hooks/components |
| Parallax on low-end mobile | Disable parallax below `md` breakpoint |
| Too many animations (overwhelming) | Strict: max 1 animation type per section, 0.5–0.8s duration |

---

## Unresolved Questions

- What analytics tool tracks conversion rate for mobile CTA bar?
- Are there specific brand motion guidelines (easing curves, duration standards)?
- Should page transitions be enabled for product detail → back navigation?
