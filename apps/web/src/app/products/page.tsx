import type { Metadata } from 'next';
import type { Product } from '@longnhan/types';
import ProductGrid from '@/components/products/product-grid';
import CategoryFilter from '@/components/products/category-filter';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchPaginated } from '@/lib/api-client';

export const revalidate = 60;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'San pham long nhan Hung Yen',
    description: 'Danh sach san pham long nhan, nhan long Hung Yen va qua bieu dac san.',
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category =
    typeof params.category === 'string'
      ? params.category
      : Array.isArray(params.category)
        ? params.category[0]
        : undefined;

  let products: Product[] = [];
  let totalRecords = 0;
  try {
    const response = await fetchPaginated<Product>('/products', {
      category,
      limit: 24,
    });
    products = response.data;
    totalRecords = response.pagination.totalRecords;
  } catch {
    products = [];
    totalRecords = 0;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Trang chu', url: '/' },
          { label: 'San pham' },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-green-950">San pham</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tong {totalRecords} san pham dang hoat dong.
        </p>
      </div>
      <CategoryFilter current={category} />
      <ProductGrid products={products} />
    </section>
  );
}
