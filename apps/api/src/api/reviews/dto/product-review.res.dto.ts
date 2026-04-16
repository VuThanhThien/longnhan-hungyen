import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ProductReviewStatus } from '../entities/product-review.entity';

export class ProductReviewResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  productId!: Uuid;

  @ApiProperty()
  @Expose()
  orderId!: Uuid;

  @ApiProperty()
  @Expose()
  rating!: number;

  @ApiPropertyOptional()
  @Expose()
  comment!: string | null;

  @ApiProperty({ enum: ProductReviewStatus })
  @Expose()
  status!: ProductReviewStatus;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}

export class PublicProductReviewResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  productId!: Uuid;

  @ApiProperty()
  @Expose()
  rating!: number;

  @ApiPropertyOptional()
  @Expose()
  comment!: string | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}

export class ProductReviewsListResDto {
  @ApiProperty()
  @Expose()
  ratingAvg!: number;

  @ApiProperty()
  @Expose()
  ratingCount!: number;

  @ApiProperty({ type: [ProductReviewResDto] })
  @Expose()
  items!: ProductReviewResDto[];
}

export class PublicProductReviewsListResDto {
  @ApiProperty()
  @Expose()
  ratingAvg!: number;

  @ApiProperty()
  @Expose()
  ratingCount!: number;

  @ApiProperty({ type: [PublicProductReviewResDto] })
  @Expose()
  items!: PublicProductReviewResDto[];
}
