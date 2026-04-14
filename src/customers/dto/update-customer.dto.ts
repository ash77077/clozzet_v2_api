import { IsString, IsEmail, IsEnum, IsOptional, IsISO8601, IsArray, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerStatus } from '../schemas/customer.schema';
import { ContactPersonDto } from './create-customer.dto';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
  @IsOptional()
  contacts?: ContactPersonDto[];

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
