import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateInventoryFabricDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  gsm: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pricePerKg: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  availableKg: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInventoryFabricDto {
  @IsString()
  name?: string;

  @IsString()
  type?: string;

  @IsString()
  color?: string;

  @IsNumber()
  @Min(0)
  gsm?: number;

  @IsNumber()
  @Min(0)
  pricePerKg?: number;

  @IsNumber()
  @Min(0)
  availableKg?: number;

  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @IsString()
  supplier?: string;

  @IsString()
  notes?: string;
}
