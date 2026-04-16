import { CategoriesService } from '@/api/categories/categories.service';
import { CategoryEntity } from '@/api/categories/entities/category.entity';
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
import slugify from 'slugify';
import { DataSource, Repository } from 'typeorm';
import { CreateProductVariantReqDto } from './dto/create-product-variant.req.dto';
import { CreateProductReqDto } from './dto/create-product.req.dto';
import { ProductCategoryBriefResDto } from './dto/product-category-brief.res.dto';
import { ProductQueryReqDto } from './dto/product-query.req.dto';
import { ProductResDto } from './dto/product.res.dto';
import { UpdateProductVariantReqDto } from './dto/update-product-variant.req.dto';
import { UpdateProductReqDto } from './dto/update-product.req.dto';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    private readonly dataSource: DataSource,
    private readonly categoriesService: CategoriesService,
  ) {}

  private toProductResDto(p: ProductEntity): ProductResDto {
    const { categoryRef, ...rest } = p;
    const category = categoryRef?.slug ?? p.category;
    const categoryBrief = categoryRef
      ? plainToInstance(
          ProductCategoryBriefResDto,
          {
            id: categoryRef.id,
            slug: categoryRef.slug,
            name: categoryRef.name,
          },
          { excludeExtraneousValues: true },
        )
      : undefined;
    return plainToInstance(
      ProductResDto,
      {
        ...rest,
        category,
        categoryBrief,
      },
      { excludeExtraneousValues: true },
    );
  }

  private async resolveCategoryForWrite(dto: {
    categoryId?: string;
    category?: string;
  }): Promise<CategoryEntity> {
    if (dto.categoryId) {
      return this.categoriesService.findByIdOrThrow(dto.categoryId as Uuid);
    }
    if (dto.category !== undefined && dto.category !== '') {
      return this.categoriesService.findBySlugKeyOrThrow(dto.category);
    }
    throw new BadRequestException('Either categoryId or category is required');
  }

  /** Public: list active products with variants */
  async findMany(
    dto: ProductQueryReqDto,
    options?: { includeInactive?: boolean },
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    const includeInactive = options?.includeInactive === true;
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryRef', 'categoryRef');

    if (includeInactive) {
      qb.leftJoinAndSelect('product.variants', 'variant');
    } else {
      qb.leftJoinAndSelect(
        'product.variants',
        'variant',
        'variant.active = true',
      );
    }

    if (!includeInactive) {
      qb.where('product.active = true');
    }

    if (dto.categoryId) {
      qb.andWhere('categoryRef.id = :categoryId', {
        categoryId: dto.categoryId,
      });
    }
    if (dto.category) {
      qb.andWhere('categoryRef.slug = :catSlug', {
        catSlug: dto.category,
      });
    }
    if (dto.q) {
      qb.andWhere('product.name ILIKE :q', { q: `%${dto.q}%` });
    }

    qb.orderBy('product.createdAt', 'DESC').addOrderBy(
      'variant.sortOrder',
      'ASC',
    );

    const [products, meta] = await paginate(qb, dto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(
      products.map((p) => this.toProductResDto(p)),
      meta,
    );
  }

  /** Public: single product by slug */
  async findBySlug(slug: string): Promise<ProductResDto> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryRef', 'categoryRef')
      .leftJoinAndSelect('product.variants', 'variant', 'variant.active = true')
      .where('product.slug = :slug', { slug })
      .andWhere('product.active = true')
      .orderBy('variant.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException('Product not found');
    return this.toProductResDto(product);
  }

  /** Admin: get single product by id */
  async findById(id: Uuid): Promise<ProductResDto> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryRef', 'categoryRef')
      .leftJoinAndSelect('product.variants', 'variant')
      .where('product.id = :id', { id })
      .orderBy('variant.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException('Product not found');
    return this.toProductResDto(product);
  }

  /** Admin: create product with variants */
  async create(dto: CreateProductReqDto): Promise<ProductResDto> {
    if (
      !dto.categoryId &&
      (dto.category === undefined || dto.category === '')
    ) {
      throw new BadRequestException(
        'Either categoryId or category is required',
      );
    }
    const cat = await this.resolveCategoryForWrite({
      categoryId: dto.categoryId,
      category: dto.category,
    });

    const slug = await this.generateUniqueSlug(dto.name);
    const product = this.productRepo.create({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      summary: dto.summary ?? dto.description ?? null,
      descriptionHtml: dto.descriptionHtml ?? null,
      basePrice: dto.basePrice,
      images: dto.images ?? [],
      featuredImageUrl: dto.featuredImageUrl ?? null,
      videoUrl: dto.videoUrl ?? null,
      categoryId: cat.id,
      category: cat.slug,
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

    const full = await this.productRepo.findOne({
      where: { id: saved.id },
      relations: ['variants', 'categoryRef'],
    });
    return this.toProductResDto(full!);
  }

  /** Admin: update product + replace variants atomically */
  async update(id: Uuid, dto: UpdateProductReqDto): Promise<ProductResDto> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.name && dto.name !== product.name) {
      product.slug = await this.generateUniqueSlug(dto.name, id);
    }

    const patchSummary =
      dto.summary !== undefined
        ? dto.summary
        : dto.description !== undefined
          ? dto.description
          : undefined;

    Object.assign(product, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(patchSummary !== undefined && { summary: patchSummary }),
      ...(dto.descriptionHtml !== undefined && {
        descriptionHtml: dto.descriptionHtml,
      }),
      ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
      ...(dto.images !== undefined && { images: dto.images }),
      ...(dto.featuredImageUrl !== undefined && {
        featuredImageUrl: dto.featuredImageUrl,
      }),
      ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
      ...(dto.active !== undefined && { active: dto.active }),
    });

    if (dto.categoryId !== undefined || dto.category !== undefined) {
      const cat = await this.resolveCategoryForWrite({
        categoryId: dto.categoryId,
        category: dto.category,
      });
      product.categoryId = cat.id;
      product.category = cat.slug;
    }

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

    const full = await this.productRepo.findOne({
      where: { id: saved.id },
      relations: ['variants', 'categoryRef'],
    });
    return this.toProductResDto(full!);
  }

  /** Admin: soft delete (set active = false) */
  async remove(id: Uuid): Promise<void> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    product.active = false;
    await this.productRepo.save(product);
  }

  /** Admin: update a single variant field (e.g. SKU) */
  async updateVariant(
    productId: Uuid,
    variantId: Uuid,
    dto: UpdateProductVariantReqDto,
  ): Promise<ProductResDto> {
    const variant = await this.variantRepo.findOneBy({
      id: variantId,
      productId,
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    Object.assign(variant, {
      ...(dto.label !== undefined && { label: dto.label.trim() }),
      ...(dto.weightG !== undefined && { weightG: dto.weightG ?? null }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
      ...(dto.skuCode !== undefined && { skuCode: dto.skuCode.trim() || null }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.active !== undefined && { active: dto.active }),
    });

    await this.variantRepo.save(variant);
    return this.findById(productId);
  }

  /** Admin: add a variant to a product */
  async createVariant(
    productId: Uuid,
    dto: CreateProductVariantReqDto,
  ): Promise<ProductResDto> {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    const variant = this.variantRepo.create({
      productId,
      label: dto.label.trim(),
      weightG: dto.weightG ?? null,
      price: dto.price,
      stock: dto.stock,
      skuCode: dto.skuCode?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      active: dto.active ?? true,
    });

    await this.variantRepo.save(variant);
    return this.findById(productId);
  }

  /** Admin: delete a variant */
  async deleteVariant(
    productId: Uuid,
    variantId: Uuid,
  ): Promise<ProductResDto> {
    const variant = await this.variantRepo.findOneBy({
      id: variantId,
      productId,
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    await this.variantRepo.delete({ id: variantId, productId });
    return this.findById(productId);
  }

  private async generateUniqueSlug(
    name: string,
    excludeId?: Uuid,
  ): Promise<string> {
    const base = slugify(name, { lower: true, strict: true, locale: 'vi' });
    let slug = base;
    let counter = 1;
    while (true) {
      const qb = this.productRepo
        .createQueryBuilder('p')
        .where('p.slug = :slug', { slug });
      if (excludeId) qb.andWhere('p.id != :id', { id: excludeId });
      const exists = await qb.getOne();
      if (!exists) break;
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
