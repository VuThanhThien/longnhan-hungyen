import type { Metadata } from 'next';

import type { PublicOrderSummary } from '@/actions/order-tracking-actions';
import { OrderSummaryPanel } from '@/components/orders/order-summary-panel';
import { OrderTrackForm } from '@/components/orders/order-track-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiServer } from '@/lib/api-server';

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng',
  description: 'Theo dõi trạng thái đơn hàng bằng mã đơn hoặc link từ email.',
};

type SearchParams = Promise<{
  t?: string | string[];
  code?: string | string[];
}>;

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token =
    typeof params.t === 'string'
      ? params.t.slice(0, 512)
      : Array.isArray(params.t)
        ? params.t[0]?.slice(0, 512)
        : null;

  const code =
    typeof params.code === 'string'
      ? params.code.slice(0, 64)
      : Array.isArray(params.code)
        ? params.code[0]?.slice(0, 64)
        : '';

  if (token) {
    let tokenData: PublicOrderSummary | null = null;
    let tokenError = false;

    try {
      const res = await apiServer.get<PublicOrderSummary>(
        '/orders/track-by-token',
        {
          params: { t: token },
        },
      );
      tokenData = res.data;
    } catch {
      tokenError = true;
    }

    return (
      <section className="mx-auto max-w-lg px-4 py-10 md:py-16">
        {tokenData ? (
          <div className="space-y-8">
            <Card className="border-border/80 bg-surface shadow-md ring-1 ring-border/40">
              <CardHeader className="border-b border-border/60 bg-muted/15">
                <h1 className="text-xl font-semibold tracking-tight">
                  Theo dõi từ email
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Link chỉ dùng một lần. Lần sau hãy tra cứu bằng mã đơn bên
                  dưới.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <OrderSummaryPanel data={tokenData} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <OrderTrackForm initialCode={code} />
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-10 md:py-16">
      <OrderTrackForm initialCode={code} />
    </section>
  );
}
