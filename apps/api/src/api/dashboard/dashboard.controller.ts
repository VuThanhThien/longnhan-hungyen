import { ApiAuth } from '@/decorators/http.decorators';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsResDto } from './dto/dashboard-stats.res.dto';

const VALID_PERIODS = ['today', 'week', 'month', 'all'] as const;
type StatsPeriod = (typeof VALID_PERIODS)[number];

@ApiTags('dashboard')
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiAuth({
    type: DashboardStatsResDto,
    summary: 'Get dashboard stats (admin)',
  })
  @ApiQuery({ name: 'period', enum: VALID_PERIODS, required: false })
  @Get('stats')
  async getStats(
    @Query('period') period?: string,
  ): Promise<DashboardStatsResDto> {
    const resolved = (period ?? 'month') as StatsPeriod;
    if (period && !VALID_PERIODS.includes(resolved)) {
      throw new BadRequestException(
        `period must be one of: ${VALID_PERIODS.join(', ')}`,
      );
    }
    return this.dashboardService.getStats(resolved);
  }
}
