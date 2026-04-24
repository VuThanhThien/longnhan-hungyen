import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';
import { SepayService } from '../../integrations/sepay/sepay.service';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { PublicOrderStatusHistoryResDto } from './dto/order-status-history.res.dto';
import { UpdateOrderStatusReqDto } from './dto/update-order-status.req.dto';
import { OrderItemEntity } from './entities/order-item.entity';
import {
  OrderStatusHistoryActor,
  OrderStatusHistoryEntity,
} from './entities/order-status-history.entity';
import { OrderTrackingTokenEntity } from './entities/order-tracking-token.entity';
import {
  OrderEntity,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './entities/order.entity';
import { OrdersService } from './orders.service';

type Qb = {
  setLock: jest.Mock;
  where: jest.Mock;
  getOne: jest.Mock;
};

function makeOrder(over: Partial<OrderEntity> = {}): OrderEntity {
  return {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    code: 'LN-260423-TEST',
    customerName: 'A',
    phone: '0900000000',
    email: null,
    address: 'Addr',
    province: null,
    total: 1000,
    discountAmount: 0,
    voucherCode: null,
    voucherId: null,
    voucher: null,
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PENDING,
    orderStatus: OrderStatus.PENDING,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    ...over,
  } as OrderEntity;
}

describe('OrdersService', () => {
  let service: OrdersService;
  let dataSource: { transaction: jest.Mock };
  let transactionsService: { getPaidAmount: jest.Mock };
  let lastEm: {
    createQueryBuilder: jest.Mock;
    insert: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let lastSaved: OrderEntity;

  beforeEach(async () => {
    transactionsService = { getPaidAmount: jest.fn().mockResolvedValue(0) };

    lastEm = {
      createQueryBuilder: jest.fn(),
      insert: jest.fn().mockResolvedValue(undefined),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    lastSaved = makeOrder();

    dataSource = {
      transaction: jest.fn(
        async (fn: (em: EntityManager) => Promise<unknown>) =>
          fn(lastEm as unknown as EntityManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('http://web') },
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(OrderTrackingTokenEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductVariantEntity),
          useValue: {},
        },
        {
          provide: getQueueToken('email'),
          useValue: { add: jest.fn() },
        },
        { provide: DataSource, useValue: dataSource },
        { provide: VouchersService, useValue: {} },
        { provide: TransactionsService, useValue: transactionsService },
        {
          provide: SepayService,
          useValue: {
            buildCheckoutFields: jest.fn().mockReturnValue({
              url: 'https://pay-sandbox.sepay.vn/v1/checkout/init',
              fields: { merchant: 'm', signature: 'sig' },
            }),
          },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('updateStatus', () => {
    function mockOrderQuery(order: OrderEntity | null) {
      const qb: Qb = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(order),
      };
      lastEm.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    beforeEach(() => {
      lastEm.save.mockImplementation(
        async (_cls: unknown, entity?: OrderEntity) => {
          lastSaved = { ...(entity ?? (_cls as OrderEntity)), items: [] };
          return lastSaved;
        },
      );
      lastEm.findOne.mockImplementation(async () => ({
        ...lastSaved,
        items: [],
      }));
    });

    it('inserts history and updates order in one transaction', async () => {
      const order = makeOrder({ orderStatus: OrderStatus.PENDING });
      mockOrderQuery(order);
      const dto: UpdateOrderStatusReqDto = {
        orderStatus: OrderStatus.CONFIRMED,
      };
      await service.updateStatus(order.id, dto, null);
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(lastEm.insert).toHaveBeenCalledWith(
        OrderStatusHistoryEntity,
        expect.objectContaining({
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CONFIRMED,
        }),
      );
      expect(lastEm.save).toHaveBeenCalled();
    });

    it('throws when order status is unchanged and payment is unchanged', async () => {
      const order = makeOrder({
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      });
      mockOrderQuery(order);
      await expect(
        service.updateStatus(
          order.id,
          { orderStatus: OrderStatus.PENDING },
          null,
        ),
      ).rejects.toThrow(/already in this status/i);
    });

    it('allows same orderStatus when paymentStatus changes', async () => {
      const order = makeOrder({
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      });
      mockOrderQuery(order);
      await service.updateStatus(
        order.id,
        {
          orderStatus: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PAID,
        },
        null,
      );
      expect(lastEm.insert).not.toHaveBeenCalled();
    });

    it('throws on illegal transition', async () => {
      const order = makeOrder({ orderStatus: OrderStatus.DELIVERED });
      mockOrderQuery(order);
      await expect(
        service.updateStatus(
          order.id,
          { orderStatus: OrderStatus.PENDING },
          null,
        ),
      ).rejects.toThrow(/Invalid status transition/i);
    });

    it('sets suggestRefund when cancelling a paid order', async () => {
      const order = makeOrder({ orderStatus: OrderStatus.CONFIRMED });
      mockOrderQuery(order);
      transactionsService.getPaidAmount.mockResolvedValue(80_000);
      const res = await service.updateStatus(
        order.id,
        { orderStatus: OrderStatus.CANCELLED },
        null,
      );
      expect(res.suggestRefund).toEqual({ suggestedAmount: 80_000 });
    });

    it('does not suggest refund when cancelling with no net paid', async () => {
      const order = makeOrder({ orderStatus: OrderStatus.CONFIRMED });
      mockOrderQuery(order);
      transactionsService.getPaidAmount.mockResolvedValue(0);
      const res = await service.updateStatus(
        order.id,
        { orderStatus: OrderStatus.CANCELLED },
        null,
      );
      expect(res.suggestRefund).toBeUndefined();
    });
  });

  describe('public status history DTO', () => {
    it('omits actorId from guest-facing serialization', () => {
      const row = {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        orderId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        fromStatus: null,
        toStatus: OrderStatus.PENDING,
        actorType: OrderStatusHistoryActor.ADMIN,
        actorId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        note: null,
        createdAt: new Date(),
      };
      const dto = plainToInstance(PublicOrderStatusHistoryResDto, row, {
        excludeExtraneousValues: true,
      });
      expect(Object.keys(dto as object)).not.toContain('actorId');
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
