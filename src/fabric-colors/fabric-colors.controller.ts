import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FabricColorsService } from './fabric-colors.service';
import { CreateFabricColorDto } from './dto/create-fabric-color.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('fabric-colors')
export class FabricColorsController {
  constructor(private readonly service: FabricColorsService) {}

  @Get()
  findAll(@Query('fabricTypeId') fabricTypeId?: string) {
    if (fabricTypeId) return this.service.findByFabric(fabricTypeId);
    return this.service.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Query('fabricTypeId') fabricTypeId?: string) {
    if (fabricTypeId) return this.service.findByFabricAdmin(fabricTypeId);
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateFabricColorDto) {
    return this.service.create(dto);
  }

  @Post('seed-defaults/:fabricTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  seedDefaults(@Param('fabricTypeId') fabricTypeId: string) {
    return this.service.seedDefaults(fabricTypeId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateFabricColorDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
