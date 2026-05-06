import { NumberField } from '@/decorators/field.decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class ValidateCartItemDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;

  @NumberField({ int: true, min: 1 })
  qty!: number;
}

export class ValidateCartReqDto {
  @ApiProperty({ type: [ValidateCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidateCartItemDto)
  items!: ValidateCartItemDto[];
}

export class InvalidCartItemDto {
  @ApiProperty()
  variantId!: string;

  @ApiProperty()
  reason!: string;
}

export class ValidateCartResDto {
  @ApiProperty()
  valid!: boolean;

  @ApiProperty({ type: [InvalidCartItemDto] })
  invalidItems!: InvalidCartItemDto[];
}
