import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { DashboardStatsResDto, OrderDayStatDto } from './dto/dashboard-stats.res.dto';

type StatsPeriod = 'today' | 'week' | 'month' | 'all';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async getStats(period: StatsPeriod): Promise<DashboardStatsResDto> {
    const dateFrom = this.getPeriodStart(period);

    const baseQb = () => {
      const qb = this.orderRepo.createQueryBuilder('order');
      if (dateFrom) qb.where('order.createdAt >= :dateFrom', { dateFrom });
      return qb;
    };

    // Aggregate counts by order status in a single query
    const statusCounts = await baseQb()
      .select('order.orderStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.orderStatus')
      .getRawMany<{ status: OrderStatus; count: string }>();

    const countByStatus = (status: OrderStatus): number =>
      parseInt(statusCounts.find((r) => r.status === status)?.count ?? '0', 10);

    const totalOrders = statusCounts.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
    const pendingOrders = countByStatus(OrderStatus.PENDING);
    const confirmedOrders = countByStatus(OrderStatus.CONFIRMED);
    const deliveredOrders = countByStatus(OrderStatus.DELIVERED);
    const cancelledOrders = countByStatus(OrderStatus.CANCELLED);

    // Revenue totals via SQL SUM
    const revenueRow = await baseQb()
      .select('COALESCE(SUM(order.total), 0)', 'totalRevenue')
      .addSelect(
        `COALESCE(SUM(CASE WHEN order.paymentStatus = '${PaymentStatus.PAID}' THEN order.total ELSE 0 END), 0)`,
        'paidRevenue',
      )
      .getRawOne<{ totalRevenue: string; paidRevenue: string }>();

    const totalRevenue = parseInt(revenueRow?.totalRevenue ?? '0', 10);
    const paidRevenue = parseInt(revenueRow?.paidRevenue ?? '0', 10);

    // Daily stats via SQL GROUP BY date
    const dailyRows = await baseQb()
      .select(`TO_CHAR(order.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD')`, 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(order.total)', 'revenue')
      .groupBy(`TO_CHAR(order.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD')`)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string; revenue: string }>();

    const dailyStats: OrderDayStatDto[] = dailyRows.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
      revenue: parseInt(r.revenue ?? '0', 10),
    }));

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      paidRevenue,
      dailyStats,
    };
  }

  private getPeriodStart(period: StatsPeriod): Date | null {
    const now = new Date();
    switch (period) {
      case 'today': {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return start;
      }
      case 'week': {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        return start;
      }
      case 'month': {
        const start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        return start;
      }
      case 'all':
        return null;
    }
  }
}
