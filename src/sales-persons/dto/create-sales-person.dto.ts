import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSalesPersonDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}