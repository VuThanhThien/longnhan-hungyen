'use client';

import * as React from 'react';
import { useActionState } from 'react';

import {
  lookupOrderAction,
  type LookupOrderState,
} from '@/actions/order-tracking-actions';
import { OrderSummaryPanel } from '@/components/orders/order-summary-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const initialLookupState: LookupOrderState = {
  ok: false,
  error: '',
};

export function OrderTrackForm({ initialCode }: { initialCode?: string }) {
  const [lookupState, lookupAction, lookupPending] = useActionState(
    lookupOrderAction,
    initialLookupState,
  );

  const [code, setCode] = React.useState(initialCode ?? '');

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card className="overflow-hidden border-border/80 bg-surface shadow-lg ring-1 ring-border/40">
        <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20 pb-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Tra cứu đơn hàng
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nhập mã đơn hàng (ví dụ LN-260416-ABCD) để xem tiến trình và chi
            tiết.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form action={lookupAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="track-code">
                Mã đơn hàng
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="track-code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="LN-YYMMDD-XXXX"
                  autoComplete="off"
                  className="h-11 font-mono text-base"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={lookupPending}
                  className="h-11 shrink-0 sm:min-w-[140px]"
                >
                  {lookupPending ? (
                    'Đang tra cứu…'
                  ) : (
                    <>
                      <Search className="mr-2 size-4" aria-hidden />
                      Tra cứu
                    </>
                  )}
                </Button>
              </div>
            </div>

            {lookupState.ok ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <OrderSummaryPanel data={lookupState.data} />
              </div>
            ) : lookupState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {lookupState.error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
