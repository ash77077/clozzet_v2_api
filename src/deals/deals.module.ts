import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Deal, DealSchema } from './schemas/deal.schema';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { PipelineStagesModule } from '../pipeline-stages/pipeline-stages.module';
import { DealStageHistoryModule } from '../deal-stage-history/deal-stage-history.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PipelineStagesModule,
    DealStageHistoryModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService, MongooseModule],
})
export class DealsModule {}
