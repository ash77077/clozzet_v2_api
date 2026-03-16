import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateMonthlyExpenseReportDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2020)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  utilities: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fixedSalaries: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  variableDailyLabor: number;
}

export class UpdateMonthlyExpenseReportDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @IsNumber()
  @Min(2020)
  year?: number;

  @IsNumber()
  @Min(0)
  rent?: number;

  @IsNumber()
  @Min(0)
  utilities?: number;

  @IsNumber()
  @Min(0)
  fixedSalaries?: number;

  @IsNumber()
  @Min(0)
  variableDailyLabor?: number;
}
