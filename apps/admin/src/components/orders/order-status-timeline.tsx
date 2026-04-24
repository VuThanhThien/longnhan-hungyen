import { OrderStatus } from '@longnhan/types';
import type { OrderStatusHistoryEntry } from '@longnhan/types';
import { formatDate } from '@/lib/utils';

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPING]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

const statusDot: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-500',
  [OrderStatus.CONFIRMED]: 'bg-blue-500',
  [OrderStatus.SHIPPING]: 'bg-purple-500',
  [OrderStatus.DELIVERED]: 'bg-emerald-500',
  [OrderStatus.CANCELLED]: 'bg-red-500',
};

const actorLabel: Record<string, string> = {
  system: 'hệ thống',
  admin: 'admin',
  customer: 'khách',
};

interface Props {
  history: OrderStatusHistoryEntry[];
}

export function OrderStatusTimeline({ history }: Props) {
  if (!history.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có lịch sử trạng thái.
      </p>
    );
  }
  // newest first
  const sorted = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <ol className="space-y-3">
      {sorted.map((entry, idx) => {
        const isLast = idx === sorted.length - 1;
        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-3 w-3 rounded-full ${statusDot[entry.toStatus]}`}
              />
              {!isLast ? (
                <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
              ) : null}
            </div>
            <div className="flex-1 pb-3">
              <p className="text-sm font-medium">
                {statusLabel[entry.toStatus]}
                {entry.fromStatus ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (từ {statusLabel[entry.fromStatus]})
                  </span>
                ) : (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (khởi tạo)
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry.createdAt)} ·{' '}
                {actorLabel[entry.actorType] ?? entry.actorType}
              </p>
              {entry.note ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
