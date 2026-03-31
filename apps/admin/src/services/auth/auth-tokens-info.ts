'use client';

import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY } from './config';
import type { TokensInfo } from './auth-context';
import { parseAuthTokens } from '@/lib/auth-token';

export function getTokensInfo(): TokensInfo {
  return parseAuthTokens(Cookies.get(AUTH_TOKEN_KEY));
}

export function setTokensInfo(tokens: TokensInfo) {
  if (tokens) {
    Cookies.set(AUTH_TOKEN_KEY, JSON.stringify(tokens), { sameSite: 'lax' });
    return;
  }

  Cookies.remove(AUTH_TOKEN_KEY);
}
