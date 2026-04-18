import { contentScope, contentSegment } from '@/lib/content-cache-tags';

export const queryKeys = {
  products: {
    all: [contentScope.products] as const,
    list: (params?: {
      category?: string;
      q?: string;
      page?: number;
      limit?: number;
    }) =>
      [
        ...queryKeys.products.all,
        contentSegment.list,
        `cat:${params?.category ?? ''}`,
        `q:${params?.q ?? ''}`,
        params?.page,
        params?.limit,
      ] as const,
    detail: (slug: string) =>
      [...queryKeys.products.all, contentSegment.detail, slug] as const,
  },
  articles: {
    all: [contentScope.articles] as const,
    list: (params?: { page?: number; limit?: number }) =>
      [
        ...queryKeys.articles.all,
        contentSegment.list,
        params?.page,
        params?.limit,
      ] as const,
    detail: (slug: string) =>
      [...queryKeys.articles.all, contentSegment.detail, slug] as const,
  },
} as const;
