'use client';

import { parseAsStringEnum, useQueryState } from 'nuqs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  VALID_PERIODS,
  PERIOD_LABELS,
  type DashboardPeriod,
} from '@/lib/dashboard/dashboard-types';

interface PeriodSwitcherProps {
  value: DashboardPeriod;
}

export function PeriodSwitcher({ value }: PeriodSwitcherProps) {
  const [period, setPeriod] = useQueryState(
    'period',
    parseAsStringEnum(VALID_PERIODS).withDefault(value),
  );

  function handleChange(next: string) {
    if (!VALID_PERIODS.includes(next as DashboardPeriod)) return;
    void setPeriod(next as DashboardPeriod, { history: 'replace' });
  }

  return (
    <Tabs value={period} onValueChange={handleChange}>
      <TabsList>
        {VALID_PERIODS.map((p) => (
          <TabsTrigger key={p} value={p}>
            {PERIOD_LABELS[p]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
