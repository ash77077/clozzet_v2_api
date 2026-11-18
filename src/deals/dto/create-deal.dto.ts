import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DealNextStepType, DealSource } from '../schemas/deal.schema';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsOptional()
  @IsString()
  contactPersonId?: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  stageId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsNumber()
  estimatedQuantity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  garmentTypeIds?: string[];

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsEnum(DealSource)
  source?: string;

  @IsOptional()
  @IsDateString()
  nextStepDate?: string;

  @IsOptional()
  @IsEnum(DealNextStepType)
  nextStepType?: string;

  @IsOptional()
  @IsString()
  nextStepNote?: string;
}
