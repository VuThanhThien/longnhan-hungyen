import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { paginate } from '@/utils/offset-pagination';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { CreateTransactionReqDto } from './dto/create-transaction.req.dto';
import { TransactionQueryReqDto } from './dto/transaction-query.req.dto';
import { TransactionResDto } from './dto/transaction.res.dto';
import { UpdateTransactionReqDto } from './dto/update-transaction.req.dto';
import {
  TransactionDirection,
  TransactionEntity,
  TransactionType,
} from './entities/transaction.entity';

const FUTURE_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async create(
    orderId: Uuid,
    dto: CreateTransactionReqDto,
    adminId: Uuid | null,
  ): Promise<TransactionResDto> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (
      (dto.type === TransactionType.PAYMENT ||
        dto.type === TransactionType.REFUND) &&
      !dto.method
    ) {
      throw new BadRequestException(`method is required for type=${dto.type}`);
    }

    const occurredAt = new Date(dto.occurredAt);
    if (occurredAt.getTime() > Date.now() + FUTURE_GRACE_MS) {
      throw new BadRequestException(
        'occurredAt cannot be more than 7 days in the future',
      );
    }

    const direction = this.deriveDirection(dto.type);

    const entity = this.txRepo.create({
      orderId,
      type: dto.type,
      method: dto.method ?? null,
      amount: dto.amount,
      direction,
      status: dto.status,
      referenceNo: dto.referenceNo ?? null,
      referenceNote: dto.referenceNote ?? null,
      occurredAt,
      createdByAdminId: adminId,
    });
    const saved = await this.txRepo.save(entity);
    return this.toDto(saved, order.code);
  }

  async findByOrder(orderId: Uuid): Promise<TransactionResDto[]> {
    const rows = await this.txRepo.find({
      where: { orderId },
      order: { occurredAt: 'DESC', createdAt: 'DESC' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async findAll(
    dto: TransactionQueryReqDto,
  ): Promise<OffsetPaginatedDto<TransactionResDto>> {
    const qb = this.txRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.order', 'order')
      .orderBy('tx.occurredAt', 'DESC')
      .addOrderBy('tx.createdAt', 'DESC');

    if (dto.type) qb.andWhere('tx.type = :type', { type: dto.type });
    if (dto.method) qb.andWhere('tx.method = :method', { method: dto.method });
    if (dto.status) qb.andWhere('tx.status = :status', { status: dto.status });
    if (dto.dateFrom)
      qb.andWhere('tx.occurredAt >= :dateFrom', {
        dateFrom: new Date(dto.dateFrom),
      });
    if (dto.dateTo)
      qb.andWhere('tx.occurredAt <= :dateTo', {
        dateTo: new Date(dto.dateTo),
      });
    if (dto.q) {
      qb.andWhere('(tx.referenceNo ILIKE :q OR order.code ILIKE :q)', {
        q: `%${dto.q}%`,
      });
    }

    const [rows, meta] = await paginate(qb, dto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(
      rows.map((r) => this.toDto(r, r.order?.code)),
      meta,
    );
  }

  async update(
    id: Uuid,
    dto: UpdateTransactionReqDto,
  ): Promise<TransactionResDto> {
    const tx = await this.txRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!tx) throw new NotFoundException('Transaction not found');

    if (dto.status !== undefined) tx.status = dto.status;
    if (dto.referenceNo !== undefined) tx.referenceNo = dto.referenceNo;
    if (dto.referenceNote !== undefined) tx.referenceNote = dto.referenceNote;
    if (dto.occurredAt !== undefined) {
      const next = new Date(dto.occurredAt);
      if (next.getTime() > Date.now() + FUTURE_GRACE_MS) {
        throw new BadRequestException(
          'occurredAt cannot be more than 7 days in the future',
        );
      }
      tx.occurredAt = next;
    }

    const saved = await this.txRepo.save(tx);
    return this.toDto(saved, tx.order?.code);
  }

  /** Net completed in/out for an order. Used by refund hint + admin header. */
  async getPaidAmount(orderId: Uuid): Promise<number> {
    const r = await this.txRepo
      .createQueryBuilder('tx')
      .select(
        "COALESCE(SUM(CASE WHEN tx.direction='in' THEN tx.amount ELSE -tx.amount END), 0)",
        'paid',
      )
      .where('tx.order_id = :id', { id: orderId })
      .andWhere("tx.status = 'completed'")
      .getRawOne<{ paid: string }>();
    return Number(r?.paid ?? 0);
  }

  private deriveDirection(type: TransactionType): TransactionDirection {
    switch (type) {
      case TransactionType.PAYMENT:
      case TransactionType.ADJUSTMENT:
        return TransactionDirection.IN;
      case TransactionType.REFUND:
      case TransactionType.FEE:
        return TransactionDirection.OUT;
    }
  }

  private toDto(tx: TransactionEntity, orderCode?: string): TransactionResDto {
    const dto = plainToInstance(TransactionResDto, tx, {
      excludeExtraneousValues: true,
    });
    if (orderCode) dto.orderCode = orderCode;
    return dto;
  }
}
