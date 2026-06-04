import { createLongnhanApi } from '@/lib/http/create-longnhan-api';
import { sanitizeApiQueryParams } from '@/lib/http/sanitize-api-query-params';
import type { PaginatedResponse } from '@/lib/types/api-paginated';

const baseURL =
  typeof window === 'undefined'
    ? process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = createLongnhanApi(baseURL);

export async function fetchApi<T>(
  path: string,
  init?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | number | undefined>;
  },
): Promise<T> {
  const method = init?.method ?? 'GET';
  if (method === 'GET' || !init?.body) {
    const { data } = await apiClient.get<T>(path, {
      params: sanitizeApiQueryParams(init?.params),
    });
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
  const { data } = await apiClient.get<PaginatedResponse<T>>(path, {
    params: sanitizeApiQueryParams(params),
  });
  return data;
}

export async function fetchList<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T[]> {
  const result = await fetchPaginated<T>(path, params);
  return result.data;
}
