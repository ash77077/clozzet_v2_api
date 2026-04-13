import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateOrderRequestDto {
  @IsString()
  @IsNotEmpty()
  modelName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitSellingPrice: number; // in AMD

  @IsNumber()
  @Min(0)
  totalAmount: number; // Should be calculated on frontend: quantity * unitSellingPrice
}
