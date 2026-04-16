import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';

export class PublicOrderItemSummaryResDto {
  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  qty!: number;

  @ApiProperty()
  @Expose()
  subtotal!: number;
}

export class PublicOrderSummaryResDto {
  @ApiProperty()
  @Expose()
  code!: string;

  @ApiProperty({ enum: OrderStatus })
  @Expose()
  orderStatus!: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  @Expose()
  paymentStatus!: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  @Expose()
  paymentMethod!: PaymentMethod;

  @ApiProperty()
  @Expose()
  total!: number;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiPropertyOptional()
  @Expose()
  province: string | null;

  @ApiPropertyOptional({
    description: 'Masked address preview (first segment only), may be null',
  })
  @Expose()
  addressPreview: string | null;

  @ApiProperty({ type: [PublicOrderItemSummaryResDto] })
  @Expose()
  items!: PublicOrderItemSummaryResDto[];
}
