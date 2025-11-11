import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  /**
   * Create and save a new order
   */
  async createOrder(orderData: any): Promise<Order> {
    try {
      const order = new this.orderModel(orderData);
      const savedOrder = await order.save();
      this.logger.log(`Order created successfully with ID: ${savedOrder._id}`);
      return savedOrder;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<Order | null> {
    try {
      return await this.orderModel.findById(id).exec();
    } catch (error) {
      this.logger.error(`Failed to find order: ${error.message}`);
      return null;
    }
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      return await this.orderModel.findOne({ orderNumber }).exec();
    } catch (error) {
      this.logger.error(`Failed to find order by number: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all orders
   */
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderModel.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`);
      return [];
    }
  }

  /**
   * Update order
   */
  async updateOrder(id: string, updateData: any): Promise<Order | null> {
    try {
      return await this.orderModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      this.logger.error(`Failed to update order: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<boolean> {
    try {
      const result = await this.orderModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      this.logger.error(`Failed to delete order: ${error.message}`);
      return false;
    }
  }
}