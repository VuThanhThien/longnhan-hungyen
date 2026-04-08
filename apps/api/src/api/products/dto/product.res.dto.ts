import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ProductVariantResDto } from './product-variant.res.dto';

export class ProductResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiPropertyOptional()
  @Expose()
  description: string | null;

  @ApiPropertyOptional()
  @Expose()
  summary: string | null;

  @ApiPropertyOptional()
  @Expose()
  descriptionHtml: string | null;

  @ApiProperty()
  @Expose()
  basePrice!: number;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  images: string[];

  @ApiPropertyOptional()
  @Expose()
  featuredImageUrl: string | null;

  @ApiPropertyOptional()
  @Expose()
  videoUrl: string | null;

  @ApiProperty()
  @Expose()
  category!: string;

  @ApiProperty()
  @Expose()
  active!: boolean;

  @ApiPropertyOptional({ type: [ProductVariantResDto] })
  @Expose()
  @Type(() => ProductVariantResDto)
  variants: ProductVariantResDto[];

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
