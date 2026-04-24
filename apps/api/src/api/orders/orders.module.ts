import { QueueName, QueuePrefix } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderStatusHistoryEntity } from './entities/order-status-history.entity';
import { OrderTrackingTokenEntity } from './entities/order-tracking-token.entity';
import { OrderEntity } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      OrderStatusHistoryEntity,
      OrderTrackingTokenEntity,
      ProductVariantEntity,
    ]),
    BullModule.registerQueue({
      name: QueueName.EMAIL,
      prefix: QueuePrefix.AUTH,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
    VouchersModule,
    TransactionsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
