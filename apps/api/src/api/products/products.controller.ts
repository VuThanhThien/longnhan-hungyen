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
import { CreateProductReqDto } from './dto/create-product.req.dto';
import { CreateProductVariantReqDto } from './dto/create-product-variant.req.dto';
import { ProductQueryReqDto } from './dto/product-query.req.dto';
import { ProductResDto } from './dto/product.res.dto';
import { UpdateProductVariantReqDto } from './dto/update-product-variant.req.dto';
import { UpdateProductReqDto } from './dto/update-product.req.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiPublic({
    type: ProductResDto,
    summary: 'List active products',
    isPaginated: true,
  })
  @Get()
  async findMany(
    @Query() dto: ProductQueryReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    return this.productsService.findMany(dto);
  }

  @ApiAuth({
    type: ProductResDto,
    summary: 'List products for admin',
    isPaginated: true,
  })
  @Get('admin')
  async findManyAdmin(
    @Query() dto: ProductQueryReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    return this.productsService.findMany(dto, { includeInactive: true });
  }

  @ApiPublic({ type: ProductResDto, summary: 'Get product by slug' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<ProductResDto> {
    return this.productsService.findBySlug(slug);
  }

  @ApiAuth({ type: ProductResDto, summary: 'Get product by id (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Get('admin/:id')
  async findById(@Param('id', ParseUUIDPipe) id: Uuid): Promise<ProductResDto> {
    return this.productsService.findById(id);
  }

  @ApiAuth({ type: ProductResDto, summary: 'Create product', statusCode: 201 })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductReqDto): Promise<ProductResDto> {
    return this.productsService.create(dto);
  }

  @ApiAuth({ type: ProductResDto, summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'String' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateProductReqDto,
  ): Promise<ProductResDto> {
    return this.productsService.update(id, dto);
  }

  @ApiAuth({ type: ProductResDto, summary: 'Update a product variant (admin)' })
  @ApiParam({ name: 'productId', type: 'String' })
  @ApiParam({ name: 'variantId', type: 'String' })
  @Put(':productId/variants/:variantId')
  async updateVariant(
    @Param('productId', ParseUUIDPipe) productId: Uuid,
    @Param('variantId', ParseUUIDPipe) variantId: Uuid,
    @Body() dto: UpdateProductVariantReqDto,
  ): Promise<ProductResDto> {
    return this.productsService.updateVariant(productId, variantId, dto);
  }

  @ApiAuth({ type: ProductResDto, summary: 'Create a product variant (admin)' })
  @ApiParam({ name: 'productId', type: 'String' })
  @Post(':productId/variants')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('productId', ParseUUIDPipe) productId: Uuid,
    @Body() dto: CreateProductVariantReqDto,
  ): Promise<ProductResDto> {
    return this.productsService.createVariant(productId, dto);
  }

  @ApiAuth({ type: ProductResDto, summary: 'Delete a product variant (admin)' })
  @ApiParam({ name: 'productId', type: 'String' })
  @ApiParam({ name: 'variantId', type: 'String' })
  @Delete(':productId/variants/:variantId')
  async deleteVariant(
    @Param('productId', ParseUUIDPipe) productId: Uuid,
    @Param('variantId', ParseUUIDPipe) variantId: Uuid,
  ): Promise<ProductResDto> {
    return this.productsService.deleteVariant(productId, variantId);
  }

  @ApiAuth({ summary: 'Soft delete product (set active=false)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: Uuid): Promise<void> {
    return this.productsService.remove(id);
  }
}
