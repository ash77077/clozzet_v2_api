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
import { B2BOrdersService } from './b2b-orders.service';
import { CreateB2BOrderDto } from './dto/create-b2b-order.dto';
import { UpdateB2BOrderStatusDto } from './dto/update-b2b-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';

@Controller('b2b-orders')
@UseGuards(JwtAuthGuard)
export class B2BOrdersController {
  constructor(private readonly b2bOrdersService: B2BOrdersService) {}

  /** POST /b2b-orders — authenticated user submits an order for their company. */
  @Post()
  async create(
    @Body() dto: CreateB2BOrderDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const data = await this.b2bOrdersService.create(dto, currentUser);
    return { success: true, message: 'Order created successfully', data };
  }

  /** GET /b2b-orders/my-orders — returns orders for the logged-in user's company (JWT-secured). */
  @Get('my-orders')
  async findMyOrders(@CurrentUser() currentUser: CurrentUserType) {
    const data = await this.b2bOrdersService.findMyOrders(currentUser);
    return { success: true, message: 'Orders retrieved successfully', data };
  }

  /** GET /b2b-orders — admin: returns all orders across all companies. */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    const data = await this.b2bOrdersService.findAll();
    return { success: true, message: 'All orders retrieved successfully', data };
  }

  /** GET /b2b-orders/:id */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.b2bOrdersService.findOne(id);
    return { success: true, message: 'Order retrieved successfully', data };
  }

  /** PATCH /b2b-orders/:id/status — update order status (admin/manager). */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateB2BOrderStatusDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const data = await this.b2bOrdersService.updateStatus(id, dto, currentUser);
    return { success: true, message: 'Order status updated successfully', data };
  }

  /** DELETE /b2b-orders/:id — admin only. */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.b2bOrdersService.remove(id);
    return { success: true, message: 'Order deleted successfully', data: null };
  }
}
