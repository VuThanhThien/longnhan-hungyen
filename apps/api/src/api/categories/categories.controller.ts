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
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryResDto } from './dto/category.res.dto';
import { CreateCategoryReqDto } from './dto/create-category.req.dto';
import { UpdateCategoryReqDto } from './dto/update-category.req.dto';

@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiPublic({
    type: CategoryResDto,
    summary: 'List active categories (ordered)',
    isPaginated: false,
  })
  @Get()
  async findMany(): Promise<CategoryResDto[]> {
    return this.categoriesService.findManyPublic();
  }

  @ApiAuth({
    type: CategoryResDto,
    summary: 'List all categories (admin)',
    isPaginated: false,
  })
  @Get('admin')
  async findManyAdmin(): Promise<CategoryResDto[]> {
    return this.categoriesService.findManyAdmin();
  }

  @ApiAuth({
    type: CategoryResDto,
    summary: 'Create category',
    statusCode: 201,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryReqDto): Promise<CategoryResDto> {
    return this.categoriesService.create(dto);
  }

  @ApiAuth({ type: CategoryResDto, summary: 'Update category' })
  @ApiParam({ name: 'id', type: 'String' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateCategoryReqDto,
  ): Promise<CategoryResDto> {
    return this.categoriesService.update(id, dto);
  }

  @ApiAuth({ summary: 'Deactivate category (soft delete)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: Uuid): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
