import type { Metadata } from 'next';
import type { SearchParams } from 'nuqs/server';
import { ProductsListingContent } from '@/components/products/products-listing-content';
import Breadcrumb from '@/components/ui/breadcrumb';
import { ProductsListingSkeleton } from '@/components/ui/route-loading-skeleton';
import { buildBreadcrumb } from '@/lib/breadcrumb';
import { loadProductSearchParams } from '@/lib/product-search-params';
import { PRODUCTS_LISTING_SEO } from '@/data/landing-page-content';
import { buildSeoMetadata } from '@/lib/seo';
import { PWA_CONFIG } from '@/lib/pwa-config';
import { connection } from 'next/server';
import { Suspense } from 'react';

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: PRODUCTS_LISTING_SEO.title,
    description: PRODUCTS_LISTING_SEO.description,
    canonicalPath: '/products',
    ogImage: {
      url: PWA_CONFIG.heroImage.path,
      width: PWA_CONFIG.heroImage.width,
      height: PWA_CONFIG.heroImage.height,
      alt: PWA_CONFIG.heroImage.alt,
    },
  });
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  await connection();
  const { q: qRaw, category: categoryRaw } =
    await loadProductSearchParams(searchParams);
  const category = categoryRaw?.trim() || undefined;
  const q = qRaw?.trim() || undefined;

  const breadcrumbItems = [
    { label: 'Trang chủ', url: '/' },
    { label: 'Sản phẩm' },
  ];
  const { schema: breadcrumbSchema } = buildBreadcrumb({
    items: breadcrumbItems,
    currentUrl: '/products',
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}
      <Breadcrumb items={breadcrumbItems} />
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Danh mục sản phẩm
        </h1>
      </div>
      <Suspense
        key={`${category ?? ''}:${q ?? ''}`}
        fallback={<ProductsListingSkeleton />}
      >
        <ProductsListingContent category={category} q={q} />
      </Suspense>
    </section>
  );
}
