import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

export class CreateCostScenarioDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  productType: string;

  @IsNumber()
  @Min(1)
  dailyOutput: number;

  @IsNumber()
  @Min(1)
  workingDaysPerMonth: number;

  @IsNumber()
  @Min(0)
  fabricPricePerKg: number;

  @IsNumber()
  @Min(0)
  fabricGramsUsed: number;

  @IsNumber()
  @Min(0)
  accessoriesCostPerUnit: number;

  @IsNumber()
  @Min(0)
  pieceworkLabor: number;

  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsNumber()
  @Min(0)
  monthlyUtilities: number;

  @IsNumber()
  @Min(0)
  monthlyFixedSalaries: number;

  @IsNumber()
  @Min(0)
  monthlyOther: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;
}

export class UpdateCostScenarioDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  productType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  dailyOutput?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  workingDaysPerMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fabricPricePerKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fabricGramsUsed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accessoriesCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pieceworkLabor?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyUtilities?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFixedSalaries?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyOther?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;
}
