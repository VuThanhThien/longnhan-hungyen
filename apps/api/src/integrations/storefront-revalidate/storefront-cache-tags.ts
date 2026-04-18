/**
 * Must stay in sync with `apps/web/src/lib/content-cache-tags.ts` (scope strings).
 */
export const storefrontWebCacheTags = {
  products: 'products',
  relatedProducts: 'related-products',
  productListingCategories: 'product-list-categories',
  homeCategories: 'home-categories',
  articles: 'articles',
} as const;
