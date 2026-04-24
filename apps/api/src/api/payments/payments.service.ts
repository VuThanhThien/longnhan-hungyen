import {
  OrderStatusHistoryActor,
  OrderStatusHistoryEntity,
} from '@/api/orders/entities/order-status-history.entity';
import {
  OrderEntity,
  OrderStatus,
  PaymentStatus,
} from '@/api/orders/entities/order.entity';
import {
  TransactionDirection,
  TransactionEntity,
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from '@/api/transactions/entities/transaction.entity';
import { Uuid } from '@/common/types/common.type';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SepayService } from '../../integrations/sepay/sepay.service';
import { SepayIpnReqDto } from './dto/sepay-ipn.req.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
    private readonly sepayService: SepayService,
  ) {}

  async handleSepayIpn(payload: SepayIpnReqDto): Promise<{ success: true }> {
    const orderCode = payload.order?.order_invoice_number;
    if (!orderCode) return { success: true };

    const order = await this.orderRepo.findOne({ where: { code: orderCode } });
    if (!order) {
      this.logger.warn(`SePay IPN: order not found`, { orderCode });
      return { success: true };
    }

    if (
      order.sepayTransactionId &&
      order.sepayTransactionId === payload.transaction.id
    ) {
      return { success: true };
    }

    if (
      payload.notification_type !== 'ORDER_PAID' ||
      payload.transaction.transaction_status !== 'APPROVED'
    ) {
      return { success: true };
    }

    const verified = await this.sepayService.verifyOrderPayment(order.code);

    const expectedAmount = Number(order.total);
    const amountOk =
      Number.isFinite(verified.amount) && verified.amount === expectedAmount;
    const currencyOk = (verified.currency ?? 'VND') === 'VND';

    if (!amountOk || !currencyOk) {
      this.logger.error(`SePay verify mismatch`, {
        orderCode: order.code,
        expectedAmount,
        verified,
      });
      return { success: true };
    }

    if (verified.status !== 'CAPTURED' && verified.status !== 'APPROVED') {
      this.logger.error(`SePay verify status not paid`, {
        orderCode: order.code,
        verified,
      });
      return { success: true };
    }

    const paidAt = payload.transaction.transaction_date
      ? new Date(payload.transaction.transaction_date)
      : new Date();

    await this.dataSource.transaction(async (em) => {
      await em.update(
        OrderEntity,
        { id: order.id as Uuid },
        {
          sepayTransactionId: payload.transaction.id,
          sepayPaidAt: paidAt,
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
        },
      );

      const pendingTx = await em.findOne(TransactionEntity, {
        where: {
          orderId: order.id as Uuid,
          type: TransactionType.PAYMENT,
          status: TransactionStatus.PENDING,
        },
      });

      if (pendingTx) {
        pendingTx.status = TransactionStatus.COMPLETED;
        pendingTx.referenceNo = payload.transaction.id;
        pendingTx.occurredAt = paidAt;
        await em.save(TransactionEntity, pendingTx);
      } else {
        await em.save(
          TransactionEntity,
          em.create(TransactionEntity, {
            orderId: order.id as Uuid,
            type: TransactionType.PAYMENT,
            method: TransactionMethod.BANK_TRANSFER,
            amount: Number(order.total),
            direction: TransactionDirection.IN,
            status: TransactionStatus.COMPLETED,
            referenceNo: payload.transaction.id,
            referenceNote: null,
            occurredAt: paidAt,
            createdByAdminId: null,
          }),
        );
      }

      await em.insert(OrderStatusHistoryEntity, {
        orderId: order.id as Uuid,
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.CONFIRMED,
        actorType: OrderStatusHistoryActor.SYSTEM,
        actorId: null,
      });
    });

    return { success: true };
  }
}
