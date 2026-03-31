export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params?: { category?: string; q?: string; page?: number; limit?: number }) =>
      [...queryKeys.products.all, 'list', params ?? {}] as const,
    detail: (slug: string) => [...queryKeys.products.all, 'detail', slug] as const,
  },
  articles: {
    all: ['articles'] as const,
    list: (params?: { page?: number; limit?: number }) =>
      [...queryKeys.articles.all, 'list', params ?? {}] as const,
    detail: (slug: string) => [...queryKeys.articles.all, 'detail', slug] as const,
  },
} as const;
