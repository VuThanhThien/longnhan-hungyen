import { Uuid } from '@/common/types/common.type';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateProductReviewReqDto } from './dto/create-product-review.req.dto';
import { ProductReviewQueryReqDto } from './dto/product-review-query.req.dto';
import {
  ProductReviewResDto,
  PublicProductReviewsListResDto,
} from './dto/product-review.res.dto';
import { UpdateProductReviewStatusReqDto } from './dto/update-product-review-status.req.dto';
import { ProductReviewStatus } from './entities/product-review.entity';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller({ path: '', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiPublic({
    type: ProductReviewResDto,
    summary: 'Create product review (verified delivered order only)',
    statusCode: 201,
  })
  @ApiParam({ name: 'productId', type: 'String' })
  @Post('products/:productId/reviews')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('productId', ParseUUIDPipe) productId: Uuid,
    @Body() dto: CreateProductReviewReqDto,
  ): Promise<ProductReviewResDto> {
    return this.reviewsService.createProductReview(productId, dto);
  }

  @ApiPublic({
    type: PublicProductReviewsListResDto,
    summary: 'List published product reviews (with aggregate)',
    statusCode: 200,
  })
  @ApiParam({ name: 'productId', type: 'String' })
  @Get('products/:productId/reviews')
  async listPublished(
    @Param('productId', ParseUUIDPipe) productId: Uuid,
    @Query() dto: ProductReviewQueryReqDto,
  ): Promise<PublicProductReviewsListResDto> {
    return this.reviewsService.listPublishedReviews(productId, dto);
  }

  @ApiAuth({ type: ProductReviewResDto, summary: 'List reviews (admin)' })
  @Get('reviews/admin')
  async listAdmin(
    @Query('status') status?: ProductReviewStatus,
  ): Promise<ProductReviewResDto[]> {
    return this.reviewsService.listAdminReviews(status);
  }

  @ApiAuth({
    type: ProductReviewResDto,
    summary: 'Update review status (admin)',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @Patch('reviews/admin/:id')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateProductReviewStatusReqDto,
  ): Promise<ProductReviewResDto> {
    return this.reviewsService.updateReviewStatus(id, dto);
  }
}
