import { IsString, IsEmail, IsEnum, IsOptional, IsISO8601 } from 'class-validator';
import { CustomerStatus } from '../schemas/customer.schema';

export class CreateCustomerDto {
  @IsString()
  companyName: string;

  @IsString()
  contactPerson: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  linkedinPage?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  nextFollowUpAt?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  lastContactedAt?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  scheduledMeetingAt?: string;
}
