# Phase 06 — Home Page Enhancement

**Status:** Completed | **Priority:** P1 | **Effort:** 8h

## Context Links
- Plan: [plan.md](./plan.md)
- Reference: https://tinhhoaphohien.vn/
- Home page: `apps/web/src/app/page.tsx`
- Featured products: `apps/web/src/components/home/featured-products.tsx`
- Product card: `apps/web/src/components/products/product-card.tsx`
- Hero: `apps/web/src/components/landing/landing-hero.tsx`

## Overview

Reference home page has: rotating hero carousel, category nav cards, multiple product sections by category, discount badges on cards, stock status badges, and quick view modal. Current home page has a static hero and a single flat product grid.

## Key Insights

- Reference uses 3 distinct product sections (Đặc sản / Gift Sets / Gift Solutions) — our DB may not have categories yet; plan for category-filtered sections with graceful fallback to single section
- Hero carousel needs client-side auto-rotate — keep simple (CSS or minimal JS, no heavy library)
- Quick view modal: show basic product info + direct order link (not full order form) — keeps scope manageable
- Discount badges: reference shows `-7%` banners — need `compareAtPrice` or `originalPrice` field on variant/product; check types first
- Stock status: reference shows "Hết hàng" overlay on product cards — derive from `variant.stockQuantity`

## Requirements

### Functional
- [ ] Hero banner carousel — 2-3 slides, auto-rotate every 5s, manual prev/next, dot indicators
- [ ] Category navigation cards — 3 cards below hero (Đặc sản / Quà tặng / Bộ quà tặng)
- [ ] Product cards: discount badge (`-X%`) when `compareAtPrice > price`
- [ ] Product cards: "Hết hàng" stock status overlay when all variants out of stock
- [ ] Product cards: "Xem nhanh" quick view button on hover → modal with product summary + CTA
- [ ] Multiple product sections by category (if products have category data)
- [ ] Section "Tin tức" (articles) preview — 3 cards (from Phase 4, reuse `LandingArticlesPreview`)

### Non-Functional
- Carousel: pure CSS transitions + `useState` — no external library (KISS)
- Quick view modal: Radix Dialog or native `<dialog>` — no heavy dependency
- Category sections: graceful fallback to single grid if no category data
- All new components under 150 LOC; split if larger

## Architecture

```
apps/web/src/
  components/
    home/
      hero-carousel.tsx              ← NEW (replaces static hero for home page)
      category-nav-cards.tsx         ← NEW (3 category link cards)
      home-products-by-category.tsx  ← NEW (multi-section product display)
      product-quick-view-modal.tsx   ← NEW (Radix Dialog quick view)
    products/
      product-card.tsx               ← MODIFY (add discount badge, stock overlay, quick view btn)
  app/
    page.tsx                         ← MODIFY (new section order, pass category data)
  data/
    landing-page-content.ts          ← MODIFY (add LANDING_CATEGORIES data)
```

## Related Code Files

- **CREATE** `apps/web/src/components/home/hero-carousel.tsx`
- **CREATE** `apps/web/src/components/home/category-nav-cards.tsx`
- **CREATE** `apps/web/src/components/home/home-products-by-category.tsx`
- **CREATE** `apps/web/src/components/home/product-quick-view-modal.tsx`
- **MODIFY** `apps/web/src/components/products/product-card.tsx`
- **MODIFY** `apps/web/src/app/page.tsx`
- **MODIFY** `apps/web/src/data/landing-page-content.ts`

## Implementation Steps

### Step 1 — Product Card Enhancements (`product-card.tsx`)

Read the file first. Then add:
- **Discount badge**: if `product.compareAtPrice > product.basePrice`, show `-X%` red badge (top-left corner, absolute positioned)
- **Stock overlay**: if all variants have `stock/stockQuantity <= 0`, show semi-transparent "Hết hàng" overlay
- **Quick view button**: `group-hover` reveal — `opacity-0 group-hover:opacity-100` button on card hover
  - On click: call `onQuickView(product)` callback prop (optional, no-op if not provided)

### Step 2 — Hero Carousel (`hero-carousel.tsx`)

```tsx
'use client'
// Slides data from LANDING_HERO_SLIDES in landing-page-content.ts
// State: activeIndex, auto-rotate useEffect (5000ms interval, clear on unmount)
// Layout: relative overflow-hidden; slides absolute positioned, transition-opacity or translate-x
// Controls: prev/next arrow buttons + dot indicators
// Slide content: headline, subhead, CTA button (from slide data)
// Fallback: if only 1 slide, render without carousel controls
```

Add to `landing-page-content.ts`:
```ts
export const LANDING_HERO_SLIDES = [
  {
    headline: 'Long nhãn Hưng Yên\nvương giả chi quả',
    subhead: 'Hương vị cổ truyền, chọn lọc từ vườn nhãn xứ Đông...',
    ctaLabel: 'Đặt hàng — COD toàn quốc',
    ctaHref: '/products',
    imageSrc: null, // placeholder until real banner images added
  },
  {
    headline: 'Set quà cao cấp\nbiếu tặng ý nghĩa',
    subhead: 'Hộp quà sang trọng, phù hợp mọi dịp lễ và doanh nghiệp.',
    ctaLabel: 'Xem bộ quà tặng',
    ctaHref: '/products',
    imageSrc: null,
  },
]
```

### Step 3 — Category Nav Cards (`category-nav-cards.tsx`)

```ts
// Add to landing-page-content.ts:
export const LANDING_CATEGORIES = [
  { label: 'Đặc sản Hưng Yên', href: '/products?category=longnhan', icon: '🌿' },
  { label: 'Giải pháp quà tặng', href: '/products?category=gift', icon: '🎁' },
  { label: 'Bộ quà tặng', href: '/products?category=giftset', icon: '📦' },
]
```
- Layout: `grid grid-cols-1 sm:grid-cols-3 gap-4`
- Each card: icon + label + arrow, hover border/shadow effect
- Place in `page.tsx` below hero carousel, above featured products

### Step 4 — Products by Category (`home-products-by-category.tsx`)

- Accepts `products: Product[]`
- Groups by `product.category` using `Map`
- Renders one `<section>` per category with section heading + `<ProductGrid>`
- If only 1 category or no category data: falls back to single grid (same as current behavior)
- Max 3 categories shown; remaining collapsed or linked to /products

### Step 5 — Quick View Modal (`product-quick-view-modal.tsx`)

- Check if `@radix-ui/react-dialog` is installed; if not, use native `<dialog>` element
- Props: `product: Product | null`, `onClose: () => void`
- Content: product image (first), name, price range, short description, "Đặt hàng" button → `/products/${slug}`
- Keep simple — NO order form inside modal (too complex); just a preview + link

### Step 6 — Wire in `page.tsx`

New section order:
```tsx
<HeroCarousel />                    // replaces LandingHero (or wraps it)
<LandingServiceBadges />            // Phase 1
<CategoryNavCards />                // new
<LandingStory />
<LandingProductQuality />
<LandingNutritionSeason />
<HomeProductsByCategory products={products} onQuickView={setQuickViewProduct} />
<LandingChannels />
<LandingTestimonialsTrust />
<LandingStatsBar />                 // Phase 2
<LandingFaq />
<LandingArticlesPreview articles={articles} />  // Phase 4
<VideoSection videoUrl={introVideo} />
<CtaSection />
<ProductQuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
```

## Todo List

- [ ] Read `product-card.tsx` before modifying
- [ ] Add discount badge to `product-card.tsx` (check `compareAtPrice` field on `Product` type)
- [ ] Add stock status overlay to `product-card.tsx`
- [ ] Add quick view trigger button to `product-card.tsx`
- [ ] Add `LANDING_HERO_SLIDES` data to `landing-page-content.ts`
- [ ] Create `hero-carousel.tsx`
- [ ] Add `LANDING_CATEGORIES` data to `landing-page-content.ts`
- [ ] Create `category-nav-cards.tsx`
- [ ] Create `home-products-by-category.tsx`
- [ ] Check if `@radix-ui/react-dialog` installed before creating modal
- [ ] Create `product-quick-view-modal.tsx`
- [ ] Refactor `page.tsx` with new section order
- [ ] Test carousel auto-rotate doesn't cause memory leak (clear interval on unmount)
- [ ] Verify category filter query param `/products?category=X` is handled in products page

## Success Criteria

- Hero carousel rotates between 2+ slides with dot indicators
- 3 category nav cards visible below hero
- Product cards show discount badge when `compareAtPrice` data exists
- "Hết hàng" overlay on out-of-stock product cards
- Quick view modal opens on card hover click
- Products grouped by category when category data available
- Fallback to single grid when no category data

## Risk Assessment

- **`compareAtPrice` field absent from `Product` type** — check `@longnhan/types`; if missing, skip discount badge until type is updated
- **Category query param** — verify `/products?category=X` filtering is handled in `apps/web/src/app/products/page.tsx`
- **Carousel on SSR** — `hero-carousel.tsx` must be `'use client'`; server renders first slide only
- **Quick view modal z-index** — must be above floating contact widget (z-50); use z-[60]+
- **`home-products-by-category.tsx` > 150 LOC** — split into `category-section.tsx` if needed

## Security Considerations

- Quick view modal: render product data only, no user input
- Category href values in LANDING_CATEGORIES are static strings — no injection risk

## Next Steps

- After Phase 6: full storefront enhancement complete
- Owner actions: provide real banner images for carousel slides, fill category slugs matching DB
