import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductDetailsController } from './product-details.controller';
import { ProductDetailsService } from './product-details.service';
import { ProductDetailsEmailService } from './product-details-email.service';
import { ProductDetails, ProductDetailsSchema } from './schemas/product-details.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductDetails.name, schema: ProductDetailsSchema },
    ]),
  ],
  controllers: [ProductDetailsController],
  providers: [ProductDetailsService, ProductDetailsEmailService],
  exports: [ProductDetailsService, ProductDetailsEmailService],
})
export class ProductDetailsModule {}
