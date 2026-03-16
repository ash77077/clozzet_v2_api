import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';

export class CreateProductionRunDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  sellingPricePerUnit: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  productionDate: string;
}

export class UpdateProductionStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([
    'pending',
    'in_progress',
    'quality_check',
    'packaged',
    'ready_for_delivery',
    'delivered',
    'completed',
    'reproduction',
    'cancelled',
  ])
  status: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantityFinished: number;

  @IsOptional()
  @IsString()
  statusNotes?: string;
}

export class RecordWasteDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  wasteKg: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RestockFabricDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  restockKg: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
