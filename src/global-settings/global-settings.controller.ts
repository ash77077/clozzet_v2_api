import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { UpdateGlobalSettingsDto } from './dto/update-global-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('global-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class GlobalSettingsController {
  constructor(private readonly service: GlobalSettingsService) {}

  @Get() get() { return this.service.get(); }
  @Patch() update(@Body() dto: UpdateGlobalSettingsDto) { return this.service.update(dto); }
}
