import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { ProductDetailsModule } from './product-details/product-details.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedersModule } from './seeders/seeders.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SalesPersonsModule } from './sales-persons/sales-persons.module';
import { RetailProductsModule } from './retail-products/retail-products.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    // Database Module
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    UsersModule,
    CompaniesModule,
    AuthModule,
    QuotesModule,
    ProductDetailsModule,
    DashboardModule,
    SeedersModule,
    ProductsModule,
    OrdersModule,
    SalesPersonsModule,
    RetailProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
