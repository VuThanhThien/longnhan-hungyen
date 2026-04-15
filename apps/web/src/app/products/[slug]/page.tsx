import ProductImages from '@/components/products/product-images';
import { ProductAddToCart } from '@/components/products/product-add-to-cart';
import ProductPdpHero from '@/components/products/product-pdp-hero';
import ProductPdpTabs from '@/components/products/product-pdp-tabs';
import RelatedProducts from '@/components/products/related-products';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { SITE_URL } from '@/lib/constants';
import { buildSeoMetadata } from '@/lib/seo';
import {
  buildBreadcrumbSchema,
  buildProductSchema,
} from '@/lib/structured-data';
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
  cacheTag('products', `product-${slug}`);
  try {
    return await fetchApi<Product>(`/products/${slug}`);
  } catch {
    return null;
  }
}

async function getRelatedProducts(
  category: string | undefined,
  excludeSlug: string,
): Promise<Product[]> {
  'use cache';
  cacheLife({ revalidate: 60 });
  cacheTag('related-products', `cat:${category ?? ''}`, `ex:${excludeSlug}`);
  try {
    const relatedResponse = await fetchPaginated<Product>('/products', {
      category,
      limit: 8,
    });
    return relatedResponse.data
      .filter((item) => item.slug !== excludeSlug)
      .slice(0, 4);
  } catch {
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
      canonicalPath: `${SITE_URL}/products/${slug}`,
    });
  }

  const summary = product.summary ?? product.description ?? null;
  const firstImage =
    product.featuredImageUrl ??
    (product.images ?? [])[0] ??
    product.imageUrls?.[0] ??
    undefined;

  return buildSeoMetadata({
    title: product.name,
    description: summary ?? `Chi tiet san pham ${product.name}.`,
    canonicalPath: `/products/${product.slug}`,
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

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Trang chủ', url: SITE_URL },
    { name: 'Sản phẩm', url: `${SITE_URL}/products` },
    { name: product.name, url: `${SITE_URL}/products/${product.slug}` },
  ]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
