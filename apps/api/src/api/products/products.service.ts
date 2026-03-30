import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { paginate } from '@/utils/offset-pagination';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';
import { DataSource, Repository } from 'typeorm';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductEntity } from './entities/product.entity';
import { CreateProductReqDto } from './dto/create-product.req.dto';
import { ProductQueryReqDto } from './dto/product-query.req.dto';
import { ProductResDto } from './dto/product.res.dto';
import { UpdateProductReqDto } from './dto/update-product.req.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /** Public: list active products with variants */
  async findMany(
    dto: ProductQueryReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant', 'variant.active = true')
      .where('product.active = true');

    if (dto.category) {
      qb.andWhere('product.category = :category', { category: dto.category });
    }
    if (dto.q) {
      qb.andWhere('product.name ILIKE :q', { q: `%${dto.q}%` });
    }

    qb.orderBy('product.createdAt', 'DESC').addOrderBy('variant.sortOrder', 'ASC');

    const [products, meta] = await paginate(qb, dto, { skipCount: false, takeAll: false });
    return new OffsetPaginatedDto(plainToInstance(ProductResDto, products, { excludeExtraneousValues: true }), meta);
  }

  /** Public: single product by slug */
  async findBySlug(slug: string): Promise<ProductResDto> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant', 'variant.active = true')
      .where('product.slug = :slug', { slug })
      .andWhere('product.active = true')
      .orderBy('variant.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException('Product not found');
    return plainToInstance(ProductResDto, product, { excludeExtraneousValues: true });
  }

  /** Admin: create product with variants */
  async create(dto: CreateProductReqDto): Promise<ProductResDto> {
    const slug = await this.generateUniqueSlug(dto.name);
    const product = this.productRepo.create({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      basePrice: dto.basePrice,
      images: dto.images ?? [],
      featuredImageUrl: dto.featuredImageUrl ?? null,
      videoUrl: dto.videoUrl ?? null,
      category: dto.category,
      active: dto.active ?? true,
    });
    const saved = await this.productRepo.save(product);

    if (dto.variants?.length) {
      const variants = dto.variants.map((v, i) =>
        this.variantRepo.create({
          productId: saved.id,
          label: v.label,
          weightG: v.weightG ?? null,
          price: v.price,
          stock: v.stock,
          skuCode: v.skuCode ?? null,
          sortOrder: v.sortOrder ?? i,
          active: v.active ?? true,
        }),
      );
      saved.variants = await this.variantRepo.save(variants);
    }

    return plainToInstance(ProductResDto, saved, { excludeExtraneousValues: true });
  }

  /** Admin: update product + replace variants atomically */
  async update(id: Uuid, dto: UpdateProductReqDto): Promise<ProductResDto> {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['variants'] });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.name && dto.name !== product.name) {
      product.slug = await this.generateUniqueSlug(dto.name, id);
    }
    Object.assign(product, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
      ...(dto.images !== undefined && { images: dto.images }),
      ...(dto.featuredImageUrl !== undefined && { featuredImageUrl: dto.featuredImageUrl }),
      ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.active !== undefined && { active: dto.active }),
    });

    // Wrap product save + variant replace in a transaction to prevent partial updates
    const saved = await this.dataSource.transaction(async (em) => {
      const savedProduct = await em.save(ProductEntity, product);

      if (dto.variants !== undefined) {
        await em.delete(ProductVariantEntity, { productId: id });
        if (dto.variants.length) {
          const variants = dto.variants.map((v, i) =>
            em.create(ProductVariantEntity, {
              productId: savedProduct.id,
              label: v.label,
              weightG: v.weightG ?? null,
              price: v.price,
              stock: v.stock,
              skuCode: v.skuCode ?? null,
              sortOrder: v.sortOrder ?? i,
              active: v.active ?? true,
            }),
          );
          savedProduct.variants = await em.save(ProductVariantEntity, variants);
        } else {
          savedProduct.variants = [];
        }
      }

      return savedProduct;
    });

    return plainToInstance(ProductResDto, saved, { excludeExtraneousValues: true });
  }

  /** Admin: soft delete (set active = false) */
  async remove(id: Uuid): Promise<void> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    product.active = false;
    await this.productRepo.save(product);
  }

  private async generateUniqueSlug(name: string, excludeId?: Uuid): Promise<string> {
    const base = slugify(name, { lower: true, strict: true, locale: 'vi' });
    let slug = base;
    let counter = 1;
    while (true) {
      const qb = this.productRepo.createQueryBuilder('p').where('p.slug = :slug', { slug });
      if (excludeId) qb.andWhere('p.id != :id', { id: excludeId });
      const exists = await qb.getOne();
      if (!exists) break;
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
