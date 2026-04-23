export const adminQueryKeys = {
  reviews: {
    root: ['reviews-admin'] as const,
    list: (status: string) => ['reviews-admin', status] as const,
  },
  articles: {
    root: ['articles', 'admin'] as const,
    list: (queryString: string) => ['articles', 'admin', queryString] as const,
  },
  categories: {
    root: ['categories', 'admin'] as const,
  },
  products: {
    root: ['products', 'admin'] as const,
    list: (queryString: string) => ['products', 'admin', queryString] as const,
  },
  orders: {
    /** Invalidates order lists (`['orders', query]`) and detail (`['orders', id]`) */
    all: ['orders'] as const,
    list: (query: string) => ['orders', query] as const,
    detail: (orderId: string) => ['orders', orderId] as const,
  },
  vouchers: {
    all: ['vouchers', 'admin'] as const,
    list: (query: string) => ['vouchers', 'admin', 'list', query] as const,
    detail: (id: string) => ['vouchers', 'admin', id] as const,
    usages: (id: string, query: string) =>
      ['vouchers', 'admin', id, 'usages', query] as const,
  },
} as const;
