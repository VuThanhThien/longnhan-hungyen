import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherUsageEntity } from './entities/voucher-usage.entity';
import { VoucherEntity } from './entities/voucher.entity';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherEntity, VoucherUsageEntity])],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
