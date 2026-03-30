import { NumberField, StringField, StringFieldOptional } from '@/decorators/field.decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
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

  @StringFieldOptional()
  notes?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
