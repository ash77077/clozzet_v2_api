import {BadRequestException, forwardRef, Inject, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {ProductDetails, ProductDetailsDocument} from './schemas/product-details.schema';
import {CreateProductDetailsDto} from './dto/create-product-details.dto';
import {ProductDetailsEmailService} from './product-details-email.service';
import {NotificationsGateway} from '../notifications/notifications.gateway';

@Injectable()
export class ProductDetailsService {
  constructor(
    @InjectModel(ProductDetails.name)
    private productDetailsModel: Model<ProductDetailsDocument>,
    private productDetailsEmailService: ProductDetailsEmailService,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createProductDetailsDto: CreateProductDetailsDto): Promise<ProductDetails> {
    try {
      // Calculate total quantity from products array if provided
      if (createProductDetailsDto.products && createProductDetailsDto.products.length > 0) {
        createProductDetailsDto.quantity = this.calculateTotalQuantityFromProducts(createProductDetailsDto.products);
      }
      // Legacy: Validate size quantities if provided
      else if (createProductDetailsDto.sizeQuantities && Object.keys(createProductDetailsDto.sizeQuantities).length > 0) {
        this.validateSizeQuantities(createProductDetailsDto);
        createProductDetailsDto.quantity = this.calculateTotalQuantity(createProductDetailsDto.sizeQuantities);
      }

      // Generate automatic order number if not provided
      if (!createProductDetailsDto.orderNumber) {
        createProductDetailsDto.orderNumber = await this.generateNextOrderNumber();
      }

      // Create and save the product details
      const createdProductDetails = new this.productDetailsModel(createProductDetailsDto);
      const savedProductDetails = await createdProductDetails.save();

      // Send email notification to manufacturing team
      await this.productDetailsEmailService.sendProductDetailsEmail(createProductDetailsDto);

      return savedProductDetails.toObject();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async findAll(): Promise<ProductDetails[]> {
    return this.productDetailsModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ProductDetails> {
    const productDetails = await this.productDetailsModel.findById(id).exec();
    
    if (!productDetails) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }
    
    return productDetails.toObject();
  }

  async findByOrderNumber(orderNumber: string): Promise<ProductDetails> {
    const productDetails = await this.productDetailsModel
      .findOne({ orderNumber })
      .exec();
    
    if (!productDetails) {
      throw new BadRequestException(`Product details with order number ${orderNumber} not found`);
    }
    
    return productDetails.toObject();
  }

  async findByClient(clientName: string): Promise<ProductDetails[]> {
    return this.productDetailsModel
      .find({ clientName: new RegExp(clientName, 'i') })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPriority(priority: string): Promise<ProductDetails[]> {
    return this.productDetailsModel
      .find({ priority })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByClothType(clothType: string): Promise<ProductDetails[]> {
    return this.productDetailsModel
      .find({ clothType })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateData: Partial<CreateProductDetailsDto>): Promise<ProductDetails> {
    // Calculate total quantity from products array if provided
    if (updateData.products && updateData.products.length > 0) {
      updateData.quantity = this.calculateTotalQuantityFromProducts(updateData.products);
    }
    // Legacy: Validate size quantities if provided
    else if (updateData.sizeQuantities) {
      this.validateSizeQuantities(updateData as CreateProductDetailsDto);
      updateData.quantity = this.calculateTotalQuantity(updateData.sizeQuantities);
    }

    const updatedProductDetails = await this.productDetailsModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedProductDetails) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }

    return updatedProductDetails.toObject();
  }

  async updateStatus(id: string, status: string): Promise<ProductDetails> {
    const updatedProductDetails = await this.productDetailsModel
      .findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedProductDetails) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }

    return updatedProductDetails.toObject();
  }

  async updateManufacturingStatus(id: string, manufacturingStatus: string, updatedBy?: string): Promise<ProductDetails> {
    // Validate manufacturing status
    const validStatuses = ['pending', 'waiting_for_info', 'in_progress', 'printing', 'quality_check', 'packaging', 'done', 'on_hold'];
    if (!validStatuses.includes(manufacturingStatus)) {
      throw new BadRequestException(`Invalid manufacturing status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Get the current order to capture the old status
    const currentOrder = await this.productDetailsModel.findById(id).exec();
    if (!currentOrder) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }

    const oldStatus = currentOrder.manufacturingStatus || 'pending';

    const updatedProductDetails = await this.productDetailsModel
      .findByIdAndUpdate(
        id,
        { manufacturingStatus, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedProductDetails) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }

    // Send email notification if status actually changed
    if (oldStatus !== manufacturingStatus) {
      try {
        await this.productDetailsEmailService.sendManufacturingStatusChangeEmail(
          updatedProductDetails.orderNumber,
          updatedProductDetails.clientName,
          oldStatus,
          manufacturingStatus,
          updatedBy || 'System'
        );
      } catch (emailError) {
        console.error('Failed to send status change email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    return updatedProductDetails.toObject();
  }

  async addManufacturingNotes(id: string, content: string, author: string): Promise<ProductDetails> {
    if (!content.trim()) {
      throw new BadRequestException('Note content cannot be empty');
    }

    if (!author.trim()) {
      throw new BadRequestException('Note author cannot be empty');
    }

    const newNote = {
      date: new Date(),
      author: author.trim(),
      content: content.trim()
    };

    const updatedProductDetails = await this.productDetailsModel
      .findByIdAndUpdate(
        id,
        {
          $push: { manufacturingNotes: newNote },
          updatedAt: new Date()
        },
        { new: true }
      )
      .exec();

    if (!updatedProductDetails) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }

    // Broadcast activity update via WebSocket to all users watching this order
    this.notificationsGateway.broadcastOrderActivity(id, {
      type: 'comment',
      date: newNote.date,
      author: newNote.author,
      content: newNote.content,
    });

    return updatedProductDetails.toObject();
  }

  async findByManufacturingStatus(status: string): Promise<ProductDetails[]> {
    // Validate manufacturing status
    const validStatuses = ['pending', 'waiting_for_info', 'in_progress', 'printing', 'quality_check', 'packaging', 'done', 'on_hold'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid manufacturing status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.productDetailsModel
      .find({ manufacturingStatus: status })
      .sort({ createdAt: -1 })
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.productDetailsModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new BadRequestException(`Product details with ID ${id} not found`);
    }
  }

  async getStatistics(): Promise<any> {
    const totalOrders = await this.productDetailsModel.countDocuments().exec();
    
    const priorityStats = await this.productDetailsModel.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    const clothTypeStats = await this.productDetailsModel.aggregate([
      {
        $group: {
          _id: '$clothType',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    const totalQuantity = await this.productDetailsModel.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]).exec();

    return {
      totalOrders,
      totalQuantity: totalQuantity[0]?.totalQuantity || 0,
      priorityBreakdown: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      clothTypeBreakdown: clothTypeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };
  }

  private validateSizeQuantities(dto: CreateProductDetailsDto): void {
    const sizeQuantities = dto.sizeQuantities;

    // Size quantities are optional, so only validate if provided
    if (!sizeQuantities || Object.keys(sizeQuantities).length === 0) {
      return; // No validation needed if not provided
    }

    // Calculate total quantity from all sizes
    const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0);

    // Ensure the total quantity is greater than 0
    if (totalQuantity <= 0) {
      throw new BadRequestException('Total quantity from size quantities must be greater than 0');
    }
  }

  private calculateTotalQuantity(sizeQuantities: { [size: string]: number }): number {
    return Object.values(sizeQuantities).reduce((total, quantity) => total + quantity, 0);
  }

  private calculateTotalQuantityFromProducts(products: any[]): number {
    let total = 0;

    for (const product of products) {
      if (product.sizes) {
        // Iterate through all size categories (xs, s, m, l, xl, xxl, xxxl, xxxxl)
        const sizeKeys = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl'];

        for (const sizeKey of sizeKeys) {
          const sizeData = product.sizes[sizeKey];
          if (sizeData) {
            // Add men, women, and uni quantities
            total += (sizeData.men || 0) + (sizeData.women || 0) + (sizeData.uni || 0);
          }
        }
      }
    }

    return total;
  }

  private async generateNextOrderNumber(): Promise<string> {
    // Find the highest existing order number
    const lastOrder = await this.productDetailsModel
      .findOne({}, {}, { sort: { 'orderNumber': -1 } })
      .exec();

    let nextNumber = 1;
    
    if (lastOrder && lastOrder.orderNumber) {
      // Extract number from order number string (assuming format like "1", "2", etc.)
      const currentNumber = parseInt(lastOrder.orderNumber, 10);
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    return nextNumber.toString();
  }
}
