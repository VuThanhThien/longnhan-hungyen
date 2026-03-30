import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { CreateProductVariantDto } from './create-product.req.dto';

export class UpdateProductReqDto {
  @StringFieldOptional({ maxLength: 255 })
  name?: string;

  @StringFieldOptional()
  description?: string;

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
