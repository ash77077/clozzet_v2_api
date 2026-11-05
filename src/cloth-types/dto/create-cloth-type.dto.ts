import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateClothTypeDto {
  @IsString()
  @IsNotEmpty()
  nameArm: string;

  @IsString()
  @IsNotEmpty()
  nameEng: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
