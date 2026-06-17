import { AllConfigType } from '@/config/config.type';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { ArticleFormatterService } from './article-formatter.service';
import { CrawlService } from './crawl.service';
import { ArticleImportPreviewReqDto } from './dto/article-import-preview.req.dto';
import { ArticleImportPreviewResDto } from './dto/article-import-preview.res.dto';
import { validateImportUrl } from './utils/validate-import-url.util';

@Injectable()
export class ArticleImportService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly crawlService: CrawlService,
    private readonly formatterService: ArticleFormatterService,
  ) {}

  async preview(
    dto: ArticleImportPreviewReqDto,
  ): Promise<ArticleImportPreviewResDto> {
    validateImportUrl(dto.url);
    this.assertConfigured();

    const start = Date.now();
    const crawl = await this.crawlService.crawl(dto.url);
    const formatted = await this.formatterService.format(dto.url, crawl);

    return plainToInstance(ArticleImportPreviewResDto, {
      sourceUrl: dto.url,
      ...formatted,
      crawlMeta: {
        crawledAt: new Date().toISOString(),
        loadTimeMs: Date.now() - start,
        sourceTitle: crawl.title,
      },
    });
  }

  private assertConfigured(): void {
    const firecrawlApiKey = this.configService.get(
      'articleImport.firecrawlApiKey',
      { infer: true },
    );
    const openaiApiKey = this.configService.get('articleImport.openaiApiKey', {
      infer: true,
    });

    if (!firecrawlApiKey || !openaiApiKey) {
      throw new ServiceUnavailableException(
        'Chức năng nhập URL chưa được cấu hình',
      );
    }
  }
}
