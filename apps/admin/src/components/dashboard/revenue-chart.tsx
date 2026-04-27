'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardErrorState } from '@/components/dashboard/dashboard-error-state';
import { adminClientGet } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import type {
  DailyStatPoint,
  DashboardPeriod,
  DashboardStats,
} from '@/lib/dashboard/dashboard-types';
import { PERIOD_LABELS } from '@/lib/dashboard/dashboard-types';
import { formatVndCompact } from '@/lib/utils';
import { BarChart2 } from 'lucide-react';

interface RevenueChartProps {
  period: DashboardPeriod;
}

export function RevenueChart({ period }: RevenueChartProps) {
  const statsQuery = useQuery({
    queryKey: adminQueryKeys.dashboard.stats(period),
    queryFn: () =>
      adminClientGet<DashboardStats>('/dashboard/stats', {
        period,
      }),
  });

  const chartData: DailyStatPoint[] = statsQuery.data?.dailyStats ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Doanh thu — {PERIOD_LABELS[period]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statsQuery.isPending ? (
          <div className="h-[220px] animate-pulse rounded-md bg-muted" />
        ) : statsQuery.isError ? (
          <DashboardErrorState message="Không thể tải dữ liệu doanh thu." />
        ) : chartData.length === 0 ? (
          <EmptyState
            icon={<BarChart2 className="h-8 w-8" />}
            title="Chưa có dữ liệu doanh thu"
            description="Chưa có đơn hàng nào trong khoảng thời gian này."
            className="h-[220px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(38, 37, 30, 0.08)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'rgba(38, 37, 30, 0.45)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatVndCompact}
                tick={{ fontSize: 12, fill: 'rgba(38, 37, 30, 0.45)' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(value)
                }
                labelStyle={{ fontSize: 12 }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: '8px',
                  border: '1px solid rgba(38, 37, 30, 0.1)',
                  background: '#f7f7f4',
                }}
              />
              <Bar
                dataKey="revenue"
                fill="var(--accent)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
