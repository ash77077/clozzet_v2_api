import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConsumptionTemplatesService } from './consumption-templates.service';
import { CreateConsumptionTemplateDto } from './dto/create-consumption-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('consumption-templates')
export class ConsumptionTemplatesController {
  constructor(
    private readonly consumptionTemplatesService: ConsumptionTemplatesService,
  ) {}

  // Public: optionally filter by clothTypeId
  @Get()
  findAll(@Query('clothTypeId') clothTypeId?: string) {
    if (clothTypeId) {
      return this.consumptionTemplatesService.findByClothType(clothTypeId);
    }
    return this.consumptionTemplatesService.findAll();
  }

  // Admin only: all templates (including inactive)
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.consumptionTemplatesService.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateConsumptionTemplateDto) {
    return this.consumptionTemplatesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateConsumptionTemplateDto>,
  ) {
    return this.consumptionTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.consumptionTemplatesService.remove(id);
  }
}
