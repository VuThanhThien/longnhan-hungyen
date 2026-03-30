import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ArticleStatus } from '../entities/article.entity';

export class ArticleResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiPropertyOptional()
  @Expose()
  excerpt: string | null;

  @ApiPropertyOptional()
  @Expose()
  contentHtml: string | null;

  @ApiPropertyOptional()
  @Expose()
  featuredImageUrl: string | null;

  @ApiPropertyOptional()
  @Expose()
  metaTitle: string | null;

  @ApiPropertyOptional()
  @Expose()
  metaDescription: string | null;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  tags: string[];

  @ApiProperty({ enum: ArticleStatus })
  @Expose()
  status!: ArticleStatus;

  @ApiPropertyOptional()
  @Expose()
  publishedAt: Date | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
