---
phase: 6
title: "Frontend — landing motion & effects"
status: pending
effort: 5h
depends_on: [1]
---

# Phase 6: Frontend — landing motion & effects

## Context Links

- [Plan Overview](plan.md)
- [Phase 4: Storefront](phase-04-storefront.md) — global layout/header/footer may land here first; this phase focuses on **home landing** only.

## Overview

- **Priority:** P1 (business-facing marketing surface)
- **Status:** pending
- Elevate `apps/web` **landing page** (`src/app/page.tsx` + `src/components/landing/*`) with purposeful **motion, micro-interactions, and scroll effects** while keeping **SEO, LCP, and CLS** healthy. Stack is **Next.js App Router + React 19 + Tailwind CSS v4** (not MUI/TanStack Router — ignore generic frontend-development skill paths that assume Vite/MUI).

## Business goals

- Stronger first impression and perceived quality for longan specialty brand.
- Guide attention to CTAs (phone, Shopee, Zalo) without noisy or gimmicky motion.
- Differentiate from flat brochure pages competitors use.

## Technical principles

| Principle | Rule |
|-----------|------|
| Accessibility | Honor `prefers-reduced-motion: reduce` — disable or replace with instant state changes. |
| Performance | Prefer `transform` and `opacity`; avoid animating `width`, `height`, `top`, `left` on large nodes. |
| RSC boundary | Keep **Server Components** as default; add **`'use client'`** only on islands that need hooks or Framer Motion. |
| Bundle | Lazy-load heavy motion utilities if introduced; keep landing JS budget small. |
| Brand | Motion timing/easing should feel calm and natural (organic product), not arcade-like. |

## Recommended tooling

1. **Primary:** `framer-motion` — `motion` components, `whileInView`, `viewport={{ once: true }}`, staggered children for sections.
2. **Secondary:** Tailwind `animate-*` + custom `@keyframes` in `globals.css` for simple loops (gradient drift, subtle pulse on decorative elements).
3. **Optional:** CSS `view-timeline` / `animation-timeline` where browser support is acceptable; otherwise Intersection Observer via Framer `whileInView`.

Add dependency in `apps/web`:

```bash
pnpm --filter @longnhan/web add framer-motion
```

## Scope (files)

| Area | File(s) | Enhancement ideas |
|------|---------|-------------------|
| Hero | `landing-hero.tsx` | Split client wrapper: headline stagger fade-up, image gentle scale-in on view, CTA hover press + focus ring, optional parallax-lite on background pattern (transform only). |
| Story | `landing-story.tsx` | Section fade + slide on scroll; pull-quote emphasis. |
| Product quality | `landing-product-quality.tsx` | Card or column stagger; icon/badge subtle scale on view. |
| Nutrition / season | `landing-nutrition-season.tsx` | Tabular or list rows reveal; seasonal badge pulse (CSS). |
| Channels | `landing-channels.tsx` | Button/link magnetic hover (small translate) or icon bounce-once on view. |
| Testimonials | `landing-testimonials-trust.tsx` | Carousel or cards: cross-fade / slide if multiple; single card fade-in. |
| FAQ | `landing-faq.tsx` | Accordion height animation (CSS or motion layout); chevron rotate. |
| Shared | `section-heading.tsx` | Underline or accent line `scaleX` from 0→1 on view. |

Introduce small shared helpers as needed (YAGNI):

- `components/landing/motion-prefers-reduced-motion.ts` — hook or utility wrapping `useReducedMotion` from Framer Motion.
- `components/landing/section-reveal.tsx` — reusable `motion.section` with consistent `variants`.

## Implementation steps

1. Add `framer-motion`; verify React 19 peer compatibility in lockfile.
2. Implement `useReducedMotion` gating at section level (pass `initial/animate` or static layout when reduced).
3. Refactor one section at a time: extract minimal client boundary (e.g. `landing-hero-motion.tsx` imported from `landing-hero.tsx` server wrapper if beneficial).
4. Tune durations (e.g. 0.35–0.6s), easing (`easeOut` / custom cubic-bezier).
5. Run Lighthouse on mobile; adjust if LCP/CLS regress.
6. Manual test: keyboard focus, screen reader (headings still first in DOM order; avoid `aria-hidden` on meaningful text).

## Todo list

- [x] Add `motion` (Framer Motion successor) to `apps/web`
- [x] Add reduced-motion handling (`ScrollReveal` + `prefers-reduced-motion` in `apps/web/src/components/ui/scroll-reveal.tsx`)
- [ ] Hero: stagger headline, image/illustration entrance, CTA micro-interaction
- [x] Section headings: reveal accent / fade-up (via `ScrollReveal` wrappers on `app/page.tsx`)
- [x] Story + product quality + nutrition: scroll-triggered reveals (stagger where cheap)
- [ ] Channels + testimonials: hover / entrance polish
- [ ] FAQ: smooth expand/collapse + chevron
- [ ] Audit `globals.css` for shared keyframes (optional subtle background motion)
- [ ] Lighthouse mobile + `prefers-reduced-motion` smoke test

## Success criteria

- Landing feels noticeably more alive; no critical a11y or performance regressions.
- Lighthouse **Performance** and **Accessibility** remain in green band vs pre-change baseline (document scores in PR if possible).
- All animations respect **reduced motion**.

## Risks

| Risk | Mitigation |
|------|------------|
| Too many client islands | Coalesce motion per section into one client child. |
| CLS from lazy images + motion | Reserve space; animate only after layout stable or use opacity-only first paint. |
| Over-animation | Cap simultaneous effects; review on real 4G device. |

## Next steps

- [Phase 7: Deployment](phase-07-deployment.md)
