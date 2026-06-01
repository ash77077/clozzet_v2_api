import { IsString, IsOptional, IsArray, IsNumber, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderHistoryItemDto {
  @IsString()
  date: string;

  @IsNumber()
  amount: number;
}

export class CustomerAiPayloadDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  last_contact_date: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderHistoryItemDto)
  order_history: OrderHistoryItemDto[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsIn(['Armenian', 'English'])
  reply_language: 'Armenian' | 'English';
}

export class AnalyzeCustomerDto {
  @ValidateNested()
  @Type(() => CustomerAiPayloadDto)
  customer: CustomerAiPayloadDto;

  @IsIn(['Armenian', 'English'])
  reply_language: 'Armenian' | 'English';
}
