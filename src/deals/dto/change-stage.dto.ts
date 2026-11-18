import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ChangeStageDto {
  @IsString()
  stageId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  lostReasonId?: string;

  @IsOptional()
  @IsString()
  lostComment?: string;

  @IsOptional()
  @IsBoolean()
  allowEmptyOrderIds?: boolean;
}

export class MarkWonDto {
  @IsString()
  orderId: string;
}

export class MarkLostDto {
  @IsString()
  lostReasonId: string;

  @IsOptional()
  @IsString()
  lostComment?: string;
}
