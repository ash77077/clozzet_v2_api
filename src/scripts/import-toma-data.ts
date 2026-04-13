import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CustomersService } from '../customers/customers.service';
import { InteractionsService } from '../interactions/interactions.service';
import { CustomerStatus } from '../customers/schemas/customer.schema';
import { InteractionType } from '../interactions/schemas/interaction.schema';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

interface ExcelRow {
  'Company Name': string;
  Industry: string;
  'Contact Person': string | null;
  Position: string | null;
  Phone: string | null;
  Email: string | null;
  Linkedin: string | null;
  Notes: string;
  'First Contact date': string | Date;
  'Next Follow Up': string | Date | null;
  'Scheduled meeting': string | Date | null;
}

interface GroupedContact {
  companyName: string;
  contactPerson: string | null;
  industry: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  rows: ExcelRow[];
}

interface ImportStats {
  totalRows: number;
  uniqueContacts: number;
  customersCreated: number;
  interactionsCreated: number;
  scheduledMeetings: number;
  errors: string[];
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;

  // Strip prefixes
  let normalized = phone.replace(/^(tel:|whatsapp:)/i, '').trim();

  // Optionally strip +374 country code (uncomment if needed)
  // normalized = normalized.replace(/^\+374/, '');

  return normalized || null;
}

function getInteractionType(notes: string): InteractionType {
  const lowerNotes = notes.toLowerCase();

  // Check for LinkedIn-related keywords (including Armenian characters)
  if (lowerNotes.includes('linkedin') ||
      lowerNotes.includes('լինք') ||
      lowerNotes.includes('նամակ')) {
    return InteractionType.LINKEDIN;
  }

  // Default to call
  return InteractionType.CALL;
}

function parseDate(dateValue: string | Date | null): Date | null {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Handle Excel date serial numbers
  if (typeof dateValue === 'number') {
    // Excel serial date (days since 1900-01-01)
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 2; // Excel has a leap year bug
    return new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  }

  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function groupByContact(rows: ExcelRow[]): GroupedContact[] {
  const groups = new Map<string, GroupedContact>();

  for (const row of rows) {
    const companyName = row['Company Name']?.trim() || '';
    const contactPerson = row['Contact Person']?.trim() || null;

    // Create unique key: company + contact (or "Unknown" for null contacts)
    const key = `${companyName}|||${contactPerson || 'Unknown'}`;

    if (!groups.has(key)) {
      groups.set(key, {
        companyName,
        contactPerson,
        industry: row.Industry?.trim() || '',
        position: row.Position?.trim() || null,
        phone: row.Phone?.trim() || null,
        email: row.Email?.trim() || null,
        linkedin: row.Linkedin?.trim() || null,
        rows: [],
      });
    }

    groups.get(key)!.rows.push(row);
  }

  return Array.from(groups.values());
}

async function importTomaData(filePath: string, dryRun: boolean = false) {
  console.log('\n========================================');
  console.log('TOMA SPREADSHEET IMPORT');
  console.log('========================================\n');

  if (dryRun) {
    console.log('>>> DRY RUN MODE - No data will be written to database <<<\n');
  }

  // Initialize NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);
  const customersService = app.get(CustomersService);
  const interactionsService = app.get(InteractionsService);

  const stats: ImportStats = {
    totalRows: 0,
    uniqueContacts: 0,
    customersCreated: 0,
    interactionsCreated: 0,
    scheduledMeetings: 0,
    errors: [],
  };

  try {
    // Read Excel file
    console.log(`Reading file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Toma';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in workbook`);
    }

    // Convert to JSON
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    stats.totalRows = rows.length;

    console.log(`✓ Loaded ${rows.length} rows from "${sheetName}" sheet\n`);

    // Group by company + contact
    console.log('Grouping rows by company and contact person...');
    const groupedContacts = groupByContact(rows);
    stats.uniqueContacts = groupedContacts.length;

    console.log(`✓ Found ${groupedContacts.length} unique contacts\n`);

    // Process each contact group
    for (const group of groupedContacts) {
      try {
        // Sort rows by date (oldest first)
        group.rows.sort((a, b) => {
          const dateA = parseDate(a['First Contact date'])?.getTime() || 0;
          const dateB = parseDate(b['First Contact date'])?.getTime() || 0;
          return dateA - dateB;
        });

        const firstRow = group.rows[0];
        const lastRow = group.rows[group.rows.length - 1];

        // Prepare customer data
        const firstContactDate = parseDate(firstRow['First Contact date']);
        const lastContactDate = parseDate(lastRow['First Contact date']);
        const nextFollowUp = parseDate(lastRow['Next Follow Up']);
        const scheduledMeeting = parseDate(lastRow['Scheduled meeting']);

        const customerData: any = {
          companyName: group.companyName,
          contactPerson: group.contactPerson || 'Unknown',
          industry: group.industry,
          phone: normalizePhone(group.phone) || undefined,
          email: group.email || undefined,
          linkedinPage: group.linkedin || undefined,
          notes: firstRow.Notes, // First note becomes the customer note
          source: 'Toma spreadsheet import',
          status: CustomerStatus.LEAD,
          lastContactedAt: lastContactDate?.toISOString(),
          nextFollowUpAt: nextFollowUp?.toISOString(),
          scheduledMeetingAt: scheduledMeeting?.toISOString(),
        };

        if (dryRun) {
          console.log(`[DRY RUN] Would create customer: ${group.companyName} / ${group.contactPerson || 'Unknown'}`);
          console.log(`  - Industry: ${group.industry}`);
          console.log(`  - First contact: ${firstContactDate?.toLocaleDateString() || 'Unknown'}`);
          console.log(`  - Total interactions: ${group.rows.length}`);
          if (group.rows.length > 1) {
            console.log(`  - Would create ${group.rows.length - 1} interaction records`);
          }
          if (scheduledMeeting) {
            console.log(`  - Has scheduled meeting: ${scheduledMeeting.toLocaleDateString()}`);
          }
        } else {
          // Check for existing customer with same company + contact
          const existingCustomer = await customersService['customerModel']
            .findOne({
              companyName: group.companyName,
              contactPerson: group.contactPerson || 'Unknown',
              source: 'Toma spreadsheet import',
            })
            .exec();

          if (existingCustomer) {
            console.log(`⊘ Skipping duplicate: ${group.companyName} / ${group.contactPerson || 'Unknown'}`);
            continue;
          }

          // Create customer
          const customer = await customersService.create(customerData);
          stats.customersCreated++;

          console.log(`✓ Created customer [${stats.customersCreated}]: ${group.companyName} / ${group.contactPerson || 'Unknown'}`);

          // Create interactions for subsequent rows (skip first row as it's in notes)
          if (group.rows.length > 1) {
            const interactionRows = group.rows.slice(1);

            for (let i = 0; i < interactionRows.length; i++) {
              const row = interactionRows[i];
              const interactionDate = parseDate(row['First Contact date']);
              const nextFollowUpDate = parseDate(row['Next Follow Up']);

              const interactionData = {
                customerId: (customer as any)._id.toString(),
                type: getInteractionType(row.Notes),
                interactionDate: interactionDate?.toISOString() || new Date().toISOString(),
                summary: row.Notes,
                subject: 'Imported from Toma spreadsheet',
                nextFollowUpDate: nextFollowUpDate?.toISOString(),
              };

              // Use a default user ID (you may need to adjust this)
              await interactionsService.create(interactionData, undefined as any);
              stats.interactionsCreated++;
            }

            console.log(`  → Created ${interactionRows.length} interactions`);
          }

          if (scheduledMeeting) {
            stats.scheduledMeetings++;
            console.log(`  → Has scheduled meeting on ${scheduledMeeting.toLocaleDateString()}`);
          }
        }
      } catch (error) {
        const errorMsg = `Error processing ${group.companyName} / ${group.contactPerson}: ${error.message}`;
        console.error(`✗ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('IMPORT SUMMARY');
    console.log('========================================');
    console.log(`Total rows in Excel:        ${stats.totalRows}`);
    console.log(`Unique contacts found:      ${stats.uniqueContacts}`);

    if (dryRun) {
      console.log(`\n>>> DRY RUN - No data was written <<<`);
      console.log(`\nWould create:`);
      console.log(`  - ${stats.uniqueContacts} customer records`);
      console.log(`  - ~${stats.totalRows - stats.uniqueContacts} interaction records`);
    } else {
      console.log(`Customers created:          ${stats.customersCreated}`);
      console.log(`Interactions created:       ${stats.interactionsCreated}`);
      console.log(`Scheduled meetings:         ${stats.scheduledMeetings}`);
      console.log(`Errors:                     ${stats.errors.length}`);
    }

    if (stats.errors.length > 0) {
      console.log('\nErrors encountered:');
      stats.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }

    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ FATAL ERROR:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  // Default file path (can be overridden with argument)
  let filePath = path.join(__dirname, '../../..', 'Toma_optimized.xlsx');

  // Check if file path is provided as argument
  const fileArgIndex = args.findIndex(arg => !arg.startsWith('--'));
  if (fileArgIndex !== -1) {
    filePath = path.resolve(args[fileArgIndex]);
  }

  try {
    await importTomaData(filePath, dryRun);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { importTomaData };