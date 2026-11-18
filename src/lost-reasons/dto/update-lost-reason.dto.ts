import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLostReasonDto {
  @IsOptional()
  @IsString()
  nameHy?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
