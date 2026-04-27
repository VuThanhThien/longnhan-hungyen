'use client';

import Link from 'next/link';
import { type Order } from '@longnhan/types';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { InlineErrorState } from '@/components/ui/inline-error-state';
import { adminClientGet } from '@/lib/admin-client';
import { toList } from '@/lib/admin-data';
import { adminQueryKeys } from '@/lib/query-keys';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

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

export function RecentOrders() {
  const queryString = 'limit=10&page=1';
  const ordersQuery = useQuery({
    queryKey: adminQueryKeys.dashboard.recentOrders(queryString),
    queryFn: async () => {
      const raw = await adminClientGet<unknown>(`/orders?${queryString}`);
      return toList<Order>(raw);
    },
  });

  const orders = ordersQuery.data ?? [];
  const error = ordersQuery.isError;

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
        {ordersQuery.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-12 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <InlineErrorState message="Không thể tải đơn hàng gần đây." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="Chưa có đơn hàng nào"
          />
        ) : (
          <div className="space-y-1">
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
