import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Product } from '@longnhan/types';
import OrderForm from '@/components/orders/order-form';
import ProductImages from '@/components/products/product-images';
import ProductPdpHero from '@/components/products/product-pdp-hero';
import ProductPdpTabs from '@/components/products/product-pdp-tabs';
import ProductPdpRichBody from '@/components/products/product-pdp-rich-body';
import ProductPdpSpecTable from '@/components/products/product-pdp-spec-table';
import RelatedProducts from '@/components/products/related-products';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { SITE_URL } from '@/lib/constants';
import { buildBreadcrumbSchema, buildProductSchema } from '@/lib/structured-data';

export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/products/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Khong tim thay san pham' };
  }

  return {
    title: product.name,
    description: product.description ?? `Chi tiet san pham ${product.name}.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.featuredImageUrl
        ? [product.featuredImageUrl]
        : (product.images ?? []).slice(0, 1),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  let relatedProducts: Product[] = [];
  try {
    const relatedResponse = await fetchPaginated<Product>('/products', {
      category: product.category,
      limit: 8,
    });
    relatedProducts = relatedResponse.data.filter((item) => item.slug !== product.slug).slice(0, 4);
  } catch {
    relatedProducts = [];
  }

  const breadcrumbItems = [
    { label: 'Trang chu', url: '/' },
    { label: 'San pham', url: '/products' },
    { label: product.name },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Trang chu', url: SITE_URL },
    { name: 'San pham', url: `${SITE_URL}/products` },
    { name: product.name, url: `${SITE_URL}/products/${product.slug}` },
  ]);

  const productSchema = buildProductSchema(product);
  const images = product.images ?? [];
  const imageList = images.length > 0 ? images : product.featuredImageUrl ? [product.featuredImageUrl] : [];

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
          <OrderForm variants={product.variants} productName={product.name} />
        </div>
      </div>

      <ProductPdpTabs product={product} />
      <ProductPdpRichBody html={product.description} />
      <ProductPdpSpecTable variants={product.variants} />
      <RelatedProducts products={relatedProducts} />
    </section>
  );
}
