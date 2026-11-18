import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LostReason, LostReasonSchema } from './schemas/lost-reason.schema';
import { LostReasonsService } from './lost-reasons.service';
import { LostReasonsController } from './lost-reasons.controller';
import { LostReasonSeederService } from './lost-reason-seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LostReason.name, schema: LostReasonSchema },
    ]),
  ],
  controllers: [LostReasonsController],
  providers: [LostReasonsService, LostReasonSeederService],
  exports: [LostReasonsService, LostReasonSeederService, MongooseModule],
})
export class LostReasonsModule {}
