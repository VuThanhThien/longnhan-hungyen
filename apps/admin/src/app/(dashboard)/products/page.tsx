import { Suspense } from 'react';
import ProductsPageClient from './page.client';

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Đang tải…</div>}
    >
      <ProductsPageClient />
    </Suspense>
  );
}
