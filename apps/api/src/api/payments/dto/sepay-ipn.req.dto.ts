import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Mirrors Sepay IPN payload:
// https://docs.sepay.vn/ ("ORDER_PAID" notification)
// Only `order.order_invoice_number`, `transaction.id`,
// `transaction.transaction_status`, and `transaction.transaction_date` drive
// business logic today; remaining fields are kept for logging/auditing and
// future use. All optional fields are tolerant of Sepay quirks (e.g.
// `custom_data: []`, nullable card fields, null `customer`/`agreement`).

class SepayIpnOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  order_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  order_currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  order_amount?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  order_invoice_number!: string;

  // Sepay sends `[]` (PHP empty assoc) or an object; accept anything.
  @ApiPropertyOptional()
  @IsOptional()
  custom_data?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  order_description?: string;
}

class SepayIpnTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_date?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_amount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authentication_status?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  card_number?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  card_holder_name?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  card_expiry?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  card_funding_method?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  card_brand?: string | null;
}

export class SepayIpnReqDto {
  @ApiProperty()
  @IsNumber()
  timestamp!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notification_type!: string;

  @ApiProperty({ type: SepayIpnOrderDto })
  @ValidateNested()
  @Type(() => SepayIpnOrderDto)
  order!: SepayIpnOrderDto;

  @ApiProperty({ type: SepayIpnTransactionDto })
  @ValidateNested()
  @Type(() => SepayIpnTransactionDto)
  transaction!: SepayIpnTransactionDto;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customer?: unknown;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  agreement?: unknown;
}
