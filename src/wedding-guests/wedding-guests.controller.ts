import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WeddingGuestsService } from './wedding-guests.service';
import { CreateWeddingGuestDto } from './dto/create-wedding-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('wedding-guests')
export class WeddingGuestsController {
  constructor(private readonly service: WeddingGuestsService) {}

  // Public — guests submit RSVP without logging in
  @Post()
  create(@Body() dto: CreateWeddingGuestDto) {
    return this.service.create(dto);
  }

  // Admin only
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.service.getStats();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
