import {
  OrderEntity,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/api/orders/entities/order.entity';
import { PaymentsService } from '@/api/payments/payments.service';
import { Uuid } from '@/common/types/common.type';
import { JobName, QueueName } from '@/constants/job.constant';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';

const BATCH_LIMIT = 200;
const WINDOW_HOURS = 24;

@Processor(QueueName.SEPAY_RECONCILE, {
  concurrency: 1,
  drainDelay: 300,
  stalledInterval: 300000,
  removeOnComplete: { age: 86400, count: 50 },
})
export class SepayReconcileProcessor extends WorkerHost {
  private readonly logger = new Logger(SepayReconcileProcessor.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly paymentsService: PaymentsService,
  ) {
    super();
  }

  async process(job: Job): Promise<{ processed: number; reconciled: number }> {
    if (job.name !== JobName.SEPAY_PG_SWEEP) {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    return this.sweep();
  }

  private async sweep(): Promise<{
    processed: number;
    reconciled: number;
  }> {
    const cutoff = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);

    const candidates = await this.orderRepo.find({
      select: ['id'],
      where: {
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
        sepayTransactionId: IsNull(),
        createdAt: MoreThanOrEqual(cutoff),
      },
      order: { createdAt: 'ASC' },
      take: BATCH_LIMIT,
    });

    this.logger.log(`Sweep: ${candidates.length} candidate(s) found`);

    let reconciled = 0;

    for (const { id } of candidates) {
      try {
        const ok = await this.paymentsService.reconcileSepayOrder(id as Uuid);
        if (ok) {
          reconciled++;
          this.logger.log(`Sweep: order ${id} reconciled`);
        }
      } catch (err) {
        this.logger.error(`Sweep: order ${id} failed`, err?.stack ?? err);
      }
    }

    this.logger.log(
      `Sweep complete: ${reconciled}/${candidates.length} reconciled`,
    );
    return { processed: candidates.length, reconciled };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`Job ${job.id} failed: ${job.failedReason}`);
  }
}
