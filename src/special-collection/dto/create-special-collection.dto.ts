import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SPECIAL_COLLECTION_CATEGORIES } from '../schemas/special-collection.schema';

export class SpecialCollectionVariantDto {
  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateSpecialCollectionDto {
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
  @IsIn(SPECIAL_COLLECTION_CATEGORIES)
  category: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsOptional()
  colorImages?: Record<string, string[]>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialCollectionVariantDto)
  variants: SpecialCollectionVariantDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
