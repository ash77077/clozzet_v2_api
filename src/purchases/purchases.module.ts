import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { StockLot, StockLotSchema } from '../stock-lots/schemas/stock-lot.schema';
import { StockConsumption, StockConsumptionSchema } from '../stock-lots/schemas/stock-consumption.schema';
import { StockAdjustment, StockAdjustmentSchema } from '../stock-lots/schemas/stock-adjustment.schema';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: StockLot.name, schema: StockLotSchema },
      { name: StockConsumption.name, schema: StockConsumptionSchema },
      { name: StockAdjustment.name, schema: StockAdjustmentSchema },
    ]),
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
