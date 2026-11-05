import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsNumber, Min } from 'class-validator';

export class CreateConsumptionTemplateDto {
  @IsString() @IsNotEmpty() clothTypeId: string;
  @IsString() @IsNotEmpty() fabricTypeId: string;
  @IsString() @IsOptional() fabricTypeName?: string;
  @IsString() @IsOptional() fabricTypeUnit?: string;

  // New norm fields
  @IsNumber() @IsOptional() @Min(0) adultNorm?: number;
  @IsNumber() @IsOptional() @Min(0) childNorm?: number;
  @IsBoolean() @IsOptional() isDefault?: boolean;

  // Legacy per-size norms — kept for backward compatibility
  @IsObject() @IsOptional()
  consumptionPerSize?: {
    XS?: number; S?: number; M?: number; L?: number;
    XL?: number; XXL?: number; XXXL?: number; XXXXL?: number;
    s1_2?: number; s3_4?: number; s5_6?: number; s7_8?: number;
    s9_10?: number; s11_12?: number; s13_14?: number; s15_16?: number;
  };

  @IsBoolean() @IsOptional() isActive?: boolean;
}
