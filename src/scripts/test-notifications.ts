/**
 * Test script for follow-up notifications
 *
 * This script:
 * 1. Connects to MongoDB
 * 2. Creates/updates a test customer with follow-up due today
 * 3. Triggers the notification system
 * 4. Shows the results
 *
 * Usage:
 *   npm run test-notifications
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CustomersSchedulerService } from '../customers/customers-scheduler.service';
import { CustomersService } from '../customers/customers.service';
import { CustomerStatus } from '../customers/schemas/customer.schema';

async function bootstrap() {
  console.log('🧪 Starting notification test script...\n');

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  const schedulerService = app.get(CustomersSchedulerService);
  const customersService = app.get(CustomersService);

  try {
    // Step 1: Get all customers
    console.log('📋 Step 1: Checking existing customers...');
    const customers = await customersService.findAll();
    console.log(`   Found ${customers.length} total customers\n`);

    // Step 2: Check customers with follow-ups due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const customersWithFollowUpToday = customers.filter(c => {
      if (!c.nextFollowUpAt) return false;
      const followUpDate = new Date(c.nextFollowUpAt);
      return followUpDate >= today && followUpDate < tomorrow;
    });

    console.log('📅 Step 2: Customers with follow-ups due today:');
    console.log(`   Count: ${customersWithFollowUpToday.length}`);

    if (customersWithFollowUpToday.length > 0) {
      customersWithFollowUpToday.forEach(c => {
        console.log(`   - ${c.companyName} (Created by: ${c.createdBy ? 'Assigned' : 'Unassigned'})`);
      });
    } else {
      console.log('   ⚠️  No customers with follow-ups due today');
      console.log('   💡 Creating a test customer with follow-up due today...\n');

      // Create a test customer
      const testCustomer = await customersService.create({
        companyName: `Test Company ${Date.now()}`,
        contactPerson: 'Test Contact',
        phone: '+374 99 123456',
        email: `test${Date.now()}@example.com`,
        status: CustomerStatus.LEAD,
        notes: 'Test customer created for notification testing',
        nextFollowUpAt: new Date().toISOString(), // Today
        source: 'Test Script',
      });

      console.log(`   ✅ Created test customer: ${testCustomer.companyName}`);
    }

    console.log('\n🔔 Step 3: Triggering notification system...\n');

    // Step 3: Trigger the notification system
    const result = await schedulerService.triggerManualFollowUpReminder();

    console.log('📊 Results:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Customers with follow-ups: ${result.customersCount}`);
    console.log(`   Managers notified: ${result.managersNotified}`);

    console.log('\n✅ Test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check your notification bell in the frontend');
    console.log('   2. Check the notifications collection in MongoDB');
    console.log('   3. Review the backend console logs above\n');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
