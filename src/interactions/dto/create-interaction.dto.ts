import { IsString, IsEnum, IsOptional, IsNumber, IsISO8601, IsMongoId, IsArray } from 'class-validator';
import { InteractionType, CallOutcome } from '../schemas/interaction.schema';

export class CreateInteractionDto {
  @IsMongoId()
  customerId: string;

  @IsEnum(InteractionType)
  type: InteractionType;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsEnum(CallOutcome)
  @IsOptional()
  outcome?: CallOutcome;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  summary: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsISO8601({ strict: true })
  @IsOptional()
  interactionDate?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  nextFollowUpDate?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;
}
