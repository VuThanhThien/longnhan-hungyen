---
phase: 4
title: "Storefront (Next.js Web)"
status: pending
effort: 12h
depends_on: [3]
---

# Phase 4: Storefront (Next.js Web)

## Context Links

- [Plan Overview](plan.md)
- [Phase 3: Backend API](phase-03-backend-api.md)
- [Next.js SEO Research](../reports/researcher-260329-2129-nextjs14-ecommerce-vietnamese-seo.md)

## Overview

- **Priority:** P1
- **Status:** pending
- Build public-facing storefront: landing page (hero + video + products), product list/detail with ISR, order form (Server Actions), articles/blog (SSG), Vietnamese SEO throughout.
- **Product detail page (PDP)** matches structural parity with [reference PDP](https://tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua) (see section below); branding and copy remain Long Nhãn Hưng Yên project–specific.

## Key Insights

- ISR (60s revalidate) for product pages; SSG for articles
- `generateMetadata` on every page for Vietnamese SEO
- JSON-LD structured data: Product, Article, BreadcrumbList, Organization
- Server Actions for order form — no client-side cart needed (simple product → order flow)
- Cloudinary loader for next/image optimization
- Mobile-first: Vietnamese users predominantly on mobile 4G
- **CRITICAL: No direct DB access** — all data fetched via `apps/api` HTTP calls. Never import TypeORM entities or connect to PostgreSQL from this app. Use `fetch(process.env.API_URL + '/...')` in Server Components and Server Actions only.

## Requirements

### Functional
- Landing page: hero banner, YouTube embed, featured products grid, call-to-action
- Product list page: grid of active products with image, name, price, category filter
- Product detail page: images gallery, description, variant selector, order form — plus PDP blocks per [reference parity](#product-detail-page-pdp--reference-parity)
- Order form: customer name, phone (required), email, address, province, payment method (COD/QR), notes
- Order confirmation page (success message + order code)
- Articles list page: card grid with featured image, title, excerpt
- Article detail page: full HTML content, meta tags
- Header + Footer (nav, contact info, social links)
- SEO: sitemap.xml, robots.txt, meta tags, JSON-LD, OpenGraph

### Non-Functional
- Vietnamese language only (no i18n)
- Page load < 3s on mobile 4G
- Lighthouse SEO score > 90
- Responsive: mobile-first with desktop breakpoints
- Tailwind CSS for styling

## Architecture

### Page Structure

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, header, footer
│   ├── page.tsx                # Landing page (SSG + ISR for products section)
│   ├── products/
│   │   ├── page.tsx            # Product list (ISR 60s)
│   │   └── [slug]/
│   │       └── page.tsx        # Product detail + order form (ISR 60s)
│   ├── order-success/
│   │   └── page.tsx            # Order confirmation
│   ├── articles/
│   │   ├── page.tsx            # Article list (SSG)
│   │   └── [slug]/
│   │       └── page.tsx        # Article detail (SSG)
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── robots.ts               # Robots.txt
│   └── not-found.tsx           # Custom 404
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── home/
│   │   ├── hero-section.tsx
│   │   ├── video-section.tsx
│   │   ├── featured-products.tsx
│   │   └── cta-section.tsx
│   ├── products/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-images.tsx
│   │   ├── variant-selector.tsx
│   │   ├── product-pdp-hero.tsx       # title, price range, ingredient/HSD strip
│   │   ├── product-pdp-tabs.tsx     # Mô tả | Thông tin bổ sung | Đánh giá
│   │   ├── product-pdp-rich-body.tsx  # long-form HTML/markdown from API
│   │   ├── product-pdp-spec-table.tsx
│   │   ├── related-products.tsx
│   │   └── category-filter.tsx
│   ├── orders/
│   │   ├── order-form.tsx       # Client component for form state
│   │   └── qr-payment-info.tsx
│   ├── articles/
│   │   ├── article-card.tsx
│   │   └── article-content.tsx
│   └── ui/
│       ├── breadcrumb.tsx
│       └── loading-spinner.tsx
├── lib/
│   ├── api-client.ts            # Fetch wrapper for backend API
│   ├── structured-data.ts       # JSON-LD generators
│   ├── cloudinary-loader.ts     # next/image loader
│   └── constants.ts             # Site URL, contact info
├── actions/
│   └── order-actions.ts         # Server Action: submit order
└── public/
    ├── images/                  # Static assets (logo, QR code image)
    └── fonts/
```

### Data Fetching Strategy

| Page | Method | Revalidate | Data Source |
|------|--------|-----------|-------------|
| Landing | ISR | 300s | GET /products?featured=true |
| Product List | ISR | 60s | GET /products |
| Product Detail | ISR | 60s | GET /products/:slug |
| Article List | SSG | on-demand | GET /articles |
| Article Detail | SSG | on-demand | GET /articles/:slug |
| Order Success | Dynamic | — | Query params (order code) |

### API Client

```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}
```

## Related Code Files

### Files to Create
- All files listed in Architecture section above (~30 files)

### Files to Modify
- `apps/web/next.config.ts` — add Cloudinary image domain, env vars
- `apps/web/app/globals.css` — Tailwind base styles
- `apps/web/package.json` — add dependencies

## Implementation Steps

### 1. Dependencies

```bash
cd apps/web
pnpm add @longnhan/types
# Tailwind already included from create-next-app
```

### 2. Root Layout

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'Long Nhãn Hưng Yên - Đặc Sản Nhãn Lồng', template: '%s | Long Nhãn Hưng Yên' },
  description: 'Chuyên cung cấp long nhãn, nhãn lồng Hưng Yên chính gốc. Giao hàng toàn quốc.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://longnhan.vn'),
  openGraph: { type: 'website', locale: 'vi_VN', siteName: 'Long Nhãn Hưng Yên' },
};
```

### 3. Landing Page

- Hero section: full-width banner image (Cloudinary), tagline, CTA button
- Video section: YouTube embed (lazy loaded iframe)
- Featured products: grid of 4-6 products from API
- CTA section: "Đặt hàng ngay" with link to products

### 4. Product List Page

```typescript
// app/products/page.tsx
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sản Phẩm Long Nhãn Hưng Yên',
    description: 'Danh sách sản phẩm long nhãn, nhãn lồng Hưng Yên tươi và sấy khô.',
  };
}

export default async function ProductsPage({ searchParams }) {
  const category = (await searchParams).category;
  const products = await fetchApi(`/products?category=${category || ''}`);
  return (
    <>
      <Breadcrumb items={[{ label: 'Trang chủ', url: '/' }, { label: 'Sản phẩm' }]} />
      <CategoryFilter current={category} />
      <ProductGrid products={products} />
    </>
  );
}
```

### 5. Product Detail + Order Form

#### Product detail page (PDP) — reference parity

**Source:** [tinhhoaphohien.vn — Long nhãn vương giả chi quả](https://tinhhoaphohien.vn/san-pham/long-nhan-vuong-gia-chi-qua). Use as **layout and information architecture** reference, not literal copy or third-party branding.

| Block | Reference behavior | Our implementation |
|-------|-------------------|---------------------|
| Breadcrumb | Trang chủ / Danh mục / Tên SP | `Breadcrumb` + category slug/label from API |
| Title | H1 product name | `generateMetadata` + on-page H1 |
| Price | Range when variants differ (e.g. 126k–252k ₫) | Min–max from variant prices in VND; format `vi-VN` |
| Quick facts | **Thành phần**, **HSD** lines | CMS/API fields: `ingredientsSummary`, `shelfLife` (or rich text excerpt) |
| Short bullets | Ăn vặt / nấu ăn / ngâm rượu | Optional `highlights: string[]` or fixed template per category |
| Gallery | Main + thumbs | Existing `product-images` plan |
| Purchase row | Khối lượng (500g/1000g), quantity, CTA | Variant selector + qty + primary CTA → scroll/focus order form or inline |
| Meta row | SKU, Danh mục, Thẻ | Map to `sku?`, `category`, `tags[]` if API supports; hide SKU if N/A |
| Tabs | Mô tả · Thông tin bổ sung · Đánh giá | **Mô tả:** long body (HTML). **Thông tin bổ sung:** key/value or table (nutrition, weight links). **Đánh giá:** MVP empty state + “coming soon” OR omit until API exists |
| Long content | Story (Phố Hiến, lịch sử, thu hoạch), nutrition %, đông y, quà biếu | Single `descriptionHtml` from admin/API, or split fields if admin supports sections |
| Spec table | Khối lượng / Cân nặng rows | `product-pdp-spec-table` driven by variants + optional static rows |
| Related products | Grid carousel | `GET /products?related=slug` or same category limit N |

**API/data:** If the NestJS `Product` entity lacks `ingredientsSummary`, `shelfLife`, `tags`, or tabbed extras, extend Phase 3 with minimal fields or store structured JSON in `metadata` — prefer explicit columns for query/filter needs.

#### Implementation checklist (PDP)

- Product images gallery (swipeable on mobile)
- Variant selector: radio buttons for weight options (500g / 1000g pattern from reference)
- Price range display when multiple variant prices
- Ingredient + HSD strip above fold
- Tabbed content area with accessible tabs (Radix/shadcn pattern if available)
- Rich HTML description (sanitized) for “Mô tả”
- Related products section (ISR-friendly fetch)
- JSON-LD `Product` with `offers` per variant or AggregateOffer for range

- Inline order form below product info (or sticky mobile bar linking to form)
- Server Action on form submit → POST /orders → redirect to success page

```typescript
// actions/order-actions.ts
'use server'
import { redirect } from 'next/navigation';

export async function submitOrder(formData: FormData) {
  const body = {
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    province: formData.get('province'),
    paymentMethod: formData.get('paymentMethod'),
    notes: formData.get('notes'),
    items: JSON.parse(formData.get('items') as string),
  };

  const res = await fetch(`${process.env.API_URL}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Order failed');
  const { data } = await res.json();
  redirect(`/order-success?code=${data.code}`);
}
```

### 6. Articles (Blog)

- List page: card grid with featured image, title, excerpt, published date
- Detail page: full HTML content rendered with `dangerouslySetInnerHTML` (from Tiptap in admin)
- `generateStaticParams` for build-time generation
- Article JSON-LD structured data

### 7. SEO Implementation

**Sitemap** (`app/sitemap.ts`):
```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const products = await fetchApi('/products?limit=1000');
  const articles = await fetchApi('/articles?limit=1000');

  return [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/articles`, priority: 0.8, changeFrequency: 'weekly' },
    ...products.map(p => ({ url: `${baseUrl}/products/${p.slug}`, priority: 0.8, changeFrequency: 'weekly' })),
    ...articles.map(a => ({ url: `${baseUrl}/articles/${a.slug}`, priority: 0.7, changeFrequency: 'monthly' })),
  ];
}
```

**JSON-LD** on product pages: Product schema with offers in VND
**JSON-LD** on article pages: NewsArticle schema
**JSON-LD** on all pages: Organization + BreadcrumbList

### 8. Cloudinary Image Loader

```typescript
// lib/cloudinary-loader.ts
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload/${params.join(',')}/${src}`;
}
```

`next.config.ts`:
```typescript
const config = {
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
  },
};
```

## Todo List

- [x] Set up root layout with Vietnamese metadata
- [x] Create header + footer components
- [x] Build landing page (hero, video, featured products, CTA)
- [x] Build product list page with category filter
- [x] Build product detail page with image gallery + PDP blocks (quick facts, tabs, spec table, related)
- [x] Build variant selector component
- [x] Build order form (client component)
- [x] Implement order Server Action
- [x] Build order success page
- [x] Build articles list page
- [x] Build article detail page
- [x] Implement sitemap.ts
- [x] Implement robots.ts
- [x] Add JSON-LD structured data (Product, Article, Organization, Breadcrumb)
- [x] Configure Cloudinary image loader
- [x] Add generateMetadata to all pages
- [x] Style all pages (Tailwind, mobile-first)
- [ ] Test on mobile viewport
- [ ] Run Lighthouse audit

## Success Criteria

- All pages render with correct data from API
- Order form submits successfully, redirects to confirmation
- Lighthouse SEO score > 90
- All pages have proper meta tags + OpenGraph
- sitemap.xml includes all products + articles
- Images load via Cloudinary CDN with auto-format
- Mobile responsive on all pages

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| API unavailable during ISR | Medium | Show cached page, error boundary for forms |
| Large image payloads | Medium | Cloudinary auto-format + responsive sizes |
| Vietnamese diacritics in slugs | Low | `slug` package handles transliteration |
| Form validation UX | Medium | Client-side validation + server validation |

## Security Considerations

- Server Action validates input server-side before API call
- No sensitive data exposed in client components
- NEXT_PUBLIC_ prefix only for non-secret env vars
- API_URL (without NEXT_PUBLIC_) used in Server Actions only

## Next Steps

- Phase 5: Admin panel (can run in parallel)
- Phase 6: [Landing motion & effects](phase-06-frontend-landing-enhancement.md) (parallel-friendly)
- Phase 7: Deployment
