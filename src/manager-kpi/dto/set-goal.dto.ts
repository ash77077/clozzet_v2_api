import { Type } from 'class-transformer';
import {
  IsMongoId, IsNumber, IsOptional, IsString, Min,
  ValidateNested, IsArray, ValidateIf,
} from 'class-validator';

export class CommissionTierDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  max: number;

  @IsNumber()
  @Min(0)
  rate: number;
}

export class SetGoalDto {
  @IsMongoId()
  userId: string;

  @IsString()
  managerName: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetInteractions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetMeetings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetRevenue?: number;

  // Only validate as array+nested when the value is actually an array (not null)
  @IsOptional()
  @ValidateIf(o => Array.isArray(o.customTiers))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommissionTierDto)
  customTiers?: CommissionTierDto[] | null;
}

// Used for the bulk endpoint — no userId/managerName (those are resolved server-side)
export class SetGoalForAllDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetInteractions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetMeetings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetRevenue?: number;

  @IsOptional()
  @ValidateIf(o => Array.isArray(o.customTiers))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommissionTierDto)
  customTiers?: CommissionTierDto[] | null;
}
