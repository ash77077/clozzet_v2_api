import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLostReasonDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  nameHy: string;

  @IsString()
  @IsNotEmpty()
  nameEn: string;

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
