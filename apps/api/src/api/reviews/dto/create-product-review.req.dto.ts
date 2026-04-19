import {
  BooleanFieldOptional,
  NumberField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min, ValidateIf } from 'class-validator';

export class CreateProductReviewReqDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @StringField({
    maxLength: 20,
    description:
      'Human-readable order code (same as on receipt), e.g. LN-260329-1234',
    example: 'LN-260329-1234',
  })
  orderCode!: string;

  @ApiProperty({ description: 'Full phone number used in the order' })
  @StringField({ maxLength: 20 })
  phone!: string;

  @NumberField({ int: true, min: 1, max: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ default: false })
  @BooleanFieldOptional()
  isAnonymous?: boolean;

  @ApiPropertyOptional({
    description: 'Required when isAnonymous is false',
    maxLength: 80,
  })
  @ValidateIf((o: CreateProductReviewReqDto) => o.isAnonymous !== true)
  @StringField({ maxLength: 80 })
  displayName?: string;

  @StringFieldOptional({ maxLength: 2000 })
  comment?: string;
}
