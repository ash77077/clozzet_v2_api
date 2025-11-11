import { Controller, Post, Get, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { SalesPersonsService } from '../sales-persons/sales-persons.service';
import { ProductDetailsService } from '../product-details/product-details.service';

@Controller('api/orders')
export class OrdersController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly ordersService: OrdersService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly productDetailsService: ProductDetailsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('send-telegram')
  async sendToTelegram(@Body() orderData: CreateOrderDto) {
    try {
      // If sales person is provided, ensure it exists in the database
      if (orderData.salesPerson && orderData.salesPerson.trim()) {
        await this.salesPersonsService.getOrCreate(orderData.salesPerson.trim());
      }

      // Save order to database first
      const savedOrder = await this.ordersService.createOrder(orderData);

      // Also create a ProductDetails entry for the manufacturing page
      const productDetailsData = this.transformOrderToProductDetails(orderData);
      await this.productDetailsService.create(productDetailsData);

      // Generate public link to order
      const frontendUrl = this.configService.get<string>('API_BASE_URL')?.replace(':3000', ':4200') || 'http://localhost:4200';
      const orderLink = `${frontendUrl}/order-blank/${savedOrder._id}`;

      // Send to Telegram with link
      const result = await this.telegramService.sendOrderNotification(orderData, orderLink);

      return {
        success: true,
        message: 'Order sent to Telegram successfully',
        data: {
          orderId: savedOrder._id,
          orderLink: orderLink,
          telegramResponse: result
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send order to Telegram',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Transform order data to ProductDetails format
   */
  private transformOrderToProductDetails(orderData: CreateOrderDto): any {
    // Calculate total quantity from sizes
    let totalQuantity = 0;
    const sizeQuantities: { [key: string]: number } = {};

    if (orderData.sizes) {
      Object.entries(orderData.sizes).forEach(([size, genders]) => {
        const sizeTotal = (genders.men || 0) + (genders.women || 0) + (genders.uni || 0);
        if (sizeTotal > 0) {
          sizeQuantities[size] = sizeTotal;
          totalQuantity += sizeTotal;
        }
      });
    }

    // Split colors string into array
    const colorsArray = orderData.colors
      ? orderData.colors.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];

    return {
      orderNumber: orderData.orderNumber,
      clientName: orderData.clientName,
      salesPerson: orderData.salesPerson,
      deadline: orderData.deadline,
      quantity: totalQuantity || orderData.quantity || 0,
      priority: orderData.priority || 'normal',
      clothType: orderData.clothType,
      textileType: orderData.textileType || '',
      colors: colorsArray,
      customColorDetails: orderData.customColorDetails,
      sizeQuantities: sizeQuantities,
      logoPosition: orderData.logoPosition,
      logoSize: orderData.logoSize,
      specialInstructions: orderData.specialInstructions,
      packagingRequirements: orderData.packagingRequirements,
      shippingAddress: orderData.shippingAddress,
      manufacturingStatus: 'pending'
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    try {
      const order = await this.ordersService.findById(id);

      if (!order) {
        throw new HttpException(
          {
            success: false,
            message: 'Order not found'
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch order',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test-telegram')
  async testTelegram() {
    try {
      const isConnected = await this.telegramService.testConnection();
      return {
        success: isConnected,
        message: isConnected ? 'Telegram bot connected successfully' : 'Failed to connect to Telegram bot'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to test Telegram connection',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
