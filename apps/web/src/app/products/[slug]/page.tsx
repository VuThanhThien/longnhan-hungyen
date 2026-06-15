import ProductImages from '@/components/products/product-images';
import { ProductAddToCart } from '@/components/products/product-add-to-cart';
import { ProductDetailEnrichment } from '@/components/products/product-detail-enrichment';
import ProductPdpHero from '@/components/products/product-pdp-hero';
import ProductPdpTabs from '@/components/products/product-pdp-tabs';
import ProductReviewsSection from '@/components/products/product-reviews-section';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { buildBreadcrumb } from '@/lib/breadcrumb';
import { productDetailCacheTags } from '@/lib/content-cache-tags';
import { buildSeoMetadata, trimMetaDescription } from '@/lib/seo';
import { PAGE_SEO_KEYWORDS } from '@/lib/seo-keywords';
import { buildProductSchema } from '@/lib/structured-data';
import type { Product } from '@longnhan/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';
import { Suspense } from 'react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife({ revalidate: 60 });
  cacheTag(...productDetailCacheTags(slug));
  try {
    return await fetchApi<Product>(`/products/${slug}`);
  } catch (error) {
    captureApiFetchError(error, {
      route: '/products/[slug]',
      section: 'product_detail',
      extra: { slug },
    });
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return buildSeoMetadata({
      title: 'Không tìm thấy sản phẩm',
      description:
        'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh. Xem danh mục long nhãn Hưng Yên tại nhanhunguyen.com.',
      canonicalPath: `/products/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  const firstImage =
    product.featuredImageUrl ??
    (product.images ?? [])[0] ??
    product.imageUrls?.[0] ??
    undefined;

  const description =
    product.summary?.trim() ||
    (product.description
      ? trimMetaDescription(product.description)
      : `Mua ${product.name} — nhãn Hưng Yên, long nhãn Tống Trân chính gốc. Giao COD toàn quốc tại nhanhunguyen.com.`);

  return buildSeoMetadata({
    title: product.name,
    description,
    canonicalPath: `/products/${product.slug}`,
    keywords: [...PAGE_SEO_KEYWORDS, product.name],
    openGraphType: 'website',
    ...(firstImage
      ? {
          ogImage: {
            url: firstImage,
            alt: product.name,
          },
        }
      : null),
  });
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  await connection();
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Trang chủ', url: '/' },
    { label: 'Sản phẩm', url: '/products' },
    { label: product.name },
  ];

  const { schema: breadcrumbSchema } = buildBreadcrumb({
    items: breadcrumbItems,
    currentUrl: `/products/${product.slug}`,
  });

  const productSchema = buildProductSchema(product);
  const images = product.images ?? [];
  const imageList =
    images.length > 0
      ? images
      : product.featuredImageUrl
        ? [product.featuredImageUrl]
        : [];
  const cartImageUrl =
    product.featuredImageUrl ?? imageList[0] ?? product.imageUrls?.[0] ?? null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}

      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductImages images={imageList} productName={product.name} />
        <div className="space-y-6">
          <ProductPdpHero product={product} />
          <ProductAddToCart
            variants={product.variants}
            productName={product.name}
            productSlug={product.slug}
            imageUrl={cartImageUrl}
          />
        </div>
      </div>

      <ProductPdpTabs product={product} />
      <ProductReviewsSection
        productId={product.id as string}
        productName={product.name}
      />
      <Suspense fallback={null}>
        <ProductDetailEnrichment product={product} />
      </Suspense>
    </section>
  );
}
