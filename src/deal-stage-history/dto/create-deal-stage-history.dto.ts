import { IsOptional, IsString } from 'class-validator';

export class CreateDealStageHistoryDto {
  @IsString()
  dealId: string;

  @IsOptional()
  @IsString()
  fromStageId?: string | null;

  @IsOptional()
  @IsString()
  fromStageKey?: string | null;

  @IsString()
  toStageId: string;

  @IsString()
  toStageKey: string;

  @IsString()
  changedBy: string;

  @IsOptional()
  @IsString()
  changedByName?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
