import { Check, Circle, Package, Truck, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export type OrderStatusValue =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

const STEPS: { key: OrderStatusValue; label: string; description: string }[] = [
  {
    key: 'pending',
    label: 'Đã tiếp nhận',
    description: 'Đơn hàng đã được ghi nhận',
  },
  {
    key: 'confirmed',
    label: 'Đã xác nhận',
    description: 'Shop đã xác nhận đơn',
  },
  {
    key: 'shipping',
    label: 'Đang giao',
    description: 'Đơn đang được vận chuyển',
  },
  { key: 'delivered', label: 'Hoàn tất', description: 'Giao hàng thành công' },
];

function statusIndex(status: OrderStatusValue): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'shipping':
      return 2;
    case 'delivered':
      return 3;
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

export function OrderStatusTimeline({
  orderStatus,
  className,
}: {
  orderStatus: string;
  className?: string;
}) {
  const s = orderStatus as OrderStatusValue;
  const cancelled = s === 'cancelled';
  const currentIdx = statusIndex(s);
  const delivered = s === 'delivered';

  const isStepComplete = (idx: number) => delivered || idx < currentIdx;
  const isStepCurrent = (idx: number) => !delivered && idx === currentIdx;

  if (cancelled) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm',
          className,
        )}
        role="status"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <XCircle className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-destructive">Đơn hàng đã hủy</p>
            <p className="mt-1 text-muted-foreground">
              Đơn không còn được xử lý. Liên hệ hỗ trợ nếu bạn cần trợ giúp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <ol className="space-y-0">
        {STEPS.map((step, idx) => {
          const isLast = idx === STEPS.length - 1;
          const complete = isStepComplete(idx);
          const current = isStepCurrent(idx);

          return (
            <li key={step.key} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    complete &&
                      'border-primary bg-primary text-primary-foreground shadow-sm',
                    current &&
                      'border-primary bg-background text-primary ring-4 ring-primary/15',
                    !complete &&
                      !current &&
                      'border-border bg-muted/50 text-muted-foreground',
                  )}
                  aria-hidden
                >
                  {complete ? (
                    <Check className="size-5" strokeWidth={2.5} />
                  ) : current ? (
                    <Package className="size-5" />
                  ) : (
                    <Circle className="size-4 opacity-40" />
                  )}
                </span>
                {!isLast ? (
                  <span
                    className={cn(
                      'my-1 w-px flex-1 min-h-[28px]',
                      complete ? 'bg-primary' : 'bg-border',
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className={cn('pb-8', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'font-semibold leading-tight',
                    current || complete
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
                {current && step.key === 'shipping' ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Truck className="size-3.5" aria-hidden />
                    Đang trên đường giao đến bạn
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
