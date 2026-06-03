import type { Category, Product } from '@longnhan/types';
import CategoryFilter from '@/components/products/category-filter';
import ProductGrid from '@/components/products/product-grid';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';

async function getProductListingCategories(): Promise<Category[]> {
  try {
    return await fetchApi<Category[]>('/categories');
  } catch (error) {
    captureApiFetchError(error, {
      route: '/products',
      section: 'listing_categories',
    });
    return [];
  }
}

async function getProductsListing(
  category: string | undefined,
  q: string | undefined,
): Promise<Product[]> {
  try {
    const response = await fetchPaginated<Product>('/products', {
      category,
      q,
      limit: 24,
    });
    return response.data;
  } catch (error) {
    captureApiFetchError(error, {
      route: '/products',
      section: 'listing',
      extra: { category: category ?? null, q: q ?? null },
    });
    return [];
  }
}

interface ProductsListingContentProps {
  category?: string;
  q?: string;
}

export async function ProductsListingContent({
  category,
  q,
}: ProductsListingContentProps) {
  const [categories, products] = await Promise.all([
    getProductListingCategories(),
    getProductsListing(category, q),
  ]);

  return (
    <>
      <CategoryFilter categories={categories} current={category} />
      <ProductGrid products={products} />
    </>
  );
}
