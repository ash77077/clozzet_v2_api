import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RetailProductsController } from './retail-products.controller';
import { RetailProductsService } from './retail-products.service';
import { RetailProduct, RetailProductSchema } from './schemas/retail-product.schema';
import { StandaloneSalesModule } from '../standalone-sales/standalone-sales.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RetailProduct.name, schema: RetailProductSchema },
    ]),
    StandaloneSalesModule,
  ],
  controllers: [RetailProductsController],
  providers: [RetailProductsService],
  exports: [RetailProductsService],
})
export class RetailProductsModule {}
