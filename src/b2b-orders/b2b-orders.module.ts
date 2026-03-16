import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { B2BOrdersController } from './b2b-orders.controller';
import { B2BOrdersService } from './b2b-orders.service';
import { B2BOrder, B2BOrderSchema } from './schemas/b2b-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: B2BOrder.name, schema: B2BOrderSchema },
    ]),
  ],
  controllers: [B2BOrdersController],
  providers: [B2BOrdersService],
  exports: [B2BOrdersService],
})
export class B2BOrdersModule {}
