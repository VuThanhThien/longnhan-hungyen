# Phase 02 — Product Experience

## Context Links
- [Plan Overview](plan.md)
- [Phase 01](phase-01-core-animation-layer.md) ← must complete first
- [product-card.tsx](../../apps/web/src/components/products/product-card.tsx)
- [product-images.tsx](../../apps/web/src/components/products/product-images.tsx)
- [variant-selector.tsx](../../apps/web/src/components/products/variant-selector.tsx)

## Overview
- **Priority:** P2
- **Status:** Pending (blocked by Phase 1)
- **Effort:** ~4h
- Enhance product browsing UX with hover lift effects, image lightbox gallery, and smooth variant selection.

## Key Insights
- Current `product-card.tsx` uses `group-hover:scale-105` — replace with motion `whileHover` for smoother, more controllable animation
- Lightbox: use `AnimatePresence` + `createPortal` (no extra library) — portal to `document.body`, backdrop + centered image
- Variant selector: absolute positioned indicator `<motion.span>` with `layoutId` — auto-animates between positions using Motion's layout animation
- Image lightbox needs keyboard support (Escape key) and focus trap for accessibility

## Requirements

### Functional
- Product cards lift smoothly on hover (y: -4px, shadow increase)
- Click product image → full-screen lightbox with prev/next navigation
- Lightbox closeable via: backdrop click, Escape key, close button
- Variant selector shows sliding indicator between options
- Image gallery thumbnail click transitions smoothly

### Non-Functional
- Lightbox uses `createPortal` — no z-index stacking issues
- Keyboard accessible (Escape, arrow keys in lightbox)
- `prefers-reduced-motion`: hover effects disabled, lightbox still functional (no transition)
- All components remain `'use client'` — no server component breakage

## Architecture

```
products/
├── product-card.tsx          ← replace scale-105 with motion whileHover
├── product-images.tsx        ← add lightbox modal + swipe support (mobile)
├── variant-selector.tsx      ← add layoutId sliding indicator
└── (new) product-lightbox.tsx ← extracted lightbox modal component
```

### Lightbox Pattern
```tsx
// AnimatePresence controls mount/unmount with fade
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      />
    </motion.div>
  )}
</AnimatePresence>
```

### Variant Indicator Pattern
```tsx
// layoutId causes motion to animate the indicator between variants
{selected === variant.id && (
  <motion.span layoutId="variant-indicator" className="absolute inset-0 bg-forest rounded" />
)}
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `apps/web/src/components/products/product-card.tsx` | modify | Replace `group-hover:scale-105` with `motion.div whileHover` |
| `apps/web/src/components/products/product-images.tsx` | modify | Add lightbox state + `ProductLightbox` usage |
| `apps/web/src/components/products/product-lightbox.tsx` | create | Extracted lightbox modal component |
| `apps/web/src/components/products/variant-selector.tsx` | modify | Add `layoutId` sliding indicator |

## Implementation Steps

1. **Enhance `product-card.tsx`**
   - Add `'use client'` if not present
   - Import `motion` from `'motion/react'`
   - Wrap card root `<div>` with `<motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }}`
   - Add `style={{ boxShadow }}` interpolation or use Tailwind `hover:shadow-lg` alongside
   - Remove `group-hover:scale-105` from image — add `motion.img whileHover={{ scale: 1.03 }}` on image wrapper instead

2. **Create `product-lightbox.tsx`**
   - `'use client'` directive
   - Props: `images: string[]`, `initialIndex: number`, `isOpen: boolean`, `onClose: () => void`
   - Use `createPortal(content, document.body)` to avoid stacking context issues
   - `useEffect` to add/remove `keydown` listener for Escape + arrow keys
   - `AnimatePresence` wraps the whole portal
   - Backdrop: `motion.div` fill screen, `onClick={onClose}`, dark overlay
   - Image: centered `motion.img` with scale-in animation, `onClick` stops propagation
   - Prev/Next buttons: arrow icons, `onClick` cycles `currentIndex`
   - Close button: top-right × icon
   - Thumbnail strip at bottom showing all images, click to jump

3. **Modify `product-images.tsx`**
   - Add `useState` for `lightboxOpen` and `lightboxIndex`
   - Make main image clickable: `onClick={() => { setLightboxOpen(true); setLightboxIndex(current) }}`
   - Add `cursor-zoom-in` class to main image wrapper
   - Render `<ProductLightbox>` at bottom of component
   - Add thumbnail transition: wrap selected thumbnail indicator with `motion.div layoutId="thumb-indicator"`

4. **Modify `variant-selector.tsx`**
   - Add `'use client'` if not present
   - Import `motion` from `'motion/react'`
   - Each variant button: wrap with `relative` positioning
   - Add `{isSelected && <motion.span layoutId="variant-bg" className="absolute inset-0 bg-[var(--brand-forest)] rounded-sm" style={{ zIndex: 0 }} />}`
   - Ensure button text is `position: relative; z-index: 1` to stay above indicator
   - Add `transition={{ type: 'spring', stiffness: 300, damping: 30 }}` on motion.span

5. **Run type-check**
   ```bash
   pnpm --filter @longnhan/web type-check
   ```

## Todo List

- [ ] Enhance `product-card.tsx` with motion whileHover (replace scale-105)
- [ ] Create `apps/web/src/components/products/product-lightbox.tsx`
- [ ] Add keyboard handlers (Escape, arrow keys) to lightbox
- [ ] Integrate lightbox into `product-images.tsx`
- [ ] Add thumbnail indicator transition in `product-images.tsx`
- [ ] Add layoutId sliding indicator to `variant-selector.tsx`
- [ ] Run type-check — zero errors

## Success Criteria

- Product cards lift 4px on hover with smooth shadow
- Clicking main product image opens full-screen lightbox
- Lightbox closes via backdrop click, Escape key, and close button
- Prev/next arrows navigate between images
- Variant selection shows smooth sliding indicator
- No TypeScript errors

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `createPortal` SSR error | Wrap in `useEffect` check: `if (typeof document === 'undefined') return null` |
| layoutId conflict (multiple cards on same page) | Use unique `layoutId` per product: `layoutId={\`variant-\${productId}\`}` |
| Lightbox blocks scroll on body | Add `overflow-hidden` to `document.body` on open, remove on close via useEffect |
| Focus trap in lightbox | Add `tabIndex={-1}` + `autoFocus` on lightbox container, restore focus on close |

## Next Steps

Phase 3 (landing sections) can run in parallel with this phase.
