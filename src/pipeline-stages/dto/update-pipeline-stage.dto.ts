import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePipelineStageDto {
  @IsOptional()
  @IsString()
  nameHy?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;
}
