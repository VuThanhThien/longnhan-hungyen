import { ShoppingCart, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: 'Đơn hàng hôm nay',
      value: stats.ordersToday,
      icon: ShoppingCart,
      color: 'text-[#9fbbe0]',
      bg: 'bg-[#9fbbe0]/25',
    },
    {
      title: 'Đơn hàng tuần này',
      value: stats.ordersThisWeek,
      icon: Package,
      color: 'text-[#c0a8dd]',
      bg: 'bg-[#c0a8dd]/25',
    },
    {
      title: 'Đơn hàng tháng này',
      value: stats.ordersThisMonth,
      icon: TrendingUp,
      color: 'text-[#dfa88f]',
      bg: 'bg-[#dfa88f]/30',
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(stats.revenueThisMonth),
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
