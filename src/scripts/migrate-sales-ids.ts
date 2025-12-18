import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { RetailProduct } from '../retail-products/schemas/retail-product.schema';
import { getModelToken } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const retailProductModel = app.get<Model<RetailProduct>>(
    getModelToken(RetailProduct.name)
  );

  console.log('Starting migration to add _id to existing sales...');

  const products = await retailProductModel.find().exec();
  let updatedCount = 0;
  let salesUpdated = 0;

  for (const product of products) {
    let needsUpdate = false;

    if (product.salesHistory && product.salesHistory.length > 0) {
      // Check if any sales are missing _id
      const hasMissingIds = product.salesHistory.some(
        sale => !(sale as any)._id
      );

      if (hasMissingIds) {
        // Force regeneration of the salesHistory array to create new _ids
        const salesData = product.salesHistory.map(sale => ({
          size: sale.size,
          color: sale.color,
          quantity: sale.quantity,
          soldPrice: sale.soldPrice,
          soldDate: sale.soldDate,
          isExternal: sale.isExternal || false,
        }));

        product.salesHistory = salesData as any;
        product.markModified('salesHistory');
        needsUpdate = true;
        salesUpdated += salesData.length;
      }
    }

    if (needsUpdate) {
      await product.save();
      updatedCount++;
      console.log(`Updated product: ${product.name} (${product.salesHistory.length} sales)`);
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Products updated: ${updatedCount}`);
  console.log(`Sales updated: ${salesUpdated}`);

  await app.close();
}

bootstrap();
