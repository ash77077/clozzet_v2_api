import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LostReasonsService } from './lost-reasons.service';
import { CreateLostReasonDto } from './dto/create-lost-reason.dto';
import { UpdateLostReasonDto } from './dto/update-lost-reason.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';

@Controller('lost-reasons')
export class LostReasonsController {
  constructor(private readonly lostReasonsService: LostReasonsService) {}

  // Public: all reasons for selection UI
  @Get()
  findAll() {
    return this.lostReasonsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateLostReasonDto) {
    return this.lostReasonsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLostReasonDto) {
    return this.lostReasonsService.update(id, dto);
  }
}
