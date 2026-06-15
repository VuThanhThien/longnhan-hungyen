import RelatedProducts from '@/components/products/related-products';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { relatedProductsCacheTags } from '@/lib/content-cache-tags';
import { buildProductSchema } from '@/lib/structured-data';
import type { Product } from '@longnhan/types';
import { cacheLife, cacheTag } from 'next/cache';

type ProductReviewItem = {
  id: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerLabel: string;
  variantLabel: string;
};

type ProductReviewsList = {
  ratingAvg: number;
  ratingCount: number;
  items: ProductReviewItem[];
};

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

async function getProductReviews(
  productId: string,
): Promise<ProductReviewsList | null> {
  'use cache';
  cacheLife({ revalidate: 60 });
  cacheTag('products', 'reviews', productId);
  try {
    return await fetchApi<ProductReviewsList>(
      `/products/${encodeURIComponent(productId)}/reviews`,
    );
  } catch (error) {
    captureApiFetchError(error, {
      route: '/products/[slug]',
      section: 'product_reviews_schema',
      extra: { productId },
    });
    return null;
  }
}

/** Reviews JSON-LD + related products — streamed after primary PDP HTML. */
export async function ProductDetailEnrichment({
  product,
}: {
  product: Product;
}) {
  const [relatedProducts, reviews] = await Promise.all([
    getRelatedProducts(product.category, product.slug),
    getProductReviews(product.id as string),
  ]);

  const baseProductSchema = buildProductSchema(product);
  const enrichedSchema = {
    ...baseProductSchema,
    ...(reviews?.ratingCount && reviews.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(reviews.ratingAvg.toFixed(1)),
            reviewCount: reviews.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null),
    ...(reviews?.items?.length
      ? {
          review: reviews.items.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: r.reviewerLabel,
            },
            datePublished: r.createdAt,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(r.comment ? { reviewBody: r.comment } : null),
          })),
        }
      : null),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enrichedSchema) }}
      />
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
