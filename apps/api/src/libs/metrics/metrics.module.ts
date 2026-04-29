import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { collectDefaultMetrics } from 'prom-client';
import { MetricsController } from './metrics.controller';
import { MetricsMiddleware } from './metrics.middleware';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule implements NestModule, OnModuleInit {
  onModuleInit() {
    collectDefaultMetrics();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
