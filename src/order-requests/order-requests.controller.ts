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
import { OrderRequestsService } from './order-requests.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { AdminReviewOrderRequestDto } from './dto/admin-review-order-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';

@Controller('order-requests')
@UseGuards(JwtAuthGuard)
export class OrderRequestsController {
  constructor(private readonly orderRequestsService: OrderRequestsService) {}

  /**
   * POST /order-requests — Manager creates a new order request
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  async create(
    @Body() dto: CreateOrderRequestDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const data = await this.orderRequestsService.create(dto, currentUser);
    return { success: true, message: 'Order request created successfully', data };
  }

  /**
   * GET /order-requests/my-requests — Manager views their own order requests
   */
  @Get('my-requests')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  async findMyRequests(@CurrentUser() currentUser: CurrentUserType) {
    const data = await this.orderRequestsService.findMyRequests(currentUser);
    return { success: true, message: 'Your order requests retrieved successfully', data };
  }

  /**
   * GET /order-requests/pending — Admin views all pending order requests
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findPending() {
    const data = await this.orderRequestsService.findPending();
    return { success: true, message: 'Pending order requests retrieved successfully', data };
  }

  /**
   * GET /order-requests — Admin views all order requests
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    const data = await this.orderRequestsService.findAll();
    return { success: true, message: 'All order requests retrieved successfully', data };
  }

  /**
   * GET /order-requests/:id — View a single order request
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.orderRequestsService.findOne(id);
    return { success: true, message: 'Order request retrieved successfully', data };
  }

  /**
   * PATCH /order-requests/:id/review — Admin reviews and approves/rejects an order request
   */
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async reviewOrderRequest(
    @Param('id') id: string,
    @Body() dto: AdminReviewOrderRequestDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const data = await this.orderRequestsService.reviewOrderRequest(id, dto, currentUser);
    return { success: true, message: 'Order request reviewed successfully', data };
  }

  /**
   * DELETE /order-requests/:id — Admin deletes an order request
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.orderRequestsService.remove(id);
    return { success: true, message: 'Order request deleted successfully', data: null };
  }
}
