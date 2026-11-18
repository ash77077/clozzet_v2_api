import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateGlobalSettingsDto {
  @IsNumber() @IsOptional() @Min(0) @Max(100) fabricWastePercent?: number;
  @IsNumber() @IsOptional() @Min(0) @Max(100) turnoverTaxPercent?: number;
  @IsNumber() @IsOptional() @Min(0) lowStockThreshold?: number;

  @IsNumber() @IsOptional() @Min(0) @Max(100) quoteDefaultPrepaymentPercent?: number;
  @IsNumber() @IsOptional() @Min(1) quoteDefaultValidityDays?: number;
  @IsNumber() @IsOptional() @Min(1) quoteDefaultLeadTimeDays?: number;
  @IsString() @IsOptional() quoteDefaultDeliveryTerms?: string;
  @IsString() @IsOptional() quoteDefaultTermsText?: string;
}
