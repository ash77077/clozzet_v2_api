import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    console.log('📝 Creating notification:', JSON.stringify(notificationData, null, 2));

    // Convert string IDs to ObjectIds if needed
    const processedData: any = { ...notificationData };

    if (typeof processedData.userId === 'string') {
      console.log('Converting userId string to ObjectId:', processedData.userId);
      processedData.userId = new Types.ObjectId(processedData.userId);
    }

    if (processedData.orderId && typeof processedData.orderId === 'string') {
      console.log('Converting orderId string to ObjectId:', processedData.orderId);
      processedData.orderId = new Types.ObjectId(processedData.orderId);
    }

    if (processedData.fromUserId && typeof processedData.fromUserId === 'string') {
      console.log('Converting fromUserId string to ObjectId:', processedData.fromUserId);
      processedData.fromUserId = new Types.ObjectId(processedData.fromUserId);
    }

    const notification = new this.notificationModel(processedData);
    const savedNotification = await notification.save();

    console.log('💾 Notification saved:', savedNotification._id);

    // Emit notification via WebSocket
    if (savedNotification.userId) {
      const userIdString = savedNotification.userId.toString();
      console.log(`📤 Emitting notification to user: ${userIdString}`);

      const sent = this.notificationsGateway.sendNotificationToUser(
        userIdString,
        savedNotification.toObject()
      );

      if (sent) {
        console.log('✅ Notification sent via WebSocket');
      } else {
        console.warn('⚠️ User not connected, notification saved but not sent via WebSocket');
      }

      // Update unread count
      const unreadCount = await this.getUnreadCount(userIdString);
      console.log(`📊 Unread count for user ${userIdString}: ${unreadCount}`);
      this.notificationsGateway.sendUnreadCountUpdate(userIdString, unreadCount);
    } else {
      console.warn('⚠️ No userId in notification, cannot send via WebSocket');
    }

    return savedNotification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      )
      .exec();

    // Update unread count via WebSocket
    if (notification?.userId) {
      const unreadCount = await this.getUnreadCount(notification.userId.toString());
      this.notificationsGateway.sendUnreadCountUpdate(
        notification.userId.toString(),
        unreadCount
      );
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<any> {
    const result = await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), read: false },
        { read: true }
      )
      .exec();

    // Update unread count via WebSocket (should be 0 now)
    this.notificationsGateway.sendUnreadCountUpdate(userId, 0);

    return result;
  }

  async delete(notificationId: string): Promise<any> {
    const notification = await this.notificationModel.findById(notificationId).exec();
    const result = await this.notificationModel.findByIdAndDelete(notificationId).exec();

    // Update unread count via WebSocket
    if (notification?.userId && !notification.read) {
      const unreadCount = await this.getUnreadCount(notification.userId.toString());
      this.notificationsGateway.sendUnreadCountUpdate(
        notification.userId.toString(),
        unreadCount
      );
    }

    return result;
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    await this.notificationModel
      .deleteMany({ orderId: new Types.ObjectId(orderId) })
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId), read: false })
      .exec();
  }

  // Helper method for notifying admin about new order requests
  async notifyAdminNewOrderRequest(data: {
    managerName: string;
    modelName: string;
    description: string;
    quantity: number;
    unitSellingPrice: number;
    totalAmount: number;
    requestId: string;
  }): Promise<void> {
    // In a real implementation, you would fetch all admin user IDs
    // For now, this is a placeholder that creates a notification with a generic admin userId
    // You should modify this to fetch actual admin users from your UsersService

    // Example: const admins = await this.usersService.findByRole('admin');
    // For now, just logging - you can implement this based on your admin user management
    console.log('Order request notification for admins:', data);

    // Uncomment and implement when you have admin user management:
    // for (const admin of admins) {
    //   await this.create({
    //     userId: admin._id,
    //     type: 'order_request',
    //     title: 'New Order Request',
    //     message: `${data.managerName} submitted an order request for ${data.modelName}`,
    //     link: `/order-requests/${data.requestId}`,
    //     read: false,
    //   });
    // }
  }

  // Helper method for notifying manager about order request review
  async notifyManagerOrderRequestReviewed(data: {
    managerId: string;
    modelName: string;
    status: string;
    reviewNote?: string;
    requestId: string;
  }): Promise<void> {
    await this.create({
      userId: new Types.ObjectId(data.managerId),
      type: 'order_updated',
      title: 'Order Request Reviewed',
      message: `Your order request for ${data.modelName} has been ${data.status}${data.reviewNote ? ': ' + data.reviewNote : ''}`,
      link: `/order-requests/${data.requestId}`,
      read: false,
    });
  }
}
