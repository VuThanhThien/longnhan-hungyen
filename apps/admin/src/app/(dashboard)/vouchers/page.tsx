import { Suspense } from 'react';
import VouchersPageClient from './page.client';

export default function VouchersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
      }
    >
      <VouchersPageClient />
    </Suspense>
  );
}
