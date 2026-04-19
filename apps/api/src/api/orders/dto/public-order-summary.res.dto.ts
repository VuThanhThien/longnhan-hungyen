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

  @ApiPropertyOptional({
    description: 'Product id from line snapshot (for saved-order / reviews)',
  })
  @Expose()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Variant label from snapshot',
  })
  @Expose()
  variantLabel?: string;
}

export class PublicOrderSummaryResDto {
  @ApiProperty({
    description: 'Order id (UUID) — same secrecy tier as order code',
  })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Phone on the order (for device-local review verification)',
  })
  @Expose()
  phone!: string;

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
