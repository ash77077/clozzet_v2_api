#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AdminSeeder } from '../seeders/admin.seeder';

async function createAdminUser() {
  const logger = new Logger('CreateAdminScript');
  
  try {
    logger.log('🚀 Starting admin user creation...');
    
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get the AdminSeeder service
    const adminSeeder = app.get(AdminSeeder);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const action = args.find(arg => arg.startsWith('--action='))?.split('=')[1] || 'create';
    const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1];
    const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1];

    switch (action) {
      case 'create':
        logger.log('📝 Environment variables you can set:');
        logger.log('   ADMIN_EMAIL (default: admin@clozzet.com)');
        logger.log('   ADMIN_PASSWORD (default: Admin@123456)');
        logger.log('   ADMIN_FIRST_NAME (default: Admin)');
        logger.log('   ADMIN_LAST_NAME (default: User)');
        logger.log('   ADMIN_PHONE (default: +1234567890)');
        logger.log('');
        
        await adminSeeder.seedAdminUser();
        
        logger.log('');
        logger.log('🎉 Admin user creation completed!');
        logger.log('⚠️  Please change the default password after first login');
        break;

      case 'update-password':
        if (!email || !password) {
          logger.error('❌ Email and password are required for password update');
          logger.log('Usage: npm run create-admin -- --action=update-password --email=admin@example.com --password=newpassword');
          process.exit(1);
        }
        await adminSeeder.updateAdminPassword(email, password);
        break;

      case 'delete':
        if (!email) {
          logger.error('❌ Email is required for admin deletion');
          logger.log('Usage: npm run create-admin -- --action=delete --email=admin@example.com');
          process.exit(1);
        }
        await adminSeeder.deleteAdminUser(email);
        break;

      case 'list':
        await adminSeeder.listAdminUsers();
        break;

      default:
        logger.error(`❌ Unknown action: ${action}`);
        logger.log('Available actions: create, update-password, delete, list');
        logger.log('');
        logger.log('Examples:');
        logger.log('  npm run create-admin');
        logger.log('  npm run create-admin -- --action=list');
        logger.log('  npm run create-admin -- --action=update-password --email=admin@example.com --password=newpass');
        logger.log('  npm run create-admin -- --action=delete --email=admin@example.com');
        process.exit(1);
    }

    await app.close();
    process.exit(0);

  } catch (error) {
    logger.error(`❌ Failed to create admin user: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
createAdminUser();