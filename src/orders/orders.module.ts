import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TelegramService } from './telegram.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { SalesPersonsModule } from '../sales-persons/sales-persons.module';
import { ProductDetailsModule } from '../product-details/product-details.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    SalesPersonsModule,
    ProductDetailsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService, TelegramService],
  exports: [OrdersService, TelegramService]
})
export class OrdersModule {}