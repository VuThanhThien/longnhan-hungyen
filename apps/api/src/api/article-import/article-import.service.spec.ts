import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleFormatterService } from './article-formatter.service';
import { ArticleImportService } from './article-import.service';
import { CrawlService } from './crawl.service';

describe('ArticleImportService', () => {
  let service: ArticleImportService;
  let crawlService: { crawl: jest.Mock };
  let formatterService: { format: jest.Mock };
  let configGet: jest.Mock;

  beforeEach(async () => {
    crawlService = { crawl: jest.fn() };
    formatterService = { format: jest.fn() };
    configGet = jest.fn((key: string) => {
      if (key === 'articleImport.firecrawlApiKey') return 'fc-key';
      if (key === 'articleImport.openaiApiKey') return 'oa-key';
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleImportService,
        { provide: ConfigService, useValue: { get: configGet } },
        { provide: CrawlService, useValue: crawlService },
        { provide: ArticleFormatterService, useValue: formatterService },
      ],
    }).compile();

    service = module.get(ArticleImportService);
  });

  it('returns preview DTO with crawlMeta on happy path', async () => {
    crawlService.crawl.mockResolvedValue({
      title: 'Source',
      markdown: '# Hello',
    });
    formatterService.format.mockResolvedValue({
      title: 'Tiêu đề',
      excerpt: 'Tóm tắt',
      contentHtml: '<p>Nội dung</p>',
      tags: ['tag'],
    });

    const result = await service.preview({
      url: 'https://example.com/post',
    });

    expect(result.sourceUrl).toBe('https://example.com/post');
    expect(result.title).toBe('Tiêu đề');
    expect(result.crawlMeta.sourceTitle).toBe('Source');
    expect(result.crawlMeta.loadTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.crawlMeta.crawledAt).toBeDefined();
  });

  it('throws 503 when firecrawl key is missing', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'articleImport.firecrawlApiKey') return '';
      if (key === 'articleImport.openaiApiKey') return 'oa-key';
      return undefined;
    });

    await expect(
      service.preview({ url: 'https://example.com/post' }),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
