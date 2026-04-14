import axios, { type AxiosInstance, isAxiosError } from 'axios';
import Cookies from 'js-cookie';
import {
  AUTH_TOKEN_KEY,
  parseAuthTokens,
  type AuthTokens,
} from '@/lib/auth-token';

function extractMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data;
    if (payload && typeof payload === 'object') {
      const msg = (payload as { message?: string | string[] }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg.join(', ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Request failed';
}

export function createLongnhanApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: (status) => status >= 200 && status < 300,
  });

  let refreshPromise: Promise<void> | null = null;

  const refreshTokens = async () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const tokens = parseAuthTokens(Cookies.get(AUTH_TOKEN_KEY));
        if (!tokens?.refreshToken) return;

        const response = await fetch(`${baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });

        if (!response.ok) {
          Cookies.remove(AUTH_TOKEN_KEY);
          return;
        }

        const json = await response.json();
        const data = (json?.data ?? json) as Partial<AuthTokens>;
        if (
          typeof data.accessToken === 'string' &&
          typeof data.refreshToken === 'string' &&
          typeof data.tokenExpires === 'number'
        ) {
          Cookies.set(
            AUTH_TOKEN_KEY,
            JSON.stringify({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              tokenExpires: data.tokenExpires,
            }),
            { sameSite: 'lax' },
          );
          return;
        }

        Cookies.remove(AUTH_TOKEN_KEY);
      } catch {
        Cookies.remove(AUTH_TOKEN_KEY);
      }
    })().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  };

  instance.interceptors.request.use(async (config) => {
    if (typeof window === 'undefined') return config;

    const tokens = parseAuthTokens(Cookies.get(AUTH_TOKEN_KEY));
    if (tokens?.tokenExpires && tokens.tokenExpires - 60_000 <= Date.now()) {
      await refreshTokens();
    }

    const refreshed = parseAuthTokens(Cookies.get(AUTH_TOKEN_KEY));
    if (refreshed?.accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${refreshed.accessToken}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const body = response.data;
      const isPaginatedEnvelope =
        body !== null &&
        typeof body === 'object' &&
        'data' in body &&
        'pagination' in body;

      if (
        !isPaginatedEnvelope &&
        body !== null &&
        typeof body === 'object' &&
        'data' in body
      ) {
        response.data = (body as { data: unknown }).data;
      }
      return response;
    },
    (error) => Promise.reject(new Error(extractMessage(error))),
  );

  return instance;
}
