import { IsString, IsNumber, IsArray, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantDto } from './create-retail-product.dto';

export class UpdateRetailProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  // Note: costPrice is NOT included here - it can only be set during creation

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];
}
