import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';

export class OrderItemResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  variantSnapshot!: Record<string, unknown>;

  @ApiProperty()
  @Expose()
  qty!: number;

  @ApiProperty()
  @Expose()
  unitPrice!: number;

  @ApiProperty()
  @Expose()
  subtotal!: number;
}

export class OrderResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  code!: string;

  @ApiProperty()
  @Expose()
  customerName!: string;

  @ApiProperty()
  @Expose()
  phone!: string;

  @ApiPropertyOptional()
  @Expose()
  email: string | null;

  @ApiProperty()
  @Expose()
  address!: string;

  @ApiPropertyOptional()
  @Expose()
  province: string | null;

  @ApiProperty()
  @Expose()
  total!: number;

  @ApiProperty({ enum: PaymentMethod })
  @Expose()
  paymentMethod!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  @Expose()
  paymentStatus!: PaymentStatus;

  @ApiProperty({ enum: OrderStatus })
  @Expose()
  orderStatus!: OrderStatus;

  @ApiPropertyOptional()
  @Expose()
  notes: string | null;

  @ApiPropertyOptional({ type: [OrderItemResDto] })
  @Expose()
  @Type(() => OrderItemResDto)
  items: OrderItemResDto[];

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
