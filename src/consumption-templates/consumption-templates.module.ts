import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConsumptionTemplate,
  ConsumptionTemplateSchema,
} from './schemas/consumption-template.schema';
import { ConsumptionTemplatesService } from './consumption-templates.service';
import { ConsumptionTemplatesController } from './consumption-templates.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConsumptionTemplate.name, schema: ConsumptionTemplateSchema },
    ]),
  ],
  controllers: [ConsumptionTemplatesController],
  providers: [ConsumptionTemplatesService],
  exports: [ConsumptionTemplatesService],
})
export class ConsumptionTemplatesModule {}
