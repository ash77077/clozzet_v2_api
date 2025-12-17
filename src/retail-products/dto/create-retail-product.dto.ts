import { IsString, IsNumber, IsArray, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductVariantDto {
  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateRetailProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}
