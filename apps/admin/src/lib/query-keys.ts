export const adminQueryKeys = {
  dashboard: {
    root: ['dashboard'] as const,
    stats: (period: string) => ['dashboard', 'stats', period] as const,
    recentOrders: (query: string) =>
      ['dashboard', 'recent-orders', query] as const,
  },
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
    brief: (idsKey: string) => ['products', 'admin', 'brief', idsKey] as const,
  },
  orders: {
    /** Invalidates order lists (`['orders', query]`) and detail (`['orders', id]`) */
    all: ['orders'] as const,
    list: (query: string) => ['orders', query] as const,
    detail: (orderId: string) => ['orders', orderId] as const,
    statusHistory: (orderId: string) =>
      ['orders', orderId, 'status-history'] as const,
    transactions: (orderId: string) =>
      ['orders', orderId, 'transactions'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (query: string) => ['transactions', 'list', query] as const,
  },
  vouchers: {
    all: ['vouchers', 'admin'] as const,
    list: (query: string) => ['vouchers', 'admin', 'list', query] as const,
    detail: (id: string) => ['vouchers', 'admin', id] as const,
    usages: (id: string, query: string) =>
      ['vouchers', 'admin', id, 'usages', query] as const,
  },
} as const;
