import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DealStageHistoryService } from './deal-stage-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';

@Controller('deal-stage-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class DealStageHistoryController {
  constructor(private readonly historyService: DealStageHistoryService) {}

  @Get()
  findByDeal(@Query('dealId') dealId?: string) {
    if (!dealId) {
      throw new BadRequestException('dealId query parameter is required');
    }
    return this.historyService.findByDeal(dealId);
  }
}
