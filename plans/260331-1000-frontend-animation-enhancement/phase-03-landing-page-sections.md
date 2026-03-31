# Phase 03 — Landing Page Sections

## Context Links
- [Plan Overview](plan.md)
- [Phase 01](phase-01-core-animation-layer.md) ← must complete first
- [landing-hero.tsx](../../apps/web/src/components/landing/landing-hero.tsx)
- [landing-story.tsx](../../apps/web/src/components/landing/landing-story.tsx)
- [landing-testimonials-trust.tsx](../../apps/web/src/components/landing/landing-testimonials-trust.tsx)
- [landing-page-content.ts](../../apps/web/src/data/landing-page-content.ts)

## Overview
- **Priority:** P2
- **Status:** Pending (blocked by Phase 1)
- **Effort:** ~5h
- Make the landing page visually stunning with hero parallax, sticky brand story scroll, animated testimonials carousel, and decorative SVG dividers.

## Key Insights
- Hero parallax: `useScroll` + `useTransform` — background moves at 0.5x scroll speed. Must be `'use client'`, and background layer must be `position: absolute` for parallax to work
- Sticky scroll story: CSS `position: sticky` + tall scroll container — no JS needed for stickiness, but entry animation via motion
- Testimonials carousel: `AnimatePresence mode="wait"` swaps slides, drag on mobile, auto-advance with `setInterval`
- SVG dividers: simple wave/leaf SVG between sections — animate path `strokeDashoffset` on scroll entry for draw-in effect
- Number counters: `useInView` + custom counter hook — only count up once when section enters viewport

## Requirements

### Functional
- Hero background parallaxes at 0.5x scroll speed
- Hero headline words/lines animate in on mount with stagger
- Brand story section: image sticks while text content scrolls alongside
- Testimonials: auto-advance every 5s, manual dot navigation, swipe on mobile
- Animated leaf/wave SVG dividers between major landing sections
- (Optional) Number counter for stats if data exists in landing-page-content.ts

### Non-Functional
- Parallax disabled below `md` breakpoint (perf on mobile)
- Auto-advance carousel pauses on hover
- All animations `once: true` — no repeat on scroll back
- `prefers-reduced-motion`: parallax off, carousel transitions instant

## Architecture

```
landing/
├── landing-hero.tsx                    ← add parallax bg + headline stagger
├── landing-story.tsx                   ← sticky scroll layout
├── landing-testimonials-trust.tsx      ← carousel with AnimatePresence
├── (new) landing-section-divider.tsx   ← animated SVG wave divider
└── (new) animated-counter.tsx          ← count-up number animation
```

### Hero Parallax Pattern
```tsx
'use client'
const { scrollY } = useScroll()
const bgY = useTransform(scrollY, [0, 500], [0, -120])
// On md+ only — use CSS media query or useMediaQuery hook
<motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none" />
```

### Testimonials Carousel Pattern
```tsx
const [index, setIndex] = useState(0)
// Auto-advance
useEffect(() => {
  const t = setInterval(() => setIndex(i => (i + 1) % items.length), 5000)
  return () => clearInterval(t)
}, [])

<AnimatePresence mode="wait">
  <motion.div
    key={index}
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    drag="x" dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={(_, info) => {
      if (info.offset.x < -50) setIndex(i => (i + 1) % items.length)
      if (info.offset.x > 50) setIndex(i => (i - 1 + items.length) % items.length)
    }}
  >
    {testimonials[index]}
  </motion.div>
</AnimatePresence>
```

### SVG Divider Pattern
```tsx
// Animated wave path draw-in on scroll entry
<motion.path
  d="M0,40 C200,0 400,80 600,40 S1000,0 1200,40"
  initial={{ pathLength: 0, opacity: 0 }}
  whileInView={{ pathLength: 1, opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 1.2, ease: 'easeInOut' }}
/>
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `apps/web/src/components/landing/landing-hero.tsx` | modify | Add parallax bg + headline stagger |
| `apps/web/src/components/landing/landing-story.tsx` | modify | Sticky scroll layout + entry animation |
| `apps/web/src/components/landing/landing-testimonials-trust.tsx` | modify | Convert to AnimatePresence carousel |
| `apps/web/src/components/landing/landing-section-divider.tsx` | create | Animated SVG wave divider |
| `apps/web/src/components/ui/animated-counter.tsx` | create | Count-up number component |
| `apps/web/src/app/page.tsx` | modify | Add LandingSectionDivider between sections |

## Implementation Steps

1. **Modify `landing-hero.tsx` — parallax + headline stagger**
   - Add `'use client'` directive
   - Import `motion, useScroll, useTransform` from `'motion/react'`
   - Import `useReducedMotion` from hooks
   - Extract the SVG background pattern `<div>` into a `<motion.div style={{ y: bgY }}>` where `bgY = useTransform(scrollY, [0, 600], [0, -100])`
   - Guard: if `shouldReduceMotion` or mobile (use `useMediaQuery('(max-width: 768px)')`), set `bgY` to static 0
   - Headline: wrap each `<span>` line with `motion.span` with stagger via parent `variants`
   - Parent `variants`: `{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }`
   - Child `variants`: `{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }`
   - Animate `<h1>` with `initial="hidden" animate="visible"`

2. **Modify `landing-story.tsx` — sticky scroll**
   - Read current component structure first
   - Convert to two-column layout: left = sticky image, right = scrollable text
   - Left column: `sticky top-24 h-fit` CSS (pure CSS sticky, no JS)
   - Right column: normal flow with multiple text blocks
   - Wrap each text block with `AnimatedSection` from Phase 1
   - Add entry animation to the image with `motion.div whileInView scale 0.95 → 1`

3. **Create `landing-section-divider.tsx`**
   - `'use client'` directive
   - Renders SVG with animated wave path (draw-in on scroll)
   - Props: `variant?: 'wave' | 'leaf'` (default 'wave'), `className?: string`, `color?: string`
   - Wave: smooth sinusoidal SVG path
   - Use `motion.path` with `initial={{ pathLength: 0 }}` + `whileInView={{ pathLength: 1 }}`
   - `viewport={{ once: true }}`, `transition={{ duration: 1.2 }}`
   - If `shouldReduceMotion`: render static path (no animation)

4. **Modify `landing-testimonials-trust.tsx` — carousel**
   - Add `'use client'` directive
   - Read current structure to understand data shape
   - Add `useState(0)` for active index
   - Add `useEffect` for 5s auto-advance interval, clear on unmount
   - Pause on hover: `onMouseEnter` / `onMouseLeave` to pause/resume interval
   - Wrap testimonial content in `AnimatePresence mode="wait"` with keyed `motion.div`
   - Add drag support for mobile swipe
   - Add dot indicator row at bottom: small circles, active dot slightly larger via motion `scale`

5. **Create `animated-counter.tsx`** (if stats exist in landing-page-content.ts)
   - Check `landing-page-content.ts` for any numeric stats
   - If present: `useInView` ref, `useMotionValue` + `useTransform` to animate number
   - Props: `value: number`, `duration?: number`, `suffix?: string`
   - Count from 0 to `value` over `duration` seconds once in view

6. **Modify `app/page.tsx`** — add dividers between sections
   - Import `LandingSectionDivider`
   - Insert between major landing sections (after hero, after story, etc.)

7. **Run type-check and build**
   ```bash
   pnpm --filter @longnhan/web type-check
   pnpm --filter @longnhan/web build
   ```

## Todo List

- [ ] Modify `landing-hero.tsx` — parallax background (md+ only)
- [ ] Modify `landing-hero.tsx` — headline stagger reveal on mount
- [ ] Modify `landing-story.tsx` — sticky left image, scrollable right text
- [ ] Create `landing-section-divider.tsx` — animated SVG wave
- [ ] Modify `landing-testimonials-trust.tsx` — AnimatePresence carousel
- [ ] Add auto-advance (5s) + pause on hover to carousel
- [ ] Add drag/swipe support to carousel
- [ ] Add dot indicator to carousel
- [ ] Create `animated-counter.tsx` (if stats data exists)
- [ ] Add dividers between sections in `app/page.tsx`
- [ ] Run type-check — zero errors

## Success Criteria

- Hero background subtly parallaxes on desktop scroll
- Hero headline lines stagger in on page load
- Brand story image stays sticky while text scrolls alongside on desktop
- Testimonials auto-advance with smooth left/right transition
- Testimonials swipeable on mobile
- SVG wave dividers animate draw-in when scrolled into view
- No layout shift or hydration errors

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `useScroll` on SSR | `'use client'` required; wrap in `useEffect` if accessing `window` directly |
| Parallax janky on low-end devices | Disable below `md`, use `will-change: transform` CSS only on hero bg element |
| Carousel timer memory leak | Always `clearInterval` in `useEffect` cleanup |
| Sticky story on mobile | Apply `sticky` only on `md:` breakpoint — stack normally on mobile |
| SVG path animation flicker | Use `fill="none"` on path, stroke-based animation only |

## Next Steps

Phase 4 (mobile UX) can run in parallel with this phase after Phase 1 is complete.
