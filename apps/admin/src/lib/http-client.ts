import axios from 'axios';
import { getTokensInfo, setTokensInfo } from '@/services/auth/auth-tokens-info';

export const httpClient = axios.create({
  baseURL: '/api',
  timeout: 15_000,
});

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
      const data = json?.data ?? json;

      if (
        typeof data?.accessToken === 'string' &&
        typeof data?.refreshToken === 'string' &&
        typeof data?.tokenExpires === 'number'
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

httpClient.interceptors.request.use(async (config) => {
  const tokens = getTokensInfo();

  if (tokens?.tokenExpires && tokens.tokenExpires - 60_000 <= Date.now()) {
    await refreshTokens();
  }

  const refreshed = getTokensInfo();

  if (refreshed?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${refreshed.accessToken}`;
  }

  return config;
});
