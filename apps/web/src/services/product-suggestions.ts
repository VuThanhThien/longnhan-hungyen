'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type ProductSuggestionItem = {
  name: string;
  slug: string;
  featuredImageUrl: string | null;
  basePrice: number;
};

export type CategorySuggestionItem = {
  slug: string;
  name: string;
};

export type SuggestionsResponse = {
  q: string;
  categories: CategorySuggestionItem[];
  products: ProductSuggestionItem[];
};

async function fetchSuggestions(q: string): Promise<SuggestionsResponse> {
  const { data } = await apiClient.get<SuggestionsResponse>(
    '/products/suggestions',
    { params: { q, limit: 8 } },
  );
  return data;
}

export function useProductSuggestions(q: string, enabled: boolean) {
  return useQuery({
    queryKey: ['products', 'suggestions', q] as const,
    queryFn: () => fetchSuggestions(q),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 30_000,
    gcTime: 120_000,
  });
}
