import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ProductVariantDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @IsArray()
  @IsString({ each: true })
  materials: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gsm?: string[];

  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateProductDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  tagline: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @IsArray()
  @IsString({ each: true })
  useCases: string[];

  @IsNumber()
  @Min(0)
  startingPrice: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
