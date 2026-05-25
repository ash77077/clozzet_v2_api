import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Customer } from '../customers/schemas/customer.schema';
import { User } from '../users/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';

/**
 * Migration Script: Assign All Unassigned Customers to Toma Babayan
 *
 * This script finds all customers without a createdBy field and assigns them
 * to Toma Babayan's user account.
 *
 * Usage:
 *   npm run migration:assign-customers
 *
 * Safety Features:
 *   - Verifies Toma Babayan user exists before making changes
 *   - Only updates customers without a createdBy field
 *   - Provides detailed logging of all changes
 *   - Can be safely re-run multiple times (idempotent)
 */

async function bootstrap() {
  console.log('='.repeat(70));
  console.log('MIGRATION: Assign Customers to Toma Babayan');
  console.log('='.repeat(70));
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  const customerModel = app.get<Model<Customer>>(
    getModelToken(Customer.name)
  );
  const userModel = app.get<Model<User>>(
    getModelToken(User.name)
  );

  try {
    // Step 1: Find Toma Babayan user
    console.log('Step 1: Searching for Toma Babayan user...');

    const tomaUser = await userModel.findOne({
      firstName: 'Toma',
      lastName: 'Babayan'
    }).exec();

    if (!tomaUser) {
      console.error('❌ ERROR: Toma Babayan user not found in database!');
      console.error('Please ensure the user exists with firstName="Toma" and lastName="Babayan"');
      await app.close();
      process.exit(1);
    }

    console.log(`✅ Found user: ${tomaUser.firstName} ${tomaUser.lastName}`);
    console.log(`   - Email: ${tomaUser.email}`);
    console.log(`   - Role: ${tomaUser.role}`);
    console.log(`   - User ID: ${tomaUser._id}`);
    console.log('');

    // Step 2: Count customers needing assignment
    console.log('Step 2: Counting customers without creator...');

    const unassignedCount = await customerModel.countDocuments({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    }).exec();

    console.log(`📊 Found ${unassignedCount} customers without a creator`);
    console.log('');

    if (unassignedCount === 0) {
      console.log('✅ No customers need assignment. Migration complete!');
      await app.close();
      return;
    }

    // Step 3: Preview customers that will be updated
    console.log('Step 3: Preview of customers to be updated...');

    const unassignedCustomers = await customerModel.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    })
    .limit(10)
    .select('companyName contactPerson email')
    .exec();

    console.log('First 10 customers:');
    unassignedCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.companyName} - ${customer.contactPerson}`);
    });

    if (unassignedCount > 10) {
      console.log(`   ... and ${unassignedCount - 10} more`);
    }
    console.log('');

    // Step 4: Perform the migration
    console.log('Step 4: Assigning customers to Toma Babayan...');
    console.log('⏳ Processing...');
    console.log('');

    const result = await customerModel.updateMany(
      {
        $or: [
          { createdBy: { $exists: false } },
          { createdBy: null }
        ]
      },
      {
        $set: { createdBy: tomaUser._id }
      }
    ).exec();

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('='.repeat(70));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total customers updated: ${result.modifiedCount}`);
    console.log(`Assigned to: ${tomaUser.firstName} ${tomaUser.lastName} (${tomaUser.email})`);
    console.log(`User ID: ${tomaUser._id}`);
    console.log('='.repeat(70));
    console.log('');

    // Step 5: Verify the migration
    console.log('Step 5: Verifying migration...');

    const remainingUnassigned = await customerModel.countDocuments({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    }).exec();

    const assignedToToma = await customerModel.countDocuments({
      createdBy: tomaUser._id
    }).exec();

    console.log(`✅ Customers still unassigned: ${remainingUnassigned}`);
    console.log(`✅ Customers assigned to Toma: ${assignedToToma}`);
    console.log('');

    if (remainingUnassigned === 0) {
      console.log('🎉 SUCCESS! All customers have been assigned to Toma Babayan.');
    } else {
      console.log('⚠️  WARNING: Some customers are still unassigned.');
      console.log('   You may need to run this migration again.');
    }

  } catch (error) {
    console.error('');
    console.error('='.repeat(70));
    console.error('❌ MIGRATION FAILED');
    console.error('='.repeat(70));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(70));
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
