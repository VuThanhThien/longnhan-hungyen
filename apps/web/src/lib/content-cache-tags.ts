/**
 * Shared string identifiers for Next.js `cacheTag` / `revalidateTag` and TanStack Query keys.
 * Import `contentScope` / `contentSegment` from here in `query-keys.ts` so roots and segments stay identical.
 */

export const contentScope = {
  products: 'products',
  articles: 'articles',
  relatedProducts: 'related-products',
} as const;

export const contentSegment = {
  list: 'list',
  detail: 'detail',
} as const;

/** Category options fetch on `/products` (filter chips). */
export const productListingCategoriesTag = 'product-list-categories' as const;

export const homeContentTags = {
  featuredProducts: 'home-featured-products',
  categories: 'home-categories',
  articles: 'home-articles',
} as const;

export function productsListCacheTags(
  category: string | undefined,
  q: string | undefined,
): readonly [string, string, string, string] {
  return [
    contentScope.products,
    contentSegment.list,
    `cat:${category ?? ''}`,
    `q:${q ?? ''}`,
  ];
}

export function productDetailCacheTags(
  slug: string,
): readonly [string, string, string] {
  return [contentScope.products, contentSegment.detail, slug];
}

export function relatedProductsCacheTags(
  category: string | undefined,
  excludeSlug: string,
): readonly [string, string, string] {
  return [
    contentScope.relatedProducts,
    `cat:${category ?? ''}`,
    `ex:${excludeSlug}`,
  ];
}

export function articlesListCacheTags(): readonly [string, string] {
  return [contentScope.articles, contentSegment.list];
}

export function articleDetailCacheTags(
  slug: string,
): readonly [string, string, string] {
  return [contentScope.articles, contentSegment.detail, slug];
}
