import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OrderStatusHistoryActor } from '../entities/order-status-history.entity';
import { OrderStatus } from '../entities/order.entity';

/** Admin view: includes actor identity. */
export class OrderStatusHistoryResDto {
  @ApiProperty() @Expose() id!: Uuid;
  @ApiProperty() @Expose() orderId!: Uuid;
  @ApiPropertyOptional({ enum: OrderStatus })
  @Expose()
  fromStatus: OrderStatus | null;
  @ApiProperty({ enum: OrderStatus }) @Expose() toStatus!: OrderStatus;
  @ApiProperty({ enum: OrderStatusHistoryActor })
  @Expose()
  actorType!: OrderStatusHistoryActor;
  @ApiPropertyOptional() @Expose() actorId: Uuid | null;
  @ApiPropertyOptional() @Expose() note: string | null;
  @ApiProperty() @Expose() createdAt!: Date;
}

/** Public/guest view: strips actor identity. */
export class PublicOrderStatusHistoryResDto {
  @ApiProperty() @Expose() id!: Uuid;
  @ApiPropertyOptional({ enum: OrderStatus })
  @Expose()
  fromStatus: OrderStatus | null;
  @ApiProperty({ enum: OrderStatus }) @Expose() toStatus!: OrderStatus;
  @ApiProperty({ enum: OrderStatusHistoryActor })
  @Expose()
  actorType!: OrderStatusHistoryActor;
  @ApiProperty() @Expose() createdAt!: Date;
}
