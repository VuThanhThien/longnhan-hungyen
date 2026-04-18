import type { Metadata } from 'next';
import type { Category, Product } from '@longnhan/types';
import type { SearchParams } from 'nuqs/server';
import ProductGrid from '@/components/products/product-grid';
import CategoryFilter from '@/components/products/category-filter';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { buildBreadcrumb } from '@/lib/breadcrumb';
import {
  productListingCategoriesTag,
  productsListCacheTags,
} from '@/lib/content-cache-tags';
import { loadProductSearchParams } from '@/lib/product-search-params';
import { buildSeoMetadata } from '@/lib/seo';
import { cacheLife, cacheTag } from 'next/cache';

async function getProductListingCategories(): Promise<Category[]> {
  'use cache';
  cacheTag(productListingCategoriesTag);
  cacheLife({ revalidate: 60 });
  try {
    return await fetchApi<Category[]>('/categories');
  } catch {
    return [];
  }
}

async function getProductsListing(
  category: string | undefined,
  q: string | undefined,
): Promise<Product[]> {
  'use cache';
  cacheLife({ revalidate: 60 });
  cacheTag(...productsListCacheTags(category, q));
  try {
    const response = await fetchPaginated<Product>('/products', {
      category,
      q,
      limit: 24,
    });
    return response.data;
  } catch {
    return [];
  }
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Sản phẩm Long Nhãn Hưng Yên',
    description:
      'Danh sách sản phẩm Long Nhãn, Nhãn Long Hưng Yên và quà biếu đặc sản.',
    canonicalPath: '/products',
  });
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { q: qRaw, category: categoryRaw } =
    await loadProductSearchParams(searchParams);
  const category = categoryRaw ?? undefined;
  const q = qRaw ?? undefined;

  const [categories, products] = await Promise.all([
    getProductListingCategories(),
    getProductsListing(category, q),
  ]);

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
        <h1 className="text-2xl md:text-3xl font-bold text-green-950">
          Danh mục sản phẩm
        </h1>
      </div>
      <CategoryFilter categories={categories} current={category} />
      <ProductGrid products={products} />
    </section>
  );
}
