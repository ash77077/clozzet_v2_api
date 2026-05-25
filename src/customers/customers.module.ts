import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersSchedulerService } from './customers-scheduler.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { InteractionsModule } from '../interactions/interactions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => InteractionsModule),
    NotificationsModule,
  ],
  providers: [CustomersService, CustomersSchedulerService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
