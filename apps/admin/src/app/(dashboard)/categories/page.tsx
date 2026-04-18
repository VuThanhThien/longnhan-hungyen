import { Suspense } from 'react';
import CategoriesPageClient from './page.client';

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
      }
    >
      <CategoriesPageClient />
    </Suspense>
  );
}
