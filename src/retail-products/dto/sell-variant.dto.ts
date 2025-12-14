import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class SellVariantDto {
  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  soldPrice?: number;
}
