import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRequestsService } from './order-requests.service';
import { OrderRequestsController } from './order-requests.controller';
import { OrderRequest, OrderRequestSchema } from './schemas/order-request.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderRequest.name, schema: OrderRequestSchema },
    ]),
    NotificationsModule,
    UsersModule,
  ],
  providers: [OrderRequestsService],
  controllers: [OrderRequestsController],
  exports: [OrderRequestsService],
})
export class OrderRequestsModule {}
