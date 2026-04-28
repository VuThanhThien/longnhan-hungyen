import { Header } from '@/components/layout/header';
import { TransactionsListClient } from './page.client';
import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Giao dịch" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Suspense
          fallback={
            <div className="text-sm text-muted-foreground">Đang tải…</div>
          }
        >
          <TransactionsListClient />
        </Suspense>
      </main>
    </div>
  );
}
