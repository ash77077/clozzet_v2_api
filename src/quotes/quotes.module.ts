import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { QuotePdfService } from './pdf/quote-pdf.service';
import { CounterService } from './counter.service';
import { Quote, QuoteSchema } from './schemas/quote.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { UsersModule } from '../users/users.module';
import { ProductDetailsModule } from '../product-details/product-details.module';
import { DealsModule } from '../deals/deals.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    UsersModule,
    ProductDetailsModule,
    DealsModule,
    CustomersModule,
  ],
  controllers: [QuotesController],
  providers: [QuotesService, QuotePdfService, CounterService],
  exports: [QuotesService],
})
export class QuotesModule {}
