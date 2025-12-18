import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StandaloneSalesService } from './standalone-sales.service';
import { StandaloneSalesController } from './standalone-sales.controller';
import { StandaloneSale, StandaloneSaleSchema } from './schemas/standalone-sale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StandaloneSale.name, schema: StandaloneSaleSchema },
    ]),
  ],
  controllers: [StandaloneSalesController],
  providers: [StandaloneSalesService],
  exports: [StandaloneSalesService],
})
export class StandaloneSalesModule {}
