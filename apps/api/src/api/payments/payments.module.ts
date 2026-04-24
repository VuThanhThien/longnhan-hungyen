import { OrderStatusHistoryEntity } from '@/api/orders/entities/order-status-history.entity';
import { OrderEntity } from '@/api/orders/entities/order.entity';
import { TransactionEntity } from '@/api/transactions/entities/transaction.entity';
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
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
