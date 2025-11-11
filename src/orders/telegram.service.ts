import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken || !this.chatId) {
      this.logger.warn('Telegram configuration is missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env file');
    }
  }

  /**
   * Format order data into a readable Telegram message
   */
  private formatOrderMessage(orderData: any, orderLink?: string): string {
    const {
      orderNumber,
      clientName,
      salesPerson,
      deadline,
      quantity,
      priority,
      clothType,
      textileType,
      colors,
      customColorDetails,
      logoPosition,
      logoSize,
      specialInstructions,
      packagingRequirements,
      shippingAddress,
      sizes,
      grandTotal
    } = orderData;

    // Format size breakdown
    let sizeBreakdown = '📏 *SIZE BREAKDOWN*\n';
    const sizeKeys = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl'];
    const sizeLabels = {
      xs: 'XS',
      s: 'S',
      m: 'M',
      l: 'L',
      xl: 'XL',
      xxl: '2XL',
      xxxl: '3XL',
      xxxxl: '4XL'
    };

    sizeKeys.forEach(sizeKey => {
      const size = sizes?.[sizeKey];
      if (size && (size.men || size.women || size.uni)) {
        const men = size.men || 0;
        const women = size.women || 0;
        const uni = size.uni || 0;
        if (men > 0 || women > 0 || uni > 0) {
          sizeBreakdown += `   ${sizeLabels[sizeKey]}: Men=${men}, Women=${women}, Uni=${uni}\n`;
        }
      }
    });

    // Build the full message
    let message = `🆕 *NEW ORDER RECEIVED*\n\n`;

    message += `📋 *ORDER INFORMATION*\n`;
    message += `Order Number: ${orderNumber || 'N/A'}\n`;
    message += `Client: ${clientName || 'N/A'}\n`;
    message += `Sales Person: ${salesPerson || 'N/A'}\n`;
    message += `Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : 'N/A'}\n`;
    message += `Priority: ${priority?.toUpperCase() || 'NORMAL'}\n`;
    message += `Total Quantity: ${quantity || grandTotal || 'N/A'}\n\n`;

    message += `👕 *PRODUCT SPECIFICATIONS*\n`;
    message += `Product Type: ${clothType || 'N/A'}\n`;
    message += `Textile: ${textileType || 'N/A'}\n`;
    message += `Colors: ${colors || 'N/A'}\n`;
    if (customColorDetails) {
      message += `Custom Colors: ${customColorDetails}\n`;
    }
    message += `\n`;

    message += sizeBreakdown;
    message += `*TOTAL: ${grandTotal} pieces*\n\n`;

    message += `🎨 *DESIGN DETAILS*\n`;
    message += `Logo Position: ${logoPosition || 'N/A'}\n`;
    message += `Logo Size: ${logoSize || 'N/A'}\n\n`;

    if (specialInstructions) {
      message += `📝 *SPECIAL INSTRUCTIONS*\n${specialInstructions}\n\n`;
    }

    if (packagingRequirements) {
      message += `📦 *PACKAGING*\n${packagingRequirements}\n\n`;
    }

    if (shippingAddress) {
      message += `🚚 *SHIPPING ADDRESS*\n${shippingAddress}\n`;
    }

    // Add order link if provided
    if (orderLink) {
      message += `\n\n🔗 *VIEW ORDER*\n`;
      message += `${orderLink}\n`;
      message += `\n_Click the link to view full order details and print_`;
    }

    return message;
  }

  /**
   * Send order notification to Telegram
   */
  async sendOrderNotification(orderData: any, orderLink?: string): Promise<any> {
    try {
      const message = this.formatOrderMessage(orderData, orderLink);

      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'Markdown'
      });

      this.logger.log(`Order notification sent to Telegram successfully`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send Telegram notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to Telegram bot
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/getMe`);
      this.logger.log(`Telegram bot connected: ${response.data.result.username}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to connect to Telegram: ${error.message}`);
      return false;
    }
  }
}
