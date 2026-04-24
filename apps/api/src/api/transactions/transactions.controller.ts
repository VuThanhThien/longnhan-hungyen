import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { CreateTransactionReqDto } from './dto/create-transaction.req.dto';
import { TransactionQueryReqDto } from './dto/transaction-query.req.dto';
import { TransactionResDto } from './dto/transaction.res.dto';
import { UpdateTransactionReqDto } from './dto/update-transaction.req.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller({ version: '1' })
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @ApiAuth({ type: TransactionResDto, summary: 'Create transaction (admin)' })
  @ApiParam({ name: 'orderId', type: 'String' })
  @Post('orders/:orderId/transactions')
  async create(
    @Param('orderId', ParseUUIDPipe) orderId: Uuid,
    @Body() dto: CreateTransactionReqDto,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<TransactionResDto> {
    return this.txService.create(orderId, dto, (user?.id as Uuid) ?? null);
  }

  @ApiAuth({
    type: TransactionResDto,
    summary: 'List transactions for an order (admin)',
  })
  @ApiParam({ name: 'orderId', type: 'String' })
  @Get('orders/:orderId/transactions')
  async findByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: Uuid,
  ): Promise<TransactionResDto[]> {
    return this.txService.findByOrder(orderId);
  }

  @ApiAuth({
    type: TransactionResDto,
    summary: 'List all transactions (admin)',
    isPaginated: true,
  })
  @Get('transactions')
  async findAll(
    @Query() dto: TransactionQueryReqDto,
  ): Promise<OffsetPaginatedDto<TransactionResDto>> {
    return this.txService.findAll(dto);
  }

  @ApiAuth({ type: TransactionResDto, summary: 'Update transaction (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Patch('transactions/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateTransactionReqDto,
  ): Promise<TransactionResDto> {
    return this.txService.update(id, dto);
  }
}
