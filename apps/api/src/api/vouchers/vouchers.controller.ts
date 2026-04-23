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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CreateVoucherReqDto } from './dto/create-voucher.req.dto';
import { UpdateVoucherReqDto } from './dto/update-voucher.req.dto';
import { ValidateVoucherReqDto } from './dto/validate-voucher.req.dto';
import { ValidateVoucherResDto } from './dto/validate-voucher.res.dto';
import { VoucherUsageQueryReqDto } from './dto/voucher-usage-query.req.dto';
import { VoucherUsageResDto } from './dto/voucher-usage.res.dto';
import { VoucherResDto } from './dto/voucher.res.dto';
import { VouchersService } from './vouchers.service';

@ApiTags('vouchers')
@Controller({ path: 'vouchers', version: '1' })
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  // ─── Public ──────────────────────────────────────────────────────────────────

  @ApiPublic({
    type: ValidateVoucherResDto,
    summary: 'Validate voucher code (public)',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(
    @Body() dto: ValidateVoucherReqDto,
  ): Promise<ValidateVoucherResDto> {
    return this.vouchersService.validate(dto);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────────

  @ApiAuth({
    type: VoucherResDto,
    summary: 'List all vouchers (admin)',
    isPaginated: false,
  })
  @Get()
  async findMany(): Promise<VoucherResDto[]> {
    return this.vouchersService.findMany();
  }

  @ApiAuth({ type: VoucherResDto, summary: 'Get voucher by id (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: Uuid): Promise<VoucherResDto> {
    return this.vouchersService.findOne(id);
  }

  @ApiAuth({
    type: VoucherResDto,
    summary: 'Create voucher (admin)',
    statusCode: 201,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVoucherReqDto): Promise<VoucherResDto> {
    return this.vouchersService.create(dto);
  }

  @ApiAuth({ type: VoucherResDto, summary: 'Update voucher (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() dto: UpdateVoucherReqDto,
  ): Promise<VoucherResDto> {
    return this.vouchersService.update(id, dto);
  }

  @ApiAuth({ summary: 'Delete voucher (admin); deactivates if used' })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: Uuid): Promise<void> {
    return this.vouchersService.remove(id);
  }

  @ApiAuth({
    type: VoucherUsageResDto,
    summary: 'Get voucher usage history (admin)',
    isPaginated: true,
  })
  @ApiParam({ name: 'id', type: 'String' })
  @Get(':id/usages')
  async findUsages(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Query() query: VoucherUsageQueryReqDto,
  ): Promise<OffsetPaginatedDto<VoucherUsageResDto>> {
    return this.vouchersService.findUsages(id, query);
  }
}
