import Link from 'next/link';
import { type Order } from '@longnhan/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const orderStatusLabels: Record<
  string,
  {
    label: string;
    variant:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'warning'
      | 'success'
      | 'info'
      | 'outline';
  }
> = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  shipping: { label: 'Đang giao', variant: 'secondary' },
  delivered: { label: 'Đã giao', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
};

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
        <Link
          href="/orders"
          className="text-sm text-accent transition-colors hover:underline"
        >
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có đơn hàng nào
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = orderStatusLabels[order.orderStatus] ?? {
                label: order.orderStatus,
                variant: 'secondary' as const,
              };
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {order.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
