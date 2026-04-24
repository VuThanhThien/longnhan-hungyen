import { OrderEntity } from '@/api/orders/entities/order.entity';
import { PaymentsModule } from '@/api/payments/payments.module';
import { QueueName } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SepayReconcileProcessor } from './sepay-reconcile.processor';
import { SepayReconcileScheduler } from './sepay-reconcile.scheduler';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.SEPAY_RECONCILE,
      streams: { events: { maxLen: 500 } },
    }),
    TypeOrmModule.forFeature([OrderEntity]),
    PaymentsModule,
  ],
  providers: [SepayReconcileProcessor, SepayReconcileScheduler],
})
export class SepayReconcileQueueModule {}
