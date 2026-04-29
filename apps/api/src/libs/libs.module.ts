import { Module } from '@nestjs/common';
import { AwsModule } from './aws/aws.module';
import { GcpModule } from './gcp/gcp.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [AwsModule, GcpModule, MetricsModule],
})
export class LibsModule {}
