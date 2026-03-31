import { createLongnhanApi } from '@/lib/http/create-longnhan-api';
import type { PaginatedResponse } from '@/lib/types/api-paginated';

const baseURL =
  typeof window === 'undefined'
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = createLongnhanApi(baseURL);

export async function fetchApi<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const method = init?.method ?? 'GET';
  if (method === 'GET' || !init?.body) {
    const { data } = await apiClient.get<T>(path);
    return data as T;
  }
  const { data } = await apiClient.request<T>({
    url: path,
    method,
    data: init.body,
  });
  return data as T;
}

export async function fetchPaginated<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<PaginatedResponse<T>> {
  const { data } = await apiClient.get<PaginatedResponse<T>>(path, { params });
  return data;
}

export async function fetchList<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T[]> {
  const result = await fetchPaginated<T>(path, params);
  return result.data;
}
