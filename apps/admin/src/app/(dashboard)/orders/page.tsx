import { Suspense } from 'react';
import OrdersPageClient from './page.client';

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
      }
    >
      <OrdersPageClient />
    </Suspense>
  );
}
