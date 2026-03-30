import {
  BooleanFieldOptional,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductVariantDto {
  @StringField({ maxLength: 100 })
  label!: string;

  @NumberFieldOptional({ int: true, min: 1 })
  weightG?: number;

  @NumberField({ int: true, min: 0 })
  price!: number;

  @NumberField({ int: true, min: 0 })
  stock!: number;

  @StringFieldOptional({ maxLength: 50 })
  skuCode?: string;

  @NumberFieldOptional({ int: true, min: 0 })
  sortOrder?: number;

  @BooleanFieldOptional()
  active?: boolean;
}

export class CreateProductReqDto {
  @StringField({ maxLength: 255 })
  name!: string;

  @StringFieldOptional()
  description?: string;

  @NumberField({ int: true, min: 0 })
  basePrice!: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @StringFieldOptional({ maxLength: 255 })
  featuredImageUrl?: string;

  @StringFieldOptional({ maxLength: 255 })
  videoUrl?: string;

  @StringField({ maxLength: 50 })
  category!: string;

  @BooleanFieldOptional()
  active?: boolean;

  @ApiProperty({ type: [CreateProductVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
