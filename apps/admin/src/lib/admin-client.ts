import { httpClient } from '@/lib/http-client';
import { sanitizeApiQueryParams } from '@/lib/http/sanitize-api-query-params';

export async function adminClientGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  const res = await httpClient.get(path, {
    params: sanitizeApiQueryParams(params),
  });
  const json = res.data;
  if (
    json &&
    typeof json === 'object' &&
    'pagination' in json &&
    Array.isArray((json as { data?: unknown }).data)
  ) {
    return json as T;
  }
  return (json?.data ?? json) as T;
}

export async function adminClientPost<T>(path: string, body?: unknown) {
  const res = await httpClient.post(path, body);
  const json = res.data;
  return (json?.data ?? json) as T;
}

export async function adminClientPut<T>(path: string, body?: unknown) {
  const res = await httpClient.put(path, body);
  const json = res.data;
  return (json?.data ?? json) as T;
}

export async function adminClientPatch<T>(path: string, body?: unknown) {
  const res = await httpClient.patch(path, body);
  const json = res.data;
  return (json?.data ?? json) as T;
}

export async function adminClientDelete<T>(path: string) {
  const res = await httpClient.delete(path);
  const json = res.data;
  return (json?.data ?? json) as T;
}
