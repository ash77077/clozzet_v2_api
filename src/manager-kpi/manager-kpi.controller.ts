import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ManagerKpiService } from './manager-kpi.service';
import { SetGoalDto, SetGoalForAllDto } from './dto/set-goal.dto';

@Controller('manager-kpi')
export class ManagerKpiController {
  constructor(private readonly kpiService: ManagerKpiService) {}

  // GET /manager-kpi/managers  — list of manager users
  @Get('managers')
  getManagers() {
    return this.kpiService.getManagers();
  }

  // GET /manager-kpi/tiers
  @Get('tiers')
  getTiers() {
    return this.kpiService.getTiers();
  }

  // GET /manager-kpi/goals
  @Get('goals')
  getAllGoals() {
    return this.kpiService.getAllGoals();
  }

  // POST /manager-kpi/goals/bulk
  @Post('goals/bulk')
  setGoalForAll(@Body() dto: SetGoalForAllDto) {
    return this.kpiService.setGoalForAll(dto);
  }

  // POST /manager-kpi/goals
  @Post('goals')
  setGoal(@Body() dto: SetGoalDto) {
    return this.kpiService.setGoal(dto);
  }

  // GET /manager-kpi/monthly?year=2026&month=7  — all managers
  @Get('monthly')
  getAllMonthly(
    @Query('year')  year:  string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year)  || new Date().getFullYear();
    const m = isNaN(parseInt(month)) ? new Date().getMonth() : parseInt(month);
    return this.kpiService.getAllManagersMonthlyKpi(y, m);
  }

  // GET /manager-kpi/monthly/:userId?year=2026&month=7
  @Get('monthly/:userId')
  getMonthly(
    @Param('userId')  userId: string,
    @Query('year')    year:   string,
    @Query('month')   month:  string,
  ) {
    const y = parseInt(year)  || new Date().getFullYear();
    const m = isNaN(parseInt(month)) ? new Date().getMonth() : parseInt(month);
    return this.kpiService.getMonthlyKpi(userId, y, m);
  }
}
