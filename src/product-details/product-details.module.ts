import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductDetailsController } from './product-details.controller';
import { ProductDetailsService } from './product-details.service';
import { ProductDetailsEmailService } from './product-details-email.service';
import { ProductDetails, ProductDetailsSchema } from './schemas/product-details.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductDetails.name, schema: ProductDetailsSchema },
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ProductDetailsController],
  providers: [ProductDetailsService, ProductDetailsEmailService],
  exports: [ProductDetailsService, ProductDetailsEmailService],
})
export class ProductDetailsModule {}
