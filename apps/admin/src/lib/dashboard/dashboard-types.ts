export type DashboardPeriod = 'today' | 'week' | 'month' | 'all';

export const VALID_PERIODS: DashboardPeriod[] = [
  'today',
  'week',
  'month',
  'all',
];

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: 'Hôm nay',
  week: '7 ngày',
  month: '30 ngày',
  all: 'Tất cả',
};

export interface DailyStatPoint {
  date: string;
  count: number;
  revenue: number;
}

/** Mirrors DashboardStatsResDto from the API */
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  dailyStats: DailyStatPoint[];
}

export function parsePeriod(raw: unknown): DashboardPeriod {
  if (
    typeof raw === 'string' &&
    VALID_PERIODS.includes(raw as DashboardPeriod)
  ) {
    return raw as DashboardPeriod;
  }
  return 'month';
}
