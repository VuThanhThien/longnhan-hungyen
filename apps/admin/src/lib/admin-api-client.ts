import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY, parseAuthTokens } from '@/lib/auth-token';

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

export async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token =
    parseAuthTokens(cookieStore.get(AUTH_TOKEN_KEY)?.value)?.accessToken ||
    cookieStore.get('token')?.value;
  const isFormData = options?.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  const json = await res.json();
  return (json?.data ?? json) as T;
}

export function getApiUrl() {
  return API_URL;
}
