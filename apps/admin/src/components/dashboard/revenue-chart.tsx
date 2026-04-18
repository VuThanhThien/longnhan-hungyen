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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

function formatVND(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Doanh thu 7 ngày qua</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
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
              tickFormatter={formatVND}
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
            <Bar dataKey="revenue" fill="var(--accent)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
