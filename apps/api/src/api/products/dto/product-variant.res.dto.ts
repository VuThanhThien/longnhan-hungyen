import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductVariantResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  label!: string;

  @ApiPropertyOptional()
  @Expose()
  weightG: number | null;

  @ApiProperty()
  @Expose()
  price!: number;

  @ApiProperty()
  @Expose()
  stock!: number;

  @ApiPropertyOptional()
  @Expose()
  skuCode: string | null;

  @ApiProperty()
  @Expose()
  sortOrder!: number;

  @ApiProperty()
  @Expose()
  active!: boolean;
}
