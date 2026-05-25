import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './schemas/customer.schema';
import { User } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CustomersSchedulerService {
  private readonly logger = new Logger(CustomersSchedulerService.name);

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    @InjectModel(User.name) private userModel: Model<User>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Send daily follow-up notifications to managers
   * Runs every workday (Monday-Friday) at 9:00 AM
   * Cron format: second minute hour dayOfMonth month dayOfWeek
   * '0 0 9 * * 1-5' = At 09:00 AM, Monday through Friday
   */
  @Cron('0 0 9 * * 1-5', {
    name: 'daily-followup-reminders',
    timeZone: 'Asia/Yerevan', // Armenia timezone
  })
  async sendDailyFollowUpReminders() {
    this.logger.log('🔔 Starting daily follow-up reminder task...');

    try {
      // Get today's date (start and end)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.logger.log(`📅 Checking follow-ups for: ${today.toDateString()}`);

      // Find all customers with follow-up due today
      const customersWithFollowUpToday = await this.customerModel.find({
        isActive: true,
        nextFollowUpAt: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .populate('createdBy', 'firstName lastName email role')
      .exec();

      this.logger.log(`📊 Found ${customersWithFollowUpToday.length} customers with follow-ups due today`);

      if (customersWithFollowUpToday.length === 0) {
        this.logger.log('✅ No follow-ups due today. Task completed.');
        return;
      }

      // Group customers by their creator (manager)
      const customersByManager = new Map<string, typeof customersWithFollowUpToday>();

      for (const customer of customersWithFollowUpToday) {
        if (customer.createdBy) {
          const managerId = (customer.createdBy as any)._id?.toString() || customer.createdBy.toString();

          if (!customersByManager.has(managerId)) {
            customersByManager.set(managerId, []);
          }
          customersByManager.get(managerId)!.push(customer);
        }
      }

      this.logger.log(`👥 Notifying ${customersByManager.size} managers`);

      // Send notifications to each manager
      for (const [managerId, customers] of customersByManager.entries()) {
        await this.sendFollowUpNotificationToManager(managerId, customers);
      }

      // Also notify all admins about all today's follow-ups
      await this.sendFollowUpNotificationToAdmins(customersWithFollowUpToday);

      this.logger.log('✅ Daily follow-up reminders sent successfully');
    } catch (error) {
      this.logger.error('❌ Error sending daily follow-up reminders:', error);
    }
  }

  /**
   * Send notification to a specific manager about their customers
   */
  private async sendFollowUpNotificationToManager(
    managerId: string,
    customers: any[]
  ): Promise<void> {
    try {
      const customerNames = customers
        .slice(0, 3)
        .map(c => c.companyName)
        .join(', ');

      const moreCount = customers.length > 3 ? customers.length - 3 : 0;
      const additionalText = moreCount > 0 ? ` and ${moreCount} more` : '';

      await this.notificationsService.create({
        userId: managerId as any,
        type: 'follow_up_reminder',
        title: `📅 ${customers.length} Follow-up${customers.length > 1 ? 's' : ''} Due Today`,
        message: `You have ${customers.length} customer${customers.length > 1 ? 's' : ''} to follow up with today: ${customerNames}${additionalText}`,
        link: '/crm-dashboard',
        read: false,
      });

      this.logger.log(`✉️ Notification sent to manager ${managerId} for ${customers.length} customers`);
    } catch (error) {
      this.logger.error(`❌ Error sending notification to manager ${managerId}:`, error);
    }
  }

  /**
   * Send notification to all admins about today's follow-ups
   */
  private async sendFollowUpNotificationToAdmins(
    customers: any[]
  ): Promise<void> {
    try {
      // Get all active admin users
      const admins = await this.userModel.find({
        role: 'admin',
        isActive: true,
      }).exec();

      this.logger.log(`📧 Sending notifications to ${admins.length} admin(s)`);

      for (const admin of admins) {
        const adminId = (admin as any)._id.toString();

        // Group customers by manager for admin view
        const managerGroups = new Map<string, any[]>();

        for (const customer of customers) {
          if (customer.createdBy) {
            const createdBy = customer.createdBy as any;
            const managerName = `${createdBy.firstName} ${createdBy.lastName}`;

            if (!managerGroups.has(managerName)) {
              managerGroups.set(managerName, []);
            }
            managerGroups.get(managerName)!.push(customer);
          }
        }

        // Create summary message
        const summaryLines = Array.from(managerGroups.entries())
          .map(([managerName, managerCustomers]) =>
            `${managerName}: ${managerCustomers.length} customer${managerCustomers.length > 1 ? 's' : ''}`
          )
          .join(', ');

        await this.notificationsService.create({
          userId: adminId as any,
          type: 'follow_up_reminder',
          title: `📅 ${customers.length} Follow-up${customers.length > 1 ? 's' : ''} Due Today (Team-wide)`,
          message: `${customers.length} total customer follow-up${customers.length > 1 ? 's' : ''} due today: ${summaryLines}`,
          link: '/crm-dashboard',
          read: false,
        });

        this.logger.log(`✉️ Notification sent to admin ${adminId}`);
      }
    } catch (error) {
      this.logger.error('❌ Error sending notifications to admins:', error);
    }
  }

  /**
   * Manual trigger for testing (can be called from a controller endpoint)
   */
  async triggerManualFollowUpReminder(): Promise<{
    success: boolean;
    message: string;
    customersCount: number;
    managersNotified: number;
  }> {
    this.logger.log('🔧 Manual trigger of follow-up reminder...');

    await this.sendDailyFollowUpReminders();

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const customersCount = await this.customerModel.countDocuments({
      isActive: true,
      nextFollowUpAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    return {
      success: true,
      message: 'Follow-up reminders sent successfully',
      customersCount,
      managersNotified: 0, // This would need to be tracked during execution
    };
  }
}
