import { JobName, QueueName } from '@/constants/job.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

const SCHEDULER_ID = 'sepay-pg-sweep-hourly';

@Injectable()
export class SepayReconcileScheduler implements OnModuleInit {
  private readonly logger = new Logger(SepayReconcileScheduler.name);

  constructor(
    @InjectQueue(QueueName.SEPAY_RECONCILE)
    private readonly queue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const enabled =
      this.configService.get<string>('SEPAY_RECONCILE_ENABLED', 'true') ===
      'true';

    if (!enabled) {
      this.logger.warn('SePay reconcile sweep is disabled');
      return;
    }

    await this.queue.upsertJobScheduler(
      SCHEDULER_ID,
      { pattern: '0 * * * *' },
      { name: JobName.SEPAY_PG_SWEEP, data: {} },
    );

    this.logger.log('Registered hourly SePay PG sweep job');
  }
}
