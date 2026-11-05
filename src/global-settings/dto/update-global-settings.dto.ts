import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateGlobalSettingsDto {
  @IsNumber() @IsOptional() @Min(0) @Max(100) fabricWastePercent?: number;
  @IsNumber() @IsOptional() @Min(0) @Max(100) turnoverTaxPercent?: number;
  @IsNumber() @IsOptional() @Min(0) lowStockThreshold?: number;
}
