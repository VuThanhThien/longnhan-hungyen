import { Suspense } from 'react';
import CategoriesPageClient from './page.client';

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Đang tải…</div>}
    >
      <CategoriesPageClient />
    </Suspense>
  );
}
