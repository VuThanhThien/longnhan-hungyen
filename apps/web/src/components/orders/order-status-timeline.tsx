import { Check, Circle, Package, Truck, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PublicOrderStatusHistoryEntry } from '@/actions/order-tracking-actions';

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

function formatShortTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildStepTimestamps(
  history: PublicOrderStatusHistoryEntry[] | undefined,
): Record<OrderStatusValue, string | undefined> {
  const out: Record<OrderStatusValue, string | undefined> = {
    pending: undefined,
    confirmed: undefined,
    shipping: undefined,
    delivered: undefined,
    cancelled: undefined,
  };
  if (!history?.length) return out;
  for (const entry of history) {
    const s = entry.toStatus as OrderStatusValue;
    if (!out[s]) out[s] = entry.createdAt;
  }
  return out;
}

export function OrderStatusTimeline({
  orderStatus,
  history,
  className,
}: {
  orderStatus: string;
  history?: PublicOrderStatusHistoryEntry[];
  className?: string;
}) {
  const s = orderStatus as OrderStatusValue;
  const cancelled = s === 'cancelled';
  const currentIdx = statusIndex(s);
  const delivered = s === 'delivered';
  const timestamps = buildStepTimestamps(history);

  const isStepComplete = (idx: number) => delivered || idx < currentIdx;
  const isStepCurrent = (idx: number) => !delivered && idx === currentIdx;

  if (cancelled) {
    const cancelAt = timestamps.cancelled;
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
            {cancelAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Hủy lúc {formatShortTimestamp(cancelAt)}
              </p>
            ) : null}
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
          const ts = timestamps[step.key];

          return (
            <li key={step.key} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    complete &&
                      'border-primary bg-primary text-primary-foreground shadow-sm',
                    current &&
                      'border-primary bg-background text-primary ring-4 ring-primary/15 animate-pulse',
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
                {ts ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatShortTimestamp(ts)}
                  </p>
                ) : null}
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
