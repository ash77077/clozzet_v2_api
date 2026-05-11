  import { Controller, Get, Post, Patch, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() notificationData: any) {
    try {
      const notification = await this.notificationsService.create(notificationData);
      return { success: true, data: notification };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to create notification', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string) {
    try {
      const notifications = await this.notificationsService.findByUserId(userId);
      return { success: true, data: notifications };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to fetch notifications', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string) {
    try {
      const notification = await this.notificationsService.markAsRead(notificationId);
      return { success: true, data: notification };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to mark notification as read', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    try {
      const result = await this.notificationsService.markAllAsRead(userId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to mark all notifications as read', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':notificationId')
  async delete(@Param('notificationId') notificationId: string) {
    try {
      const result = await this.notificationsService.delete(notificationId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to delete notification', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    try {
      const count = await this.notificationsService.getUnreadCount(userId);
      return { success: true, data: { count } };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get unread count', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
