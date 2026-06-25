import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
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
import { FinancialProductionModule } from './financial-production/financial-production.module';
import { SpecialCollectionModule } from './special-collection/special-collection.module';
import { B2BOrdersModule } from './b2b-orders/b2b-orders.module';
import { OrderRequestsModule } from './order-requests/order-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CustomersModule } from './customers/customers.module';
import { InteractionsModule } from './interactions/interactions.module';
import { AiModule } from './ai/ai.module';
import { ExpoSalesModule } from './expo-sales/expo-sales.module';
import { WeddingGuestsModule } from './wedding-guests/wedding-guests.module';
import { EmployeesModule } from './employees/employees.module';

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
    // Schedule Module for Cron Jobs
    ScheduleModule.forRoot(),
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
    FinancialProductionModule,
    SpecialCollectionModule,
    B2BOrdersModule,
    OrderRequestsModule,
    NotificationsModule,
    CustomersModule,
    InteractionsModule,
    AiModule,
    ExpoSalesModule,
    WeddingGuestsModule,
    EmployeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
