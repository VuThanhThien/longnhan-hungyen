import { OrderItemEntity } from '@/api/orders/entities/order-item.entity';
import { OrderEntity, OrderStatus } from '@/api/orders/entities/order.entity';
import { ProductEntity } from '@/api/products/entities/product.entity';
import { Uuid } from '@/common/types/common.type';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateProductReviewReqDto } from './dto/create-product-review.req.dto';
import { ProductReviewQueryReqDto } from './dto/product-review-query.req.dto';
import {
  ProductReviewResDto,
  PublicProductReviewsListResDto,
} from './dto/product-review.res.dto';
import { UpdateProductReviewStatusReqDto } from './dto/update-product-review-status.req.dto';
import {
  ProductReviewEntity,
  ProductReviewStatus,
} from './entities/product-review.entity';
import {
  buildPublicReviewerLabel,
  looksLikeVietnamPhoneNumber,
  normalizeVietnamPhone,
} from './utils/review-public-label.util';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProductReviewEntity)
    private readonly reviewRepo: Repository<ProductReviewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
  ) {}

  async createProductReview(
    productId: Uuid,
    dto: CreateProductReviewReqDto,
  ): Promise<ProductReviewResDto> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const orderCode = dto.orderCode.trim();
    if (!orderCode) {
      throw new BadRequestException('Mã đơn hàng không hợp lệ.');
    }

    const order = await this.orderRepo.findOne({
      where: { code: orderCode },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Đơn hàng chưa được giao thành công.');
    }

    const isAnonymous = dto.isAnonymous === true;
    const displayName = (dto.displayName ?? '').trim();
    if (!isAnonymous) {
      if (!displayName) {
        throw new BadRequestException('Vui lòng nhập tên hiển thị.');
      }
      if (looksLikeVietnamPhoneNumber(displayName)) {
        throw new BadRequestException('Tên hiển thị không hợp lệ.');
      }
    }

    const inputPhone = normalizeVietnamPhone(dto.phone);
    const orderPhone = normalizeVietnamPhone(order.phone);
    if (!inputPhone || !orderPhone || inputPhone !== orderPhone) {
      throw new BadRequestException('Thông tin đơn hàng không hợp lệ.');
    }

    const items = await this.orderItemRepo.find({
      where: { orderId: order.id },
    });

    const matchingItem = items.find((i) => {
      const snap = i.variantSnapshot as Record<string, unknown>;
      return String(snap?.productId ?? '') === String(productId);
    });
    if (!matchingItem) {
      throw new BadRequestException('Đơn hàng không chứa sản phẩm này.');
    }

    const snap = matchingItem.variantSnapshot as Record<string, unknown>;
    const variantLabelRaw = snap?.label;
    const variantLabelSnapshot =
      typeof variantLabelRaw === 'string' && variantLabelRaw.trim()
        ? variantLabelRaw.trim()
        : null;

    const publicReviewerLabel = buildPublicReviewerLabel({
      isAnonymous,
      displayName: isAnonymous ? undefined : displayName,
      orderPhone: order.phone,
    });

    try {
      const created = await this.reviewRepo.save(
        this.reviewRepo.create({
          productId,
          orderId: order.id,
          rating: dto.rating,
          comment: dto.comment ? dto.comment : null,
          isAnonymous,
          variantLabelSnapshot,
          publicReviewerLabel,
          status: ProductReviewStatus.PENDING,
        }),
      );

      return plainToInstance(ProductReviewResDto, created, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new BadRequestException(
        'Bạn đã đánh giá sản phẩm này cho đơn hàng này.',
      );
    }
  }

  async listPublishedReviews(
    productId: Uuid,
    dto: ProductReviewQueryReqDto,
  ): Promise<PublicProductReviewsListResDto> {
    const limit = Math.min(Math.max(dto.limit ?? 10, 1), 50);

    const qb = this.reviewRepo
      .createQueryBuilder('r')
      .where('r.productId = :productId', { productId })
      .andWhere('r.status = :status', { status: ProductReviewStatus.PUBLISHED })
      .orderBy('r.createdAt', 'DESC')
      .take(limit);

    const items = await qb.getMany();

    const agg = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .andWhere('r.status = :status', { status: ProductReviewStatus.PUBLISHED })
      .getRawOne<{ avg: string | null; count: string }>();

    const ratingAvg = agg?.avg ? Number.parseFloat(agg.avg) : 0;
    const ratingCount = agg?.count ? Number.parseInt(agg.count, 10) : 0;

    return plainToInstance(
      PublicProductReviewsListResDto,
      {
        ratingAvg,
        ratingCount,
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          rating: i.rating,
          comment: i.comment,
          createdAt: i.createdAt,
          reviewerLabel: i.publicReviewerLabel ?? 'Khách hàng',
          variantLabel: i.variantLabelSnapshot ?? '—',
        })),
      },
      { excludeExtraneousValues: true },
    );
  }

  async listAdminReviews(
    status?: ProductReviewStatus,
  ): Promise<ProductReviewResDto[]> {
    const where = status ? { status } : {};
    const items = await this.reviewRepo.find({
      where: where as any,
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return plainToInstance(ProductReviewResDto, items, {
      excludeExtraneousValues: true,
    });
  }

  async updateReviewStatus(
    id: Uuid,
    dto: UpdateProductReviewStatusReqDto,
  ): Promise<ProductReviewResDto> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.status = dto.status;
    const saved = await this.reviewRepo.save(review);

    return plainToInstance(ProductReviewResDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async deleteReview(id: Uuid): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.delete({ id });
  }
}
