'use client';

import { createContext } from 'react';
import type { AuthTokens } from '@/lib/auth-token';

export interface AuthUser {
  id: string;
  email?: string;
  role?: { id?: number | string } | number | string;
  [key: string]: unknown;
}

export type TokensInfo = AuthTokens | null;

export const AuthContext = createContext<{
  user: AuthUser | null;
  isLoaded: boolean;
}>({
  user: null,
  isLoaded: true,
});

export const AuthActionsContext = createContext<{
  setUser: (user: AuthUser | null) => void;
  logOut: () => Promise<void>;
}>({
  setUser: () => {},
  logOut: async () => {},
});

export const AuthTokensContext = createContext<{
  setTokensInfo: (tokensInfo: TokensInfo) => void;
}>({
  setTokensInfo: () => {},
});
