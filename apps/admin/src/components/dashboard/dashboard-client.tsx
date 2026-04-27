'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { PeriodSwitcher } from '@/components/dashboard/period-switcher';
import { StatCards } from '@/components/dashboard/stat-cards';
import {
  VALID_PERIODS,
  type DashboardPeriod,
} from '@/lib/dashboard/dashboard-types';

const RevenueChart = dynamic(
  () =>
    import('@/components/dashboard/revenue-chart').then((m) => m.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] animate-pulse rounded-md bg-muted" />
    ),
  },
);

interface DashboardClientProps {
  initialPeriod: DashboardPeriod;
}

export function DashboardClient({ initialPeriod }: DashboardClientProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-[260px] animate-pulse rounded-md bg-muted" />
        </div>
      }
    >
      <DashboardClientInner initialPeriod={initialPeriod} />
    </Suspense>
  );
}

function DashboardClientInner({ initialPeriod }: DashboardClientProps) {
  const [period] = useQueryState(
    'period',
    parseAsStringEnum(VALID_PERIODS).withDefault(initialPeriod),
  );

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Thống kê theo kỳ
        </h2>
        <PeriodSwitcher value={period} />
      </div>

      <StatCards period={period} />
      <RevenueChart period={period} />
    </>
  );
}
