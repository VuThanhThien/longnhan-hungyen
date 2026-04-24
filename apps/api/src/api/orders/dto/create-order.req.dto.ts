import {
  NumberField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;

  @NumberField({ int: true, min: 1 })
  qty!: number;
}

export class CreateOrderReqDto {
  @StringField({ maxLength: 100 })
  customerName!: string;

  @StringField({ maxLength: 20 })
  phone!: string;

  @StringFieldOptional({ maxLength: 255 })
  email?: string;

  @StringField()
  address!: string;

  @StringFieldOptional({ maxLength: 100 })
  province?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    enum: ['manual', 'sepay'],
    deprecated: true,
    description:
      'Ignored: bank_transfer always uses SePay Payment Gateway checkout. Kept for backward-compatible clients.',
  })
  @IsOptional()
  @IsIn(['manual', 'sepay'])
  bankTransferProvider?: 'manual' | 'sepay';

  @StringFieldOptional()
  notes?: string;

  @StringFieldOptional({ maxLength: 50 })
  voucherCode?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
