# Phase 01 — Core Animation Layer

## Context Links
- [Plan Overview](plan.md)
- [Brainstorm Report](../reports/brainstorm-260331-1000-frontend-animation-enhancement.md)
- [landing-hero.tsx](../../apps/web/src/components/landing/landing-hero.tsx)
- [app/layout.tsx](../../apps/web/src/app/layout.tsx)

## Overview
- **Priority:** P1 (prerequisite for all other phases)
- **Status:** in-progress
- **Effort:** ~4h
- Install `motion` library and build the reusable animation infrastructure that all other phases depend on.

## Key Insights
- `motion` (not `framer-motion`) is the v12 successor — import from `'motion/react'`
- Next.js App Router: animated components must be `'use client'` — server components cannot use motion
- `viewport: { once: true }` prevents re-triggering on scroll-back (critical for elegance)
- `prefers-reduced-motion` must be respected — use `useReducedMotion()` hook from motion
- `AnimatePresence` for page transitions must wrap at `app/layout.tsx` level

## Requirements

### Functional
- `motion` installed and importable in all web components
- `AnimatedSection` wrapper applies consistent scroll-reveal to any child
- All existing landing + home sections wrapped with `AnimatedSection`
- Stagger animations applied to list containers (product grid, FAQ, channels)
- Page transitions on route changes via `AnimatePresence`

### Non-Functional
- Bundle size increase < 30kb gzip (motion is ~25kb tree-shakable)
- No hydration errors in Next.js SSR
- Animations disabled when `prefers-reduced-motion: reduce`
- Duration range: 0.5–0.8s, easing: `easeOut` (elegant, not bouncy)

## Architecture

```
apps/web/src/
├── hooks/
│   └── use-reduced-motion.ts        ← wraps motion's useReducedMotion
├── components/ui/
│   └── animated-section.tsx         ← reusable scroll-reveal wrapper
├── components/ui/
│   └── stagger-container.tsx        ← stagger children animation wrapper
└── app/
    └── layout.tsx                   ← add AnimatePresence for page transitions
```

### AnimatedSection API
```tsx
<AnimatedSection delay={0.1} direction="up" className="...">
  {children}
</AnimatedSection>
```
- `delay`: 0–0.4s (stagger between sections)
- `direction`: 'up' | 'left' | 'right' (default: 'up')
- Internally uses `motion.div` with `whileInView` + `viewport: { once: true }`

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `apps/web/package.json` | modify | add `motion` dependency |
| `apps/web/src/hooks/use-reduced-motion.ts` | create | prefers-reduced-motion hook |
| `apps/web/src/components/ui/animated-section.tsx` | create | reusable scroll-reveal wrapper |
| `apps/web/src/components/ui/stagger-container.tsx` | create | stagger children wrapper |
| `apps/web/src/app/layout.tsx` | modify | add AnimatePresence for page transitions |
| `apps/web/src/components/landing/landing-hero.tsx` | modify | wrap content with AnimatedSection |
| `apps/web/src/components/landing/landing-channels.tsx` | modify | wrap + stagger channel items |
| `apps/web/src/components/landing/landing-product-quality.tsx` | modify | wrap + stagger cards |
| `apps/web/src/components/landing/landing-story.tsx` | modify | wrap with AnimatedSection |
| `apps/web/src/components/landing/landing-testimonials-trust.tsx` | modify | wrap with AnimatedSection |
| `apps/web/src/components/landing/landing-nutrition-season.tsx` | modify | wrap with AnimatedSection |
| `apps/web/src/components/landing/landing-faq.tsx` | modify | wrap + stagger FAQ items |
| `apps/web/src/components/home/hero-section.tsx` | modify | wrap with AnimatedSection |
| `apps/web/src/components/home/featured-products.tsx` | modify | wrap + stagger products |
| `apps/web/src/components/home/cta-section.tsx` | modify | wrap with AnimatedSection |
| `apps/web/src/components/home/video-section.tsx` | modify | wrap with AnimatedSection |

## Implementation Steps

1. **Install motion library**
   ```bash
   pnpm add motion --filter @longnhan/web
   ```

2. **Create `use-reduced-motion.ts`**
   ```ts
   // apps/web/src/hooks/use-reduced-motion.ts
   'use client'
   import { useReducedMotion } from 'motion/react'
   export { useReducedMotion }
   ```

3. **Create `animated-section.tsx`**
   - `'use client'` directive at top
   - Import `motion` from `'motion/react'`, `useReducedMotion` from hooks
   - Accept props: `children`, `delay?: number`, `direction?: 'up'|'left'|'right'`, `className?: string`
   - Compute `initial` based on direction: up → `{ opacity: 0, y: 24 }`, left → `{ opacity: 0, x: -24 }`, right → `{ opacity: 0, x: 24 }`
   - If `shouldReduceMotion`: render plain `<div>` wrapping children (no animation)
   - Return `<motion.div initial={initial} whileInView={{ opacity: 1, y: 0, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay, ease: 'easeOut' }} className={className}>`

4. **Create `stagger-container.tsx`**
   - `'use client'` directive
   - Wraps children in `motion.div` with `variants` for stagger
   - Container variant: `{ visible: { transition: { staggerChildren: 0.1 } } }`
   - Item variant exported as `staggerItem`: `{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }`
   - Props: `children`, `className`

5. **Modify `app/layout.tsx`** for page transitions
   - Add `'use client'` to a new `PageTransitionWrapper` component in `components/layout/`
   - Wrap `{children}` with `<AnimatePresence mode="wait">` and `<motion.main key={pathname}>`
   - Use `usePathname()` from `next/navigation` as the key
   - Transition: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` → `exit={{ opacity: 0 }}`, duration 0.3s

6. **Wrap all landing sections** — edit each landing component to add `AnimatedSection` as outer wrapper with appropriate delay (0, 0.1, 0.2... per section order)

7. **Apply StaggerContainer** to product grid in `featured-products.tsx` and channel items in `landing-channels.tsx` and FAQ items in `landing-faq.tsx`

8. **Run type-check and build**
   ```bash
   pnpm --filter @longnhan/web type-check
   pnpm --filter @longnhan/web build
   ```

## Todo List

- [x] Install `motion` package
- [ ] Create `apps/web/src/hooks/use-reduced-motion.ts`
- [ ] Create `apps/web/src/components/ui/animated-section.tsx` (interim: `scroll-reveal.tsx` used for scroll-driven fade-up)
- [ ] Create `apps/web/src/components/ui/stagger-container.tsx`
- [ ] Create `apps/web/src/components/layout/page-transition-wrapper.tsx`
- [ ] Modify `app/layout.tsx` to use PageTransitionWrapper
- [x] Wrap all 6 landing components with AnimatedSection (implemented with `ScrollReveal` in `app/page.tsx`)
- [ ] Wrap all 4 home components with AnimatedSection (`FeaturedProducts`, `VideoSection`, `CtaSection` wrapped; fourth home block not wired same way)
- [ ] Apply StaggerContainer to featured-products, landing-channels, landing-faq
- [x] Run type-check and build — zero errors

## Success Criteria

- `motion` importable from all web components without error
- All landing/home sections animate in on scroll (fade-up, once only)
- Page route changes produce 0.3s fade transition
- `prefers-reduced-motion` users see zero animations
- `pnpm build` passes with zero errors

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Hydration mismatch | `'use client'` on all motion components; never use motion in Server Components |
| `usePathname` in layout | Create separate client `PageTransitionWrapper` component, keep layout.tsx as Server Component |
| Motion tree-shaking | Import only used hooks: `import { motion, AnimatePresence, useReducedMotion } from 'motion/react'` |
| Tailwind transform conflict | motion uses inline styles for transforms — no conflict with Tailwind classes |

## Next Steps

After Phase 1 complete → Phases 2, 3, 4 can all start in parallel.
