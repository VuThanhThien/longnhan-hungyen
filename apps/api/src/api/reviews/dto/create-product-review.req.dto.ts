import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@/decorators/field.decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CreateProductReviewReqDto {
  @UUIDField()
  orderId!: string;

  @ApiProperty({ description: 'Full phone number used in the order' })
  @StringField({ maxLength: 20 })
  phone!: string;

  @NumberField({ int: true, min: 1, max: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @StringFieldOptional({ maxLength: 2000 })
  comment?: string;
}
