import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ArticleQueryReqDto } from './dto/article-query.req.dto';
import { ArticleResDto } from './dto/article.res.dto';
import { CreateArticleReqDto } from './dto/create-article.req.dto';
import { UpdateArticleReqDto } from './dto/update-article.req.dto';
import { ArticlesService } from './articles.service';

@ApiTags('articles')
@Controller({ path: 'articles', version: '1' })
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiPublic({ type: ArticleResDto, summary: 'List published articles', isPaginated: true })
  @Get()
  async findMany(@Query() dto: ArticleQueryReqDto): Promise<OffsetPaginatedDto<ArticleResDto>> {
    return this.articlesService.findMany(dto);
  }

  @ApiPublic({ type: ArticleResDto, summary: 'Get article by slug' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<ArticleResDto> {
    return this.articlesService.findBySlug(slug);
  }

  @ApiAuth({ type: ArticleResDto, summary: 'Create article (admin)', statusCode: 201 })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateArticleReqDto): Promise<ArticleResDto> {
    return this.articlesService.create(dto);
  }

  @ApiAuth({ type: ArticleResDto, summary: 'Update article (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateArticleReqDto,
  ): Promise<ArticleResDto> {
    return this.articlesService.update(id, dto);
  }

  @ApiAuth({ summary: 'Delete article (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: Uuid): Promise<void> {
    return this.articlesService.remove(id);
  }
}
