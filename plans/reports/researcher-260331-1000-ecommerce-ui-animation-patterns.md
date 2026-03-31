# Ecommerce UI/UX Design & Animation Patterns Research

**Date:** 2026-03-31
**Focus:** Reference site analysis (tinhhoaphohien.vn) + modern animation techniques for Next.js 15 + React 19

---

## 1. Reference Site Design Analysis

### Visual Design Patterns

**Color Scheme**
- Primary Accent: `#d7942c` (gold/warm) — premium food product positioning
- Secondary: `#d26e4b` (rust/terracotta)
- Text: `#5e4027` (dark brown) — high contrast on light backgrounds
- Success States: `#7a9c59` (sage green)
- Footer: Dark `#000000` with light content areas

**Typography**
- Headings: UTMSeagullBold (custom serif)
- Body: Roboto (clean, readable)
- Establishes warm, inviting premium feel

**Layout Structure**
- Fixed header: logo, search, cart (height: 117px desktop, 70px mobile)
- Product page: Left-aligned gallery + right-aligned details (responsive stacking)
- Breakpoints: 767px (tablet), 549px (mobile)
- Bottom-fixed contact bar replaces floating elements on mobile

### Product Presentation Techniques

1. **Image Gallery**
   - PhotoSwipe lightbox integration
   - Thumbnail navigation for variant switching
   - Supports multiple product images with smooth transitions

2. **Product Details Structure**
   - Collapsible tabs for descriptions/specs
   - Key info: composition, shelf life (HSD: 12 tháng), usage suggestions
   - Nutritional benefits presented hierarchically

3. **Social Proof & Trust**
   - Social sharing buttons: WhatsApp, Facebook, Twitter, Pinterest, LinkedIn
   - Quantity increment controls (confidence signaling)
   - Structured product metadata display

### Interactive Elements

- **CTA Buttons**: "Thêm vào giỏ hàng" (Add to Cart) with dropdown variant selectors
- **Quantity Controls**: +/- increment for purchase confidence
- **Floating Contact Bar**: Fixed bottom navigation on mobile
- **Tooltips**: Tooltipster library for hover hints
- **Custom Button Styling**: Gradient pseudo-elements (::before, ::after) for ornate borders

### Mobile-First Patterns

- Stacked layout for product details (image above, details below)
- Reduced padding/margins for mobile screens
- Bottom-fixed contact bar instead of floating sidebars
- Responsive typography scaling
- Touch-friendly button sizing

---

## 2. Top 5-8 Animation & UI Patterns Worth Adopting

### Pattern 1: Scroll-Triggered Product Reveals
**Use Case:** Product grid/featured sections
- Fade-in + slide-up on viewport entry
- Staggered timing for grid items (100-150ms offset)
- Adoption metric: 67% of award-winning sites use this (2024)

### Pattern 2: Hover State Enhancements
**Use Case:** Product cards, CTAs
- Scale effect (1.02-1.05)
- Gradient or shadow elevation
- Smooth 200-300ms transition
- Reference: Custom gradient pseudo-elements technique

### Pattern 3: Scroll-Linked Parallax
**Use Case:** Hero sections, product imagery
- Background moves at 50-70% of scroll speed
- Creates depth perception without performance cost
- Works well with food/lifestyle product photography

### Pattern 4: Layout Shift Animations
**Use Case:** Filter results, cart updates, variant selection
- Smooth repositioning when DOM changes (reorder products)
- No janky layout shifts
- Shared layout animation for seamless transitions

### Pattern 5: Image Reveal Sliders
**Use Case:** Product gallery, variant showcase
- Slide transition between product images
- Automatic or manual advance
- Staggered animation for multiple images on same page

### Pattern 6: Gesture-Driven Interactions
**Use Case:** Mobile product browsing
- Swipe-to-dismiss product cards
- Drag-and-drop cart reordering
- Touch-friendly carousel with momentum scrolling

### Pattern 7: Collapsible Content (Accordion)
**Use Case:** Product specs, ingredients, FAQs
- Smooth height expansion/collapse
- Icon rotation (180°) indicating state
- Used on reference site for product descriptions

### Pattern 8: Sticky/Floating Contact Bar
**Use Case:** Mobile CTAs
- Fixed bottom bar with store contact options
- Dismissible on scroll-down, reappears on scroll-up
- High conversion pattern (reference site uses this)

---

## 3. Modern Animation Libraries for Next.js 15 + React 19

### Recommended Primary: **Motion** (Framer Motion Successor)

**URL:** https://motion.dev/

**Strengths:**
- Production-grade React animation library
- Declarative API (feels native to React)
- Viewport detection built-in (`whileInView`, `viewport` props)
- Scroll animations with `useScroll()` hook
- Layout animations for reordering (handles DOM shifts)
- Performance optimized (animates transform + opacity only)
- React 19 compatible

**Best For:**
- Scroll-triggered reveals
- Page transitions
- Gesture interactions
- Layout animations (product filters, cart reordering)

**Example Patterns:**
```jsx
// Scroll-triggered fade-in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
/>

// Hover scale
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 300 }}
/>

// Scroll-linked parallax
<motion.div style={{ y: useScroll().scrollY * 0.5 }} />
```

### Secondary: **GSAP ScrollTrigger**

**Strengths:**
- Industry-standard for agencies (high-end marketing sites)
- Unmatched precision for complex timeline sequences
- Better for video scrubbing and advanced effects
- More verbose but more control

**Best For:**
- Complex product showcase sequences (like iPhone product pages)
- Video scroll scrubbing with overlay text
- Timeline-based narratives
- When animation precision is non-negotiable

**Tradeoff:** More verbose, requires learning GSAP syntax (not React-native)

### Tertiary: **React Scroll Animation Libraries**

Lightweight alternatives for specific use cases:

- **react-animate-on-scroll**: Simple viewport detection for fade/slide effects
- **react-kino**: Cinematic scroll-driven storytelling
- **AOS (Animate On Scroll)**: Lightweight, extensive preset animations

**Best For:**
- Landing page sections
- Simple fade-in/slide-in patterns
- When minimal bundle size matters

---

## 4. Implementation Priority for LongNhan Storefront

### Phase 1 (High Impact, Low Complexity)
1. Scroll-triggered product card reveals (Motion)
2. Hover state enhancements on product cards
3. Collapsible accordion for product specs
4. Mobile sticky contact bar

### Phase 2 (Medium Impact, Medium Complexity)
1. Image reveal slider for gallery
2. Scroll-linked parallax on hero sections
3. Layout animations for filter/sort interactions
4. Gesture-driven interactions (swipe on mobile)

### Phase 3 (Polish, Advanced)
1. Page transitions between product/category pages
2. Smooth product image transitions in lightbox
3. Animated loading states
4. Scroll-linked progress indicators

---

## 5. Next.js 15 + React 19 Compatibility Notes

- **Motion (Framer Motion successor)**: Full React 19 support, built for modern React
- **GSAP**: Works with React 19 via ref attachment pattern
- All scroll animation libraries compatible with React Server Components (RSC) if used in client boundary
- Use `'use client'` directive in Next.js for animation components
- Leverage Next.js 15 image optimization alongside Motion image transitions

---

## Unresolved Questions

1. **Specific animation budget:** Does the project have performance requirements (LCP, FCP targets)?
2. **Mobile priority:** Should mobile animations be simplified (reduce motion) for lower-end devices?
3. **Accessibility:** Should `prefers-reduced-motion` media query be implemented?
4. **Third-party integration:** Are there existing analytics/tracking that need animation event hooks?

---

## Sources

- [Motion — JavaScript & React animation library](https://motion.dev/)
- [Motion Examples | React, JS & Vue Animations](https://motion.dev/examples)
- [React scroll animation — scroll-linked & parallax | Motion](https://motion.dev/docs/react-scroll-animations)
- [Advanced page transitions with Next.js and Framer Motion - LogRocket Blog](https://blog.logrocket.com/advanced-page-transitions-next-js-framer-motion/)
- [Implementing React scroll animations with Framer Motion - LogRocket Blog](https://blog.logrocket.com/react-scroll-animations-framer-motion/)
- [Best React Scroll Animation Libraries 2025: Complete Guide](https://zoer.ai/posts/zoer/best-react-scroll-animation-libraries-2025)
- [GitHub - adityas-ops/e-commerce-landing: e-commerce landing page with Next.js, Tailwind CSS, and Framer Motion](https://github.com/adityas-ops/e-commerce-landing)
