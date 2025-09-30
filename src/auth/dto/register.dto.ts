import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class CompanyInfoDto {
  @ApiProperty({ example: 'ACME Corporation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'clozzet.corp@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123 Business St, City, State 12345' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Retail' })
  @IsString()
  @IsNotEmpty()
  industry: string;

  @ApiProperty({ example: '11-50' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'https://www.acme.com', required: false })
  @IsString()
  @IsOptional()
  website?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Procurement Manager' })
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty({ example: 'Procurement' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ type: CompanyInfoDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company: CompanyInfoDto;
}
