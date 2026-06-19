import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerStatus } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ImportResult } from './dto/bulk-import-customers.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { InteractionsService } from '../interactions/interactions.service';
import { InteractionType } from '../interactions/schemas/interaction.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>,
    @Inject(forwardRef(() => InteractionsService))
    private readonly interactionsService: InteractionsService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId?: string): Promise<Customer> {
    const customerData = {
      ...createCustomerDto,
      createdBy: userId || null,
    };
    const customer = new this.customerModel(customerData);
    return await customer.save();
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerModel
      .find({ isActive: true })
      .populate('createdBy', 'firstName lastName')
      .sort({ lastContactedAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id).populate('createdBy', 'firstName lastName').exec();
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, updateCustomerDto, { new: true })
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async remove(id: string, userId?: string, reason?: string): Promise<void> {
    const result = await this.customerModel
      .findByIdAndUpdate(id, { isActive: false, deletedBy: userId || null, deleteReason: reason || null }, { new: true })
      .exec();
    if (!result) throw new NotFoundException(`Customer with ID ${id} not found`);
  }

  async findDeleted(): Promise<Customer[]> {
    return await this.customerModel
      .find({ isActive: false })
      .populate('createdBy', 'firstName lastName')
      .populate('deletedBy', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async restore(id: string): Promise<Customer> {
    const result = await this.customerModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();
    if (!result) throw new NotFoundException(`Customer with ID ${id} not found`);
    return result;
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.customerModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Customer with ID ${id} not found`);
  }

  async deleteDuplicatesByCompanyName(companyName: string): Promise<number> {
    // Find all customers with this company name
    const customers = await this.customerModel
      .find({ companyName: companyName, isActive: true })
      .exec();

    console.log(`[CLEANUP] Found ${customers.length} customers with name: ${companyName}`);

    // Hard delete ALL of them (we'll re-import clean data)
    const result = await this.customerModel
      .deleteMany({ companyName: companyName })
      .exec();

    console.log(`[CLEANUP] Deleted ${result.deletedCount} customers`);

    return result.deletedCount || 0;
  }

  async findByStatus(status: CustomerStatus): Promise<Customer[]> {
    return await this.customerModel
      .find({ status, isActive: true })
      .populate('createdBy', 'firstName lastName')
      .sort({ lastContactedAt: -1 })
      .exec();
  }

  async findNeedingFollowUp(): Promise<Customer[]> {
    const today = new Date();
    return await this.customerModel
      .find({
        isActive: true,
        nextFollowUpAt: { $lte: today },
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ nextFollowUpAt: 1 })
      .exec();
  }

  async updateLastContacted(id: string): Promise<Customer> {
    const customer = await this.customerModel
      .findByIdAndUpdate(
        id,
        { lastContactedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async validateBulkImport(customersData: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      total: customersData.length,
      success: 0,
      failed: 0,
      errors: [],
      importedCustomers: [],
    };

    for (let i = 0; i < customersData.length; i++) {
      const rowData = customersData[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and first row is header

      try {
        // Convert plain object to DTO class instance
        const dto = plainToClass(CreateCustomerDto, rowData);

        // Validate the DTO
        const validationErrors = await validate(dto);

        if (validationErrors.length > 0) {
          const errorMessages = validationErrors.map(error =>
            Object.values(error.constraints || {}).join(', ')
          );

          result.failed++;
          result.errors.push({
            row: rowNumber,
            data: rowData,
            errors: errorMessages,
          });
          continue;
        }

        // Check for duplicate email (skip check for empty emails)
        if (dto.email) {
          const existingCustomer = await this.customerModel.findOne({
            email: dto.email,
            isActive: true
          }).exec();

          if (existingCustomer) {
            result.failed++;
            result.errors.push({
              row: rowNumber,
              data: rowData,
              errors: [`Customer with email ${dto.email} already exists`],
            });
            continue;
          }
        }

        // Validation passed
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          data: rowData,
          errors: [error.message || 'Unknown error occurred'],
        });
      }
    }

    return result;
  }

  async bulkImport(customersData: any[], userId?: string): Promise<ImportResult> {
    const result: ImportResult = {
      total: customersData.length,
      success: 0,
      failed: 0,
      errors: [],
      importedCustomers: [],
    };

    for (let i = 0; i < customersData.length; i++) {
      const rowData = customersData[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and first row is header

      try {
        // Convert plain object to DTO class instance
        const dto = plainToClass(CreateCustomerDto, rowData);

        // Validate the DTO
        const validationErrors = await validate(dto);

        if (validationErrors.length > 0) {
          const errorMessages = validationErrors.map(error =>
            Object.values(error.constraints || {}).join(', ')
          );

          result.failed++;
          result.errors.push({
            row: rowNumber,
            data: rowData,
            errors: errorMessages,
          });
          continue;
        }

        // Check for duplicate email (skip check for empty emails)
        if (dto.email) {
          const existingCustomer = await this.customerModel.findOne({
            email: dto.email,
            isActive: true
          }).exec();

          if (existingCustomer) {
            result.failed++;
            result.errors.push({
              row: rowNumber,
              data: rowData,
              errors: [`Customer with email ${dto.email} already exists`],
            });
            continue;
          }
        }

        // Create the customer with userId
        const customer = await this.create(dto, userId);
        result.success++;
        result.importedCustomers.push(customer);

        // Create interactions from parsed conversations if any
        const conversations = rowData._conversations;
        if (conversations && Array.isArray(conversations) && conversations.length > 0) {
          const customerId = (customer as any)._id.toString();
          console.log(`[IMPORT] Customer: ${customer.companyName}`);
          console.log(`[IMPORT]   - First note saved to Notes field`);
          console.log(`[IMPORT]   - Creating ${conversations.length} additional interactions for Interaction History`);

          let successCount = 0;
          for (let i = 0; i < conversations.length; i++) {
            const conversation = conversations[i];
            try {
              // Auto-detect interaction type from Armenian/English text
              const summary = conversation.summary?.toLowerCase() || '';
              let interactionType = InteractionType.CALL; // Default

              // Check for LinkedIn mentions (English and Armenian)
              if (summary.includes('linkedin') ||
                  summary.includes('լինքդ') ||
                  summary.includes('լինք') ||
                  summary.includes('նամակ') ||
                  summary.includes('հաղորդագրություն')) {
                interactionType = InteractionType.LINKEDIN;
              }
              // Check for WhatsApp
              else if (summary.includes('whatsapp') || summary.includes('վոթսափ')) {
                interactionType = InteractionType.WHATSAPP;
              }
              // Check for email
              else if (summary.includes('email') || summary.includes('էլ') || summary.includes('նամակ')) {
                interactionType = InteractionType.EMAIL;
              }
              // Check for in-person meeting
              else if (summary.includes('meeting') || summary.includes('հանդիպում') || summary.includes('այց')) {
                interactionType = InteractionType.IN_PERSON;
              }

              const interactionData = {
                customerId: customerId,
                type: interactionType,
                interactionDate: conversation.date || new Date().toISOString(),
                summary: conversation.summary,
                subject: 'imported from excel',
                createdByName: 'Toma Babayan'
              };

              console.log(`[IMPORT]   Interaction ${i + 1}: Type=${interactionType}, Date=${conversation.date ? new Date(conversation.date).toLocaleDateString() : 'No date'}, Summary="${conversation.summary?.substring(0, 50)}..."`);

              // Use userId if provided, otherwise pass undefined (will use system user)
              await this.interactionsService.create(interactionData, userId || undefined);
              successCount++;
            } catch (error) {
              console.error(`[IMPORT]   ✗ Failed to create interaction ${i + 1}:`, error.message);
              // Continue with other interactions even if one fails
            }
          }

          console.log(`[IMPORT] ✓ Successfully created ${successCount}/${conversations.length} interactions for: ${customer.companyName}`);
        } else if (conversations && Array.isArray(conversations) && conversations.length === 0) {
          console.log(`[IMPORT] Customer: ${customer.companyName} - Only first note saved (no additional interactions)`);
        } else {
          console.log(`[IMPORT] Customer: ${customer.companyName} - Only note saved (no interaction history)`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          data: rowData,
          errors: [error.message || 'Unknown error occurred'],
        });
      }
    }

    return result;
  }
}
