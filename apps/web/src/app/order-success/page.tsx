import Link from 'next/link';
import type { Metadata } from 'next';
import {
  CircleCheck,
  Home,
  Package,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

import { apiServer } from '@/lib/api-server';
import { OrderSuccessCartClearer } from '@/components/orders/order-success-cart-clearer';
import {
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/components/orders/order-summary-panel';
import QrPaymentInfo from '@/components/orders/qr-payment-info';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { PublicOrderSummary } from '@/actions/order-tracking-actions';

interface OrderSuccessPageProps {
  searchParams: Promise<{
    code?: string | string[];
  }>;
}

export const metadata: Metadata = {
  title: 'Đặt hàng thành công',
  description:
    'Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ xác nhận sớm.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = await searchParams;
  const codeFromQuery =
    typeof params.code === 'string'
      ? params.code.slice(0, 64)
      : Array.isArray(params.code)
        ? params.code[0]?.slice(0, 64)
        : null;

  let summary: PublicOrderSummary | null = null;
  if (codeFromQuery) {
    try {
      const res = await apiServer.get<PublicOrderSummary>('/orders/summary', {
        params: { code: codeFromQuery },
      });
      summary = res.data;
    } catch {
      summary = null;
    }
  }

  const orderCode = summary?.code ?? codeFromQuery;
  const showBankQr = summary?.paymentMethod === 'bank_transfer';

  return (
    <section className="relative mx-auto max-w-xl px-4 py-12 md:py-20">
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl"
        aria-hidden
      />

      {orderCode ? <OrderSuccessCartClearer /> : null}

      <Card
        className="relative overflow-hidden border-border/80 bg-surface text-foreground shadow-xl ring-1 ring-border/50"
        role="status"
        aria-live="polite"
      >
        <div className="absolute right-4 top-4 opacity-[0.07]">
          <Sparkles className="size-24 text-primary" aria-hidden />
        </div>

        <CardHeader className="items-center space-y-0 pb-2 pt-10 text-center">
          <div
            className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-inner ring-2 ring-primary/20"
            aria-hidden
          >
            <CircleCheck className="size-11" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Đặt hàng thành công
          </h1>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Cảm ơn bạn đã đặt hàng. Đội ngũ Long Nhãn Tổng Trần sẽ liên hệ xác
            nhận đơn trong thời gian sớm nhất.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-6 pt-2">
          {orderCode ? (
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
                  {summary ? (
                    <dl className="mt-4 grid gap-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Tổng tiền</dt>
                        <dd className="font-semibold tabular-nums">
                          {summary.total.toLocaleString('vi-VN')}₫
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Thanh toán</dt>
                        <dd className="text-right font-medium">
                          {paymentMethodLabel(summary.paymentMethod)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Trạng thái TT</dt>
                        <dd className="text-right font-medium">
                          {paymentStatusLabel(summary.paymentStatus)}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Không tải được chi tiết đơn. Bạn vẫn có thể tra cứu bằng
                      mã ở trang theo dõi.
                    </p>
                  )}
                </div>
              </div>

              <Button
                asChild
                variant="default"
                size="lg"
                className="w-full shadow-md"
              >
                <Link
                  href={`/track-order?code=${encodeURIComponent(orderCode)}`}
                >
                  Xem tiến trình đơn hàng
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Nếu bạn không thấy mã đơn, vui lòng kiểm tra email hoặc liên hệ hỗ
              trợ.
            </p>
          )}

          {showBankQr ? (
            <div className="mx-auto max-w-lg">
              <QrPaymentInfo
                totalAmount={summary?.total}
                orderCode={orderCode ?? undefined}
              />
            </div>
          ) : null}
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
