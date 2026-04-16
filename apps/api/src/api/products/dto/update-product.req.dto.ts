import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@/decorators/field.decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProductVariantDto } from './create-product.req.dto';

export class UpdateProductReqDto {
  @StringFieldOptional({ maxLength: 255 })
  name?: string;

  @StringFieldOptional()
  description?: string;

  @StringFieldOptional()
  summary?: string;

  @StringFieldOptional()
  descriptionHtml?: string;

  @NumberFieldOptional({ int: true, min: 0 })
  basePrice?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @StringFieldOptional({ maxLength: 255 })
  featuredImageUrl?: string;

  @StringFieldOptional({ maxLength: 255 })
  videoUrl?: string;

  @UUIDFieldOptional()
  categoryId?: string;

  @StringFieldOptional({ maxLength: 50 })
  category?: string;

  @BooleanFieldOptional()
  active?: boolean;

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}
