import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WeddingGuestsService } from './wedding-guests.service';
import { CreateWeddingGuestDto } from './dto/create-wedding-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('wedding-guests')
export class WeddingGuestsController {
  constructor(private readonly service: WeddingGuestsService) {}

  @Post()
  create(@Body() dto: CreateWeddingGuestDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.service.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getStats() {
    return this.service.getStats();
  }
}
