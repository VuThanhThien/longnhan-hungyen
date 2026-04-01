# Phase 05 — Product Page Enhancement

**Status:** Completed | **Priority:** P1 | **Effort:** 5h

## Context Links
- Plan: [plan.md](./plan.md)
- Reference: https://tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua
- Product page: `apps/web/src/app/products/[slug]/page.tsx`
- PDP Hero: `apps/web/src/components/products/product-pdp-hero.tsx`
- PDP Tabs: `apps/web/src/components/products/product-pdp-tabs.tsx`
- Product Images: `apps/web/src/components/products/product-images.tsx`
- Order Form: `apps/web/src/components/orders/order-form.tsx`

## Overview

Current product page has the structural bones (breadcrumb, images, order form, tabs, related products) but lacks key conversion elements present on the reference: trust micro-badges near CTA, social sharing, stock status, image zoom, tag/category display, and better product info formatting.

## Key Insights

- Reference shows service badges inline with Add to Cart: "Giao hàng 24h · Tư vấn miễn phí · COD"
- `product-pdp-hero.tsx` has hardcoded Vietnamese strings (non-diacritic) — needs proper copy
- Tabs component has Vietnamese labels without diacritics ("Mo ta", "Danh gia") — fix copy
- `ProductImages` has thumbnail switcher but no zoom — reference shows zoom button
- Reviews tab shows "coming soon" placeholder — reference shows (0) review count in tab label
- Reference shows product tags as linked chips below title
- Stock/availability not displayed on product page currently

## Requirements

### Functional
- [ ] Trust micro-badges strip near order form (3 inline badges: delivery, consult, COD)
- [ ] Social sharing buttons (Zalo share, Facebook share)
- [ ] Stock status display ("Còn hàng" / "Hết hàng") near variant selector
- [ ] Image zoom on hover or click (lightbox or CSS zoom)
- [ ] Fix all non-diacritic Vietnamese text in product components
- [ ] Product tags display as linked chips below product title
- [ ] Review count in tab label ("Đánh giá (0)")
- [ ] Category label linked to `/products?category=X`

### Non-Functional
- Trust badges reuse same data from `LANDING_SERVICE_BADGES` (Phase 1) — DRY
- Image zoom: CSS `scale` on hover is sufficient (no heavy lightbox library)
- Social sharing: simple `<a>` tags with share URLs — no JS SDK
- Stock status: derive from `variant.stock` / `variant.stockQuantity`

## Architecture

```
apps/web/src/
  components/
    products/
      product-pdp-hero.tsx         ← MODIFY (fix copy, add tags, category, stock status)
      product-pdp-tabs.tsx         ← MODIFY (fix copy, add review count)
      product-images.tsx           ← MODIFY (add CSS zoom on main image)
      product-pdp-trust-badges.tsx ← NEW (inline trust badges near order form)
      product-pdp-share-buttons.tsx ← NEW (Zalo + Facebook share)
  app/
    products/[slug]/page.tsx       ← MODIFY (mount new components)
```

## Related Code Files

- **MODIFY** `apps/web/src/components/products/product-pdp-hero.tsx`
- **MODIFY** `apps/web/src/components/products/product-pdp-tabs.tsx`
- **MODIFY** `apps/web/src/components/products/product-images.tsx`
- **MODIFY** `apps/web/src/app/products/[slug]/page.tsx`
- **CREATE** `apps/web/src/components/products/product-pdp-trust-badges.tsx`
- **CREATE** `apps/web/src/components/products/product-pdp-share-buttons.tsx`

## Implementation Steps

1. **Fix Vietnamese copy in `product-pdp-hero.tsx`**
   - "Thanh phan" → "Thành phần"
   - "Han su dung" → "Hạn sử dụng"
   - Remove hardcoded text; use `product.ingredients`, `product.shelfLife` if fields exist, else keep fallback
   - Add category chip: `<Link href={/products?category=${product.category}}>` below price
   - Add tags as chips: `product.tags?.map(tag => <span key={tag}>{tag}</span>)`
   - Add stock status per selected variant from `OrderForm` state or derive in hero

2. **Fix copy in `product-pdp-tabs.tsx`**
   - "Mo ta" → "Mô tả"
   - "Thong tin bo sung" → "Thông tin bổ sung"
   - "Danh gia" → "Đánh giá (0)" — hardcode `(0)` until review system exists
   - "Danh muc" → "Danh mục", "Khoi luong" → "Khối lượng"
   - "Nhieu quy cach" → "Nhiều quy cách"

3. **Add CSS zoom to `product-images.tsx`**
   - Wrap main image in `group/zoom overflow-hidden`
   - Add `className="... transition-transform duration-300 group-hover/zoom:scale-110"` to `<Image>`
   - Keep `object-cover` — zoom stays within container

4. **Create `product-pdp-trust-badges.tsx`**
   ```tsx
   // 3 inline badges: truck icon + "Giao hàng 24h", chat icon + "Tư vấn miễn phí", cash icon + "COD toàn quốc"
   // Layout: flex flex-wrap gap-3
   // Each: flex items-center gap-1.5 text-xs text-(--brand-forest-muted)
   // Icon: small inline SVG (16x16)
   ```
   - Mount in `products/[slug]/page.tsx` between `<OrderForm>` and closing div

5. **Create `product-pdp-share-buttons.tsx`**
   ```tsx
   // Accept: productName, productUrl
   // Zalo: https://zalo.me/share/url?url={encoded}&title={encoded}
   // Facebook: https://www.facebook.com/sharer/sharer.php?u={encoded}
   // Layout: flex gap-2 items-center, small pill buttons
   ```
   - Mount below trust badges in product page

6. **Wire in `products/[slug]/page.tsx`**
   - Import and add `<ProductPdpTrustBadges />` and `<ProductPdpShareButtons>`
   - Pass `productName={product.name}` and `productUrl={SITE_URL}/products/${product.slug}` to share buttons

## Todo List

- [ ] Fix non-diacritic Vietnamese copy in `product-pdp-hero.tsx`
- [ ] Add category chip and tags to `product-pdp-hero.tsx`
- [ ] Fix non-diacritic Vietnamese copy in `product-pdp-tabs.tsx`
- [ ] Add review count `(0)` to reviews tab label
- [ ] Add CSS hover zoom to `product-images.tsx`
- [ ] Create `product-pdp-trust-badges.tsx`
- [ ] Create `product-pdp-share-buttons.tsx`
- [ ] Mount both new components in `products/[slug]/page.tsx`
- [ ] Check `Product` type for `tags`, `ingredients`, `shelfLife` fields before using

## Success Criteria

- All Vietnamese text on product page uses correct diacritics
- 3 trust badges visible below order form
- Zalo + Facebook share buttons visible
- Product image zooms on hover (no layout shift)
- Tags and category shown below product title (if data exists)
- Reviews tab shows "Đánh giá (0)"

## Risk Assessment

- **`product.tags` may not exist** — add `tags?: string[]` check before rendering
- **Zalo share URL format** — test actual Zalo share URL format; may need `?url=` or `?link=`
- **Zoom on mobile** — `group-hover` doesn't fire on touch; acceptable (mobile users tap to navigate)

## Security Considerations

- Share URLs: `encodeURIComponent()` on all user-supplied values (product name, URL)
- No user data collected

## Next Steps

→ Phase 06 (Home Page Enhancement) can run in parallel
