import { Controller, Get, UseGuards } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';

@Controller('migration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Get('dry-run')
  dryRun() {
    return this.migrationService.dryRun();
  }
}
