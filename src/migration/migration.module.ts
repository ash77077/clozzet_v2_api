import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import {
  Interaction,
  InteractionSchema,
} from '../interactions/schemas/interaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Interaction.name, schema: InteractionSchema },
    ]),
  ],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}
