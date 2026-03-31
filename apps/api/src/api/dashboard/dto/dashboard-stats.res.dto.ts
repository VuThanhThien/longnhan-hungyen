import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderDayStatDto {
  @ApiProperty()
  @Expose()
  date!: string;

  @ApiProperty()
  @Expose()
  count!: number;

  @ApiProperty()
  @Expose()
  revenue!: number;
}

export class DashboardStatsResDto {
  @ApiProperty()
  @Expose()
  totalOrders!: number;

  @ApiProperty()
  @Expose()
  pendingOrders!: number;

  @ApiProperty()
  @Expose()
  confirmedOrders!: number;

  @ApiProperty()
  @Expose()
  deliveredOrders!: number;

  @ApiProperty()
  @Expose()
  cancelledOrders!: number;

  @ApiProperty()
  @Expose()
  totalRevenue!: number;

  @ApiProperty()
  @Expose()
  paidRevenue!: number;

  @ApiProperty({ type: [OrderDayStatDto] })
  @Expose()
  dailyStats!: OrderDayStatDto[];
}
