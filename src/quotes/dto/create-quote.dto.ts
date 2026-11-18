import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum,
  IsArray, ValidateNested, Min, Max, IsDateString,
} from 'class-validator';

export class CreateQuoteItemDto {
  @IsString() @IsOptional() itemId?: string;
  @IsString() @IsOptional() garmentTypeId?: string;
  @IsString() @IsOptional() garmentTypeName?: string;
  @IsString() @IsOptional() fabricId?: string;
  @IsString() @IsOptional() fabricName?: string;
  @IsString() @IsOptional() colorId?: string;
  @IsString() @IsOptional() colorName?: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsOptional() decorationMethod?: string;
  @IsString() @IsOptional() logoPosition?: string;
  @IsString() @IsOptional() logoSize?: string;
  @IsNumber() @Min(1) quantity: number;
  @IsOptional() sizeBreakdown?: Record<string, any>;
  @IsNumber() @Min(0) unitPrice: number;
  @IsNumber() @Min(0) @Max(100) @IsOptional() lineDiscountPercent?: number;
  @IsNumber() @Min(0) @IsOptional() lineTotal?: number;
  @IsString() @IsOptional() imageUrl?: string;
  @IsNumber() @IsOptional() sortOrder?: number;
  @IsNumber() @Min(0) @IsOptional() estimatedUnitCost?: number;
}

export class CreateQuoteDto {
  @IsString() @IsNotEmpty() dealId: string;
  @IsString() @IsNotEmpty() customerId: string;
  @IsString() @IsOptional() contactPersonId?: string;
  @IsEnum(['hy', 'en']) @IsOptional() language?: string;
  @IsEnum(['cash', 'invoice']) @IsOptional() paymentType?: string;
  @IsNumber() @Min(0) @Max(100) @IsOptional() prepaymentPercent?: number;
  @IsNumber() @Min(1) @IsOptional() validityDays?: number;
  @IsDateString() @IsOptional() issueDate?: string;
  @IsDateString() @IsOptional() validUntil?: string;
  @IsEnum(['percent', 'amount']) @IsOptional() discountType?: string;
  @IsNumber() @Min(0) @IsOptional() discountValue?: number;
  @IsNumber() @Min(0) @IsOptional() productionLeadTimeDays?: number;
  @IsString() @IsOptional() deliveryTerms?: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() termsText?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateQuoteItemDto) @IsOptional()
  items?: CreateQuoteItemDto[];
}
