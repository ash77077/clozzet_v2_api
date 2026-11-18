import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DealStageHistory,
  DealStageHistorySchema,
} from './schemas/deal-stage-history.schema';
import { DealStageHistoryService } from './deal-stage-history.service';
import { DealStageHistoryController } from './deal-stage-history.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DealStageHistory.name, schema: DealStageHistorySchema },
    ]),
  ],
  controllers: [DealStageHistoryController],
  providers: [DealStageHistoryService],
  exports: [DealStageHistoryService, MongooseModule],
})
export class DealStageHistoryModule {}
