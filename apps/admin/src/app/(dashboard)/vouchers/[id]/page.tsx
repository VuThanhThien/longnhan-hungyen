import { Suspense } from 'react';
import VoucherDetailPageClient from './page.client';

export default function VoucherDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
      }
    >
      <VoucherDetailPageClient />
    </Suspense>
  );
}
