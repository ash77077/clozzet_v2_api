import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateQuoteDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Contact person name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'john@techcorp.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+37444010744',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Type of product requested',
    example: 't-shirts',
  })
  @IsString()
  @IsNotEmpty()
  productType: string;

  @ApiProperty({
    description: 'Quantity of products needed',
    example: 100,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Additional services requested',
    example: ['logo-design', 'rush-delivery'],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  additionalServices: string[];

  @ApiProperty({
    description: 'Detailed message about the project',
    example: 'We need custom branded t-shirts for our upcoming conference...',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Budget range for the project',
    example: '1000-5000',
  })
  @IsString()
  @IsNotEmpty()
  budget: string;

  @ApiProperty({
    description: 'Timeline for the project',
    example: '2-weeks',
  })
  @IsString()
  @IsNotEmpty()
  timeline: string;
}