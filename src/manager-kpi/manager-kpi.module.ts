import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ManagerKpiController } from './manager-kpi.controller';
import { ManagerKpiService } from './manager-kpi.service';
import { ManagerGoal, ManagerGoalSchema } from './schemas/manager-goal.schema';
import { Interaction, InteractionSchema } from '../interactions/schemas/interaction.schema';
import { Meeting, MeetingSchema } from '../meetings/schemas/meeting.schema';
import { ProductDetails, ProductDetailsSchema } from '../product-details/schemas/product-details.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManagerGoal.name,     schema: ManagerGoalSchema },
      { name: Interaction.name,     schema: InteractionSchema },
      { name: Meeting.name,         schema: MeetingSchema },
      { name: ProductDetails.name,  schema: ProductDetailsSchema },
      { name: User.name,            schema: UserSchema },
    ]),
  ],
  controllers: [ManagerKpiController],
  providers: [ManagerKpiService],
  exports: [ManagerKpiService],
})
export class ManagerKpiModule {}
