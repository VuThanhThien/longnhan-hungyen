import { Uuid } from '@/common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { CreateTransactionReqDto } from './dto/create-transaction.req.dto';
import { TransactionQueryReqDto } from './dto/transaction-query.req.dto';
import {
  TransactionDirection,
  TransactionEntity,
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let txRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let orderRepo: { findOne: jest.Mock };
  let qb: jest.Mocked<
    Pick<
      SelectQueryBuilder<TransactionEntity>,
      | 'leftJoinAndSelect'
      | 'orderBy'
      | 'addOrderBy'
      | 'andWhere'
      | 'select'
      | 'where'
      | 'skip'
      | 'take'
      | 'getMany'
      | 'getCount'
      | 'getRawOne'
    >
  >;

  const orderId = '11111111-1111-1111-1111-111111111111' as Uuid;
  const txId = '22222222-2222-2222-2222-222222222222' as Uuid;

  beforeEach(async () => {
    qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
      getRawOne: jest.fn().mockResolvedValue({ paid: '0' }),
    };

    txRepo = {
      create: jest.fn((p: Partial<TransactionEntity>) =>
        Object.assign(new TransactionEntity(), { id: txId, ...p }),
      ),
      save: jest.fn(async (e: TransactionEntity) => e),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    orderRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(TransactionEntity), useValue: txRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: orderRepo },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  describe('create', () => {
    beforeEach(() => {
      orderRepo.findOne.mockResolvedValue({
        id: orderId,
        code: 'LN-260423-ABCD',
      } as OrderEntity);
    });

    it.each([
      [TransactionType.PAYMENT, TransactionDirection.IN],
      [TransactionType.REFUND, TransactionDirection.OUT],
      [TransactionType.ADJUSTMENT, TransactionDirection.IN],
      [TransactionType.FEE, TransactionDirection.OUT],
    ] as const)('derives direction for type=%s', async (type, direction) => {
      const dto: CreateTransactionReqDto = {
        type,
        method:
          type === TransactionType.ADJUSTMENT || type === TransactionType.FEE
            ? undefined
            : TransactionMethod.COD,
        amount: 10_000,
        status: TransactionStatus.COMPLETED,
        occurredAt: new Date().toISOString(),
      };
      await service.create(orderId, dto, null);
      expect(txRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ direction }),
      );
    });

    it('rejects occurredAt more than 7 days in the future', async () => {
      const far = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      await expect(
        service.create(
          orderId,
          {
            type: TransactionType.ADJUSTMENT,
            amount: 1,
            status: TransactionStatus.COMPLETED,
            occurredAt: far,
          } as CreateTransactionReqDto,
          null,
        ),
      ).rejects.toThrow(/future/i);
    });

    it('requires method for payment', async () => {
      await expect(
        service.create(
          orderId,
          {
            type: TransactionType.PAYMENT,
            amount: 1,
            status: TransactionStatus.COMPLETED,
            occurredAt: new Date().toISOString(),
          } as CreateTransactionReqDto,
          null,
        ),
      ).rejects.toThrow(/method/i);
    });
  });

  describe('update', () => {
    it('does not change amount when extra fields are present at runtime', async () => {
      const existing = {
        id: txId,
        orderId,
        type: TransactionType.PAYMENT,
        method: TransactionMethod.COD,
        amount: 50_000,
        direction: TransactionDirection.IN,
        status: TransactionStatus.COMPLETED,
        referenceNo: null,
        referenceNote: null,
        occurredAt: new Date(),
        order: { code: 'X' } as OrderEntity,
      } as TransactionEntity;
      txRepo.findOne.mockResolvedValue(existing);
      await service.update(txId, {
        status: TransactionStatus.VOIDED,
        ...({
          amount: 1,
          type: TransactionType.FEE,
        } as Record<string, unknown>),
      } as never);
      expect(txRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50_000,
          type: TransactionType.PAYMENT,
          status: TransactionStatus.VOIDED,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('applies type, method, status, date range, and search filters', async () => {
      const dto = {
        page: 1,
        limit: 20,
        type: TransactionType.PAYMENT,
        method: TransactionMethod.COD,
        status: TransactionStatus.COMPLETED,
        dateFrom: '2026-01-01T00:00:00.000Z',
        dateTo: '2026-12-31T23:59:59.999Z',
        q: 'LN-',
      } as TransactionQueryReqDto;
      await service.findAll(dto);
      expect(qb.andWhere).toHaveBeenCalledWith('tx.type = :type', {
        type: TransactionType.PAYMENT,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('tx.method = :method', {
        method: TransactionMethod.COD,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('tx.status = :status', {
        status: TransactionStatus.COMPLETED,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'tx.occurredAt >= :dateFrom',
        expect.objectContaining({ dateFrom: expect.any(Date) }),
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'tx.occurredAt <= :dateTo',
        expect.objectContaining({ dateTo: expect.any(Date) }),
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(tx.referenceNo ILIKE :q OR order.code ILIKE :q)',
        { q: '%LN-%' },
      );
    });
  });

  describe('getPaidAmount', () => {
    it('returns net completed in minus out', async () => {
      qb.getRawOne.mockResolvedValueOnce({ paid: '45000' });
      const n = await service.getPaidAmount(orderId);
      expect(n).toBe(45000);
      expect(txRepo.createQueryBuilder).toHaveBeenCalledWith('tx');
      expect(qb.andWhere).toHaveBeenCalledWith("tx.status = 'completed'");
    });
  });
});
