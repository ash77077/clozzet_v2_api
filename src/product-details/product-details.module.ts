import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductDetailsController } from './product-details.controller';
import { ProductDetailsService } from './product-details.service';
import { ProductDetailsEmailService } from './product-details-email.service';
import { ProductDetailsDeadlineScheduler } from './product-details-deadline.scheduler';
import { ProductDetails, ProductDetailsSchema } from './schemas/product-details.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductDetails.name, schema: ProductDetailsSchema },
    ]),
    forwardRef(() => NotificationsModule),
    TelegramModule,
  ],
  controllers: [ProductDetailsController],
  providers: [ProductDetailsService, ProductDetailsEmailService, ProductDetailsDeadlineScheduler],
  exports: [ProductDetailsService, ProductDetailsEmailService],
})
export class ProductDetailsModule {}
