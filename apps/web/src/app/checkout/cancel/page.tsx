import Link from 'next/link';
import type { Metadata } from 'next';
import { Home, RefreshCw, Search, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Đã huỷ thanh toán',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ orderCode?: string | string[] }>;

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderCode =
    typeof params.orderCode === 'string'
      ? params.orderCode.slice(0, 64)
      : Array.isArray(params.orderCode)
        ? params.orderCode[0]?.slice(0, 64)
        : null;

  return (
    <section className="mx-auto max-w-xl px-4 py-12 md:py-20">
      <Card className="border-border/80 bg-surface text-foreground shadow-xl ring-1 ring-border/50">
        <CardHeader className="items-center space-y-0 pb-2 pt-10 text-center">
          <div
            className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 shadow-inner ring-2 ring-amber-500/20"
            aria-hidden
          >
            <XCircle className="size-11" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Bạn đã huỷ thanh toán
          </h1>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Nếu bạn muốn tiếp tục, vui lòng quay lại trang thanh toán để thử
            lại.
          </p>
        </CardHeader>

        {orderCode ? (
          <CardContent className="pb-6 pt-2">
            <p className="text-center text-sm text-muted-foreground">
              Mã đơn hàng:{' '}
              <span className="font-mono font-semibold text-foreground">
                {orderCode}
              </span>
            </p>
            <Button
              asChild
              variant="default"
              size="lg"
              className="mt-4 w-full shadow-md"
            >
              <Link href={`/track-order?code=${encodeURIComponent(orderCode)}`}>
                <Search className="size-4 shrink-0" aria-hidden />
                Tra cứu đơn hàng
              </Link>
            </Button>
          </CardContent>
        ) : null}

        <CardFooter className="flex flex-col gap-3 border-t border-border/80 bg-muted/20 px-4 py-6 sm:flex-row sm:justify-center sm:gap-4">
          <Button asChild size="lg" className="w-full min-w-48 sm:w-auto">
            <Link href="/checkout">
              <RefreshCw className="size-4 shrink-0" aria-hidden />
              Quay lại thanh toán
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
