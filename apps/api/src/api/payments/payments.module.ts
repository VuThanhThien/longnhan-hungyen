import { OrderStatusHistoryEntity } from '@/api/orders/entities/order-status-history.entity';
import { OrderTrackingTokenEntity } from '@/api/orders/entities/order-tracking-token.entity';
import { OrderEntity } from '@/api/orders/entities/order.entity';
import { TransactionEntity } from '@/api/transactions/entities/transaction.entity';
import { QueueName, QueuePrefix } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      TransactionEntity,
      OrderStatusHistoryEntity,
      OrderTrackingTokenEntity,
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
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
