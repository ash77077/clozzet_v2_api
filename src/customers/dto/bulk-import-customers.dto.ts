import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from './create-customer.dto';

export class BulkImportCustomersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerDto)
  customers: CreateCustomerDto[];
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: ImportError[];
  importedCustomers: any[];
}

export interface ImportError {
  row: number;
  data: any;
  errors: string[];
}
