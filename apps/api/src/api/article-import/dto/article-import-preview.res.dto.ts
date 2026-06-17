import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ArticleImportCrawlMetaResDto {
  @ApiProperty()
  @Expose()
  crawledAt!: string;

  @ApiProperty()
  @Expose()
  loadTimeMs!: number;

  @ApiPropertyOptional()
  @Expose()
  sourceTitle?: string;
}

export class ArticleImportPreviewResDto {
  @ApiProperty()
  @Expose()
  sourceUrl!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  excerpt!: string;

  @ApiProperty()
  @Expose()
  contentHtml!: string;

  @ApiPropertyOptional()
  @Expose()
  featuredImageUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  metaTitle?: string;

  @ApiPropertyOptional()
  @Expose()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  tags?: string[];

  @ApiProperty({ type: ArticleImportCrawlMetaResDto })
  @Expose()
  @Type(() => ArticleImportCrawlMetaResDto)
  crawlMeta!: ArticleImportCrawlMetaResDto;
}
