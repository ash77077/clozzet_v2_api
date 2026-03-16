import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { B2BOrder, B2BOrderStatus } from './schemas/b2b-order.schema';
import { CreateB2BOrderDto } from './dto/create-b2b-order.dto';
import { UpdateB2BOrderStatusDto } from './dto/update-b2b-order-status.dto';
import { CurrentUserType } from '../common/decorators/current-user.decorator';

@Injectable()
export class B2BOrdersService {
  constructor(
    @InjectModel(B2BOrder.name) private readonly b2bOrderModel: Model<B2BOrder>,
  ) {}

  /** Extracts a plain string companyId from the JWT user, whether populated or raw. */
  private extractCompanyId(currentUser: CurrentUserType): string {
    const raw = currentUser.companyId as any;
    const id = raw?._id?.toString() ?? raw?.toString() ?? null;
    if (!id) {
      throw new ForbiddenException('No company associated with this account');
    }
    return id;
  }

  async create(dto: CreateB2BOrderDto, currentUser: CurrentUserType): Promise<B2BOrder> {
    const companyId = this.extractCompanyId(currentUser);
    const companyName = (currentUser.companyId as any)?.name ?? 'Unknown Company';

    const order = new this.b2bOrderModel({
      companyId,
      companyName,
      orderedBy: currentUser.email,
      items: dto.items,
      notes: dto.notes,
      status: B2BOrderStatus.PENDING,
      timeline: [
        {
          status: B2BOrderStatus.PENDING,
          changedAt: new Date(),
          changedBy: currentUser.email,
          note: 'Order created',
        },
      ],
    });

    return order.save();
  }

  /** Returns all orders for the authenticated user's company (secure — from JWT). */
  async findMyOrders(currentUser: CurrentUserType): Promise<B2BOrder[]> {
    // If user has no company, return empty array instead of throwing error
    try {
      const companyId = this.extractCompanyId(currentUser);
      return this.b2bOrderModel
        .find({ companyId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      // User has no company associated - return empty orders
      return [];
    }
  }

  /** Admin: returns all orders across all companies. */
  async findAll(): Promise<B2BOrder[]> {
    return this.b2bOrderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<B2BOrder> {
    const order = await this.b2bOrderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateB2BOrderStatusDto,
    currentUser: CurrentUserType,
  ): Promise<B2BOrder> {
    const order = await this.findOne(id);

    order.status = dto.status;
    order.timeline.push({
      status: dto.status,
      changedAt: new Date(),
      changedBy: currentUser.email,
      note: dto.note,
    });

    return order.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.b2bOrderModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Order not found');
  }
}
