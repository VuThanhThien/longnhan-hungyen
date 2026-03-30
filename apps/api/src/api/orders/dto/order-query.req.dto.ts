import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { StringFieldOptional } from '@/decorators/field.decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

export class OrderQueryReqDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  readonly orderStatus?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  readonly paymentStatus?: PaymentStatus;

  /** Filter orders from this date (ISO 8601) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly dateFrom?: string;

  /** Filter orders up to this date (ISO 8601) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly dateTo?: string;
}
