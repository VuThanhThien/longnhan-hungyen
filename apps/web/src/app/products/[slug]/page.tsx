import ProductImages from '@/components/products/product-images';
import { ProductAddToCart } from '@/components/products/product-add-to-cart';
import ProductPdpHero from '@/components/products/product-pdp-hero';
import ProductPdpTabs from '@/components/products/product-pdp-tabs';
import RelatedProducts from '@/components/products/related-products';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { buildBreadcrumb } from '@/lib/breadcrumb';
import {
  productDetailCacheTags,
  relatedProductsCacheTags,
} from '@/lib/content-cache-tags';
import { buildSeoMetadata } from '@/lib/seo';
import { buildProductSchema } from '@/lib/structured-data';
import type { Product } from '@longnhan/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';

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

async function getRelatedProducts(
  category: string | undefined,
  excludeSlug: string,
): Promise<Product[]> {
  'use cache';
  cacheLife({ revalidate: 60 });
  cacheTag(...relatedProductsCacheTags(category, excludeSlug));
  try {
    const relatedResponse = await fetchPaginated<Product>('/products', {
      category,
      limit: 8,
    });
    return relatedResponse.data
      .filter((item) => item.slug !== excludeSlug)
      .slice(0, 4);
  } catch (error) {
    captureApiFetchError(error, {
      route: '/products/[slug]',
      section: 'related_products',
      extra: { category: category ?? null, excludeSlug },
    });
    return [];
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
      canonicalPath: `/products/${slug}`,
    });
  }

  const firstImage =
    product.featuredImageUrl ??
    (product.images ?? [])[0] ??
    product.imageUrls?.[0] ??
    undefined;

  return buildSeoMetadata({
    title: product.name,
    description: `Chi tiết sản phẩm ${product.name} của shop Long Nhãn Tống Trân.`,
    canonicalPath: `/products/${product.slug}`,
    openGraphType: 'website',
    category: 'food',
    generator: 'Next.js',
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
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.category,
    product.slug,
  );

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
      <RelatedProducts products={relatedProducts} />
    </section>
  );
}
