import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: 'notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSocketMap = new Map<string, string>(); // userId -> socketId
  private orderRooms = new Map<string, Set<string>>(); // orderId -> Set of socketIds

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from user socket map
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }

    // Remove from all order rooms
    for (const [orderId, sockets] of this.orderRooms.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        this.logger.log(`Removed socket ${client.id} from order room ${orderId}`);
        if (sockets.size === 0) {
          this.orderRooms.delete(orderId);
        }
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    this.logger.log(`Registration attempt - userId: ${userId}, socketId: ${client.id}`);

    if (userId) {
      // Remove old socket for this user if exists
      for (const [uid, socketId] of this.userSocketMap.entries()) {
        if (uid === userId && socketId !== client.id) {
          this.logger.log(`Removing old socket ${socketId} for user ${userId}`);
          this.userSocketMap.delete(uid);
        }
      }

      this.userSocketMap.set(userId, client.id);
      this.logger.log(`✅ User ${userId} registered with socket ${client.id}`);
      this.logger.log(`Total registered users: ${this.userSocketMap.size}`);

      return { success: true, message: 'Registered successfully' };
    }

    this.logger.warn(`❌ Invalid userId in registration`);
    return { success: false, message: 'Invalid userId' };
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.logger.log(`Attempting to send notification to user ${userId}`);
    this.logger.log(`Current registered users: ${Array.from(this.userSocketMap.keys()).join(', ')}`);

    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`✅ Notification sent to user ${userId} via socket ${socketId}`);
      this.logger.log(`Notification details:`, JSON.stringify(notification, null, 2));
      return true;
    }

    this.logger.warn(`❌ User ${userId} not connected (no socket found)`);
    this.logger.warn(`Available sockets: ${Array.from(this.userSocketMap.entries()).map(([uid, sid]) => `${uid}:${sid}`).join(', ')}`);
    return false;
  }

  // Broadcast notification to all connected clients
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcasted to all clients');
  }

  // Send notification count update to user
  sendUnreadCountUpdate(userId: string, count: number) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('unreadCountUpdate', { count });
      this.logger.log(`Unread count update sent to user ${userId}: ${count}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Order Activity & Comments (Real-time)
  // ═══════════════════════════════════════════════════════════════════════════

  @SubscribeMessage('joinOrder')
  handleJoinOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    if (!orderId) {
      return { success: false, message: 'Invalid orderId' };
    }

    // Join the order room
    client.join(`order:${orderId}`);

    // Track in our map
    if (!this.orderRooms.has(orderId)) {
      this.orderRooms.set(orderId, new Set());
    }
    this.orderRooms.get(orderId)!.add(client.id);

    this.logger.log(`✅ Socket ${client.id} joined order room: ${orderId}`);
    this.logger.log(`Total users watching order ${orderId}: ${this.orderRooms.get(orderId)!.size}`);

    return { success: true, message: `Joined order ${orderId}` };
  }

  @SubscribeMessage('leaveOrder')
  handleLeaveOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    if (!orderId) {
      return { success: false, message: 'Invalid orderId' };
    }

    // Leave the order room
    client.leave(`order:${orderId}`);

    // Remove from our map
    const room = this.orderRooms.get(orderId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) {
        this.orderRooms.delete(orderId);
      }
    }

    this.logger.log(`Socket ${client.id} left order room: ${orderId}`);

    return { success: true, message: `Left order ${orderId}` };
  }

  // Broadcast activity/comment to all users watching an order
  broadcastOrderActivity(orderId: string, activity: any) {
    this.logger.log(`📢 Broadcasting activity to order ${orderId}`);
    this.logger.log(`Activity details:`, JSON.stringify(activity, null, 2));

    const room = this.orderRooms.get(orderId);
    if (room && room.size > 0) {
      this.server.to(`order:${orderId}`).emit('orderActivity', {
        orderId,
        activity,
      });
      this.logger.log(`✅ Activity broadcasted to ${room.size} users watching order ${orderId}`);
      return true;
    }

    this.logger.warn(`No users watching order ${orderId}`);
    return false;
  }

  // Send order update to all users watching an order
  broadcastOrderUpdate(orderId: string, update: any) {
    this.logger.log(`📢 Broadcasting order update to order ${orderId}`);
    this.server.to(`order:${orderId}`).emit('orderUpdate', {
      orderId,
      update,
    });
    this.logger.log(`✅ Order update broadcasted`);
  }
}