import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductionNormDto {
  @IsString() @IsNotEmpty() clothTypeId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @Min(0) quantity: number;
  @IsString() @IsNotEmpty() unit: string;
  @IsNumber() @Min(0) unitCostAmd: number;
  @IsString() @IsOptional() notes?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsNumber() @IsOptional() sortOrder?: number;
}
