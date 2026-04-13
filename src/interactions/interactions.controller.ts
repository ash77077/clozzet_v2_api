import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  /**
   * POST /interactions - Log a new interaction (call/message)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createInteractionDto: CreateInteractionDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const data = await this.interactionsService.create(
      createInteractionDto,
      currentUser.userId,
    );
    return { success: true, message: 'Interaction logged successfully', data };
  }

  /**
   * GET /interactions - Get all interactions
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll() {
    const data = await this.interactionsService.findAll();
    return { success: true, message: 'Interactions retrieved successfully', data };
  }

  /**
   * GET /interactions/follow-ups/pending - Get pending follow-ups
   */
  @Get('follow-ups/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findPendingFollowUps() {
    const data = await this.interactionsService.findPendingFollowUps();
    return { success: true, message: 'Pending follow-ups retrieved successfully', data };
  }

  /**
   * GET /interactions/customer/:customerId - Get interaction history for a customer
   * This is the key endpoint for the timeline view
   */
  @Get('customer/:customerId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findByCustomer(@Param('customerId') customerId: string) {
    const data = await this.interactionsService.findByCustomer(customerId);
    return { success: true, message: 'Customer interaction history retrieved successfully', data };
  }

  /**
   * GET /interactions/:id - Get a single interaction
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findOne(@Param('id') id: string) {
    const data = await this.interactionsService.findById(id);
    return { success: true, message: 'Interaction retrieved successfully', data };
  }

  /**
   * PATCH /interactions/:id - Update an interaction
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(@Param('id') id: string, @Body() updateData: any) {
    const data = await this.interactionsService.update(id, updateData);
    return { success: true, message: 'Interaction updated successfully', data };
  }

  /**
   * PATCH /interactions/:id/complete - Mark follow-up as completed
   */
  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async markFollowUpCompleted(@Param('id') id: string) {
    const data = await this.interactionsService.markFollowUpCompleted(id);
    return { success: true, message: 'Follow-up marked as completed', data };
  }
}
