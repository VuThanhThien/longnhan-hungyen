import { Uuid } from '@/common/types/common.type';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { CategoryResDto } from './dto/category.res.dto';
import { CreateCategoryReqDto } from './dto/create-category.req.dto';
import { UpdateCategoryReqDto } from './dto/update-category.req.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async findManyPublic(): Promise<CategoryResDto[]> {
    const rows = await this.categoryRepo.find({
      where: { active: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return plainToInstance(CategoryResDto, rows, {
      excludeExtraneousValues: true,
    });
  }

  async findManyAdmin(): Promise<CategoryResDto[]> {
    const rows = await this.categoryRepo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return plainToInstance(CategoryResDto, rows, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCategoryReqDto): Promise<CategoryResDto> {
    const exists = await this.categoryRepo.exist({ where: { slug: dto.slug } });
    if (exists) {
      throw new ConflictException('Category slug already exists');
    }
    const row = await this.categoryRepo.save(
      this.categoryRepo.create({
        name: dto.name.trim(),
        slug: dto.slug.trim(),
        sortOrder: dto.sortOrder ?? 0,
        active: dto.active ?? true,
      }),
    );
    return plainToInstance(CategoryResDto, row, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: Uuid, dto: UpdateCategoryReqDto): Promise<CategoryResDto> {
    const row = await this.categoryRepo.findOneBy({ id });
    if (!row) throw new NotFoundException('Category not found');

    if (dto.slug !== undefined && dto.slug !== row.slug) {
      const nextSlug = dto.slug.trim();
      const taken = await this.categoryRepo
        .createQueryBuilder('c')
        .where('c.slug = :slug', { slug: nextSlug })
        .andWhere('c.id != :id', { id })
        .getExists();
      if (taken) throw new ConflictException('Category slug already exists');
      row.slug = nextSlug;
    }
    if (dto.name !== undefined) row.name = dto.name.trim();
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    if (dto.active !== undefined) row.active = dto.active;

    const saved = await this.categoryRepo.save(row);
    return plainToInstance(CategoryResDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: Uuid): Promise<void> {
    const row = await this.categoryRepo.findOneBy({ id });
    if (!row) throw new NotFoundException('Category not found');
    row.active = false;
    await this.categoryRepo.save(row);
  }

  async findByIdOrThrow(id: Uuid): Promise<CategoryEntity> {
    const row = await this.categoryRepo.findOneBy({ id });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  /** Resolves legacy free-text or slug string to a category row (normalized slug matches DB). */
  async findBySlugKeyOrThrow(raw: string): Promise<CategoryEntity> {
    const slug =
      slugify(raw.trim() || 'other', {
        lower: true,
        strict: true,
        locale: 'vi',
      }) || 'other';
    const row = await this.categoryRepo.findOne({ where: { slug } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }
}
