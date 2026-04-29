import { Public } from '@/decorators/public.decorator';
import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { register } from 'prom-client';

@ApiExcludeController()
@Controller()
export class MetricsController {
  @Get('metrics')
  @Public()
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
