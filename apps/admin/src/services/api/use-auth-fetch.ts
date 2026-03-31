'use client';

import { useCallback } from 'react';
import { getTokensInfo, setTokensInfo } from '@/services/auth/auth-tokens-info';

const AUTH_REFRESH_URL = '/api/auth/refresh';

let refreshPromise: Promise<void> | null = null;

async function refreshTokens() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokens = getTokensInfo();
      if (!tokens?.refreshToken) return;

      const response = await fetch(AUTH_REFRESH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        setTokensInfo(null);
        return;
      }

      const json = await response.json();
      const data = (json?.data ?? json) as Partial<{
        accessToken: string;
        refreshToken: string;
        tokenExpires: number;
      }>;

      if (
        typeof data.accessToken === 'string' &&
        typeof data.refreshToken === 'string' &&
        typeof data.tokenExpires === 'number'
      ) {
        setTokensInfo({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires,
        });
        return;
      }

      setTokensInfo(null);
    } catch {
      setTokensInfo(null);
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function useAuthFetch() {
  return useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    const tokens = getTokensInfo();
    const headers = new Headers(init?.headers);

    if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (tokens?.tokenExpires && tokens.tokenExpires - 60_000 <= Date.now()) {
      await refreshTokens();
    }

    const refreshed = getTokensInfo();
    if (refreshed?.accessToken) {
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
    }

    return fetch(input, { ...init, headers });
  }, []);
}
