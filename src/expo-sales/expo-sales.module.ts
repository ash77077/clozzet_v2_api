import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpoSalesController } from './expo-sales.controller';
import { ExpoSalesService } from './expo-sales.service';
import { ExpoStock, ExpoStockSchema } from './schemas/expo-stock.schema';
import { RetailProduct, RetailProductSchema } from '../retail-products/schemas/retail-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExpoStock.name, schema: ExpoStockSchema },
      { name: RetailProduct.name, schema: RetailProductSchema },
    ]),
  ],
  controllers: [ExpoSalesController],
  providers: [ExpoSalesService],
})
export class ExpoSalesModule {}
