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
import { FabricTypesService } from './fabric-types.service';
import { CreateFabricTypeDto } from './dto/create-fabric-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('fabric-types')
export class FabricTypesController {
  constructor(private readonly fabricTypesService: FabricTypesService) {}

  // Public: active only
  @Get()
  findAll() {
    return this.fabricTypesService.findAll();
  }

  // Admin only: all including inactive
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.fabricTypesService.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateFabricTypeDto) {
    return this.fabricTypesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateFabricTypeDto>) {
    return this.fabricTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.fabricTypesService.remove(id);
  }
}
