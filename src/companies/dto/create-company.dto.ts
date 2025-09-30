import { IsString, IsEmail, IsOptional, IsUrl, IsEnum } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsEnum(['Retail', 'E-commerce', 'Manufacturing', 'Hospitality', 'Healthcare', 'Education', 'Non-profit', 'Government', 'Other'])
  industry: string;

  @IsEnum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
  size: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}