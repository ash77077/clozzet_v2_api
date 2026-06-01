import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDetails } from './schemas/product-details.schema';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class ProductDetailsDeadlineScheduler {
  private readonly logger = new Logger(ProductDetailsDeadlineScheduler.name);

  constructor(
    @InjectModel(ProductDetails.name) private productDetailsModel: Model<ProductDetails>,
    private telegramService: TelegramService,
  ) {}

  // Runs every day at 9:00 AM Armenia time
  @Cron('0 0 9 * * *', {
    name: 'deadline-reminders',
    timeZone: 'Asia/Yerevan',
  })
  async sendDeadlineReminders(daysAhead = 2) {
    this.logger.log('Checking for orders with upcoming deadlines...');

    try {
      // Build date strings in Armenia timezone (UTC+4)
      const nowUtc = Date.now() + (4 * 60 * 60 * 1000);
      const todayStr = new Date(nowUtc).toISOString().slice(0, 10);
      const limitStr = new Date(nowUtc + daysAhead * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      this.logger.log(`Looking for non-done orders with deadline between ${todayStr} and ${limitStr}`);

      // Fetch all non-done orders and filter in JS to handle mixed date formats
      const allOrders = await this.productDetailsModel
        .find({ manufacturingStatus: { $nin: ['done'] } })
        .sort({ deadline: 1 })
        .exec();

      const todayMs = new Date(todayStr + 'T00:00:00Z').getTime();
      const limitMs = new Date(limitStr + 'T23:59:59Z').getTime();

      const orders = allOrders.filter(order => {
        if (!order.deadline) return false;
        const d = new Date(order.deadline).getTime();
        return d >= todayMs && d <= limitMs;
      });

      if (orders.length === 0) {
        this.logger.log(`No orders with deadlines in the next ${daysAhead} day(s).`);
        return;
      }

      this.logger.log(`Found ${orders.length} order(s) with upcoming deadlines.`);

      for (const order of orders) {
        const deadlineDate = new Date(order.deadline);
        const daysLeft = Math.round((deadlineDate.getTime() - todayMs) / (24 * 60 * 60 * 1000));

        const urgencyLabel = daysLeft <= 0 ? '🔴 TODAY' : daysLeft === 1 ? '🟠 Tomorrow' : `🟡 In ${daysLeft} days`;

        const deadlineFormatted = deadlineDate.toLocaleDateString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        });

        const startFormatted = order.startDate
          ? new Date(order.startDate).toLocaleDateString('en-GB', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })
          : '—';

        const message =
          `⏰ <b>Deadline Reminder</b> — ${urgencyLabel}\n\n` +
          `Order <b>#${order.orderNumber}</b>\n\n` +
          `👤 Client: ${order.clientName}\n` +
          `📦 Quantity: ${order.quantity} units\n` +
          `🗓 Start date: ${startFormatted}\n` +
          `🚨 Deadline: <b>${deadlineFormatted}</b>\n` +
          `📊 Status: ${order.manufacturingStatus || 'pending'}\n` +
          `⚡ Priority: ${order.priority}`;

        const sent = await this.telegramService.sendMessage(message);
        if (sent) {
          this.logger.log(`Telegram reminder sent for order #${order.orderNumber} (${daysLeft}d left)`);
        }
      }
    } catch (error) {
      this.logger.error('Error sending deadline reminders:', error);
    }
  }
}
