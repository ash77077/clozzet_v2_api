#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { ProductSeeder } from '../seeders/product.seeder';

async function seedProducts() {
  const logger = new Logger('SeedProductsScript');

  try {
    logger.log('🚀 Starting product seeding...');

    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get the ProductSeeder service
    const productSeeder = app.get(ProductSeeder);

    // Run the seeder
    await productSeeder.seed();

    logger.log('');
    logger.log('🎉 Product seeding completed!');

    await app.close();
    process.exit(0);

  } catch (error) {
    logger.error(`❌ Failed to seed products: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
seedProducts();