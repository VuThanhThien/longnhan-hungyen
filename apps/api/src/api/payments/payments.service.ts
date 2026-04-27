import {
  OrderStatusHistoryActor,
  OrderStatusHistoryEntity,
} from '@/api/orders/entities/order-status-history.entity';
import { OrderTrackingTokenEntity } from '@/api/orders/entities/order-tracking-token.entity';
import {
  OrderEntity,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/api/orders/entities/order.entity';
import {
  TransactionDirection,
  TransactionEntity,
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from '@/api/transactions/entities/transaction.entity';
import { IOrderTrackingLinkJob } from '@/common/interfaces/job.interface';
import { Uuid } from '@/common/types/common.type';
import { AllConfigType } from '@/config/config.type';
import { JobName, QueueName } from '@/constants/job.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import crypto from 'crypto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { SepayService } from '../../integrations/sepay/sepay.service';
import { SepayIpnReqDto } from './dto/sepay-ipn.req.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderTrackingTokenEntity)
    private readonly orderTrackingTokenRepo: Repository<OrderTrackingTokenEntity>,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue<IOrderTrackingLinkJob, any, string>,
    private readonly configService: ConfigService<AllConfigType>,
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

    await this.applyVerifiedSepayCapture(order, {
      sepayTransactionId: payload.transaction.id,
      paidAt,
    });

    return { success: true };
  }

  async reconcileSepayOrder(orderId: Uuid): Promise<boolean> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) return false;

    if (
      order.paymentMethod !== PaymentMethod.BANK_TRANSFER ||
      order.paymentStatus !== PaymentStatus.PENDING ||
      order.orderStatus !== OrderStatus.PENDING ||
      order.sepayTransactionId
    ) {
      return false;
    }

    const verified = await this.sepayService.verifyOrderPayment(order.code);

    if (verified.status !== 'CAPTURED' && verified.status !== 'APPROVED') {
      return false;
    }

    const expectedAmount = Number(order.total);
    if (
      !Number.isFinite(verified.amount) ||
      verified.amount !== expectedAmount ||
      (verified.currency ?? 'VND') !== 'VND'
    ) {
      this.logger.warn(`Reconcile: amount/currency mismatch`, {
        orderCode: order.code,
        expectedAmount,
        verified,
      });
      return false;
    }

    if (!verified.sepayTransactionId) {
      this.logger.error(`Reconcile: missing sepayTransactionId from PG`, {
        orderCode: order.code,
      });
      return false;
    }

    // Re-read to guard against race (IPN or cancel between verify call)
    const fresh = await this.orderRepo.findOne({ where: { id: orderId } });
    if (
      !fresh ||
      fresh.paymentStatus !== PaymentStatus.PENDING ||
      fresh.orderStatus !== OrderStatus.PENDING ||
      fresh.sepayTransactionId
    ) {
      return false;
    }

    await this.applyVerifiedSepayCapture(fresh, {
      sepayTransactionId: verified.sepayTransactionId,
      paidAt: verified.paidAt ?? new Date(),
    });

    return true;
  }

  private async applyVerifiedSepayCapture(
    order: OrderEntity,
    input: { sepayTransactionId: string; paidAt: Date },
  ): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const result = await em.update(
        OrderEntity,
        { id: order.id as Uuid, sepayTransactionId: IsNull() },
        {
          sepayTransactionId: input.sepayTransactionId,
          sepayPaidAt: input.paidAt,
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
        },
      );

      if (result.affected === 0) {
        this.logger.warn(`Apply capture skipped: already reconciled`, {
          orderId: order.id,
        });
        return;
      }

      const pendingTx = await em.findOne(TransactionEntity, {
        where: {
          orderId: order.id as Uuid,
          type: TransactionType.PAYMENT,
          status: TransactionStatus.PENDING,
        },
      });

      if (pendingTx) {
        pendingTx.status = TransactionStatus.COMPLETED;
        pendingTx.referenceNo = input.sepayTransactionId;
        pendingTx.occurredAt = input.paidAt;
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
            referenceNo: input.sepayTransactionId,
            referenceNote: null,
            occurredAt: input.paidAt,
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

    if (order.email) {
      try {
        await this.enqueueOrderTrackingLinkEmail(order);
      } catch (err) {
        this.logger.error(
          `Failed to enqueue tracking email for order ${order.code}`,
          err instanceof Error ? err.stack : err,
        );
      }
    }
  }

  private async enqueueOrderTrackingLinkEmail(
    order: OrderEntity,
  ): Promise<void> {
    if (!order.email) return;

    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ttlHours = 48;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.orderTrackingTokenRepo.save(
      this.orderTrackingTokenRepo.create({
        orderId: order.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    const webPublicUrl = this.configService.getOrThrow('app.webPublicUrl', {
      infer: true,
    });
    const url = `${webPublicUrl.replace(/\/$/, '')}/track-order?t=${encodeURIComponent(token)}`;

    await this.emailQueue.add(
      JobName.ORDER_TRACKING_LINK,
      {
        email: order.email,
        url,
        orderCode: order.code,
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 60000 } },
    );
  }
}
