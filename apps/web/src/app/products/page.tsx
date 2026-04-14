import type { Metadata } from 'next';
import type { Product } from '@longnhan/types';
import type { SearchParams } from 'nuqs/server';
import ProductGrid from '@/components/products/product-grid';
import CategoryFilter from '@/components/products/category-filter';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchPaginated } from '@/lib/api-client';
import { loadProductSearchParams } from '@/lib/product-search-params';
import { buildSeoMetadata } from '@/lib/seo';

export const revalidate = 60;

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

  let products: Product[] = [];
  try {
    const response = await fetchPaginated<Product>('/products', {
      category,
      q,
      limit: 24,
    });
    products = response.data;
  } catch {
    products = [];
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb
        items={[{ label: 'Trang chủ', url: '/' }, { label: 'Sản phẩm' }]}
      />
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-green-950">
          Danh mục sản phẩm
        </h1>
      </div>
      <CategoryFilter current={category} />
      <ProductGrid products={products} />
    </section>
  );
}
