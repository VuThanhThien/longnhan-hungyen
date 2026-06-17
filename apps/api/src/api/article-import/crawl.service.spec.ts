const mockScrapeUrl = jest.fn();

jest.mock('@mendable/firecrawl-js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    scrapeUrl: mockScrapeUrl,
  })),
}));

import { AllConfigType } from '@/config/config.type';
import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CrawlService } from './crawl.service';

describe('CrawlService', () => {
  let service: CrawlService;

  beforeEach(async () => {
    mockScrapeUrl.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: keyof AllConfigType | string) => {
              if (key === 'articleImport.firecrawlApiKey') return 'fc-key';
              if (key === 'articleImport.timeoutMs') return 90_000;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get(CrawlService);
  });

  it('returns markdown and title on success', async () => {
    mockScrapeUrl.mockResolvedValue({
      success: true,
      markdown: '# Hello',
      metadata: { title: 'Source Title', ogImage: 'https://img.test/a.jpg' },
    });

    const result = await service.crawl('https://example.com/post');

    expect(result.markdown).toBe('# Hello');
    expect(result.title).toBe('Source Title');
    expect(result.metadata?.ogImage).toBe('https://img.test/a.jpg');
  });

  it('throws BadGatewayException when scrape fails', async () => {
    mockScrapeUrl.mockResolvedValue({ success: false });

    await expect(service.crawl('https://example.com/post')).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('throws BadGatewayException when markdown is empty', async () => {
    mockScrapeUrl.mockResolvedValue({ success: true, markdown: '   ' });

    await expect(service.crawl('https://example.com/post')).rejects.toThrow(
      BadGatewayException,
    );
  });
});
