export const AUTH_TOKEN_KEY = 'longnhan-hy-landing-auth-token-data';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
}

export function parseAuthTokens(value: string | undefined): AuthTokens | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<AuthTokens>;
    if (
      typeof parsed?.accessToken === 'string' &&
      typeof parsed?.refreshToken === 'string' &&
      typeof parsed?.tokenExpires === 'number'
    ) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        tokenExpires: parsed.tokenExpires,
      };
    }
  } catch {
    return null;
  }

  return null;
}
