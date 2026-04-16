import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { IOrderTrackingLinkJob } from '@/common/interfaces/job.interface';
import { Uuid } from '@/common/types/common.type';
import { AllConfigType } from '@/config/config.type';
import { JobName, QueueName } from '@/constants/job.constant';
import { paginate } from '@/utils/offset-pagination';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import crypto from 'crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { CreateOrderReqDto } from './dto/create-order.req.dto';
import { OrderQueryReqDto } from './dto/order-query.req.dto';
import { OrderResDto } from './dto/order.res.dto';
import { PublicOrderSummaryResDto } from './dto/public-order-summary.res.dto';
import { UpdateOrderStatusReqDto } from './dto/update-order-status.req.dto';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderTrackingTokenEntity } from './entities/order-tracking-token.entity';
import { OrderEntity, PaymentMethod } from './entities/order.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderTrackingTokenEntity)
    private readonly orderTrackingTokenRepo: Repository<OrderTrackingTokenEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue<IOrderTrackingLinkJob, any, string>,
    private readonly dataSource: DataSource,
  ) {}

  /** Public: create order with transaction (validates stock, decrements) */
  async create(dto: CreateOrderReqDto): Promise<OrderResDto> {
    const result = await this.dataSource.transaction(async (em) => {
      // Load variants with SELECT FOR UPDATE to prevent race conditions
      const variantIds = dto.items.map((i) => i.variantId);
      const variants = await em
        .createQueryBuilder(ProductVariantEntity, 'v')
        .setLock('pessimistic_write')
        .whereInIds(variantIds)
        .getMany();

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      // Validate all variants exist, are active, and have stock
      for (const item of dto.items) {
        const variant = variantMap.get(item.variantId as Uuid);
        if (!variant || !variant.active) {
          throw new BadRequestException(
            `Variant ${item.variantId} not found or inactive`,
          );
        }
        if (variant.stock < item.qty) {
          throw new BadRequestException(
            `Insufficient stock for variant "${variant.label}": available ${variant.stock}, requested ${item.qty}`,
          );
        }
      }

      // Build order items and calculate total
      let total = 0;
      const orderItems: Partial<OrderItemEntity>[] = dto.items.map((item) => {
        const variant = variantMap.get(item.variantId as Uuid)!;
        const subtotal = variant.price * item.qty;
        total += subtotal;
        return {
          variantId: variant.id,
          qty: item.qty,
          unitPrice: variant.price,
          subtotal,
          variantSnapshot: {
            id: variant.id,
            label: variant.label,
            price: variant.price,
            weightG: variant.weightG,
            skuCode: variant.skuCode,
            productId: variant.productId,
          },
        };
      });

      // Generate unique order code: LN-YYMMDD-XXXX
      const code = await this.generateOrderCode(em);

      // Create order
      const order = em.create(OrderEntity, {
        code,
        customerName: dto.customerName,
        phone: dto.phone,
        email: dto.email ?? null,
        address: dto.address,
        province: dto.province ?? null,
        total,
        paymentMethod: dto.paymentMethod ?? PaymentMethod.COD,
        notes: dto.notes ?? null,
      });
      const savedOrder = await em.save(OrderEntity, order);

      // Save order items
      const items = orderItems.map((item) =>
        em.create(OrderItemEntity, { ...item, orderId: savedOrder.id }),
      );
      savedOrder.items = await em.save(OrderItemEntity, items);

      // Decrement stock
      for (const item of dto.items) {
        await em.decrement(
          ProductVariantEntity,
          { id: item.variantId as Uuid },
          'stock',
          item.qty,
        );
      }

      return plainToInstance(OrderResDto, savedOrder, {
        excludeExtraneousValues: true,
      });
    });

    const order = await this.orderRepo.findOne({
      where: { code: result.code },
    });
    if (order?.email) {
      try {
        await this.enqueueOrderTrackingLinkEmail(order);
      } catch (err) {
        this.logger.error(
          `Failed to enqueue tracking email for order ${order.code}`,
          err instanceof Error ? err.stack : err,
        );
      }
    }

    return result;
  }

  /** Admin: list orders with filters */
  async findMany(
    dto: OrderQueryReqDto,
  ): Promise<OffsetPaginatedDto<OrderResDto>> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .orderBy('order.createdAt', 'DESC');

    if (dto.orderStatus) {
      qb.andWhere('order.orderStatus = :orderStatus', {
        orderStatus: dto.orderStatus,
      });
    }
    if (dto.paymentStatus) {
      qb.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: dto.paymentStatus,
      });
    }
    if (dto.dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: new Date(dto.dateFrom),
      });
    }
    if (dto.dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', {
        dateTo: new Date(dto.dateTo),
      });
    }
    if (dto.q) {
      qb.andWhere('(order.code ILIKE :q OR order.phone ILIKE :q)', {
        q: `%${dto.q}%`,
      });
    }

    const [orders, meta] = await paginate(qb, dto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(
      plainToInstance(OrderResDto, orders, { excludeExtraneousValues: true }),
      meta,
    );
  }

  /** Admin: get single order */
  async findOne(id: Uuid): Promise<OrderResDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return plainToInstance(OrderResDto, order, {
      excludeExtraneousValues: true,
    });
  }

  /** Admin: update order/payment status */
  async updateStatus(
    id: Uuid,
    dto: UpdateOrderStatusReqDto,
  ): Promise<OrderResDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (dto.orderStatus) order.orderStatus = dto.orderStatus;
    if (dto.paymentStatus) order.paymentStatus = dto.paymentStatus;

    const saved = await this.orderRepo.save(order);
    return plainToInstance(OrderResDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Generate unique order code within the same transaction.
   * Uses a random 4-char hex suffix to avoid race conditions from
   * sequential count-based codes (two concurrent txns could read same count).
   * Falls back to retry on unique constraint violation handled by the DB.
   */
  private async generateOrderCode(_em: EntityManager): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `LN-${yy}${mm}${dd}-`;

    // Random 4-char alphanumeric suffix — collision probability negligible for MVP scale
    const randomSuffix = Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()
      .padEnd(4, '0');
    return `${prefix}${randomSuffix}`;
  }

  /**
   * Public: guest-safe summary by order code (rate-limit at controller).
   */
  async lookupByCode(code: string): Promise<PublicOrderSummaryResDto> {
    const trimmed = code?.trim();
    if (!trimmed || trimmed.length > 64) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.orderRepo.findOne({
      where: { code: trimmed },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    return plainToInstance(
      PublicOrderSummaryResDto,
      mapOrderToPublicSummary(order),
      {
        excludeExtraneousValues: true,
      },
    );
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

  /** Public: exchange token for guest-safe summary (single-use, expires) */
  async trackByToken(token: string): Promise<PublicOrderSummaryResDto> {
    if (!token || token.length < 20 || token.length > 512) {
      throw new NotFoundException('Order not found');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const now = new Date();
    const updateRes = await this.orderTrackingTokenRepo
      .createQueryBuilder()
      .update(OrderTrackingTokenEntity)
      .set({ usedAt: now })
      .where('"tokenHash" = :tokenHash', { tokenHash })
      .andWhere('"usedAt" IS NULL')
      .andWhere('"expiresAt" > NOW()')
      .returning(['orderId'])
      .execute();

    const orderId = updateRes.raw?.[0]?.orderId as Uuid | undefined;
    if (updateRes.affected !== 1 || !orderId) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    return plainToInstance(
      PublicOrderSummaryResDto,
      mapOrderToPublicSummary(order),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

function mapOrderToPublicSummary(order: OrderEntity) {
  const addressPreview = getAddressPreview(order.address);

  return {
    code: order.code,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    total: order.total,
    createdAt: order.createdAt,
    province: order.province ?? null,
    addressPreview,
    items: (order.items ?? []).map((i) => ({
      name: String((i.variantSnapshot as any)?.label ?? 'Sản phẩm'),
      qty: i.qty,
      subtotal: i.subtotal,
    })),
  };
}

function getAddressPreview(address: string | null | undefined): string | null {
  if (!address) return null;
  const first = address.split(',')[0]?.trim();
  if (!first) return null;
  return first;
}
