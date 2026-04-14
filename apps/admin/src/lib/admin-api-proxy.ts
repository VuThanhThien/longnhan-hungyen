import { cookies } from 'next/headers';
import { getApiUrl } from '@/lib/admin-api-client';
import { AUTH_TOKEN_KEY, parseAuthTokens } from '@/lib/auth-token';

export async function forwardAdminApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const cookieStore = await cookies();
  const token =
    parseAuthTokens(cookieStore.get(AUTH_TOKEN_KEY)?.value)?.accessToken ||
    cookieStore.get('token')?.value;
  const url = `${getApiUrl()}${path}`;
  const isFormData = init?.body instanceof FormData;

  return fetch(url, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });
}
