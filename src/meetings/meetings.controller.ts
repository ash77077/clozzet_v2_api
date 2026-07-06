import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';
import { MeetingStatus } from './schemas/meeting.schema';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() dto: CreateMeetingDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const data = await this.meetingsService.create(dto, currentUser.userId);
    return { success: true, message: 'Meeting created successfully', data };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll() {
    const data = await this.meetingsService.findAll();
    return { success: true, message: 'Meetings retrieved successfully', data };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findOne(@Param('id') id: string) {
    const data = await this.meetingsService.findById(id);
    return { success: true, message: 'Meeting retrieved successfully', data };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(@Param('id') id: string, @Body() updateData: Partial<CreateMeetingDto>) {
    const data = await this.meetingsService.update(id, updateData);
    return { success: true, message: 'Meeting updated successfully', data };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateStatus(@Param('id') id: string, @Body('status') status: MeetingStatus) {
    const data = await this.meetingsService.updateStatus(id, status);
    return { success: true, message: 'Meeting status updated', data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async delete(@Param('id') id: string) {
    await this.meetingsService.delete(id);
    return { success: true, message: 'Meeting deleted successfully' };
  }
}
