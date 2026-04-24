'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { OrderSuccessCartClearer } from '@/components/orders/order-success-cart-clearer';
import {
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/components/orders/order-summary-panel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { fetchApi } from '@/lib/api-client';

type PaymentPollSummary = {
  code: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  orderStatus: string;
};

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const orderCode = (sp.get('orderCode') ?? '').slice(0, 64);

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!orderCode) return;
    const t = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [orderCode]);

  const q = useQuery({
    queryKey: ['checkout-payment-poll', orderCode],
    enabled: Boolean(orderCode),
    queryFn: () =>
      fetchApi<PaymentPollSummary>(
        `/orders/summary?code=${encodeURIComponent(orderCode)}`,
      ),
    refetchInterval: (query) => {
      if (timedOut) return false;
      const data = query.state.data;
      if (data?.paymentStatus === 'paid') return false;
      if (data?.paymentStatus === 'failed') return false;
      return POLL_INTERVAL_MS;
    },
  });

  const isPaid = q.data?.paymentStatus === 'paid';
  const isFailed = q.data?.paymentStatus === 'failed';
  const isPending = !isPaid && !isFailed;
  const pollingActive = Boolean(orderCode) && !timedOut && isPending;

  if (!orderCode) {
    return (
      <section className="mx-auto max-w-xl px-4 py-12 md:py-20">
        <Card className="border-border/80 bg-surface text-foreground shadow-xl ring-1 ring-border/50">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-4 size-12 text-destructive" />
            <p className="text-lg font-semibold">Thiếu mã đơn hàng</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng quay lại trang thanh toán hoặc kiểm tra email.
            </p>
            <Button asChild className="mt-6">
              <Link href="/checkout">Quay lại thanh toán</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-xl px-4 py-12 md:py-20">
      <OrderSuccessCartClearer />

      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl"
        aria-hidden
      />

      <Card className="relative overflow-hidden border-border/80 bg-surface text-foreground shadow-xl ring-1 ring-border/50">
        <CardHeader className="items-center space-y-0 pb-2 pt-10 text-center">
          <StatusIcon isPaid={isPaid} isFailed={isFailed} />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {isPaid
              ? 'Thanh toán thành công'
              : isFailed
                ? 'Thanh toán thất bại'
                : 'Đang chờ xác nhận thanh toán'}
          </h1>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {isPaid
              ? 'Cảm ơn bạn! Đơn hàng sẽ được xử lý trong thời gian sớm nhất.'
              : isFailed
                ? 'Thanh toán không thành công. Bạn có thể thử lại hoặc liên hệ hỗ trợ.'
                : 'Hệ thống đang xác nhận thanh toán từ ngân hàng. Vui lòng chờ trong giây lát...'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-6 pt-2">
          <div className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-border/80 bg-gradient-to-br from-muted/50 to-background p-5 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm ring-1 ring-border/60">
                <Package className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Mã đơn hàng
                </p>
                <p className="mt-1 break-all font-mono text-lg font-semibold tracking-tight text-foreground">
                  {orderCode}
                </p>

                {q.isLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Đang tải trạng thái...
                  </div>
                ) : q.data ? (
                  <dl className="mt-4 grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Tổng tiền</dt>
                      <dd className="font-semibold tabular-nums">
                        {q.data.total.toLocaleString('vi-VN')}₫
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Thanh toán</dt>
                      <dd className="text-right font-medium">
                        {paymentMethodLabel(q.data.paymentMethod)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Trạng thái TT</dt>
                      <dd className="text-right font-medium">
                        <PaymentStatusBadge status={q.data.paymentStatus} />
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Không tải được chi tiết đơn. Bạn vẫn có thể tra cứu bằng mã
                    ở trang theo dõi.
                  </p>
                )}
              </div>
            </div>

            {isPending && !pollingActive ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <RefreshCw className="size-4" />
                Hết thời gian tự động kiểm tra. Vui lòng tải lại trang hoặc tra
                cứu đơn hàng.
              </div>
            ) : null}
          </div>

          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full shadow-md"
          >
            <Link href={`/track-order?code=${encodeURIComponent(orderCode)}`}>
              <Search className="size-4 shrink-0" aria-hidden />
              Tra cứu đơn hàng
            </Link>
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border/80 bg-muted/20 px-4 py-6 sm:flex-row sm:justify-center sm:gap-4">
          <Button asChild size="lg" className="w-full min-w-48 sm:w-auto">
            <Link href="/products">
              <ShoppingBag className="size-4 shrink-0" aria-hidden />
              Tiếp tục mua sắm
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full min-w-48 border-border bg-background sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4 shrink-0" aria-hidden />
              Về trang chủ
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}

function StatusIcon({
  isPaid,
  isFailed,
}: {
  isPaid: boolean;
  isFailed: boolean;
}) {
  if (isPaid) {
    return (
      <div
        className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-inner ring-2 ring-primary/20"
        aria-hidden
      >
        <CheckCircle2 className="size-11" strokeWidth={2.25} />
      </div>
    );
  }
  if (isFailed) {
    return (
      <div
        className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/15 to-destructive/5 text-destructive shadow-inner ring-2 ring-destructive/20"
        aria-hidden
      >
        <XCircle className="size-11" strokeWidth={2.25} />
      </div>
    );
  }
  return (
    <div
      className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 shadow-inner ring-2 ring-amber-500/20 animate-pulse"
      aria-hidden
    >
      <Clock className="size-11" strokeWidth={2.25} />
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const label = paymentStatusLabel(status);

  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
        <CheckCircle2 className="size-3" />
        {label}
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        <XCircle className="size-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
      <Clock className="size-3" />
      {label}
    </span>
  );
}
