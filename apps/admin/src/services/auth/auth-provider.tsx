'use client';

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthActionsContext, AuthContext, AuthTokensContext, type AuthUser, type TokensInfo } from './auth-context';
import { getTokensInfo, setTokensInfo as setTokensInfoToStorage } from './auth-tokens-info';

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

    if (!tokens?.accessToken) {
      setTokensInfo(null);
      return;
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setTokensInfo(null);
    }
  }, [setTokensInfo]);

  const loadData = useCallback(async () => {
    const tokens = getTokensInfo();

    try {
      if (!tokens?.accessToken) return;

      const response = await fetch('/api/users/me', {
        method: 'GET',
      });

      if (response.status === 401) {
        await logOut();
        return;
      }

      if (!response.ok) return;

      const json = await response.json();
      const data = (json?.data ?? json) as AuthUser;
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, [logOut]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const contextValue = useMemo(
    () => ({
      isLoaded,
      user,
    }),
    [isLoaded, user],
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser,
      logOut,
    }),
    [logOut],
  );

  const contextTokensValue = useMemo(
    () => ({
      setTokensInfo,
    }),
    [setTokensInfo],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>{children}</AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}
