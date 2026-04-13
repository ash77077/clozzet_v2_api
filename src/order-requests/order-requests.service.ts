import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderRequest, OrderRequestStatus } from './schemas/order-request.schema';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { AdminReviewOrderRequestDto } from './dto/admin-review-order-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';

@Injectable()
export class OrderRequestsService {
  constructor(
    @InjectModel(OrderRequest.name)
    private readonly orderRequestModel: Model<OrderRequest>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Manager creates a new order request
   */
  async create(dto: CreateOrderRequestDto, currentUser: CurrentUserType): Promise<OrderRequest> {
    // Validate that totalAmount matches quantity * unitSellingPrice
    const expectedTotal = dto.quantity * dto.unitSellingPrice;
    if (Math.abs(dto.totalAmount - expectedTotal) > 0.01) {
      throw new BadRequestException('Total amount does not match quantity * unit selling price');
    }

    const orderRequest = new this.orderRequestModel({
      ...dto,
      createdBy: currentUser.userId,
      status: OrderRequestStatus.PENDING_ADMIN,
    });

    const savedRequest = await orderRequest.save();

    // Get manager details for notification
    const manager = await this.usersService.findById(currentUser.userId);
    const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Manager';

    // Send notification to admin
    await this.notificationsService.notifyAdminNewOrderRequest({
      managerName,
      modelName: dto.modelName,
      description: dto.description,
      quantity: dto.quantity,
      unitSellingPrice: dto.unitSellingPrice,
      totalAmount: dto.totalAmount,
      requestId: (savedRequest._id as any).toString(),
    });

    return savedRequest;
  }

  /**
   * Get all order requests created by the current manager
   */
  async findMyRequests(currentUser: CurrentUserType): Promise<OrderRequest[]> {
    return await this.orderRequestModel
      .find({ createdBy: currentUser.userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all order requests (Admin only)
   */
  async findAll(): Promise<OrderRequest[]> {
    return await this.orderRequestModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Get all pending order requests (Admin view)
   */
  async findPending(): Promise<OrderRequest[]> {
    return await this.orderRequestModel
      .find({ status: OrderRequestStatus.PENDING_ADMIN })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single order request by ID
   */
  async findOne(id: string): Promise<OrderRequest> {
    const orderRequest = await this.orderRequestModel.findById(id).exec();
    if (!orderRequest) {
      throw new NotFoundException(`Order request with ID ${id} not found`);
    }
    return orderRequest;
  }

  /**
   * Admin reviews and approves/rejects an order request
   */
  async reviewOrderRequest(
    id: string,
    dto: AdminReviewOrderRequestDto,
    currentUser: CurrentUserType,
  ): Promise<OrderRequest> {
    const orderRequest = await this.findOne(id);

    // Check if already reviewed
    if (orderRequest.status !== OrderRequestStatus.PENDING_ADMIN) {
      throw new BadRequestException(
        `Order request has already been ${orderRequest.status.toLowerCase()}`,
      );
    }

    // Calculate profit margin
    const profitMargin = orderRequest.totalAmount - dto.internalCost;

    // Update order request
    orderRequest.internalCost = dto.internalCost;
    orderRequest.profitMargin = profitMargin;
    orderRequest.adminNotes = dto.adminNotes;
    orderRequest.status = dto.status;
    orderRequest.approvedBy = currentUser.userId;

    if (dto.status === OrderRequestStatus.APPROVED) {
      orderRequest.approvedAt = new Date();
    } else if (dto.status === OrderRequestStatus.REJECTED) {
      orderRequest.rejectedAt = new Date();
    }

    const savedRequest = await orderRequest.save();

    // Get manager details for notification
    const manager = await this.usersService.findById(orderRequest.createdBy);
    if (manager && manager.email) {
      // Send notification to manager
      await this.notificationsService.notifyManagerOrderRequestReviewed({
        managerEmail: manager.email,
        modelName: orderRequest.modelName,
        status: dto.status === OrderRequestStatus.APPROVED ? 'Approved' : 'Rejected',
        internalCost: dto.internalCost,
        profitMargin,
        adminNotes: dto.adminNotes,
      });
    }

    return savedRequest;
  }

  /**
   * Delete an order request (Admin only)
   */
  async remove(id: string): Promise<void> {
    const result = await this.orderRequestModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order request with ID ${id} not found`);
    }
  }
}
