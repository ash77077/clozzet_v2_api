import { IsString, IsNumber, Min } from 'class-validator';

export class QuickSellDto {
  @IsString()
  category: string;

  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  soldPrice: number;
}