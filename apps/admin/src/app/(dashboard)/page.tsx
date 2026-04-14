import { Header } from '@/components/layout/header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { adminFetch } from '@/lib/admin-api-client';
import { toList } from '@/lib/admin-data';
import type { Order } from '@longnhan/types';

interface DashboardStats {
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  revenueByDay: { date: string; revenue: number }[];
}

async function getDashboardData() {
  try {
    const [stats, recentOrdersRaw] = await Promise.all([
      adminFetch<DashboardStats>('/dashboard/stats'),
      adminFetch<unknown>('/orders?limit=10&page=1'),
    ]);
    return { stats, recentOrders: toList<Order>(recentOrdersRaw) };
  } catch {
    return {
      stats: {
        ordersToday: 0,
        ordersThisWeek: 0,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
        revenueByDay: [],
      },
      recentOrders: [],
    };
  }
}

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardData();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="Tổng quan" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <StatCards stats={stats} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={stats.revenueByDay} />
          </div>
          <div className="lg:col-span-1">
            {/* placeholder for quick stats */}
          </div>
        </div>
        <RecentOrders
          orders={Array.isArray(recentOrders) ? recentOrders : []}
        />
      </main>
    </div>
  );
}
