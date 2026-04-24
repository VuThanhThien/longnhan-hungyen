import sepayConfig from '@/config/sepay.config';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SepayService } from './sepay.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(sepayConfig)],
  providers: [SepayService],
  exports: [SepayService],
})
export class SepayModule {}
