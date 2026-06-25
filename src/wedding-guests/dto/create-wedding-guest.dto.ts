import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Attending } from '../schemas/wedding-guest.schema';

export class CreateWeddingGuestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEnum(Attending)
  @IsOptional()
  attending?: Attending;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  guestCount?: number;

  @IsString()
  @MaxLength(800)
  @IsOptional()
  message?: string;
}
