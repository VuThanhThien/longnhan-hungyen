'use client';

import { ShoppingCart, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { adminClientGet } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import { DashboardErrorState } from '@/components/dashboard/dashboard-error-state';
import type {
  DashboardPeriod,
  DashboardStats,
} from '@/lib/dashboard/dashboard-types';

interface StatCardsProps {
  period: DashboardPeriod;
}

export function StatCards({ period }: StatCardsProps) {
  const statsQuery = useQuery({
    queryKey: adminQueryKeys.dashboard.stats(period),
    queryFn: () =>
      adminClientGet<DashboardStats>('/dashboard/stats', {
        period,
      }),
    refetchOnMount: false,
  });

  if (statsQuery.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return <DashboardErrorState />;
  }

  const stats = statsQuery.data;
  const cards = [
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-[#9fbbe0]',
      bg: 'bg-[#9fbbe0]/25',
    },
    {
      title: 'Chờ xác nhận',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-[#dfa88f]',
      bg: 'bg-[#dfa88f]/25',
    },
    {
      title: 'Đã giao',
      value: stats.deliveredOrders,
      icon: CheckCircle2,
      color: 'text-[#9fc9a2]',
      bg: 'bg-[#9fc9a2]/25',
    },
    {
      title: 'Doanh thu (đã thanh toán)',
      value: formatCurrency(stats.paidRevenue),
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
