import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { CustomersSchedulerService } from './customers-scheduler.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CustomerStatus } from './schemas/customer.schema';
import * as XLSX from 'xlsx';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly customersSchedulerService: CustomersSchedulerService,
  ) {}

  /**
   * POST /customers - Create a new customer
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    const userId = req.user?.userId;
    console.log('[CREATE CUSTOMER] User from JWT:', req.user);
    console.log('[CREATE CUSTOMER] User ID:', userId);
    const data = await this.customersService.create(createCustomerDto, userId);
    return { success: true, message: 'Customer created successfully', data };
  }

  /**
   * GET /customers - Get all customers
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll() {
    const data = await this.customersService.findAll();
    return { success: true, message: 'Customers retrieved successfully', data };
  }

  /**
   * GET /customers/status/:status - Get customers by status
   */
  @Get('status/:status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findByStatus(@Param('status') status: CustomerStatus) {
    const data = await this.customersService.findByStatus(status);
    return { success: true, message: `${status} customers retrieved successfully`, data };
  }

  /**
   * GET /customers/follow-ups - Get customers needing follow-up
   */
  @Get('follow-ups/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findNeedingFollowUp() {
    const data = await this.customersService.findNeedingFollowUp();
    return { success: true, message: 'Customers needing follow-up retrieved successfully', data };
  }

  /**
   * GET /customers/deleted - List soft-deleted customers (admin only)
   * Must be before :id routes to avoid param matching
   */
  @Get('deleted')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findDeleted() {
    const data = await this.customersService.findDeleted();
    return { success: true, message: 'Deleted customers retrieved', data };
  }

  /**
   * GET /customers/:id - Get a single customer by ID
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findOne(@Param('id') id: string) {
    const data = await this.customersService.findById(id);
    return { success: true, message: 'Customer retrieved successfully', data };
  }

  /**
   * PUT /customers/:id - Update a customer
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const data = await this.customersService.update(id, updateCustomerDto);
    return { success: true, message: 'Customer updated successfully', data };
  }

  /**
   * PATCH /customers/:id/restore - Restore a soft-deleted customer (admin only)
   */
  @Patch(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async restore(@Param('id') id: string) {
    const data = await this.customersService.restore(id);
    return { success: true, message: 'Customer restored successfully', data };
  }

  /**
   * DELETE /customers/:id/hard - Permanently delete a customer (admin only)
   */
  @Delete(':id/hard')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async hardDelete(@Param('id') id: string) {
    await this.customersService.hardDelete(id);
    return { success: true, message: 'Customer permanently deleted', data: null };
  }

  /**
   * DELETE /customers/:id - Delete (soft delete) a customer
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async remove(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: any) {
    const userId = req.user?.userId;
    await this.customersService.remove(id, userId, body?.reason);
    return { success: true, message: 'Customer deleted successfully', data: null };
  }

  /**
   * DELETE /customers/cleanup/duplicates - Delete duplicate customers by company name
   */
  @Delete('cleanup/duplicates/:companyName')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async cleanupDuplicates(@Param('companyName') companyName: string) {
    const deleted = await this.customersService.deleteDuplicatesByCompanyName(companyName);
    return {
      success: true,
      message: `Deleted ${deleted} duplicate customers with name: ${companyName}`,
      data: { count: deleted }
    };
  }

  /**
   * POST /customers/trigger-followup-notifications - Manually trigger daily follow-up notifications
   * This endpoint allows admins to manually trigger the follow-up notification system for testing
   */
  @Post('trigger-followup-notifications')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async triggerFollowUpNotifications() {
    const result = await this.customersSchedulerService.triggerManualFollowUpReminder();
    return {
      success: result.success,
      message: result.message,
      data: {
        customersCount: result.customersCount,
        managersNotified: result.managersNotified,
      },
    };
  }

  /**
   * POST /customers/import/excel/validate - Validate Excel file before import
   * Required columns: Company Name, Contact Person
   * Optional columns: Phone, Email, Status, Address, Website, Industry, Notes, First Contact Date, Scheduled Meeting, Next Follow Up
   */
  @Post('import/excel/validate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async validateExcelImport(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user?.userId;
    const result = await this.processExcelFile(file, true, userId);
    return {
      success: true,
      message: 'Validation completed',
      data: result,
    };
  }

  /**
   * POST /customers/import/excel - Import customers from Excel file
   * Required columns: Company Name, Contact Person
   * Optional columns: Phone, Email, Status, Address, Website, Industry, Notes, First Contact Date, Scheduled Meeting, Next Follow Up
   */
  @Post('import/excel')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user?.userId;
    const result = await this.processExcelFile(file, false, userId);
    return {
      success: true,
      message: `Import completed: ${result.success} successful, ${result.failed} failed`,
      data: result,
    };
  }

  /**
   * Helper method to process Excel file
   * @param file - The uploaded Excel file
   * @param validateOnly - If true, only validate without importing
   * @param userId - The ID of the user performing the import
   */
  private async processExcelFile(file: Express.Multer.File, validateOnly: boolean = false, userId?: string) {
    // Check file extension
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      throw new BadRequestException('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
    }

    try {
      // Parse the Excel file - DO NOT fill merged cells
      const workbook = XLSX.read(file.buffer, { type: 'buffer', cellFormula: false, cellHTML: false });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Store merged cell information for reference
      const mergedCells = worksheet['!merges'] || [];
      console.log(`[IMPORT] Found ${mergedCells.length} merged cell ranges`);

      // Convert to JSON - empty cells will be empty strings due to defval
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      console.log(`[IMPORT] Total rows in Excel: ${rawData.length}`);

      // Log first few rows to debug
      console.log('[IMPORT] First 3 rows Company Names:',
        rawData.slice(0, 3).map((r, i) => `Row ${i}: "${r['Company Name']}"`).join(', '));

      // Process horizontal note/date columns (Note 1/Date 1, Note 2/Date 2, etc.)
      // Each row is a customer with multiple notes as separate columns
      const consolidatedData: any[] = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const companyName = row['Company Name']?.toString().trim() || '';

        if (!companyName) continue;

        // Extract all Note/Date pairs from columns
        const interactions: any[] = [];

        // Try to find all Note columns (Note 1, Note 2, Note 3, etc. OR just sequential date/note columns)
        for (let noteNum = 1; noteNum <= 20; noteNum++) {
          // Try different column name variations
          const noteCol = row[`Note ${noteNum}`] || row[`Note${noteNum}`] || row[`note ${noteNum}`];
          const dateCol = row[`Date ${noteNum}`] || row[`Date${noteNum}`] || row[`date ${noteNum}`];

          const noteText = noteCol?.toString().trim();

          if (noteText) {
            interactions.push({
              note: noteText,
              date: dateCol || null,
            });
          } else {
            // Stop looking for more notes if we find an empty one
            break;
          }
        }

        // If no Note 1/Date 1 columns found, try the original Notes column approach
        if (interactions.length === 0) {
          const singleNote = row['Notes']?.toString().trim();
          const singleDate = row['First Contact date'] || row['First Contact Date'];

          if (singleNote) {
            interactions.push({
              note: singleNote,
              date: singleDate,
            });
          }
        }

        console.log(`[IMPORT DEBUG] Company: ${companyName}, Found ${interactions.length} notes/dates in columns`);

        if (interactions.length === 0) continue;

        // Sort interactions by date (oldest first)
        interactions.sort((a: any, b: any) => {
          const dateA = this.parseExcelDate(a.date) || new Date(0);
          const dateB = this.parseExcelDate(b.date) || new Date(0);
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

        // SKIP Note 1/Date 1 entirely - it goes to customer notes field, NOT as interaction
        const firstNote = interactions[0];

        // All remaining notes (2, 3, 4, etc.) become interaction history
        const conversations = interactions.slice(1).map((interaction: any) => ({
          note: interaction.note,
          date: interaction.date,
        }));

        // Create customer object
        const customer: any = {
          ...row,
          Notes: firstNote.note, // First note goes to Notes field
          'First Contact date': firstNote.date,
          _activities: conversations, // Notes 2-8+ become interactions
        };

        // Use Next Follow Up and Scheduled meeting from the main row
        if (row['Next Follow Up']) {
          customer['Next Follow Up'] = row['Next Follow Up'];
        }
        if (row['Scheduled meeting'] || row['Scheduled Meeting']) {
          customer['Scheduled meeting'] = row['Scheduled meeting'] || row['Scheduled Meeting'];
          customer['Scheduled Meeting'] = row['Scheduled meeting'] || row['Scheduled Meeting'];
        }

        consolidatedData.push(customer);
      }

      console.log(`[IMPORT] Processed ${consolidatedData.length} customers`);
      console.log(`[IMPORT] Total interactions to create: ${consolidatedData.reduce((sum, c) => sum + (c._activities?.length || 0), 0)}`);

      const finalData = consolidatedData.length > 0 ? consolidatedData : rawData;

      if (finalData.length === 0) {
        throw new BadRequestException('Excel file is empty or contains no valid data');
      }

      // Map Excel columns to DTO fields
      const customersData = finalData.map(row => {
        // Helper function to safely get and trim string values
        const safeString = (value: any): string => {
          if (value === null || value === undefined || value === '') return '';
          return value.toString().trim();
        };

        const email = safeString(row['Email']);
        const companyName = safeString(row['Company Name']);
        const contactPerson = safeString(row['Contact Person']);
        const phone = safeString(row['Phone']);
        const status = safeString(row['Status']) || 'Lead';

        // Convert activities to interactions format
        // Note: row.Notes already contains Note 1 (set in consolidation step)
        // row._activities already contains Notes 2-8+ (skipping Note 1)
        const activities = row._activities || [];

        // Use the Notes field directly from row (already contains Note 1)
        const customerNotes = safeString(row['Notes']);

        // All activities in _activities are already Notes 2-8+ (Note 1 was excluded)
        const conversations = activities
          .filter((activity: any) => activity.note)
          .map((activity: any) => ({
            summary: activity.note,
            date: activity.date ? this.parseExcelDate(activity.date) : undefined,
          }));

        console.log(`[IMPORT DEBUG] Company: ${companyName}, Note 1 in notes field, Conversations to create: ${conversations.length}`);

        // Normalize phone number
        const normalizePhone = (phoneValue: string): string => {
          if (!phoneValue) return '';
          return phoneValue.replace(/^(tel:|whatsapp:)/i, '').trim();
        };

        return {
          companyName: companyName,
          contactPerson: contactPerson || 'Unknown',
          phone: normalizePhone(phone),
          email: email || undefined,
          status: status,
          address: safeString(row['Address']),
          website: safeString(row['Website']),
          linkedinPage: safeString(row['LinkedIn Page']) || safeString(row['LinkedIn']) || safeString(row['Linkedin']),
          industry: safeString(row['Industry']),
          notes: customerNotes,
          source: 'Excel import',
          nextFollowUpAt: row['Next Follow Up'] ? this.parseExcelDate(row['Next Follow Up']) : undefined,
          lastContactedAt: row['First Contact date'] || row['First Contact Date'] ? this.parseExcelDate(row['First Contact date'] || row['First Contact Date']) : undefined,
          scheduledMeetingAt: row['Scheduled meeting'] || row['Scheduled Meeting'] ? this.parseExcelDate(row['Scheduled meeting'] || row['Scheduled Meeting']) : undefined,
          _conversations: conversations, // Metadata for creating interactions
        };
      });

      // Deduplicate by email - keep only the first occurrence of each email
      const seenEmails = new Set<string>();
      const deduplicatedData = customersData.filter(customer => {
        // Skip customers without email from deduplication check
        if (!customer.email) {
          return true;
        }

        const email = customer.email.toLowerCase();

        // Keep only first occurrence of each email
        if (seenEmails.has(email)) {
          return false;
        }

        seenEmails.add(email);
        return true;
      });

      // Log deduplication info if any duplicates were removed
      const duplicatesRemoved = customersData.length - deduplicatedData.length;
      if (duplicatesRemoved > 0) {
        console.log(`Removed ${duplicatesRemoved} duplicate email(s) from import`);
      }

      if (validateOnly) {
        // Validate only - don't import, just return validation results
        const validationResults = await this.customersService.validateBulkImport(deduplicatedData);
        return {
          ...validationResults,
          duplicatesRemoved: duplicatesRemoved,
          originalTotal: customersData.length,
        };
      } else {
        // Import the data
        const result = await this.customersService.bulkImport(deduplicatedData, userId);
        return {
          ...result,
          duplicatesRemoved: duplicatesRemoved,
          originalTotal: customersData.length,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to process Excel file');
    }
  }

  /**
   * Helper method to parse Excel date values
   */
  private parseExcelDate(value: any): string | undefined {
    if (!value) return undefined;

    // If it's already a string in ISO format
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return undefined;
    }

    // If it's an Excel serial date number
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + value * 86400000);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return undefined;
  }

  /**
   * Helper method to parse conversations from notes field
   * Expected format: "YYYY-MM-DD: conversation text" or "DD/MM/YYYY: conversation text"
   * Multiple conversations separated by newlines or semicolons
   */
  private parseConversations(notes: string): Array<{ date: string, summary: string }> {
    if (!notes) return [];

    const conversations: Array<{ date: string, summary: string }> = [];

    // Split by newlines or semicolons
    const lines = notes.split(/[\n;]/).map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
      // Try to match different date formats at the start of the line
      // Format 1: YYYY-MM-DD: text or YYYY/MM/DD: text
      const match1 = line.match(/^(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s*[:\-]\s*(.+)$/);
      // Format 2: DD-MM-YYYY: text or DD/MM/YYYY: text
      const match2 = line.match(/^(\d{1,2}[-/]\d{1,2}[-/]\d{4})\s*[:\-]\s*(.+)$/);
      // Format 3: DD.MM.YYYY: text
      const match3 = line.match(/^(\d{1,2}\.\d{1,2}\.\d{4})\s*[:\-]\s*(.+)$/);

      if (match1) {
        const dateStr = match1[1].replace(/\//g, '-');
        const summary = match1[2].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          conversations.push({ date: date.toISOString(), summary });
        }
      } else if (match2) {
        const parts = match2[1].split(/[-/]/);
        const dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        const summary = match2[2].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          conversations.push({ date: date.toISOString(), summary });
        }
      } else if (match3) {
        const parts = match3[1].split('.');
        const dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        const summary = match3[2].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          conversations.push({ date: date.toISOString(), summary });
        }
      }
    }

    return conversations;
  }
}
