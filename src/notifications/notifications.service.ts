import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface OrderRequestNotificationData {
  managerName: string;
  modelName: string;
  description: string;
  quantity: number;
  unitSellingPrice: number;
  totalAmount: number;
  requestId: string;
}

export interface OrderRequestApprovalData {
  managerEmail: string;
  modelName: string;
  status: 'Approved' | 'Rejected';
  internalCost?: number;
  profitMargin?: number;
  adminNotes?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly adminEmail: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get('ADMIN_EMAIL') || 'clozzet.corp@gmail.com';
  }

  /**
   * Notify admin when a manager creates a new order request
   * Scalable architecture: Can easily add Telegram notification here
   */
  async notifyAdminNewOrderRequest(data: OrderRequestNotificationData): Promise<void> {
    try {
      // Email notification
      await this.sendEmailToAdmin(data);

      // Telegram notification (placeholder for future implementation)
      // await this.sendTelegramToAdmin(data);

      this.logger.log(`Admin notified of new order request: ${data.requestId}`);
    } catch (error) {
      this.logger.error(`Failed to notify admin: ${error.message}`, error.stack);
      // Don't throw error - notification failures shouldn't block order creation
    }
  }

  /**
   * Notify manager when admin reviews their order request
   * Scalable architecture: Can easily add Telegram notification here
   */
  async notifyManagerOrderRequestReviewed(data: OrderRequestApprovalData): Promise<void> {
    try {
      // Email notification
      await this.sendEmailToManager(data);

      // Telegram notification (placeholder for future implementation)
      // await this.sendTelegramToManager(data);

      this.logger.log(`Manager notified of order request review: ${data.modelName}`);
    } catch (error) {
      this.logger.error(`Failed to notify manager: ${error.message}`, error.stack);
      // Don't throw error - notification failures shouldn't block review process
    }
  }

  /**
   * Send email to admin about new order request
   */
  private async sendEmailToAdmin(data: OrderRequestNotificationData): Promise<void> {
    const subject = `🔔 New Order Request: ${data.modelName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Order Request from ${data.managerName}</h2>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #3498db; margin-top: 0;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Model/Style:</td>
              <td style="padding: 8px 0;">${data.modelName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Description:</td>
              <td style="padding: 8px 0;">${data.description}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Quantity:</td>
              <td style="padding: 8px 0;">${data.quantity} units</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Unit Price:</td>
              <td style="padding: 8px 0;">${this.formatCurrency(data.unitSellingPrice)} AMD</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #27ae60;">Total Amount:</td>
              <td style="padding: 8px 0; color: #27ae60; font-weight: bold;">${this.formatCurrency(data.totalAmount)} AMD</td>
            </tr>
          </table>
        </div>

        <p style="background-color: #fff3cd; padding: 15px; border-left: 4px solid: #ffc107; margin: 20px 0;">
          <strong>⚠️ Action Required:</strong> Please review this order request and add the internal cost calculation.
        </p>

        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
          This is an automated notification from Clozzet Order Management System.
        </p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: this.adminEmail,
      subject,
      html,
    });
  }

  /**
   * Send email to manager about order request review
   */
  private async sendEmailToManager(data: OrderRequestApprovalData): Promise<void> {
    const isApproved = data.status === 'Approved';
    const subject = `${isApproved ? '✅' : '❌'} Order Request ${data.status}: ${data.modelName}`;

    const statusColor = isApproved ? '#27ae60' : '#e74c3c';
    const statusBg = isApproved ? '#d4edda' : '#f8d7da';

    let detailsHtml = '';
    if (isApproved && data.internalCost !== undefined) {
      const profitMargin = data.profitMargin || 0;
      detailsHtml = `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #3498db; margin-top: 0;">Financial Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Internal Cost:</td>
              <td style="padding: 8px 0;">${this.formatCurrency(data.internalCost)} AMD</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Profit Margin:</td>
              <td style="padding: 8px 0; color: ${profitMargin >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                ${this.formatCurrency(profitMargin)} AMD
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    const notesHtml = data.adminNotes ? `
      <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <strong>Admin Notes:</strong><br>
        ${data.adminNotes}
      </div>
    ` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Order Request Review Result</h2>

        <div style="background-color: ${statusBg}; color: ${statusColor}; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0;">${isApproved ? '✅' : '❌'} Your order request has been ${data.status}!</h3>
          <p style="margin: 10px 0 0 0; font-weight: bold;">${data.modelName}</p>
        </div>

        ${detailsHtml}
        ${notesHtml}

        <p style="${isApproved ? 'color: #27ae60;' : 'color: #e74c3c;'} font-weight: bold; margin: 20px 0;">
          ${isApproved
            ? '✓ You can now proceed with the client and finalize this order.'
            : '✗ Please review the admin notes and make necessary adjustments before resubmitting.'}
        </p>

        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
          This is an automated notification from Clozzet Order Management System.
        </p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: data.managerEmail,
      subject,
      html,
    });
  }

  /**
   * Format currency with thousand separators
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US').format(amount);
  }

  /**
   * Placeholder for future Telegram integration
   * This method can be implemented later without changing the API
   */
  // private async sendTelegramToAdmin(data: OrderRequestNotificationData): Promise<void> {
  //   const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
  //   const chatId = this.configService.get('TELEGRAM_CHAT_ID');
  //
  //   if (!botToken || !chatId) {
  //     this.logger.warn('Telegram credentials not configured');
  //     return;
  //   }
  //
  //   const message = `🔔 *New Order Request*\n\nModel: ${data.modelName}\nQuantity: ${data.quantity}\nTotal: ${this.formatCurrency(data.totalAmount)} AMD`;
  //
  //   // Implement Telegram API call here
  //   this.logger.log('Telegram notification would be sent here');
  // }
}
