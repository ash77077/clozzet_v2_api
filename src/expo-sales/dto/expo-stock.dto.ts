import { Type } from 'class-transformer';
import {
  IsString, IsNumber, IsOptional, IsArray, ValidateNested,
  Min, IsEnum, IsIn,
} from 'class-validator';

export class ExpoStockItemDto {
  @IsString() type: string;
  @IsString() color: string;
  @IsString() size: string;
  @IsNumber() @Min(0) quantity: number;
  @IsNumber() @Min(0) costPrice: number;
  @IsOptional() @IsNumber() @Min(0) sellPrice?: number;
}

export class CreateExpoStockDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ExpoStockItemDto)
  items?: ExpoStockItemDto[];
}

export class AddExpoItemsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ExpoStockItemDto)
  items: ExpoStockItemDto[];
}

export class SellExpoItemDto {
  @IsString() type: string;
  @IsString() color: string;
  @IsString() size: string;
  @IsNumber() @Min(1) quantity: number;
  @IsNumber() @Min(0) soldPrice: number;
}

export class SellCartDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => SellExpoItemDto)
  items: SellExpoItemDto[];
}

export class UpdateExpoItemDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsNumber() @Min(0) quantity?: number;
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @IsOptional() @IsNumber() @Min(0) sellPrice?: number;
}

export class ImportFromExpoDto {
  @IsString() sourceExpoId: string;
  @IsOptional() @IsArray() sourceItemIds?: string[];  // if empty, import all
}

export class ReturnToRetailDto {
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ExpoStockItemDto)
  overrides?: ExpoStockItemDto[]; // optional qty overrides; if empty use remaining stock
}
