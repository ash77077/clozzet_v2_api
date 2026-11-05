import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClothTypesService } from './cloth-types.service';
import { CreateClothTypeDto } from './dto/create-cloth-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('cloth-types')
export class ClothTypesController {
  constructor(private readonly clothTypesService: ClothTypesService) {}

  // Public: active only, sorted by sortOrder
  @Get()
  findAll() {
    return this.clothTypesService.findAll();
  }

  // Admin only: all including inactive
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.clothTypesService.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateClothTypeDto) {
    return this.clothTypesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateClothTypeDto>) {
    return this.clothTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.clothTypesService.remove(id);
  }
}
