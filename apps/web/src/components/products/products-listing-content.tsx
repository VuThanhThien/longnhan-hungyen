import type { Category, Product } from '@longnhan/types';
import CategoryFilter from '@/components/products/category-filter';
import ProductGrid from '@/components/products/product-grid';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import {
  productListingCategoriesTag,
  productsListCacheTags,
} from '@/lib/content-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

async function getProductListingCategories(): Promise<Category[]> {
  'use cache';
  cacheTag(productListingCategoriesTag);
  cacheLife({ revalidate: 60 });
  return fetchApi<Category[]>('/categories');
}

async function getProductsListing(
  category: string | undefined,
  q: string | undefined,
): Promise<Product[]> {
  'use cache';
  cacheLife({ revalidate: 60 });
  cacheTag(...productsListCacheTags(category, q));
  const response = await fetchPaginated<Product>('/products', {
    category,
    q,
    limit: 24,
  });
  return response.data;
}

interface ProductsListingContentProps {
  category?: string;
  q?: string;
}

export async function ProductsListingContent({
  category,
  q,
}: ProductsListingContentProps) {
  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    [categories, products] = await Promise.all([
      getProductListingCategories(),
      getProductsListing(category, q),
    ]);
  } catch (error) {
    captureApiFetchError(error, {
      route: '/products',
      section: 'listing',
      extra: { category: category ?? null, q: q ?? null },
    });
  }

  return (
    <>
      <CategoryFilter categories={categories} current={category} />
      <ProductGrid products={products} />
    </>
  );
}
