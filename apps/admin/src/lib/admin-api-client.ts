import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

export async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export function getApiUrl() {
  return API_URL;
}
