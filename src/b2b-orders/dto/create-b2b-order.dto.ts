import { IsString, IsArray, IsOptional, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class B2BOrderItemDto {
  @IsString()
  type: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  size: string;
}

export class CreateB2BOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => B2BOrderItemDto)
  items: B2BOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
