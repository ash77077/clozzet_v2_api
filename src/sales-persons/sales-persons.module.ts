import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesPersonsController } from './sales-persons.controller';
import { SalesPersonsService } from './sales-persons.service';
import { SalesPerson, SalesPersonSchema } from './schemas/sales-person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalesPerson.name, schema: SalesPersonSchema },
    ]),
  ],
  controllers: [SalesPersonsController],
  providers: [SalesPersonsService],
  exports: [SalesPersonsService],
})
export class SalesPersonsModule {}