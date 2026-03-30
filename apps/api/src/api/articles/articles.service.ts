import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { paginate } from '@/utils/offset-pagination';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { ArticleQueryReqDto } from './dto/article-query.req.dto';
import { ArticleResDto } from './dto/article.res.dto';
import { CreateArticleReqDto } from './dto/create-article.req.dto';
import { UpdateArticleReqDto } from './dto/update-article.req.dto';
import { ArticleEntity, ArticleStatus } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
  ) {}

  /** Public: list published articles (no contentHtml for performance) */
  async findMany(dto: ArticleQueryReqDto): Promise<OffsetPaginatedDto<ArticleResDto>> {
    const qb = this.articleRepo
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.title',
        'article.slug',
        'article.excerpt',
        'article.featuredImageUrl',
        'article.metaTitle',
        'article.metaDescription',
        'article.tags',
        'article.status',
        'article.publishedAt',
        'article.createdAt',
        'article.updatedAt',
      ])
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .orderBy('article.publishedAt', 'DESC');

    if (dto.tag) {
      qb.andWhere(':tag = ANY(article.tags)', { tag: dto.tag });
    }
    if (dto.q) {
      qb.andWhere('article.title ILIKE :q', { q: `%${dto.q}%` });
    }

    const [articles, meta] = await paginate(qb, dto, { skipCount: false, takeAll: false });
    return new OffsetPaginatedDto(
      plainToInstance(ArticleResDto, articles, { excludeExtraneousValues: true }),
      meta,
    );
  }

  /** Public: full article by slug */
  async findBySlug(slug: string): Promise<ArticleResDto> {
    const article = await this.articleRepo.findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
    });
    if (!article) throw new NotFoundException('Article not found');
    return plainToInstance(ArticleResDto, article, { excludeExtraneousValues: true });
  }

  /** Admin: create article */
  async create(dto: CreateArticleReqDto): Promise<ArticleResDto> {
    const slug = await this.generateUniqueSlug(dto.title);
    const isPublished = dto.published === true;
    const article = this.articleRepo.create({
      title: dto.title,
      slug,
      excerpt: dto.excerpt ?? null,
      contentHtml: dto.contentHtml,
      featuredImageUrl: dto.featuredImageUrl ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      tags: dto.tags ?? [],
      status: isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
      publishedAt: isPublished ? new Date() : null,
    });
    const saved = await this.articleRepo.save(article);
    return plainToInstance(ArticleResDto, saved, { excludeExtraneousValues: true });
  }

  /** Admin: update article */
  async update(id: Uuid, dto: UpdateArticleReqDto): Promise<ArticleResDto> {
    const article = await this.articleRepo.findOneBy({ id });
    if (!article) throw new NotFoundException('Article not found');

    if (dto.title && dto.title !== article.title) {
      article.slug = await this.generateUniqueSlug(dto.title, id);
    }

    // Handle publish/unpublish
    if (dto.published === true && article.status !== ArticleStatus.PUBLISHED) {
      article.status = ArticleStatus.PUBLISHED;
      // Always set a fresh publishedAt when explicitly publishing
      article.publishedAt = new Date();
    } else if (dto.published === false) {
      article.status = ArticleStatus.DRAFT;
      // Clear publishedAt so re-publishing later gets a fresh timestamp
      article.publishedAt = null;
    }

    Object.assign(article, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
      ...(dto.contentHtml !== undefined && { contentHtml: dto.contentHtml }),
      ...(dto.featuredImageUrl !== undefined && { featuredImageUrl: dto.featuredImageUrl }),
      ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
      ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
    });

    const saved = await this.articleRepo.save(article);
    return plainToInstance(ArticleResDto, saved, { excludeExtraneousValues: true });
  }

  /** Admin: delete article */
  async remove(id: Uuid): Promise<void> {
    const article = await this.articleRepo.findOneBy({ id });
    if (!article) throw new NotFoundException('Article not found');
    await this.articleRepo.remove(article);
  }

  private async generateUniqueSlug(title: string, excludeId?: Uuid): Promise<string> {
    const base = slugify(title, { lower: true, strict: true, locale: 'vi' });
    let slug = base;
    let counter = 1;
    while (true) {
      const qb = this.articleRepo.createQueryBuilder('a').where('a.slug = :slug', { slug });
      if (excludeId) qb.andWhere('a.id != :id', { id: excludeId });
      const exists = await qb.getOne();
      if (!exists) break;
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
