const mockCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleFormatterService } from './article-formatter.service';

describe('ArticleFormatterService', () => {
  let service: ArticleFormatterService;
  let configGet: jest.Mock;

  beforeEach(async () => {
    mockCreate.mockReset();
    configGet = jest.fn((key: string) => {
      if (key === 'articleImport.openaiApiKey') return 'oa-key';
      if (key === 'articleImport.openaiModel') return 'gpt-4o-mini';
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleFormatterService,
        {
          provide: ConfigService,
          useValue: { get: configGet },
        },
      ],
    }).compile();

    service = module.get(ArticleFormatterService);
  });

  it('maps OpenAI JSON response to formatted article fields', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Tiêu đề',
              excerpt: 'Tóm tắt',
              contentHtml: '<p>Nội dung</p>',
              metaTitle: 'SEO',
              metaDescription: 'Mô tả',
              tags: ['long nhãn'],
              featuredImageUrl: 'https://img.test/b.jpg',
            }),
          },
        },
      ],
    });

    const result = await service.format('https://example.com/post', {
      markdown: '# Source',
      title: 'Source',
      metadata: { ogImage: 'https://img.test/a.jpg' },
    });

    expect(result.title).toBe('Tiêu đề');
    expect(result.excerpt).toBe('Tóm tắt');
    expect(result.contentHtml).toBe('<p>Nội dung</p>');
    expect(result.featuredImageUrl).toBe('https://img.test/b.jpg');
    expect(result.tags).toEqual(['long nhãn']);
  });

  it('throws ServiceUnavailableException when OpenAI key is missing', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'articleImport.openaiApiKey') return '';
      if (key === 'articleImport.openaiModel') return 'gpt-4o-mini';
      return undefined;
    });

    await expect(
      service.format('https://example.com/post', { markdown: '# Source' }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws BadGatewayException on OpenAI API error', async () => {
    mockCreate.mockRejectedValue(new Error('API down'));

    await expect(
      service.format('https://example.com/post', { markdown: '# Source' }),
    ).rejects.toThrow(BadGatewayException);
  });
});
