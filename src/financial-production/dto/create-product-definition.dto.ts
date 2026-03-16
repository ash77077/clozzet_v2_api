import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class FabricComponentDto {
  @IsNotEmpty()
  @IsString()
  fabricId: string;

  @IsOptional()
  @IsString()
  fabricName?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pricePerKg: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  gramsUsed: number;
}

class AccessoryComponentDto {
  @IsNotEmpty()
  @IsString()
  accessoryId: string;

  @IsOptional()
  @IsString()
  accessoryName?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateProductDefinitionDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  productCode?: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => FabricComponentDto)
  fabricComponent: FabricComponentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessoryComponentDto)
  accessories: AccessoryComponentDto[];

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pieceworkLabor: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;
}

export class UpdateProductDefinitionDto {
  @IsString()
  productName?: string;

  @IsString()
  productCode?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FabricComponentDto)
  fabricComponent?: FabricComponentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessoryComponentDto)
  accessories?: AccessoryComponentDto[];

  @IsNumber()
  @Min(0)
  pieceworkLabor?: number;

  @IsNumber()
  @Min(0)
  sellingPrice?: number;
}
