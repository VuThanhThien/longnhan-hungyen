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

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId as Uuid },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Đơn hàng chưa được giao thành công.');
    }

    const inputPhone = normalizeVietnamPhone(dto.phone);
    const orderPhone = normalizeVietnamPhone(order.phone);
    if (!inputPhone || !orderPhone || inputPhone !== orderPhone) {
      throw new BadRequestException('Thông tin đơn hàng không hợp lệ.');
    }

    const items = await this.orderItemRepo.find({
      where: { orderId: order.id },
    });

    const hasProduct = items.some((i) => {
      const snap = i.variantSnapshot as any;
      return String(snap?.productId ?? '') === String(productId);
    });
    if (!hasProduct) {
      throw new BadRequestException('Đơn hàng không chứa sản phẩm này.');
    }

    try {
      const created = await this.reviewRepo.save(
        this.reviewRepo.create({
          productId,
          orderId: order.id,
          rating: dto.rating,
          comment: dto.comment ? dto.comment : null,
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
}

function normalizeVietnamPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('84')) return `0${digits.slice(2)}`;
  return digits;
}
