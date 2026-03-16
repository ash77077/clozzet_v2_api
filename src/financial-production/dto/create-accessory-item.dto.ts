import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateAccessoryItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  costPerUnit: number;
}

export class UpdateAccessoryItemDto {
  @IsString()
  name?: string;

  @IsString()
  unit?: string;

  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsNumber()
  @Min(0)
  costPerUnit?: number;
}
