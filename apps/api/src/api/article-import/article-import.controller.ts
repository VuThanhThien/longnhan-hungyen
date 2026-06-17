import { ApiAuth } from '@/decorators/http.decorators';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticleImportService } from './article-import.service';
import { ArticleImportPreviewReqDto } from './dto/article-import-preview.req.dto';
import { ArticleImportPreviewResDto } from './dto/article-import-preview.res.dto';

@ApiTags('article-import')
@Controller({ path: 'article-import', version: '1' })
export class ArticleImportController {
  constructor(private readonly articleImportService: ArticleImportService) {}

  @ApiAuth({
    type: ArticleImportPreviewResDto,
    summary: 'Preview article import from URL',
  })
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async preview(
    @Body() dto: ArticleImportPreviewReqDto,
  ): Promise<ArticleImportPreviewResDto> {
    return this.articleImportService.preview(dto);
  }
}
