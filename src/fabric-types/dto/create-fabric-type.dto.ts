import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, IsNumber, Min } from 'class-validator';

export class CreateFabricTypeDto {
  @IsString() @IsNotEmpty() nameArm: string;
  @IsString() @IsNotEmpty() nameEng: string;
  @IsString() @IsIn(['m', 'kg']) unit: string;
  @IsString() @IsOptional() composition?: string;
  @IsNumber() @IsOptional() @Min(0) densityGsm?: number;
  @IsNumber() @IsOptional() @Min(0) widthCm?: number;
  @IsNumber() @IsOptional() @Min(0) pricePerUnitAmd?: number;
  @IsString() @IsOptional() notes?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
