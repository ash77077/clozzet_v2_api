import { IsEnum, IsOptional, IsString } from 'class-validator';
import { B2BOrderStatus } from '../schemas/b2b-order.schema';

export class UpdateB2BOrderStatusDto {
  @IsEnum(B2BOrderStatus)
  status: B2BOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
