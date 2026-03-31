'use client';

import { useQuery } from '@tanstack/react-query';
import type { Product } from '@longnhan/types';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse } from '@/lib/types/api-paginated';

export function useProductsList(params?: {
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
      return data;
    },
  });
}
