import type { MetadataRoute } from 'next';
import type { Article, Product } from '@longnhan/types';
import { fetchPaginated } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Product[] = [];
  let articles: Article[] = [];

  try {
    const [productRes, articleRes] = await Promise.all([
      fetchPaginated<Product>('/products', { limit: 1000 }),
      fetchPaginated<Article>('/articles', { limit: 1000 }),
    ]);
    products = productRes.data;
    articles = articleRes.data;
  } catch (error) {
    captureApiFetchError(error, {
      route: 'sitemap',
      section: 'entries',
    });
    products = [];
    articles = [];
  }

  return [
    {
      url: SITE_URL,
      priority: 1,
      changeFrequency: 'daily',
    },
    {
      url: `${SITE_URL}/products`,
      priority: 0.9,
      changeFrequency: 'daily',
    },
    {
      url: `${SITE_URL}/articles`,
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
  ];
}
