import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { PaymentPeriod, PaymentStatus } from '../schemas/salary-payment.schema';

export class CreateSalaryPaymentDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2020)
  year: number;

  @IsEnum(PaymentPeriod)
  period: PaymentPeriod;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cardAmount?: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
