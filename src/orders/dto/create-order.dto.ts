import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsObject,
  ValidateNested,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class SizeGenderBreakdown {
  @IsOptional()
  @IsNumber()
  @Min(0)
  men?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  women?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  uni?: number;
}

class SizesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  xs?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  s?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  m?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  l?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  xl?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  xxl?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  xxxl?: SizeGenderBreakdown;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizeGenderBreakdown)
  xxxxl?: SizeGenderBreakdown;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  salesPerson?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  clothType?: string;

  @IsOptional()
  @IsString()
  textileType?: string;

  @IsOptional()
  @IsString()
  fabricWeight?: string;

  @IsOptional()
  @IsString()
  colors?: string;

  @IsOptional()
  @IsString()
  customColorDetails?: string;

  @IsOptional()
  @IsString()
  logoPosition?: string;

  @IsOptional()
  @IsString()
  logoSize?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  packagingRequirements?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SizesDto)
  sizes?: SizesDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  grandTotal?: number;
}
