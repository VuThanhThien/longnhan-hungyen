import {
  OrderEntity,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/api/orders/entities/order.entity';
import { PaymentsService } from '@/api/payments/payments.service';
import { Uuid } from '@/common/types/common.type';
import { JobName } from '@/constants/job.constant';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { SepayReconcileProcessor } from './sepay-reconcile.processor';

function makeOrder(overrides: Partial<OrderEntity> = {}): OrderEntity {
  return new OrderEntity({
    id: 'order-1' as Uuid,
    code: 'LN-260424-0001',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    paymentStatus: PaymentStatus.PENDING,
    orderStatus: OrderStatus.PENDING,
    sepayTransactionId: null,
    createdAt: new Date(),
    total: 100000,
    ...overrides,
  });
}

describe('SepayReconcileProcessor', () => {
  let processor: SepayReconcileProcessor;
  let orderRepoMock: {
    find: jest.Mock;
  };
  let paymentsServiceMock: {
    reconcileSepayOrder: jest.Mock;
  };

  beforeEach(async () => {
    orderRepoMock = { find: jest.fn().mockResolvedValue([]) };
    paymentsServiceMock = {
      reconcileSepayOrder: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SepayReconcileProcessor,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: orderRepoMock,
        },
        {
          provide: PaymentsService,
          useValue: paymentsServiceMock,
        },
      ],
    }).compile();

    processor = module.get(SepayReconcileProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('returns empty results when no candidates', async () => {
    orderRepoMock.find.mockResolvedValue([]);

    const result = await processor.process({
      name: JobName.SEPAY_PG_SWEEP,
    } as Job);

    expect(result).toEqual({ processed: 0, reconciled: 0 });
    expect(paymentsServiceMock.reconcileSepayOrder).not.toHaveBeenCalled();
  });

  it('calls reconcileSepayOrder for each candidate', async () => {
    const orders = [
      makeOrder({ id: 'id-1' as Uuid }),
      makeOrder({ id: 'id-2' as Uuid }),
    ];
    orderRepoMock.find.mockResolvedValue(orders);
    paymentsServiceMock.reconcileSepayOrder
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const result = await processor.process({
      name: JobName.SEPAY_PG_SWEEP,
    } as Job);

    expect(result).toEqual({ processed: 2, reconciled: 1 });
    expect(paymentsServiceMock.reconcileSepayOrder).toHaveBeenCalledWith(
      'id-1',
    );
    expect(paymentsServiceMock.reconcileSepayOrder).toHaveBeenCalledWith(
      'id-2',
    );
  });

  it('continues processing when one order throws', async () => {
    const orders = [
      makeOrder({ id: 'err-1' as Uuid }),
      makeOrder({ id: 'ok-1' as Uuid }),
    ];
    orderRepoMock.find.mockResolvedValue(orders);
    paymentsServiceMock.reconcileSepayOrder
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(true);

    const result = await processor.process({
      name: JobName.SEPAY_PG_SWEEP,
    } as Job);

    expect(result).toEqual({ processed: 2, reconciled: 1 });
  });

  it('throws on unknown job name', async () => {
    await expect(
      processor.process({ name: 'unknown-job' } as Job),
    ).rejects.toThrow('Unknown job name');
  });
});
