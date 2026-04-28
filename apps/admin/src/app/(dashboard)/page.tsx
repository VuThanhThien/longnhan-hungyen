import { Header } from '@/components/layout/header';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { parsePeriod } from '@/lib/dashboard/dashboard-types';

interface DashboardPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = searchParams ? await searchParams : {};
  const period = parsePeriod(params.period);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="Tổng quan" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <DashboardClient initialPeriod={period} />
        <RecentOrders />
      </main>
    </div>
  );
}
