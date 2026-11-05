import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() notes?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
