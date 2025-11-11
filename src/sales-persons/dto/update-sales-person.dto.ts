import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSalesPersonDto } from './create-sales-person.dto';

export class UpdateSalesPersonDto extends PartialType(CreateSalesPersonDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}