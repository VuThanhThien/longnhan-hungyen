import { Module } from '@nestjs/common';
import { EmailQueueModule } from './queues/email-queue/email-queue.module';
import { SepayReconcileQueueModule } from './queues/sepay-reconcile-queue/sepay-reconcile-queue.module';

@Module({
  imports: [EmailQueueModule, SepayReconcileQueueModule],
})
export class BackgroundModule {}
