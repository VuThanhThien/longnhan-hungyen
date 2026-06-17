import { Test, TestingModule } from '@nestjs/testing';
import { ArticleImportController } from './article-import.controller';
import { ArticleImportService } from './article-import.service';

describe('ArticleImportController', () => {
  let controller: ArticleImportController;
  let service: { preview: jest.Mock };

  beforeEach(async () => {
    service = { preview: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleImportController],
      providers: [{ provide: ArticleImportService, useValue: service }],
    }).compile();

    controller = module.get(ArticleImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates preview to service', async () => {
    const dto = { url: 'https://example.com/post' };
    const response = { sourceUrl: dto.url, title: 'Test' };
    service.preview.mockResolvedValue(response);

    const result = await controller.preview(dto);

    expect(service.preview).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });
});
