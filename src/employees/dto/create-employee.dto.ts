import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { EmployeeStatus, PaymentMethod } from '../schemas/employee.schema';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @Min(0)
  monthlySalary: number;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashPortion?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cardPortion?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
