import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProductReviewStatus } from '../entities/product-review.entity';

export class UpdateProductReviewStatusReqDto {
  @ApiProperty({
    enum: [ProductReviewStatus.PUBLISHED, ProductReviewStatus.REJECTED],
  })
  @IsEnum(ProductReviewStatus)
  status!: ProductReviewStatus.PUBLISHED | ProductReviewStatus.REJECTED;
}
