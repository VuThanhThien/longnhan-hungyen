import { useQuery } from '@tanstack/react-query';
import type { Product } from '@longnhan/types';
import { adminClientGet } from '@/lib/admin-client';
import { adminProductQueryKey } from './products.utils';

export function useAdminProduct(productId?: string) {
  return useQuery({
    queryKey: adminProductQueryKey(productId),
    enabled: Boolean(productId),
    queryFn: () => adminClientGet<Product>(`/products/admin/${productId}`),
  });
}

