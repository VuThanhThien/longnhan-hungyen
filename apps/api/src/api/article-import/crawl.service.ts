import { AllConfigType } from '@/config/config.type';
import FirecrawlApp from '@mendable/firecrawl-js';
import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CrawlResult } from './types/crawl-result.type';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async crawl(url: string): Promise<CrawlResult> {
    const apiKey = this.configService.get('articleImport.firecrawlApiKey', {
      infer: true,
    });
    const timeoutMs = this.configService.get('articleImport.timeoutMs', {
      infer: true,
    })!;

    const crawlPromise = this.scrapeWithFirecrawl(url, apiKey!);
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new GatewayTimeoutException(
            'Quá thời gian chờ — thử lại hoặc URL khác',
          ),
        );
      }, timeoutMs);
      timeoutId.unref?.();
    });

    try {
      return await Promise.race([crawlPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
  }

  private async scrapeWithFirecrawl(
    url: string,
    apiKey: string,
  ): Promise<CrawlResult> {
    const start = Date.now();

    try {
      const client = new FirecrawlApp({ apiKey });
      const response = await client.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      });

      if (!response.success) {
        this.logger.warn(`Firecrawl scrape failed for ${url}`);
        throw new BadGatewayException('Không thể tải trang nguồn');
      }

      const markdown = response.markdown?.trim() ?? '';
      if (!markdown) {
        throw new BadGatewayException('Không thể tải trang nguồn');
      }

      const metadata = response.metadata as
        | { ogImage?: string; title?: string }
        | undefined;

      this.logger.debug(`Crawled ${url} in ${Date.now() - start}ms`);

      return {
        title: metadata?.title ?? response.title,
        markdown,
        html: response.html,
        metadata: {
          ogImage:
            metadata?.ogImage ??
            (response.metadata as { ogImage?: string } | undefined)?.ogImage,
        },
      };
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof GatewayTimeoutException
      ) {
        throw error;
      }

      this.logger.error(`Firecrawl error for ${url}`, error);
      throw new BadGatewayException('Không thể tải trang nguồn');
    }
  }
}
