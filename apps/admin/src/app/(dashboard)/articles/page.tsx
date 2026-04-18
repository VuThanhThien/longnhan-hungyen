import { Suspense } from 'react';
import ArticlesPageClient from './page.client';

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
      }
    >
      <ArticlesPageClient />
    </Suspense>
  );
}
