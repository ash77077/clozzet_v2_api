import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get() findAll() { return this.service.findAllAdmin(); }
  @Post() create(@Body() dto: CreateSupplierDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateSupplierDto>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
