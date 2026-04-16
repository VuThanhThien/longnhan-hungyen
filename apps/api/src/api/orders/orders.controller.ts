import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
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
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CreateOrderReqDto } from './dto/create-order.req.dto';
import { OrderQueryReqDto } from './dto/order-query.req.dto';
import { OrderResDto } from './dto/order.res.dto';
import { PublicOrderSummaryResDto } from './dto/public-order-summary.res.dto';
import { UpdateOrderStatusReqDto } from './dto/update-order-status.req.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiPublic({
    type: OrderResDto,
    summary: 'Create order (customer)',
    statusCode: 201,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderReqDto): Promise<OrderResDto> {
    return this.ordersService.create(dto);
  }

  @ApiPublic({
    type: PublicOrderSummaryResDto,
    summary: 'Public order summary by code (guest)',
    statusCode: 200,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getPublicSummary(
    @Query('code') code: string,
  ): Promise<PublicOrderSummaryResDto> {
    return this.ordersService.lookupByCode(code);
  }

  @ApiPublic({
    type: PublicOrderSummaryResDto,
    summary: 'Track order by magic token (single-use)',
    statusCode: 200,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get('track-by-token')
  @HttpCode(HttpStatus.OK)
  async trackByToken(
    @Query('t') token: string,
  ): Promise<PublicOrderSummaryResDto> {
    return this.ordersService.trackByToken(token);
  }

  @ApiAuth({
    type: OrderResDto,
    summary: 'List orders (admin)',
    isPaginated: true,
  })
  @Get()
  async findMany(
    @Query() dto: OrderQueryReqDto,
  ): Promise<OffsetPaginatedDto<OrderResDto>> {
    return this.ordersService.findMany(dto);
  }

  @ApiAuth({ type: OrderResDto, summary: 'Get order by id (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: Uuid): Promise<OrderResDto> {
    return this.ordersService.findOne(id);
  }

  @ApiAuth({
    type: OrderResDto,
    summary: 'Update order/payment status (admin)',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateOrderStatusReqDto,
  ): Promise<OrderResDto> {
    return this.ordersService.updateStatus(id, dto);
  }
}
