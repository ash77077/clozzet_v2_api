import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductionNormsService } from './production-norms.service';
import { CreateProductionNormDto } from './dto/create-production-norm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('production-norms')
export class ProductionNormsController {
  constructor(private readonly service: ProductionNormsService) {}

  @Get()
  findAll(@Query('clothTypeId') clothTypeId?: string) {
    if (clothTypeId) return this.service.findByClothType(clothTypeId);
    return [];
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Query('clothTypeId') clothTypeId?: string) {
    if (clothTypeId) return this.service.findByClothTypeAdmin(clothTypeId);
    return [];
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductionNormDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductionNormDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
