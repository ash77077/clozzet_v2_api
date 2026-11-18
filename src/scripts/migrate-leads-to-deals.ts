/**
 * Migration: Lead customers → Pipeline deals
 *
 * For every Customer with status=Lead that has no existing deal,
 * creates a deal in the 'new_lead' stage.
 *
 * Dry-run:  npx ts-node -r tsconfig-paths/register src/scripts/migrate-leads-to-deals.ts --dry-run
 * Real run: npx ts-node -r tsconfig-paths/register src/scripts/migrate-leads-to-deals.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Customer, CustomerStatus } from '../customers/schemas/customer.schema';
import { Deal } from '../deals/schemas/deal.schema';
import { DealSource } from '../deals/schemas/deal.schema';
import { PipelineStage } from '../pipeline-stages/schemas/pipeline-stage.schema';
import { User } from '../users/schemas/user.schema';

const VALID_SOURCES = new Set(Object.values(DealSource));

const DRY_RUN = process.argv.includes('--dry-run');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  const customerModel = app.get<Model<Customer>>(getModelToken(Customer.name));
  const dealModel     = app.get<Model<Deal>>(getModelToken(Deal.name));
  const stageModel    = app.get<Model<PipelineStage>>(getModelToken(PipelineStage.name));
  const userModel     = app.get<Model<User>>(getModelToken(User.name));

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Migrate Leads → Deals  ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'}`);
  console.log(`${'─'.repeat(60)}\n`);

  // Get the new_lead stage
  const newLeadStage = await stageModel.findOne({ key: 'new_lead' }).exec();
  if (!newLeadStage) {
    throw new Error('Pipeline stage "new_lead" not found. Run the app once to seed stages.');
  }

  // Fallback owner: first admin user
  const adminUser = await userModel.findOne({ role: 'admin', isActive: true }).exec();
  if (!adminUser) {
    throw new Error('No active admin user found for fallback ownerId.');
  }
  const fallbackOwnerId = (adminUser as any)._id as Types.ObjectId;
  console.log(`Fallback owner: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})\n`);

  // Load all Lead customers
  const leads = await customerModel
    .find({ status: CustomerStatus.LEAD, isActive: { $ne: false } })
    .exec();

  console.log(`Lead customers found: ${leads.length}`);

  // Find customers that already have a deal
  const existingDeals = await dealModel
    .find({ customerId: { $in: leads.map(l => (l as any)._id) }, isDeleted: false })
    .select('customerId')
    .exec();

  const alreadyHasDeal = new Set(existingDeals.map(d => d.customerId.toString()));

  const toMigrate = leads.filter(l => !alreadyHasDeal.has((l as any)._id.toString()));
  const skipped   = leads.length - toMigrate.length;

  console.log(`Already have a deal: ${skipped}  →  skipping`);
  console.log(`To create:          ${toMigrate.length}\n`);

  if (toMigrate.length === 0) {
    console.log('Nothing to do.');
    await app.close();
    return;
  }

  let created = 0;
  let errors  = 0;

  for (const customer of toMigrate) {
    const customerId  = (customer as any)._id as Types.ObjectId;
    const ownerId     = (customer.assignedTo as Types.ObjectId | null) ?? fallbackOwnerId;
    const title       = customer.companyName;

    console.log(`  ${DRY_RUN ? '[DRY]' : '[CREATE]'} "${title}" (customer: ${customerId})`);

    if (!DRY_RUN) {
      try {
        await dealModel.create({
          title,
          customerId,
          contactPersonId: null,
          ownerId,
          stageId:         (newLeadStage as any)._id,
          stageKey:        newLeadStage.key,
          stageEnteredAt:  (customer as any).createdAt ?? new Date(),
          probability:     newLeadStage.probability,
          source:          (customer.source && VALID_SOURCES.has(customer.source as DealSource)) ? customer.source : undefined,
          nextStepNote:    customer.notes ?? undefined,
          createdBy:       ownerId,
          isDeleted:       false,
          orderIds:        [],
          quoteIds:        [],
        });
        created++;
      } catch (e: any) {
        console.error(`    ERROR: ${e.message}`);
        errors++;
      }
    } else {
      created++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${DRY_RUN ? 'Would create' : 'Created'}: ${created} deals`);
  if (skipped)  console.log(`  Skipped (already had deal): ${skipped}`);
  if (errors)   console.log(`  Errors: ${errors}`);
  console.log(`${'─'.repeat(60)}\n`);

  await app.close();
}

bootstrap().catch(e => { console.error(e); process.exit(1); });
