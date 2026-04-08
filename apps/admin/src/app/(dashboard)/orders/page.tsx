import { Suspense } from 'react';
import OrdersPageClient from './page.client';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Đang tải…</div>}>
      <OrdersPageClient />
    </Suspense>
  );
}
