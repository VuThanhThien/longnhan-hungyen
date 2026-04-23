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
import { EntityManager, Repository } from 'typeorm';
import { CreateVoucherReqDto } from './dto/create-voucher.req.dto';
import { UpdateVoucherReqDto } from './dto/update-voucher.req.dto';
import { ValidateVoucherReqDto } from './dto/validate-voucher.req.dto';
import { ValidateVoucherResDto } from './dto/validate-voucher.res.dto';
import { VoucherUsageQueryReqDto } from './dto/voucher-usage-query.req.dto';
import { VoucherUsageResDto } from './dto/voucher-usage.res.dto';
import { VoucherResDto } from './dto/voucher.res.dto';
import { VoucherUsageEntity } from './entities/voucher-usage.entity';
import { DiscountType, VoucherEntity } from './entities/voucher.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(VoucherEntity)
    private readonly voucherRepo: Repository<VoucherEntity>,
    @InjectRepository(VoucherUsageEntity)
    private readonly voucherUsageRepo: Repository<VoucherUsageEntity>,
  ) {}

  // ─── Public ──────────────────────────────────────────────────────────────────

  /** Validate a voucher code without writing to DB. Returns discount preview. */
  async validate(dto: ValidateVoucherReqDto): Promise<ValidateVoucherResDto> {
    const code = dto.code.toUpperCase();
    const phone = dto.phone.trim();

    const voucher = await this.voucherRepo.findOne({ where: { code } });

    // Not found or inactive → same generic message (no info leak)
    if (!voucher || !voucher.isActive) {
      return this.invalidResult('Mã giảm giá không hợp lệ');
    }

    // Expired
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return this.invalidResult('Mã giảm giá đã hết hạn');
    }

    // Global usage cap
    if (voucher.maxUses !== null && voucher.usedCount >= voucher.maxUses) {
      return this.invalidResult('Mã giảm giá đã hết lượt sử dụng');
    }

    // Phone already used this voucher
    const existingUsage = await this.voucherUsageRepo.findOne({
      where: { voucherId: voucher.id, phone },
    });
    if (existingUsage) {
      return this.invalidResult('Số điện thoại này đã sử dụng mã giảm giá này');
    }

    // Min order amount
    if (
      voucher.minOrderAmount !== null &&
      dto.orderTotal < voucher.minOrderAmount
    ) {
      return this.invalidResult(
        `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      );
    }

    // Percentage sanity guard (data integrity)
    if (
      voucher.discountType === DiscountType.PERCENTAGE &&
      voucher.discountValue > 100
    ) {
      return this.invalidResult('Mã giảm giá không hợp lệ');
    }

    const discountAmount = this.calcDiscount(
      voucher.discountType,
      voucher.discountValue,
      dto.orderTotal,
    );

    return plainToInstance(
      ValidateVoucherResDto,
      {
        valid: true,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount,
        finalTotal: dto.orderTotal - discountAmount,
      },
      { excludeExtraneousValues: true },
    );
  }

  /**
   * Validate voucher inside an existing DB transaction (called by OrdersService).
   * Throws BadRequestException with Vietnamese message instead of returning { valid: false }.
   * Returns { voucher, discountAmount } for caller to persist on order.
   */
  async validateForOrder(
    em: EntityManager,
    code: string,
    orderTotal: number,
    phone: string,
  ): Promise<{ voucher: VoucherEntity; discountAmount: number }> {
    phone = phone.trim();

    const voucher = await em.findOne(VoucherEntity, { where: { code } });

    if (!voucher || !voucher.isActive) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }
    if (voucher.maxUses !== null && voucher.usedCount >= voucher.maxUses) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }
    if (
      voucher.minOrderAmount !== null &&
      orderTotal < voucher.minOrderAmount
    ) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      );
    }
    if (
      voucher.discountType === DiscountType.PERCENTAGE &&
      voucher.discountValue > 100
    ) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }

    const existingUsage = await em.findOne(VoucherUsageEntity, {
      where: { voucherId: voucher.id, phone },
    });
    if (existingUsage) {
      throw new BadRequestException(
        'Số điện thoại này đã sử dụng mã giảm giá này',
      );
    }

    const discountAmount = this.calcDiscount(
      voucher.discountType,
      voucher.discountValue,
      orderTotal,
    );

    return { voucher, discountAmount };
  }

  /**
   * Apply voucher inside an existing DB transaction.
   * Called by OrdersService (Phase 02). Performs SELECT FOR UPDATE + re-validates.
   * Returns the discount amount applied.
   */
  async applyVoucherInTransaction(
    em: EntityManager,
    voucherId: Uuid,
    orderId: Uuid,
    phone: string,
    orderTotal: number,
  ): Promise<number> {
    phone = phone.trim();

    // Re-load with pessimistic write lock to prevent race conditions
    const voucher = await em.findOne(VoucherEntity, {
      where: { id: voucherId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!voucher || !voucher.isActive) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }
    if (voucher.maxUses !== null && voucher.usedCount >= voucher.maxUses) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }
    if (
      voucher.minOrderAmount !== null &&
      orderTotal < voucher.minOrderAmount
    ) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      );
    }
    if (
      voucher.discountType === DiscountType.PERCENTAGE &&
      voucher.discountValue > 100
    ) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }

    // Re-check phone usage under lock to avoid race condition before DB constraint
    const alreadyUsed = await em.findOne(VoucherUsageEntity, {
      where: { voucherId, phone },
    });
    if (alreadyUsed) {
      throw new BadRequestException('Mã giảm giá đã được sử dụng');
    }

    const discountAmount = this.calcDiscount(
      voucher.discountType,
      voucher.discountValue,
      orderTotal,
    );

    await em.increment(VoucherEntity, { id: voucherId }, 'usedCount', 1);
    await em.save(
      em.create(VoucherUsageEntity, {
        voucherId,
        orderId,
        phone,
        discountAmount,
      }),
    );

    return discountAmount;
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────────

  async findMany(): Promise<VoucherResDto[]> {
    const vouchers = await this.voucherRepo.find({
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(VoucherResDto, vouchers, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: Uuid): Promise<VoucherResDto> {
    const voucher = await this.voucherRepo.findOne({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return plainToInstance(VoucherResDto, voucher, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateVoucherReqDto): Promise<VoucherResDto> {
    const code = dto.code.toUpperCase();
    if (
      dto.discountType === DiscountType.PERCENTAGE &&
      dto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Giá trị giảm giá theo % không được vượt quá 100',
      );
    }
    const existing = await this.voucherRepo.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException(`Mã giảm giá đã tồn tại`);
    }
    const voucher = this.voucherRepo.create({ ...dto, code });
    try {
      const saved = await this.voucherRepo.save(voucher);
      return plainToInstance(VoucherResDto, saved, {
        excludeExtraneousValues: true,
      });
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException('Mã giảm giá đã tồn tại');
      }
      throw err;
    }
  }

  async update(id: Uuid, dto: UpdateVoucherReqDto): Promise<VoucherResDto> {
    const voucher = await this.voucherRepo.findOne({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher not found');

    // Determine effective discountType and discountValue after this update
    const effectiveType = dto.discountType ?? voucher.discountType;
    const effectiveValue = dto.discountValue ?? voucher.discountValue;
    if (effectiveType === DiscountType.PERCENTAGE && effectiveValue > 100) {
      throw new BadRequestException(
        'Giá trị giảm giá theo % không được vượt quá 100',
      );
    }

    if (dto.code) {
      const code = dto.code.toUpperCase();
      const conflict = await this.voucherRepo.findOne({ where: { code } });
      if (conflict && conflict.id !== id) {
        throw new BadRequestException(`Voucher code "${code}" already exists`);
      }
      dto.code = code;
    }

    Object.assign(voucher, dto);
    const saved = await this.voucherRepo.save(voucher);
    return plainToInstance(VoucherResDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Hard delete if never used; soft-deactivate (isActive=false) if usedCount > 0.
   */
  async remove(id: Uuid): Promise<void> {
    const voucher = await this.voucherRepo.findOne({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher not found');

    if (voucher.usedCount > 0) {
      await this.voucherRepo.update(id, { isActive: false });
    } else {
      await this.voucherRepo.delete(id);
    }
  }

  async findUsages(
    id: Uuid,
    query: VoucherUsageQueryReqDto,
  ): Promise<OffsetPaginatedDto<VoucherUsageResDto>> {
    const voucher = await this.voucherRepo.findOne({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher not found');

    const qb = this.voucherUsageRepo
      .createQueryBuilder('usage')
      .where('usage.voucherId = :id', { id })
      .orderBy('usage.usedAt', 'DESC');

    const [usages, meta] = await paginate(qb, query, { skipCount: false });

    return new OffsetPaginatedDto(
      usages.map((u) =>
        plainToInstance(
          VoucherUsageResDto,
          {
            id: u.id,
            voucherId: u.voucherId,
            orderId: u.orderId,
            phoneMasked: maskPhone(u.phone),
            discountAmount: u.discountAmount,
            usedAt: u.usedAt,
          },
          { excludeExtraneousValues: true },
        ),
      ),
      meta,
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private calcDiscount(
    type: DiscountType,
    value: number,
    orderTotal: number,
  ): number {
    let amount: number;
    if (type === DiscountType.PERCENTAGE) {
      amount = Math.floor((orderTotal * value) / 100);
    } else {
      amount = Math.min(value, orderTotal);
    }
    return Math.max(0, amount);
  }

  private invalidResult(message: string): ValidateVoucherResDto {
    return plainToInstance(
      ValidateVoucherResDto,
      { valid: false, discountAmount: 0, finalTotal: 0, message },
      { excludeExtraneousValues: true },
    );
  }
}

function maskPhone(phone: string): string {
  if (phone.length <= 5) return phone;
  return phone.slice(0, 3) + '***' + phone.slice(-2);
}
