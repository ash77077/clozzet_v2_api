import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateFabricColorDto {
  @IsString() @IsNotEmpty() fabricTypeId: string;
  @IsString() @IsNotEmpty() nameArm: string;
  @IsString() @IsOptional() nameEng?: string;
  @IsOptional() @Matches(/^#[0-9A-Fa-f]{6}$/) hex?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
