import { OrderItemEntity } from '@/api/orders/entities/order-item.entity';
import { OrderEntity } from '@/api/orders/entities/order.entity';
import { ProductEntity } from '@/api/products/entities/product.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReviewEntity } from './entities/product-review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReviewEntity,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
