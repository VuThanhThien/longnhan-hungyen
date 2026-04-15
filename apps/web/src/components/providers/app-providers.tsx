'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { InstallAppBanner } from '@/components/pwa/install-app-banner';
import { OfflineSupport } from '@/components/pwa/offline-support';
import { AuthProvider } from '@/services/auth/auth-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfflineSupport />
        <InstallAppBanner />
        <Suspense fallback={null}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </Suspense>
        <Toaster richColors closeButton position="top-center" />
        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools
            buttonPosition="bottom-left"
            initialIsOpen={false}
          />
        ) : null}
      </AuthProvider>
    </QueryClientProvider>
  );
}
