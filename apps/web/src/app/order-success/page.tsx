import Link from 'next/link';
import type { Metadata } from 'next';
import { CircleCheck, Home, Package, ShoppingBag } from 'lucide-react';

import { OrderSuccessCartClearer } from '@/components/orders/order-success-cart-clearer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

interface OrderSuccessPageProps {
  searchParams: Promise<{ code?: string | string[] }>;
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

  const orderCode = codeFromQuery;

  return (
    <section className="mx-auto max-w-xl px-4 py-12 md:py-20">
      {orderCode ? <OrderSuccessCartClearer /> : null}

      <Card
        className="overflow-hidden border-border bg-surface text-foreground shadow-md"
        role="status"
        aria-live="polite"
      >
        <CardHeader className="items-center space-y-0 pb-2 pt-10 text-center">
          <div
            className="mb-6 flex size-18 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--palette-offwhite)_35%,transparent)] ring-2 ring-border/80"
            aria-hidden
          >
            <CircleCheck className="size-10" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Đặt hàng thành công
          </h1>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Cảm ơn bạn đã đặt hàng. Đội ngũ Long Nhãn Tổng Trần sẽ liên hệ xác
            nhận đơn trong thời gian sớm nhất.
          </p>
        </CardHeader>

        <CardContent className="pb-6 pt-2">
          {orderCode ? (
            <div className="mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-left">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border/60">
                <Package className="size-5" aria-hidden />
              </span>
              {/* TODO: link go to tracking page */}
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Mã đơn hàng
                </p>
                <p className="mt-0.5 break-all font-mono text-base font-semibold text-foreground">
                  {orderCode}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/25 px-4 py-6 sm:flex-row sm:justify-center sm:gap-4">
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
