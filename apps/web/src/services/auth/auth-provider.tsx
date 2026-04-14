'use client';

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
  type AuthUser,
  type TokensInfo,
} from './auth-context';
import {
  getTokensInfo,
  setTokensInfo as setTokensInfoToStorage,
} from './auth-tokens-info';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3001/api/v1';

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const setTokensInfo = useCallback((tokensInfo: TokensInfo) => {
    setTokensInfoToStorage(tokensInfo);
    if (!tokensInfo) {
      setUser(null);
    }
  }, []);

  const logOut = useCallback(async () => {
    const tokens = getTokensInfo();
    if (tokens?.accessToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
    }

    setTokensInfo(null);
  }, [setTokensInfo]);

  const loadData = useCallback(async () => {
    const tokens = getTokensInfo();
    console.log('🚀 ~ AuthProvider ~ tokens:', tokens);

    try {
      if (!tokens?.accessToken) return;

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (response.status === 401) {
        await logOut();
        return;
      }

      if (!response.ok) return;
      const json = await response.json();
      const data = (json?.data ?? json) as AuthUser;
      setUser(data);
    } finally {
      setIsLoaded(true);
    }
  }, [logOut]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const contextValue = useMemo(() => ({ user, isLoaded }), [user, isLoaded]);
  const contextActionsValue = useMemo(() => ({ setUser, logOut }), [logOut]);
  const contextTokensValue = useMemo(
    () => ({ setTokensInfo }),
    [setTokensInfo],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}
